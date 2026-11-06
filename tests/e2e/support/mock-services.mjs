// Stand-ins for Neon Auth and Resend, used only by the browser tests
// (npm run test:e2e). They speak the same HTTP shapes the app uses, so the
// real sign-up, log-in, login-link and reset flows run end to end without
// touching any real account or sending any real email.
import { createServer } from "node:http";
import { generateKeyPairSync, randomBytes, randomUUID, sign } from "node:crypto";
import pg from "pg";

const PORT = Number(process.env.MOCK_PORT ?? 3199);
const APP = process.env.MOCK_APP_URL ?? "http://localhost:3100";
const COOKIE = "__Secure-neon-auth.session_token";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const KID = "test-key";
const jwk = { ...publicKey.export({ format: "jwk" }), kid: KID, alg: "EdDSA" };

let users = new Map(); // email -> user
let sessions = new Map(); // token -> email
let links = new Map(); // token -> { email, type, expiresAt }
let mail = []; // emails "sent" through Resend

// Real Neon Auth keeps reset tokens in neon_auth.verification, in the app's
// own database; the app reads it to show the email and clear the lockout.
const db = process.env.MOCK_DATABASE_URL ? new pg.Pool({ connectionString: process.env.MOCK_DATABASE_URL, max: 2 }) : null;
const dbReady = db?.query(`create schema if not exists neon_auth;
  create table if not exists neon_auth.verification (
    id uuid primary key default gen_random_uuid(), identifier text not null, value text not null,
    "expiresAt" timestamptz not null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now())`);
const dbRun = async (sql, args) => { if (db) { await dbReady; await db.query(sql, args); } };

const now = () => new Date().toISOString();
const json = (res, status, body, headers = {}) => {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
};
const read = (req) =>
  new Promise((ok) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => ok(b ? JSON.parse(b) : {}));
  });
const tokenFrom = (req) =>
  (req.headers.cookie ?? "")
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([n]) => n === COOKIE)?.[1];
const userJson = (u) => ({ id: u.id, email: u.email, name: u.name, emailVerified: u.emailVerified, createdAt: u.createdAt, updatedAt: u.createdAt });
const startSession = (email) => {
  const token = randomBytes(16).toString("hex");
  sessions.set(token, email);
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
};

