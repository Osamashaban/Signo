// Business rules of US-SGN-001 that need no database or network, so they can
// be unit tested. Every number here comes from the ticket or the canvas notes.

export const COUNTRIES = ["egypt", "saudi_arabia", "uae", "other"] as const;
export type Country = (typeof COUNTRIES)[number];
export const LANGUAGES = ["ar", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

// BR9: timezone from the sign-up country.
const TIMEZONES: Record<Country, string> = {
  egypt: "Africa/Cairo",
  saudi_arabia: "Asia/Riyadh",
  uae: "Asia/Dubai",
  other: "Africa/Cairo",
};
export function timezoneFor(country: Country): string {
  return TIMEZONES[country];
}

// D27: Egypt pays in EGP, every other country uses the Gulf (USD) market.
export function marketFor(country: Country): "egypt" | "gulf" {
  return country === "egypt" ? "egypt" : "gulf";
}

// Field errors (BR16 / D18 on the canvas): codes map to MSG-001-10/11/12 and 03.
export type FieldError = "m10" | "m11" | "m12" | "m03";

export function checkName(value: string): FieldError | null {
  const v = value.trim();
  if (!v) return "m10";
  if (v.length < 2 || v.length > 80) return "m12";
  return null;
}

// A practical check: something@something.tld, no spaces, at most 254 characters.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
export function checkEmail(value: string): FieldError | null {
  const v = normalizeEmail(value);
  if (!v) return "m10";
  if (v.length > 254 || !EMAIL.test(v)) return "m11";
  return null;
}

// BR4: at least 8 characters, at least one letter and one number.
export function checkPassword(value: string): FieldError | null {
  if (!value) return "m10";
  if (value.length < 8 || !/\p{L}/u.test(value) || !/\p{N}/u.test(value)) return "m03";
  return null;
}

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  agencyName: string;
  country: string;
  language: string;
};
export type SignUpErrors = Partial<Record<keyof SignUpInput, FieldError>>;

export function checkSignUp(input: SignUpInput): SignUpErrors {
  const errors: SignUpErrors = {};
  const name = checkName(input.fullName);
  if (name) errors.fullName = name;
  const email = checkEmail(input.email);
  if (email) errors.email = email;
  const password = checkPassword(input.password);
  if (password) errors.password = password;
  const agency = checkName(input.agencyName);
  if (agency) errors.agencyName = agency;
  if (!(COUNTRIES as readonly string[]).includes(input.country)) errors.country = "m10";
  if (!(LANGUAGES as readonly string[]).includes(input.language)) errors.language = "m10";
  return errors;
}

// BR7: 5 wrong passwords within 15 minutes lock log-in for 15 minutes.
export const LOCKOUT_MAX_FAILURES = 5;
export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export type Attempt = { outcome: "failed" | "cleared"; at: Date };

// attempts: newest first. Returns when the lock ends, or null when not locked.
export function lockedUntil(attempts: Attempt[], now: Date): Date | null {
  const failures: Date[] = [];
  for (const a of attempts) {
    if (a.outcome === "cleared") break;
    failures.push(a.at);
  }
  // Find 5 failures that fall inside one 15-minute window; the lock starts at
  // the 5th of them and lasts 15 minutes.
  for (let i = 0; i + LOCKOUT_MAX_FAILURES - 1 < failures.length; i++) {
    const newest = failures[i];
    const fifthBack = failures[i + LOCKOUT_MAX_FAILURES - 1];
    if (newest.getTime() - fifthBack.getTime() <= LOCKOUT_WINDOW_MS) {
      const until = new Date(newest.getTime() + LOCKOUT_WINDOW_MS);
      return until > now ? until : null;
    }
  }
  return null;
}

// D19 on the canvas: resend waits 60 seconds, at most 5 emails an hour.
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const RESEND_HOURLY_LIMIT = 5;
export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // D21 on the canvas

export type ResendState =
  | { kind: "ok" }
  | { kind: "cooldown"; seconds: number }
  | { kind: "limit" };

// sentAt: when earlier verification emails were sent, any order.
export function resendState(sentAt: Date[], now: Date): ResendState {
  const lastHour = sentAt.filter((d) => now.getTime() - d.getTime() < 60 * 60 * 1000);
  if (lastHour.length >= RESEND_HOURLY_LIMIT) return { kind: "limit" };
  const latest = Math.max(0, ...sentAt.map((d) => d.getTime()));
  const wait = latest + RESEND_COOLDOWN_MS - now.getTime();
  if (wait > 0) return { kind: "cooldown", seconds: Math.ceil(wait / 1000) };
  return { kind: "ok" };
}

export function isLanguage(value: unknown): value is Language {
  return value === "ar" || value === "en";
}
