import { describe, expect, it } from "vitest";
import { directionOf, routing } from "@/i18n/routing";

describe("routing", () => {
  it("supports Arabic and English, Arabic first", () => {
    expect(routing.locales).toEqual(["ar", "en"]);
    expect(routing.defaultLocale).toBe("ar");
  });

  it("Arabic is right-to-left, English left-to-right", () => {
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });
});
