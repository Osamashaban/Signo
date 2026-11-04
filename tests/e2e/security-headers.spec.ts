import { expect, test } from "@playwright/test";

// Pipeline step 9: pages can't be framed or sniffed, and don't leak referrers.
for (const path of ["/ar", "/en", "/api/health"]) {
  test(`security headers on ${path}`, async ({ request }) => {
    const response = await request.get(path);
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
}
