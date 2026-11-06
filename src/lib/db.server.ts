import "server-only";
import { Pool, type PoolClient } from "pg";

// One small pool per server instance. Plain Postgres (pg), so it works with
// Neon's pooled connection string today and any Postgres later (D20).
let pool: Pool | null = null;

function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. See .env.example.");
  pool ??= new Pool({ connectionString: url, max: 5 });
  return pool;
}

export function databaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

// Runs fn in a transaction as the server's owner role. Only for sign-up and
// the auth bookkeeping tables; never with input that picks another agency.
export async function asServer<T>(fn: (db: PoolClient) => Promise<T>): Promise<T> {
  const db = await getPool().connect();
  try {
    await db.query("begin");
    const result = await fn(db);
    await db.query("commit");
    return result;
  } catch (error) {
    await db.query("rollback").catch(() => {});
    throw error;
  } finally {
    db.release();
  }
}

// Runs fn in a transaction as signo_app for one signed-in member, so the
// row-level security policies limit every read and write to their agency.
export async function asMember<T>(userId: string, fn: (db: PoolClient) => Promise<T>): Promise<T> {
  return asServer(async (db) => {
    await db.query("set local role signo_app");
    await db.query("select set_config('app.user_id', $1, true)", [userId]);
    return fn(db);
  });
}
