import { connection } from "next/server";
import { deliverAuthLink } from "@/lib/auth/service.server";
import { type Jwk, verifyNeonSignature } from "@/lib/auth/webhook";

// Neon Auth calls this when it needs to send a login link or a password
// reset link (events send.magic_link). Only requests signed by Neon Auth's
// key are accepted. Nothing secret is logged.
let cachedKeys: { keys: Jwk[]; at: number } | null = null;

async function neonKeys(refresh = false): Promise<Jwk[]> {
  const base = process.env.NEON_AUTH_BASE_URL;
  if (!base) return [];
  if (!refresh && cachedKeys && Date.now() - cachedKeys.at < 60 * 60 * 1000) return cachedKeys.keys;
  const res = await fetch(`${base.replace(/\/$/, "")}/.well-known/jwks.json`, { cache: "no-store" });
  if (!res.ok) return cachedKeys?.keys ?? [];
  const body = (await res.json()) as { keys?: Jwk[] };
  cachedKeys = { keys: body.keys ?? [], at: Date.now() };
  return cachedKeys.keys;
}

export async function POST(request: Request) {
  await connection();
  const rawBody = await request.text();
  const h = request.headers;
  const signed = {
    rawBody,
    signature: h.get("x-neon-signature"),
    kid: h.get("x-neon-signature-kid"),
    timestamp: h.get("x-neon-timestamp"),
  };
  let ok = verifyNeonSignature({ ...signed, keys: await neonKeys() });
  if (!ok && signed.kid) ok = verifyNeonSignature({ ...signed, keys: await neonKeys(true) });
  if (!ok) return Response.json({ error: "unauthorized" }, { status: 401 });

  const payload = JSON.parse(rawBody) as {
    event_type?: string;
    user?: { email?: string };
    event_data?: { link_type?: string; token?: string };
  };
  const email = payload.user?.email;
  const type = payload.event_data?.link_type;
  const token = payload.event_data?.token;
  if (payload.event_type === "send.magic_link" && email && token && (type === "sign-in" || type === "forget-password")) {
    try {
      await deliverAuthLink(type, email, token);
    } catch (cause) {
      console.error("[auth-webhook] could not send the email", (cause as Error).message);
      return Response.json({ error: "email_failed" }, { status: 500 });
    }
  }
  return Response.json({ ok: true });
}
