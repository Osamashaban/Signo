import "server-only";
import { connection } from "next/server";
import type { PoolClient } from "pg";
import { asMember, asServer, databaseConfigured } from "@/lib/db.server";
import { sendAuthEmail } from "@/lib/email.server";
import { authConfigured, neonAuth } from "./neon.server";
import { appOrigin } from "./origin.server";
import {
  type Attempt,
  type Country,
  type Language,
  type ResendState,
  type SignUpErrors,
  type SignUpInput,
  VERIFICATION_TTL_MS,
  checkSignUp,
  lockedUntil,
  marketFor,
  normalizeEmail,
  resendState,
  timezoneFor,
} from "./rules";
import { emailKey, newToken, sha256 } from "./tokens";

export function servicesReady(): boolean {
  return databaseConfigured() && authConfigured();
}

type AuthError = { status?: number; code?: string; message?: string } | null | undefined;
const errorCode = (e: AuthError) => (e?.code ?? "").toUpperCase();

// ---------------------------------------------------------------- the member
export type Member = {
  userId: string;
  email: string;
  fullName: string;
  language: Language;
  verified: boolean;
  agencyId: string;
  agencyName: string;
  role: "owner" | "member";
};

// The signed-in member with their agency, read through RLS. Null when signed
// out, or when the login has no Signo membership (for example a login made
// directly against Neon Auth, outside Signo's sign-up).
export async function currentMember(): Promise<Member | null> {
  await connection(); // per request, never baked into a prerendered page
  if (!servicesReady()) return null;
  const { data } = await neonAuth().getSession();
  const userId = data?.user?.id;
  if (!userId) return null;
  return asMember(userId, async (db) => {
    const { rows } = await db.query(
      `select p.user_id, p.email, p.full_name, p.ui_language, p.email_verified_at,
              a.id as agency_id, a.name as agency_name, m.role
         from member_profiles p
         join agency_members m on m.user_id = p.user_id
         join agencies a on a.id = m.agency_id
        where p.user_id = app.current_user_id()`,
    );
    const r = rows[0];
    if (!r) return null;
    return {
      userId: r.user_id,
      email: r.email,
      fullName: r.full_name,
      language: r.ui_language,
      verified: !!r.email_verified_at,
      agencyId: r.agency_id,
      agencyName: r.agency_name,
      role: r.role,
    } satisfies Member;
  });
}

// ------------------------------------------------------------------ sign-up
export type SignUpResult =
  | { ok: true }
  | { ok: false; errors: SignUpErrors; exists?: boolean; failed?: boolean };

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const errors = checkSignUp(input);
  if (Object.keys(errors).length) return { ok: false, errors };
  if (!servicesReady()) return { ok: false, errors: {}, failed: true };

  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const country = input.country as Country;
  const language = input.language as Language;

  const known = await asServer(async (db) =>
    (await db.query("select 1 from member_profiles where email = $1", [email])).rowCount,
  );
  if (known) return { ok: false, errors: {}, exists: true }; // AC2

  const auth = neonAuth();
  let userId: string;
  const { data, error } = await auth.signUp.email({ email, password: input.password, name: fullName });
  if (error || !data?.user?.id) {
    const code = errorCode(error);
    if (code.includes("ALREADY_EXISTS") || error?.status === 422) {
      // A login with no Signo profile is left over from a sign-up that failed
      // half-way. The right password finishes that sign-up; otherwise AC2.
      const retry = await auth.signIn.email({ email, password: input.password });
      if (retry.error || !retry.data?.user?.id) return { ok: false, errors: {}, exists: true };
      userId = retry.data.user.id as string;
    } else if (code.includes("PASSWORD")) {
      return { ok: false, errors: { password: "m03" } };
    } else {
      return { ok: false, errors: {}, failed: true };
    }
  } else {
    userId = data.user.id as string;
  }

  // BR1: the agency, the owner membership and the profile in one transaction.
  try {
    await asServer(async (db) => {
      const agency = await db.query(
        `insert into agencies (name, country, market, timezone, default_language)
         values ($1, $2, $3, $4, $5) returning id`,
        [input.agencyName.trim(), country, marketFor(country), timezoneFor(country), language],
      );
      const agencyId = agency.rows[0].id;
      await db.query(`insert into agency_members (agency_id, user_id, role) values ($1, $2, 'owner')`, [agencyId, userId]);
      await db.query(
        `insert into member_profiles (user_id, agency_id, full_name, email, ui_language)
         values ($1, $2, $3, $4, $5)`,
        [userId, agencyId, fullName, email, language],
      );
    });
  } catch (cause) {
    // Nothing of ours was kept. The login stays and the person can submit the
    // form again: the branch above then finishes the sign-up.
    await auth.signOut().catch(() => {});
    console.error("[signup] could not create the agency", (cause as Error).message);
    return { ok: false, errors: {}, failed: true };
  }

  await sendVerification(userId, email, language).catch((cause) =>
    console.error("[signup] verification email failed", (cause as Error).message),
  );
  return { ok: true };
}

