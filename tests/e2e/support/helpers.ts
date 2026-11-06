import { type Page, expect } from "@playwright/test";
import ar from "../../../messages/ar.json";
import en from "../../../messages/en.json";

const AUTH = { ar: ar.Auth, en: en.Auth } as const;

export const MOCK = "http://localhost:3199";

let n = 0;
export function uniqueEmail(tag: string) {
  return `${tag}-${Date.now()}-${process.pid}-${n++}@agency.test`;
}

type Mail = { to: string[]; subject: string; html: string; text: string };

// The latest email the app "sent" to this address through the Resend stand-in.
export async function lastMail(to: string, count = 1): Promise<Mail> {
  await expect
    .poll(async () => ((await (await fetch(`${MOCK}/__mail?to=${encodeURIComponent(to)}`)).json()) as Mail[]).length, { timeout: 10_000 })
    .toBeGreaterThanOrEqual(count);
  const all = (await (await fetch(`${MOCK}/__mail?to=${encodeURIComponent(to)}`)).json()) as Mail[];
  return all.at(-1)!;
}

export async function mailCount(to: string): Promise<number> {
  return ((await (await fetch(`${MOCK}/__mail?to=${encodeURIComponent(to)}`)).json()) as Mail[]).length;
}

export function linkIn(mail: Mail): string {
  const m = mail.text.match(/https?:\/\/\S+/);
  if (!m) throw new Error("no link in email");
  return m[0];
}

export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

export async function noSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

export type Account = { fullName: string; email: string; password: string; agencyName: string };

export function newAccount(tag: string): Account {
  return { fullName: "Mostafa Adel", email: uniqueEmail(tag), password: "secret123", agencyName: "Mostateel Studio" };
}

// Fills and sends the sign-up form; language "ar" | "en" picks the toggle.
export async function signUp(page: Page, locale: "ar" | "en", a: Account, opts: { language?: "ar" | "en"; country?: string } = {}) {
  const t = AUTH[locale];
  await page.goto(`/${locale}/signup`);
  await expect(page.getByRole("button", { name: t.signupCta })).toBeEnabled(); // hydrated
  await page.getByLabel(t.fullName).fill(a.fullName);
  await page.getByLabel(t.email, { exact: true }).fill(a.email);
  await page.getByLabel(t.password, { exact: true }).fill(a.password);
  await page.getByLabel(t.agencyName).fill(a.agencyName);
  if (opts.country) await page.getByLabel(t.country).selectOption(opts.country);
  if (opts.language) await page.getByRole("radio", { name: opts.language === "ar" ? "العربية" : "English" }).click();
  await page.getByRole("button", { name: t.signupCta }).click();
}

export async function ready(page: Page, name: string) {
  await expect(page.getByRole("button", { name, exact: true })).toBeEnabled();
}

export async function logIn(page: Page, locale: "ar" | "en", email: string, password: string) {
  const t = AUTH[locale];
  await page.goto(`/${locale}/login`);
  await expect(page.getByRole("button", { name: t.loginCta, exact: true })).toBeEnabled(); // hydrated
  await page.getByLabel(t.email, { exact: true }).fill(email);
  await page.getByLabel(t.password, { exact: true }).fill(password);
  await page.getByRole("button", { name: t.loginCta, exact: true }).click();
}

// Signs up and opens the verification link: a verified member on /clients.
export async function verifiedMember(page: Page, locale: "ar" | "en", tag: string) {
  const a = newAccount(tag);
  await signUp(page, locale, a);
  await expect(page).toHaveURL(new RegExp(`/${locale}/check-email$`));
  await page.goto(linkIn(await lastMail(a.email)));
  await expect(page).toHaveURL(new RegExp(`/${locale}/clients$`));
  return a;
}
