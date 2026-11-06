import { type NextRequest, NextResponse } from "next/server";
import { getPathname } from "@/i18n/navigation";
import { isLanguage } from "@/lib/auth/rules";
import { verifyEmail } from "@/lib/auth/service.server";

// The link in the verification email (BR2, 24 hours). Valid: on to the
// clients page. Expired, used or replaced: the "Link expired" screen (AC13).
export async function GET(request: NextRequest, ctx: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await ctx.params;
  const locale = isLanguage(raw) ? raw : "ar";
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const result = await verifyEmail(token);
  const href = result === "verified" ? "/clients" : "/link-expired?kind=verify";
  const res = NextResponse.redirect(new URL(getPathname({ locale, href }), request.url), 303);
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