async function webhook(event, user, data) {
  const body = JSON.stringify({ event_id: randomUUID(), event_type: event, timestamp: now(), user: { email: user.email }, event_data: data });
  const ts = String(Date.now());
  const header = Buffer.from(JSON.stringify({ alg: "EdDSA", kid: KID })).toString("base64url");
  const signed = Buffer.from(`${ts}.${Buffer.from(body).toString("base64url")}`).toString("base64url");
  const sig = sign(null, Buffer.from(`${header}.${signed}`), privateKey).toString("base64url");
  await fetch(`${APP}/api/auth-webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-neon-signature": `${header}..${sig}`, "x-neon-signature-kid": KID, "x-neon-timestamp": ts },
    body,
  }).catch(() => {});
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // ---- test helpers
  if (path === "/__mail") {
    const to = url.searchParams.get("to");
    return json(res, 200, mail.filter((m) => m.to.includes(to)));
  }
  if (path === "/__expire") {
    for (const [t, l] of links) {
      if (l.email !== url.searchParams.get("email")) continue;
      l.expiresAt = 0;
      await dbRun(`update neon_auth.verification set "expiresAt" = now() - interval '1 second' where identifier = $1`, [`reset-password:${t}`]);
    }
    return json(res, 200, { ok: true });
  }
  if (path === "/health") return json(res, 200, { ok: true });

  // ---- Resend
  if (path === "/resend/emails" && req.method === "POST") {
    if (req.headers.authorization !== "Bearer test-resend-key") return json(res, 401, { message: "bad key" });
    mail.push(await read(req));
    return json(res, 200, { id: randomUUID() });
  }

  // ---- Neon Auth (Managed Better Auth)
  if (!path.startsWith("/auth/")) return json(res, 404, {});
  const route = path.slice("/auth/".length);

  if (route === ".well-known/jwks.json") return json(res, 200, { keys: [jwk] });

  if (route === "get-session") {
    const email = sessions.get(tokenFrom(req));
    const u = email && users.get(email);
    if (!u) return json(res, 200, null);
    const day = new Date(Date.now() + 86400000).toISOString();
    return json(res, 200, { session: { id: "s", userId: u.id, token: tokenFrom(req), expiresAt: day, createdAt: now(), updatedAt: now() }, user: userJson(u) });
  }

  if (route === "sign-up/email" && req.method === "POST") {
    const b = await read(req);
    if (users.has(b.email)) return json(res, 422, { code: "USER_ALREADY_EXISTS", message: "User already exists" });
    const u = { id: randomUUID(), email: b.email, name: b.name, password: b.password, emailVerified: false, createdAt: now() };
    users.set(b.email, u);
    return json(res, 200, { token: null, user: userJson(u) }, { "set-cookie": startSession(b.email) });
  }

  if (route === "sign-in/email" && req.method === "POST") {
    const b = await read(req);
    const u = users.get(b.email);
    if (!u || u.password !== b.password) return json(res, 401, { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" });
    return json(res, 200, { redirect: false, user: userJson(u) }, { "set-cookie": startSession(b.email) });
  }

  if (route === "sign-out" && req.method === "POST") {
    sessions.delete(tokenFrom(req));
    return json(res, 200, { success: true }, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0` });
  }

  if (route === "sign-in/magic-link" && req.method === "POST") {
    const b = await read(req);
    const u = users.get(b.email);
    if (u) {
      const token = randomBytes(16).toString("hex");
      links.set(token, { email: u.email, type: "sign-in", expiresAt: Date.now() + 3600000 });
      await webhook("send.magic_link", u, { link_type: "sign-in", token, link_url: `http://localhost:${PORT}/auth/magic-link/verify?token=${token}` });
    }
    return json(res, 200, { status: true });
  }

  if (route === "magic-link/verify") {
    const l = links.get(url.searchParams.get("token"));
    const ok = l && l.type === "sign-in" && l.expiresAt > Date.now();
    if (!ok) {
      res.writeHead(302, { location: `${url.searchParams.get("errorCallbackURL")}&error=EXPIRED_TOKEN` });
      return res.end();
    }
    links.delete(url.searchParams.get("token"));
    res.writeHead(302, { location: url.searchParams.get("callbackURL"), "set-cookie": startSession(l.email) });
    return res.end();
  }

  if (route === "request-password-reset" && req.method === "POST") {
    const b = await read(req);
    const u = users.get(b.email);
    if (u) {
      const token = randomBytes(16).toString("hex");
      links.set(token, { email: u.email, type: "reset", expiresAt: Date.now() + 3600000 });
      await dbRun(`insert into neon_auth.verification (identifier, value, "expiresAt") values ($1, $2, now() + interval '1 hour')`, [`reset-password:${token}`, u.id]);
      await webhook("send.magic_link", u, { link_type: "forget-password", token, link_url: `http://localhost:${PORT}/auth/reset-password/${token}` });
    }
    return json(res, 200, { status: true });
  }

  if (route === "reset-password" && req.method === "POST") {
    const b = await read(req);
    const l = links.get(b.token);
    if (!l || l.type !== "reset" || l.expiresAt < Date.now()) return json(res, 400, { code: "INVALID_TOKEN", message: "Invalid token" });
    links.delete(b.token);
    await dbRun(`delete from neon_auth.verification where identifier = $1`, [`reset-password:${b.token}`]);
    users.get(l.email).password = b.newPassword;
    for (const [t, e] of sessions) if (e === l.email) sessions.delete(t);
    return json(res, 200, { status: true });
  }

  return json(res, 404, { code: "NOT_FOUND" });
}).listen(PORT, () => console.log(`mock services on ${PORT}`));
