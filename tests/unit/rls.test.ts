import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// AC10 / CLAUDE.md rule 1: a member of agency A gets nothing of agency B.
// Runs against the tests' own Postgres with the migrations applied
// (TEST_DATABASE_URL; CI sets it). Skipped when no test database is given.
const url = process.env.TEST_DATABASE_URL;
const db = new Client({ connectionString: url });

const a = { agency: randomUUID(), user: randomUUID() };
const b = { agency: randomUUID(), user: randomUUID() };

async function asMember<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  await db.query("begin");
  try {
    await db.query("set local role signo_app");
    await db.query("select set_config('app.user_id', $1, true)", [userId]);
    return await fn();
  } finally {
    await db.query("rollback");
  }
}

describe.skipIf(!url)("agency data isolation (RLS)", () => {
  beforeAll(async () => {
    await db.connect();
    for (const [x, name] of [
      [a, "Agency A"],
      [b, "Agency B"],
    ] as const) {
      await db.query(`insert into agencies (id, name, country, market, timezone, default_language) values ($1, $2, 'egypt', 'egypt', 'Africa/Cairo', 'ar')`, [x.agency, name]);
      await db.query(`insert into agency_members (agency_id, user_id, role) values ($1, $2, 'owner')`, [x.agency, x.user]);
      await db.query(`insert into member_profiles (user_id, agency_id, full_name, email, ui_language) values ($1, $2, 'Owner', $3, 'ar')`, [x.user, x.agency, `${x.user}@rls.test`]);
      await db.query(`insert into activity (agency_id, actor_id, event) values ($1, $2, 'test.event')`, [x.agency, x.user]);
    }
  });
  afterAll(async () => {
    await db.end();
  });

  it("A sees its own agency, members, profiles and activity", async () => {
    await asMember(a.user, async () => {
      expect((await db.query("select id from agencies")).rows).toEqual([{ id: a.agency }]);
      expect((await db.query("select user_id from agency_members")).rows).toEqual([{ user_id: a.user }]);
      expect((await db.query("select user_id from member_profiles")).rows).toEqual([{ user_id: a.user }]);
      expect((await db.query("select agency_id from activity")).rows.every((r) => r.agency_id === a.agency)).toBe(true);
    });
  });

  it("A gets nothing of B, even asking for B's ids directly", async () => {
    await asMember(a.user, async () => {
      expect((await db.query("select * from agencies where id = $1", [b.agency])).rowCount).toBe(0);
      expect((await db.query("select * from agency_members where agency_id = $1", [b.agency])).rowCount).toBe(0);
      expect((await db.query("select * from member_profiles where user_id = $1", [b.user])).rowCount).toBe(0);
      expect((await db.query("select * from activity where agency_id = $1", [b.agency])).rowCount).toBe(0);
    });
  });

  it("A cannot change B's profile, and can change only the language of its own", async () => {
    await asMember(a.user, async () => {
      expect((await db.query("update member_profiles set ui_language = 'en' where user_id = $1", [b.user])).rowCount).toBe(0);
      expect((await db.query("update member_profiles set ui_language = 'en' where user_id = $1", [a.user])).rowCount).toBe(1);
    });
    await asMember(a.user, async () => {
      await expect(db.query("update member_profiles set full_name = 'X' where user_id = $1", [a.user])).rejects.toThrow(/permission denied/);
    });
  });

  it("members cannot write agencies, memberships or activity, nor read the server-only tables", async () => {
    for (const sql of [
      "insert into agencies (name, country, market, timezone, default_language) values ('Z', 'egypt', 'egypt', 'Africa/Cairo', 'ar')",
      `insert into agency_members (agency_id, user_id, role) values ('${b.agency}', '${a.user}', 'member')`,
      "update agency_members set role = 'owner'",
      `insert into activity (agency_id, event) values ('${b.agency}', 'x')`,
      "select * from login_attempts",
      "select * from email_verifications",
      "select * from platform_admins",
    ]) {
      await asMember(a.user, async () => {
        await expect(db.query(sql), sql).rejects.toThrow(/permission denied/);
      });
    }
  });

  it("with no member set, nothing is visible", async () => {
    await db.query("begin");
    await db.query("set local role signo_app");
    expect((await db.query("select * from agencies")).rowCount).toBe(0);
    await db.query("rollback");
  });

  it("activity is append-only, even for the server", async () => {
    await expect(db.query("update activity set event = 'changed' where agency_id = $1", [a.agency])).rejects.toThrow(/append-only/);
    await expect(db.query("delete from activity where agency_id = $1", [a.agency])).rejects.toThrow(/append-only/);
  });
});