// ------------------------------------------------- verification (24 hours)
async function sentTimes(db: PoolClient, userId: string): Promise<Date[]> {
  const { rows } = await db.query(
    `select created_at from email_verifications
      where user_id = $1 and created_at > now() - interval '1 hour'`,
    [userId],
  );
  return rows.map((r) => r.created_at as Date);
}

async function sendVerification(userId: string, email: string, language: Language) {
  const token = newToken();
  await asServer(async (db) => {
    // D19: a new link replaces the old one.
    await db.query(
      `update email_verifications set replaced_at = now()
        where user_id = $1 and used_at is null and replaced_at is null`,
      [userId],
    );
    await db.query(
      `insert into email_verifications (user_id, token_hash, expires_at) values ($1, $2, $3)`,
      [userId, sha256(token), new Date(Date.now() + VERIFICATION_TTL_MS)],
    );
  });
  const link = `${appOrigin()}/${language}/verify-email?token=${encodeURIComponent(token)}`;
  await sendAuthEmail(email, "verify", language, link);
}

export async function verificationState(userId: string): Promise<ResendState> {
  return asServer(async (db) => resendState(await sentTimes(db, userId), new Date()));
}

export async function resendVerification(member: Member): Promise<ResendState> {
  if (member.verified) return { kind: "ok" };
  const state = await verificationState(member.userId);
  if (state.kind !== "ok") return state;
  await sendVerification(member.userId, member.email, member.language);
  return verificationState(member.userId);
}

export type VerifyResult = "verified" | "expired";

export async function verifyEmail(token: string): Promise<VerifyResult> {
  if (!token || !databaseConfigured()) return "expired";
  return asServer(async (db) => {
    const { rows } = await db.query(
      `update email_verifications set used_at = now()
        where token_hash = $1 and used_at is null and replaced_at is null and expires_at > now()
        returning user_id`,
      [sha256(token)],
    );
    if (!rows[0]) return "expired";
    await db.query(
      `update member_profiles set email_verified_at = coalesce(email_verified_at, now()), updated_at = now()
        where user_id = $1`,
      [rows[0].user_id],
    );
    return "verified";
  });
}

// ------------------------------------------------------------------ lockout
async function attempts(db: PoolClient, email: string): Promise<Attempt[]> {
  const { rows } = await db.query(
    `select outcome, created_at from login_attempts
      where email_hash = $1 and created_at > now() - interval '30 minutes'
      order by created_at desc limit 20`,
    [emailKey(email)],
  );
  return rows.map((r) => ({ outcome: r.outcome, at: r.created_at }));
}

export async function isLocked(email: string): Promise<boolean> {
  return asServer(async (db) => lockedUntil(await attempts(db, email), new Date()) !== null);
}

async function recordAttempt(email: string, outcome: "failed" | "cleared") {
  await asServer((db) =>
    db.query(`insert into login_attempts (email_hash, outcome) values ($1, $2)`, [emailKey(email), outcome]),
  );
}

// ------------------------------------------------------------------- log in
export type LogInResult =
  | { ok: true; language: Language; verified: boolean }
  | { ok: false; reason: "wrong" | "locked" | "failed" };

export async function logIn(rawEmail: string, password: string): Promise<LogInResult> {
  const email = normalizeEmail(rawEmail);
  if (!email || !password) return { ok: false, reason: "wrong" };
  if (!servicesReady()) return { ok: false, reason: "failed" };
  if (await isLocked(email)) return { ok: false, reason: "locked" };

  const auth = neonAuth();
  const { data, error } = await auth.signIn.email({ email, password });
  if (error || !data?.user?.id) {
    if (error?.status && error.status >= 500) return { ok: false, reason: "failed" };
    await recordAttempt(email, "failed");
    return { ok: false, reason: (await isLocked(email)) ? "locked" : "wrong" };
  }
  const member = await asServer(async (db) =>
    (
      await db.query(`select ui_language, email_verified_at from member_profiles where user_id = $1`, [
        data.user.id,
      ])
    ).rows[0],
  );
  if (!member) {
    await auth.signOut().catch(() => {});
    return { ok: false, reason: "wrong" };
  }
  return { ok: true, language: member.ui_language, verified: !!member.email_verified_at };
}

