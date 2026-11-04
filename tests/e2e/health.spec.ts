import { expect, test } from "@playwright/test";

// Pipeline check: the health endpoint answers and never leaks connection details.
test("health endpoint reports the app and database state", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.app).toBe("running");
  expect(["connected", "not_configured", "not_migrated", "unreachable"]).toContain(body.database);
  expect(JSON.stringify(body)).not.toMatch(/postgres(ql)?:\/\//);
});
