// Pure helpers for scripts/migrate.mjs, kept separate so they can be unit tested.
import { createHash } from "node:crypto";

// Migration files are named <14-digit UTC timestamp>_<snake_case_name>.sql.
export const MIGRATION_NAME = /^\d{14}_[a-z0-9_]+\.sql$/;

export function checksum(sql) {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

// files: [{ name, sql }]; applied: [{ name, checksum }] from schema_migrations.
// Returns the files still to apply, in order, or throws when history and files disagree.
export function planMigrations(files, applied) {
  for (const file of files) {
    if (!MIGRATION_NAME.test(file.name)) {
      throw new Error(`Bad migration file name: ${file.name}`);
    }
  }
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
  const byName = new Map(sorted.map((f) => [f.name, f]));

  for (const row of applied) {
    const file = byName.get(row.name);
    if (!file) {
      throw new Error(
        `The database has migration ${row.name}, which is not in db/migrations. ` +
          "Another change is probably in progress: update this branch from main, or wait for it.",
      );
    }
    if (checksum(file.sql) !== row.checksum) {
      throw new Error(`Migration ${row.name} was edited after it was applied. Add a new migration instead.`);
    }
  }

  const done = new Set(applied.map((r) => r.name));
  const pending = sorted.filter((f) => !done.has(f.name));
  const lastApplied = applied.map((r) => r.name).sort().at(-1);
  const outOfOrder = pending.find((f) => lastApplied && f.name < lastApplied);
  if (outOfOrder) {
    throw new Error(
      `Migration ${outOfOrder.name} sorts before ${lastApplied}, which is already applied. Rename it with a newer timestamp.`,
    );
  }
  return pending;
}