export async function logOut() {
  if (!authConfigured()) return;
  await neonAuth().signOut().catch(() => {});
}

// ------------------------------------------------------------- magic links
export type MagicResult = { ok: true } | { ok: false; reason: "locked" | "failed" };

export async function requestMagicLink(rawEmail: string, locale: Language): Promise<MagicResult> {
  const email = normalizeEmail(rawEmail);
  if (!servicesReady()) return { ok: false, reason: "failed" };
  if (await isLocked(email)) return { ok: false, reason: "locked" }; // D20 on the canvas
  const origin = appOrigin();
  // The magic-link method exists on the server API but is missing from its types.
  const signIn = neonAuth().signIn as unknown as {
    magicLink(args: { email: string; callbackURL: string; errorCallbackURL: string }): Promise<{ error: AuthError }>;
  };
  const { error } = await signIn.magicLink({
    email,
    callbackURL: `${origin}/${locale}/clients`,
    errorCallbackURL: `${origin}/${locale}/link-expired?kind=login`,
  });
  if (error && error.status && error.status >= 500) return { ok: false, reason: "failed" };
  return { ok: true }; // MSG-001-06 whether or not the email has an account
}

// ---------------------------------------------------------- password reset
export async function requestPasswordReset(rawEmail: string, locale: Language): Promise<boolean> {
  const email = normalizeEmail(rawEmail);
  if (!servicesReady()) return false;
  const { error } = await neonAuth().requestPasswordReset({
    email,
    redirectTo: `${appOrigin()}/${locale}/reset-password`,
  });
  return !(error && error.status && error.status >= 500); // MSG-001-07 either way
}

export type ResetResult = "changed" | "expired" | "failed";

export async function resetPassword(token: string, newPassword: string): Promise<ResetResult> {
  if (!servicesReady()) return "failed";
  // Who the link belongs to, so their lockout can be cleared afterwards.
  const email = await asServer(async (db) => {
    const { rows } = await db
      .query(
        `select p.email from neon_auth.verification v
           join member_profiles p on p.user_id::text = v.value
          where v.identifier = $1`,
        [`reset-password:${token}`],
      )
      .catch(() => ({ rows: [] as { email: string }[] }));
    return rows[0]?.email as string | undefined;
  });
  const { error } = await neonAuth().resetPassword({ newPassword, token });
  if (error) {
    if (error.status && error.status >= 500) return "failed";
    return "expired";
  }
  if (email) await recordAttempt(email, "cleared");
  return "changed";
}

// ----------------------------------------------------------------- language
export async function saveLanguage(member: Member, language: Language) {
  await asMember(member.userId, (db) =>
    db.query(
      `update member_profiles set ui_language = $1, updated_at = now() where user_id = app.current_user_id()`,
      [language],
    ),
  );
}

// ------------------------------------------- emails asked for by Neon Auth
// Neon Auth calls our webhook instead of sending its own emails, so links
// arrive in the member's language and point at Signo's own address.
export async function deliverAuthLink(kind: "sign-in" | "forget-password", rawEmail: string, token: string) {
  const email = normalizeEmail(rawEmail);
  const profile = await asServer(async (db) =>
    (await db.query(`select ui_language from member_profiles where email = $1`, [email])).rows[0],
  );
  if (!profile) return; // not a Signo member: send nothing, say nothing
  const language = profile.ui_language as Language;
  const origin = appOrigin();
  if (kind === "sign-in") {
    if (await isLocked(email)) return; // D20: lockout also blocks login links
    const query = new URLSearchParams({
      token,
      callbackURL: `${origin}/${language}/clients`,
      errorCallbackURL: `${origin}/${language}/link-expired?kind=login`,
    });
    await sendAuthEmail(email, "magic", language, `${origin}/api/auth/magic-link/verify?${query}`);
  } else {
    const link = `${origin}/${language}/reset-password?token=${encodeURIComponent(token)}`;
    await sendAuthEmail(email, "reset", language, link);
  }
}

// The address a reset link belongs to, shown under "Set a new password".
export async function resetLinkEmail(token: string): Promise<string | null> {
  if (!databaseConfigured() || !token) return null;
  return asServer(async (db) => {
    const { rows } = await db
      .query(
        `select p.email from neon_auth.verification v
           join member_profiles p on p.user_id::text = v.value
          where v.identifier = $1 and v."expiresAt" > now()`,
        [`reset-password:${token}`],
      )
      .catch(() => ({ rows: [] as { email: string }[] }));
    return (rows[0]?.email as string | undefined) ?? null;
  });
}
