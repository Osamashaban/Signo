import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { type Jwk, verifyNeonSignature } from "@/lib/auth/webhook";

// Only emails Neon Auth asked for are sent: the signature must match its key.
const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const keys: Jwk[] = [{ ...(publicKey.export({ format: "jwk" }) as Jwk), kid: "k1" }];

function signed(body: string, ts: number, key = privateKey) {
  const header = Buffer.from(JSON.stringify({ alg: "EdDSA", kid: "k1" })).toString("base64url");
  const payload = Buffer.from(`${ts}.${Buffer.from(body).toString("base64url")}`).toString("base64url");
  return `${header}..${sign(null, Buffer.from(`${header}.${payload}`), key).toString("base64url")}`;
}

describe("Neon Auth webhook signature", () => {
  const body = JSON.stringify({ event_type: "send.magic_link", user: { email: "a@b.co" } });
  const now = Date.now();

  it("accepts a fresh, correctly signed request", () => {
    expect(verifyNeonSignature({ rawBody: body, signature: signed(body, now), kid: "k1", timestamp: String(now), keys })).toBe(true);
  });
  it("rejects a changed body", () => {
    expect(verifyNeonSignature({ rawBody: body + " ", signature: signed(body, now), kid: "k1", timestamp: String(now), keys })).toBe(false);
  });
  it("rejects another key", () => {
    const other = generateKeyPairSync("ed25519").privateKey;
    expect(verifyNeonSignature({ rawBody: body, signature: signed(body, now, other), kid: "k1", timestamp: String(now), keys })).toBe(false);
  });
  it("rejects an old request (replay)", () => {
    const old = now - 6 * 60 * 1000;
    expect(verifyNeonSignature({ rawBody: body, signature: signed(body, old), kid: "k1", timestamp: String(old), keys })).toBe(false);
  });
  it("rejects missing headers and unknown keys", () => {
    expect(verifyNeonSignature({ rawBody: body, signature: null, kid: "k1", timestamp: String(now), keys })).toBe(false);
    expect(verifyNeonSignature({ rawBody: body, signature: signed(body, now), kid: "nope", timestamp: String(now), keys })).toBe(false);
  });
});
