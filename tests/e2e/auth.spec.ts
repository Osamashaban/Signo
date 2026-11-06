import { expect, test } from "@playwright/test";
import arAll from "../../messages/ar.json";
import enAll from "../../messages/en.json";
import { MOCK, lastMail, linkIn, logIn, mailCount, newAccount, noSidewaysScroll, ready, signUp, verifiedMember, watchConsole } from "./support/helpers";

// US-SGN-001 acceptance criteria, end to end, in both languages, on desktop
// and phone (the two Playwright projects). Neon Auth and Resend are replaced
// by local stand-ins; the database is the tests' own Postgres.
const T = { ar: arAll.Auth, en: enAll.Auth } as const;
const E = { ar: arAll.Email, en: enAll.Email } as const;
const iso = (s: string) => `⁨${s}⁩`;

for (const locale of ["ar", "en"] as const) {
  const t = T[locale];
  const other = locale === "ar" ? "en" : "ar";

  test.describe(`${locale}`, () => {
    test("AC1: sign-up creates the workspace, emails in the chosen language, shows Check your email", async ({ page }) => {
      const errors = watchConsole(page);
      const a = newAccount("ac1");
      await signUp(page, locale, a, { language: other, country: "uae" });
      // The chosen language (BR8) decides where the person lands and the email language.
      await expect(page).toHaveURL(new RegExp(`/${other}/check-email$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(T[other].checkTitle);
      await expect(page.getByText(T[other].m01.replace("{email}", iso(a.email)))).toBeVisible();
      const mail = await lastMail(a.email);
      expect(mail.subject).toBe(E[other].verifySubject);
      expect(mail.text).toContain(E[other].verifyBody);
      expect(linkIn(mail)).toContain(`/${other}/verify-email?token=`);
      await noSidewaysScroll(page);
      expect(errors).toEqual([]);
    });

    test("AC11 + AC3: wrong fields show together under each field and nothing is sent", async ({ page }) => {
      await page.goto(`/${locale}/signup`);
      await ready(page, t.signupCta);
      await expect(page.getByRole("radio", { name: locale === "ar" ? "العربية" : "English" })).toHaveAttribute("aria-checked", "true"); // BR11
      await page.getByLabel(t.fullName).fill("M");
      await page.getByLabel(t.email, { exact: true }).fill("mostafa@studio");
      await page.getByLabel(t.password, { exact: true }).fill("short1");
      await page.getByRole("button", { name: t.signupCta }).click();
      await expect(page.getByText(t.m12)).toBeVisible();
      await expect(page.getByText(t.m11)).toBeVisible();
      await expect(page.getByText(t.m03)).toBeVisible();
      await expect(page.getByText(t.m10)).toBeVisible(); // agency name left empty
      await expect(page.getByLabel(t.fullName)).toHaveAttribute("aria-invalid", "true");
      await expect(page).toHaveURL(new RegExp(`/${locale}/signup$`));
      for (const weak of ["abcdefgh", "12345678"]) {
        await page.getByLabel(t.password, { exact: true }).fill(weak);
        await page.getByRole("button", { name: t.signupCta }).click();
        await expect(page.getByText(t.m03)).toBeVisible();
      }
      await noSidewaysScroll(page);
    });

    test("AC2: an email that already has an account shows MSG-001-02 and creates nothing", async ({ page }) => {
      const a = newAccount("ac2");
      await signUp(page, locale, a);
      await expect(page).toHaveURL(/check-email$/);
      await page.context().clearCookies();
      await signUp(page, locale, { ...a, agencyName: "Second Agency" });
      await expect(page.getByTestId("banner")).toContainText(t.m02);
      await expect(page).toHaveURL(new RegExp(`/${locale}/signup$`));
      expect(await mailCount(a.email)).toBe(1);
    });

    test("AC4 + AC12: an unverified member sees Check your email, resend waits 60 s", async ({ page }) => {
      const a = newAccount("ac4");
      await signUp(page, locale, a);
      await page.context().clearCookies();
      await logIn(page, locale, a.email, a.password);
      await expect(page).toHaveURL(new RegExp(`/${locale}/check-email$`));
      await page.goto(`/${locale}/clients`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/check-email$`)); // cannot open the clients list
      // "Resend email" is ready as drawn; the sign-up email went out seconds
      // ago, so a resend now is held back and counts down instead (60 s).
      await expect(page.getByTestId("resend")).toHaveText(t.resend);
      await page.getByTestId("resend").click();
      await expect(page.getByTestId("resend")).toBeDisabled();
      await expect(page.getByTestId("resend")).toContainText(t.m14.split("{seconds}")[0].trim());
      expect(await mailCount(a.email)).toBe(1);
    });

    test("AC13: an unknown or used verification link shows Link expired", async ({ page }) => {
      await page.goto(`/${locale}/verify-email?token=not-a-real-token`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/link-expired\\?kind=verify$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.expiredTitle);
      await expect(page.getByText(t.m08)).toBeVisible();
    });

    test("AC5 + AC14: verified log-in lands on the agency's clients page; log out ends it", async ({ page }) => {
      const errors = watchConsole(page);
      const a = await verifiedMember(page, locale, "ac5");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.m16);
      await expect(page.getByTestId("agency-name")).toHaveText(a.agencyName);
      await noSidewaysScroll(page);
      // The verification link works once only.
      const used = linkIn(await lastMail(a.email));
      await page.getByRole("button", { name: t.logout }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/login$`));
      await page.goto(`/${locale}/clients`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/login$`));
      await page.goto(used);
      await expect(page).toHaveURL(/link-expired\?kind=verify$/);
      await logIn(page, locale, a.email, a.password);
      await expect(page).toHaveURL(new RegExp(`/${locale}/clients$`));
      expect(errors).toEqual([]);
    });

    test("AC6: wrong password shows MSG-001-04; the 5th in 15 minutes locks log-in and login links", async ({ page }) => {
      const a = await verifiedMember(page, locale, "ac6");
      await page.context().clearCookies();
      for (let i = 1; i <= 4; i++) {
        await logIn(page, locale, a.email, `wrong${i}pass`);
        await expect(page.getByTestId("banner")).toHaveText(t.m04);
        await expect(page.getByLabel(t.password, { exact: true })).toHaveAttribute("aria-invalid", "true");
      }
      await logIn(page, locale, a.email, "wrong5pass");
      await expect(page.getByTestId("banner")).toContainText(t.m05);
      await expect(page.getByRole("button", { name: t.loginCta, exact: true })).toBeDisabled();
      await expect(page.getByRole("button", { name: t.magic })).toBeDisabled();
      await expect(page.getByRole("link", { name: t.resetLink })).toBeVisible(); // reset stays open (D20)
      // Even the right password is refused while locked.
      await logIn(page, locale, a.email, a.password);
      await expect(page.getByTestId("banner")).toContainText(t.m05);
      // A login link is refused too.
      await page.goto(`/${locale}/login`);
      await ready(page, t.loginCta);
      await page.getByLabel(t.email, { exact: true }).fill(a.email);
      await page.getByRole("button", { name: t.magic }).click();
      await expect(page.getByTestId("banner")).toContainText(t.m05);
    });

    test("AC7: a login link logs in and lands on the clients page", async ({ page }) => {
      const a = await verifiedMember(page, locale, "ac7");
      await page.context().clearCookies();
      await page.goto(`/${locale}/login`);
      await ready(page, t.loginCta);
      await page.getByLabel(t.email, { exact: true }).fill(a.email);
      await page.getByRole("button", { name: t.magic }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/login-link-sent$`));
      await expect(page.getByText(t.m06)).toBeVisible();
      const mail = await lastMail(a.email, 2);
      expect(mail.subject).toBe(E[locale].magicSubject);
      await page.goto(linkIn(mail));
      await expect(page).toHaveURL(new RegExp(`/${locale}/clients$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.m16);
    });

    test("AC7: an unknown email still shows MSG-001-06 and nothing is sent", async ({ page }) => {
      await page.goto(`/${locale}/login`);
      await ready(page, t.loginCta);
      const email = `nobody-${Date.now()}@agency.test`;
      await page.getByLabel(t.email, { exact: true }).fill(email);
      await page.getByRole("button", { name: t.magic }).click();
      await expect(page).toHaveURL(/login-link-sent$/);
      expect(await mailCount(email)).toBe(0);
    });

    test("AC8: password reset changes the password; the old one stops working", async ({ page }) => {
      const a = await verifiedMember(page, locale, "ac8");
      await page.context().clearCookies();
      await page.goto(`/${locale}/forgot-password`);
      await ready(page, t.forgotCta);
      await page.getByLabel(t.email, { exact: true }).fill(a.email);
      await page.getByRole("button", { name: t.forgotCta }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/reset-link-sent$`));
      await expect(page.getByText(t.m07)).toBeVisible();
      const mail = await lastMail(a.email, 2);
      expect(mail.subject).toBe(E[locale].resetSubject);
      await page.goto(linkIn(mail));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.newTitle);
      await expect(page.getByText(a.email, { exact: true })).toBeVisible();
      await ready(page, t.newCta);
      await page.getByLabel(t.newPassword).fill("weakpass");
      await page.getByRole("button", { name: t.newCta }).click();
      await expect(page.getByText(t.m03)).toBeVisible();
      await page.getByLabel(t.newPassword).fill("brandnew42");
      await page.getByRole("button", { name: t.newCta }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/login\\?changed=1$`));
      await expect(page.getByTestId("banner")).toHaveText(t.m09);
      await logIn(page, locale, a.email, a.password);
      await expect(page.getByTestId("banner")).toHaveText(t.m04);
      await logIn(page, locale, a.email, "brandnew42");
      await expect(page).toHaveURL(new RegExp(`/${locale}/clients$`));
      // The same reset link cannot be used twice.
      await page.goto(linkIn(mail));
      await page.getByLabel(t.newPassword).fill("another42");
      await page.getByRole("button", { name: t.newCta }).click();
      await expect(page).toHaveURL(/link-expired\?kind=reset$/);
      await expect(page.getByRole("link", { name: t.newLink })).toHaveAttribute("href", new RegExp(`/${locale}/forgot-password$`));
    });

    test("BR7: a password reset clears the lockout", async ({ page }) => {
      const a = await verifiedMember(page, locale, "ac6r");
      await page.context().clearCookies();
      for (let i = 0; i < 5; i++) {
        await logIn(page, locale, a.email, "wrong1pass");
        await expect(page.getByTestId("banner")).toBeVisible();
      }
      await expect(page.getByTestId("banner")).toContainText(t.m05);
      await page.goto(`/${locale}/forgot-password`);
      await ready(page, t.forgotCta);
      await page.getByLabel(t.email, { exact: true }).fill(a.email);
      await page.getByRole("button", { name: t.forgotCta }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/reset-link-sent$`));
      await page.goto(linkIn(await lastMail(a.email, 2)));
      await ready(page, t.newCta);
      await page.getByLabel(t.newPassword).fill("brandnew42");
      await page.getByRole("button", { name: t.newCta }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/login\\?changed=1$`));
      await logIn(page, locale, a.email, "brandnew42");
      await expect(page).toHaveURL(new RegExp(`/${locale}/clients$`));
    });

    test("AC7: an expired login link shows Link expired", async ({ page }) => {
      const a = await verifiedMember(page, locale, "ac7x");
      await page.context().clearCookies();
      await page.goto(`/${locale}/login`);
      await ready(page, t.loginCta);
      await page.getByLabel(t.email, { exact: true }).fill(a.email);
      await page.getByRole("button", { name: t.magic }).click();
      await expect(page).toHaveURL(/login-link-sent$/);
      const link = linkIn(await lastMail(a.email, 2));
      await fetch(`${MOCK}/__expire?email=${encodeURIComponent(a.email)}`);
      await page.goto(link);
      await expect(page).toHaveURL(new RegExp(`/${locale}/link-expired\\?kind=login`));
      await expect(page.getByText(t.m08)).toBeVisible();
    });
  });
}

test("AC9: the language choice is saved and follows the member to another device", async ({ page, browser }) => {
  const a = await verifiedMember(page, "ar", "ac9");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByTestId("other-language").click();
  await expect(page).toHaveURL(/\/en\/clients$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(T.en.m16);
  await page.getByRole("button", { name: T.en.logout }).click();
  // "Another device": a fresh browser with no cookies, opening the Arabic log-in.
  const other = await browser.newContext();
  const p2 = await other.newPage();
  await logIn(p2, "ar", a.email, a.password);
  await expect(p2).toHaveURL(/\/en\/clients$/);
  await other.close();
});
