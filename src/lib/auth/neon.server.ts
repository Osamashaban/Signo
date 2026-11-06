import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

// Neon Auth (D31) holds the logins and passwords. Created on first use so a
// build or test without the settings still works; auth actions then fail
// safely with a general error.
type NeonAuth = ReturnType<typeof createNeonAuth>;
let instance: NeonAuth | null = null;

export function authConfigured(): boolean {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET ?? "";
  return !!process.env.NEON_AUTH_BASE_URL && secret.length >= 32;
}

export function neonAuth(): NeonAuth {
  if (!authConfigured()) throw new Error("Neon Auth is not configured. See .env.example.");
  instance ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!, sameSite: "lax" },
    logLevel: "error",
  });
  return instance;
}
