import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
export const MOCK_PORT = 3199;

// Local settings, if any (see tests/README.md).
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (CI sets the variables directly).
}

const E2E_DATABASE_URL = process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/signo";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      // Stand-ins for Neon Auth and Resend (tests/e2e/support/mock-services.mjs).
      command: `node tests/e2e/support/mock-services.mjs`,
      url: `http://localhost:${MOCK_PORT}/health`,
      env: { MOCK_PORT: String(MOCK_PORT), MOCK_APP_URL: `http://localhost:${PORT}`, MOCK_DATABASE_URL: E2E_DATABASE_URL },
      reuseExistingServer: false,
      timeout: 20_000,
    },
    {
      command: `npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      // The tests' own throwaway Postgres and the stand-ins above. Never Neon.
      env: {
        DATABASE_URL: E2E_DATABASE_URL,
        NEON_AUTH_BASE_URL: `http://localhost:${MOCK_PORT}/auth`,
        NEON_AUTH_COOKIE_SECRET: "e2e-only-cookie-secret-0123456789abcdef",
        RESEND_API_KEY: "test-resend-key",
        RESEND_API_URL: `http://localhost:${MOCK_PORT}/resend/emails`,
        EMAIL_FROM: "Signo <test@example.com>",
        APP_URL: `http://localhost:${PORT}`,
      },
    },
  ],
});
