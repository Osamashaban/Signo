import { expect, test } from "@playwright/test";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

// v0 "Coming soon" screen (Claude Design canvas, page v0).

// A browser set to English gets English; any other language gets Arabic.
test.describe("default language", () => {
  test.use({ locale: "fr-FR" });
  test("the home address opens the Arabic page by default", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });
});

for (const [locale, t, dir] of [
  ["ar", ar.ComingSoon, "rtl"],
  ["en", en.ComingSoon, "ltr"],
] as const) {
  test(`${locale}: shows every line of the design, word for word`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`/${locale}`);
    await expect(page).toHaveTitle(t.metaTitle);
    await expect(page.locator("html")).toHaveAttribute("dir", dir);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.title);
    for (const text of [t.brand, t.brandAlt, t.badge, t.body, t.foot]) {
      await expect(page.getByText(text, { exact: true })).toBeVisible();
    }
    // Nothing spills sideways on a phone or desktop.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test(`${locale}: the language button opens the other language`, async ({ page }) => {
    const other = locale === "ar" ? "en" : "ar";
    await page.goto(`/${locale}`);
    await page.getByTestId("other-language").click();
    await expect(page).toHaveURL(new RegExp(`/${other}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", other);
  });
}
