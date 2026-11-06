import { connection } from "next/server";
import { cookies } from "next/headers";
import { authConfigured } from "@/lib/auth/neon.server";
import { appOrigin } from "@/lib/auth/origin.server";

// The login link in the email (AC7) opens here. Signo asks Neon Auth to check
// the link and copies the session cookie onto Signo's own domain, then sends
// the person on. Nothing else of Neon Auth is reachable through this address:
// sign-up and log-in go through Signo's server actions, which apply the
// lockout (BR7) and create the agency (BR1).
const SESSION_COOKIE = "__Secure-neon-auth.session_token";

export async function GET(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  await connection();
  const { path } = await ctx.params;
  if (!authConfigured() || path.join("/") !== "magic-link/verify") {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  const origin = appOrigin();
  const incoming = new URL(request.url).searchParams;
  const fallback = `${origin}/ar/link-expired?kind=login`;
  // Only Signo's own pages may be the destination (no open redirect).
  const own = (u: string | null) => (u && (u === origin || u.startsWith(`${origin}/`)) ? u : null);
  const query = new URLSearchParams({
    token: incoming.get("token") ?? "",
    callbackURL: own(incoming.get("callbackURL")) ?? `${origin}/ar/clients`,
    errorCallbackURL: own(incoming.get("errorCallbackURL")) ?? fallback,
  });

  const base = process.env.NEON_AUTH_BASE_URL!.replace(/\/$/, "");
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/magic-link/verify?${query}`, {
      redirect: "manual",
      headers: { Origin: origin },
      cache: "no-store",
    });
  } catch {
    return Response.redirect(fallback, 303);
  }

  const jar = await cookies();
  for (const header of upstream.headers.getSetCookie()) {
    const [pair] = header.split(";");
    const eq = pair.indexOf("=");
    const name = pair.slice(0, eq).trim();
    if (name !== SESSION_COOKIE) continue;
    const maxAge = /max-age=(\d+)/i.exec(header)?.[1];
    jar.set(name, pair.slice(eq + 1).trim(), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      ...(maxAge ? { maxAge: Number(maxAge) } : {}),
    });
  }
  const location = own(upstream.headers.get("location"));
  return new Response(null, {
    status: 303,
    headers: { Location: location ?? fallback, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
