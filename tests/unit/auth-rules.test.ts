import { describe, expect, it } from "vitest";
import {
  checkEmail,
  checkName,
  checkPassword,
  checkSignUp,
  lockedUntil,
  marketFor,
  resendState,
  timezoneFor,
} from "@/lib/auth/rules";

const min = 60 * 1000;
const at = (base: Date, minutesAgo: number) => new Date(base.getTime() - minutesAgo * min);

describe("US-SGN-001 BR4: password", () => {
  it.each(["secret12", "كلمةسر12", "a1234567", "Abcdefg9"])("accepts %s", (p) => expect(checkPassword(p)).toBeNull());
  it.each([
    ["", "m10"],
    ["abc123", "m03"],
    ["abcdefgh", "m03"],
    ["12345678", "m03"],
    ["       1", "m03"],
  ])("rejects %j with %s", (p, code) => expect(checkPassword(p)).toBe(code));
});

describe("field rules (Field Descriptions, MSG-001-10/11/12)", () => {
  it("names need 2 to 80 characters after trimming", () => {
    expect(checkName("  ")).toBe("m10");
    expect(checkName("M")).toBe("m12");
    expect(checkName("Mo")).toBeNull();
    expect(checkName("م".repeat(80))).toBeNull();
    expect(checkName("x".repeat(81))).toBe("m12");
  });
  it("emails", () => {
    expect(checkEmail("")).toBe("m10");
    expect(checkEmail("mostafa@studio")).toBe("m11");
    expect(checkEmail("no spaces@agency.com")).toBe("m11");
    expect(checkEmail("  Mostafa@Studio.EG ")).toBeNull();
  });
  it("reports every wrong field at once", () => {
    const errors = checkSignUp({ fullName: "M", email: "x", password: "short", agencyName: "", country: "mars", language: "fr" });
    expect(errors).toEqual({ fullName: "m12", email: "m11", password: "m03", agencyName: "m10", country: "m10", language: "m10" });
  });
});

describe("BR9 and D27: country sets timezone and market", () => {
  it.each([
    ["egypt", "Africa/Cairo", "egypt"],
    ["saudi_arabia", "Asia/Riyadh", "gulf"],
    ["uae", "Asia/Dubai", "gulf"],
    ["other", "Africa/Cairo", "gulf"],
  ] as const)("%s", (country, tz, market) => {
    expect(timezoneFor(country)).toBe(tz);
    expect(marketFor(country)).toBe(market);
  });
});

describe("BR7: lockout after 5 wrong passwords in 15 minutes", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  const failed = (m: number) => ({ outcome: "failed" as const, at: at(now, m) });

  it("4 failures do not lock", () => {
    expect(lockedUntil([failed(0), failed(1), failed(2), failed(3)], now)).toBeNull();
  });
  it("the 5th failure within 15 minutes locks for 15 minutes", () => {
    const until = lockedUntil([failed(0), failed(3), failed(6), failed(9), failed(14)], now);
    expect(until?.toISOString()).toBe(new Date(now.getTime() + 15 * min).toISOString());
  });
  it("5 failures spread over more than 15 minutes do not lock", () => {
    expect(lockedUntil([failed(0), failed(4), failed(8), failed(12), failed(16)], now)).toBeNull();
  });
  it("the lock ends 15 minutes after the 5th failure", () => {
    expect(lockedUntil([failed(15), failed(16), failed(17), failed(18), failed(19)], now)).toBeNull();
    expect(lockedUntil([failed(14), failed(16), failed(17), failed(18), failed(19)], now)).not.toBeNull();
  });
  it("a password reset clears earlier failures", () => {
    const attempts = [failed(0), failed(1), { outcome: "cleared" as const, at: at(now, 2) }, failed(3), failed(4), failed(5)];
    expect(lockedUntil(attempts, now)).toBeNull();
  });
});

describe("D19: verification resend waits 60 s, at most 5 an hour", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  it("first send is allowed", () => expect(resendState([], now)).toEqual({ kind: "ok" }));
  it("counts down after a send", () => {
    expect(resendState([new Date(now.getTime() - 2000)], now)).toEqual({ kind: "cooldown", seconds: 58 });
  });
  it("allows again after 60 s", () => {
    expect(resendState([new Date(now.getTime() - 61_000)], now)).toEqual({ kind: "ok" });
  });
  it("stops at 5 in the last hour", () => {
    const five = [5, 15, 25, 35, 45].map((m) => at(now, m));
    expect(resendState(five, now)).toEqual({ kind: "limit" });
    expect(resendState([...five.slice(1), at(now, 61)], now)).toEqual({ kind: "ok" });
  });
});
