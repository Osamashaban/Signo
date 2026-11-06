import { createPublicKey, verify, type JsonWebKey } from "node:crypto";

// Checks a Neon Auth webhook signature: detached JWS (Ed25519) over
// "<timestamp>.<base64url(body)>", per Neon's webhook reference.
export const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000;

export type Jwk = JsonWebKey & { kid?: string };

export function verifyNeonSignature(opts: {
  rawBody: string;
  signature: string | null;
  kid: string | null;
  timestamp: string | null;
  keys: Jwk[];
  now?: number;
}): boolean {
  const { rawBody, signature, kid, timestamp, keys } = opts;
  if (!signature || !kid || !timestamp) return false;
  const age = (opts.now ?? Date.now()) - Number.parseInt(timestamp, 10);
  if (!Number.isFinite(age) || Math.abs(age) > MAX_WEBHOOK_AGE_MS) return false;
  const jwk = keys.find((k) => k.kid === kid);
  if (!jwk) return false;
  const [header, empty, sig] = signature.split(".");
  if (!header || empty !== "" || !sig) return false;
  try {
    const payload = Buffer.from(rawBody, "utf8").toString("base64url");
    const signed = Buffer.from(`${timestamp}.${payload}`, "utf8").toString("base64url");
    const key = createPublicKey({ key: jwk, format: "jwk" });
    return verify(null, Buffer.from(`${header}.${signed}`), key, Buffer.from(sig, "base64url"));
  } catch {
    return false;
  }
}
