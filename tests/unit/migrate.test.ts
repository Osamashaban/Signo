import { describe, expect, it } from "vitest";
import { checksum, planMigrations } from "../../scripts/migrate-lib.mjs";

const a = { name: "20261104191500_init_health_check.sql", sql: "create table a ();" };
const b = { name: "20261105090000_add_clients.sql", sql: "create table b ();" };

describe("migration plan", () => {
  it("applies everything, oldest first, on an empty database", () => {
    expect(planMigrations([b, a], []).map((f) => f.name)).toEqual([a.name, b.name]);
  });

  it("skips migrations already applied", () => {
    expect(planMigrations([a, b], [{ name: a.name, checksum: checksum(a.sql) }])).toEqual([b]);
  });

  it("stops when the database has a migration this branch doesn't have", () => {
    expect(() => planMigrations([a], [{ name: b.name, checksum: "x" }])).toThrow(/not in db\/migrations/);
  });

  it("stops when an applied migration was edited", () => {
    expect(() => planMigrations([a], [{ name: a.name, checksum: checksum("other") }])).toThrow(/edited/);
  });

  it("stops when a new migration sorts before one already applied", () => {
    expect(() => planMigrations([a, b], [{ name: b.name, checksum: checksum(b.sql) }])).toThrow(/Rename/);
  });

  it("rejects badly named files", () => {
    expect(() => planMigrations([{ name: "clients.sql", sql: "" }], [])).toThrow(/Bad migration file name/);
  });
});
