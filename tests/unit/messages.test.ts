import { describe, expect, it } from "vitest";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

// CLAUDE.md rule 7: every UI string exists in both languages.
function keysOf(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object"
      ? keysOf(value as Record<string, unknown>, path)
      : [path];
  });
}

describe("translations", () => {
  it("Arabic and English have exactly the same keys", () => {
    expect(keysOf(ar).sort()).toEqual(keysOf(en).sort());
  });

  it("no translation is empty", () => {
    for (const messages of [ar, en]) {
      for (const key of keysOf(messages)) {
        const value = key
          .split(".")
          .reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages);
        expect(String(value).trim(), key).not.toBe("");
      }
    }
  });
});
