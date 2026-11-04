import { neon } from "@neondatabase/serverless";
import { connection } from "next/server";

// Pipeline check (PIPELINE.md, SETUP.md final check): says which environment
// this deployment is and whether it reaches its database. It never returns
// connection details or any agency data.
type DatabaseState = "connected" | "not_configured" | "not_migrated" | "unreachable";

export async function GET() {
  await connection(); // always run at request time, never prerendered

  const environment = process.env.VERCEL_ENV ?? "development";
  const url = process.env.DATABASE_URL;
  let database: DatabaseState = "not_configured";

  if (url) {
    try {
      const sql = neon(url);
      const rows = await sql`select to_regclass('public.health_check') is not null as ready`;
      database = rows[0]?.ready ? "connected" : "not_migrated";
    } catch {
      database = "unreachable";
    }
  }

  return Response.json(
    { app: "running", environment, database },
    { headers: { "cache-control": "no-store" } },
  );
}
