"use server";

import { redirect } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { type FieldError, type Language, type SignUpErrors, checkEmail, checkPassword, isLanguage } from "@/lib/auth/rules";
import * as service from "@/lib/auth/service.server";

// Server actions behind the US-SGN-001 forms. Every input is checked again
// here; nothing from the browser is trusted.
const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v : "";
};
const localeOf = (f: FormData): Language => {
  const v = str(f, "locale");
  return isLanguage(v) ? v : "ar";
};
const go = (locale: Language, href: string): never => redirect(getPathname({ locale, href }));

// ------------------------------------------------------------------ sign-up
export type SignUpState = { errors: SignUpErrors; exists?: boolean; failed?: boolean };

export async function signUpAction(_prev: SignUpState, form: FormData): Promise<SignUpState> {
  const locale = localeOf(form);
  const input = {
    fullName: str(form, "fullName"),
    email: str(form, "email"),
    password: str(form, "password"),
    agencyName: str(form, "agencyName"),
    country: str(form, "country"),
    language: str(form, "language"),
  };
  const result = await service.signUp(input);
  if (!result.ok) {
    return { errors: result.errors, exists: result.exists, failed: result.failed };
  }
  return go(isLanguage(input.language) ? input.language : locale, "/check-email");
}

// ------------------------------------------------------------------- log in
export type LogInState = { banner?: "m04" | "m05" | "error"; emailError?: FieldError; email?: string };

export async function logInAction(_prev: LogInState, form: FormData): Promise<LogInState> {
  const locale = localeOf(form);
  const email = str(form, "email");
  const intent = str(form, "intent");

  if (intent === "magic") {
    const bad = checkEmail(email);
    if (bad) return { emailError: bad, email };
    const r = await service.requestMagicLink(email, locale);
    if (!r.ok) return { banner: r.reason === "locked" ? "m05" : "error", email };
    return go(locale, "/login-link-sent");
  }

  const r = await service.logIn(email, str(form, "password"));
  if (!r.ok) return { banner: r.reason === "locked" ? "m05" : r.reason === "wrong" ? "m04" : "error", email };
  // BR8 / AC9: the member's saved language wins on every device.
  return go(r.language, r.verified ? "/clients" : "/check-email");
}

// --------------------------------------------------- verification resend
export type ResendActionState = { state?: "resent" | "cooldown" | "limit"; seconds?: number };

export async function resendAction(_prev: ResendActionState, form: FormData): Promise<ResendActionState> {
  const locale = localeOf(form);
  const member = await service.currentMember();
  if (!member) return go(locale, "/login");
  if (member.verified) return go(member.language, "/clients");
  const before = await service.verificationState(member.userId);
  if (before.kind === "limit") return { state: "limit" };
  if (before.kind === "cooldown") return { state: "cooldown", seconds: before.seconds };
  const after = await service.resendVerification(member);
  return { state: "resent", seconds: after.kind === "cooldown" ? after.seconds : 60 };
}

// ---------------------------------------------------------- password reset
export type ForgotState = { emailError?: FieldError; failed?: boolean; email?: string };

export async function forgotAction(_prev: ForgotState, form: FormData): Promise<ForgotState> {
  const locale = localeOf(form);
  const email = str(form, "email");
  const bad = checkEmail(email);
  if (bad) return { emailError: bad, email };
  const ok = await service.requestPasswordReset(email, locale);
  if (!ok) return { failed: true, email };
  return go(locale, "/reset-link-sent");
}

export type NewPasswordState = { error?: FieldError; failed?: boolean };

export async function newPasswordAction(_prev: NewPasswordState, form: FormData): Promise<NewPasswordState> {
  const locale = localeOf(form);
  const password = str(form, "password");
  const bad = checkPassword(password);
  if (bad) return { error: bad };
  const r = await service.resetPassword(str(form, "token"), password);
  if (r === "expired") return go(locale, "/link-expired?kind=reset");
  if (r === "failed") return { failed: true };
  return go(locale, "/login?changed=1");
}

// ------------------------------------------------------- language, log out
export async function switchLanguageAction(form: FormData) {
  const to = str(form, "to");
  if (!isLanguage(to)) return;
  const member = await service.currentMember();
  if (member) await service.saveLanguage(member, to);
  return go(to, "/clients");
}

export async function logOutAction(form: FormData) {
  await service.logOut(); // this device only (BR10)
  return go(localeOf(form), "/login");
}
