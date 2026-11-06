import { createHash, randomBytes } from "node:crypto";

// 256 bits of randomness, URL-safe. Only the SHA-256 is stored.
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function emailKey(email: string): string {
  return sha256(email.trim().toLowerCase());
}
