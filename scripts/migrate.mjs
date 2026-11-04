// Applies db/migrations/*.sql to the database in DATABASE_URL_UNPOOLED, in order,
// each in its own transaction, and records them in schema_migrations.
//
//   node scripts/migrate.mjs            apply pending migrations
//   node scripts/migrate.mjs --dry-run  only list them
//
// Run by the "Migrate staging database" and "Migrate production database"
// workflows. Never prints the connection string.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { checksum, planMigrations } from "./migrate-lib.mjs";

const dryRun = process.argv.includes("--dry-run");
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set.");
  process.exit(1);
}

const dir = path.resolve("db/migrations");
const names = (await readdir(dir)).filter((n) => n.endsWith(".sql"));
const files = await Promise.all(
  names.map(async (name) => ({ name, sql: await readFile(path.join(dir, name), "utf8") })),
);

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(`create table if not exists schema_migrations (
    name text primary key,
    checksum text not null,
    applied_at timestamptz not null default now()
  )`);
  // One migration run at a time, even if two workflows start together.
  await client.query("select pg_advisory_lock(727140)");

  const { rows: applied } = await client.query("select name, checksum from schema_migrations order by name");
  const pending = planMigrations(files, applied);

  if (pending.length === 0) {
    console.log("No pending migrations.");
  } else {
    console.log(`Pending migrations (${pending.length}):`);
    for (const f of pending) console.log(`  ${f.name}`);
  }
  if (dryRun) process.exit(0);

  for (const f of pending) {
    await client.query("begin");
    try {
      await client.query(f.sql);
      await client.query("insert into schema_migrations (name, checksum) values ($1, $2)", [
        f.name,
        checksum(f.sql),
      ]);
      await client.query("commit");
      console.log(`Applied ${f.name}`);
    } catch (error) {
      await client.query("rollback");
      console.error(`Failed on ${f.name}: ${error.message}`);
      process.exit(1);
    }
  }
} finally {
  await client.end();
}
