import "server-only";
import { getTranslations } from "next-intl/server";
import type { Language } from "@/lib/auth/rules";

// Auth emails in the member's own language (D29), sent through Resend's
// HTTP API (D32). Plain fetch, no SDK, so it moves with the app (D20).
export type AuthEmail = "verify" | "magic" | "reset";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function renderAuthEmail(kind: AuthEmail, language: Language, link: string) {
  const t = await getTranslations({ locale: language, namespace: "Email" });
  const dir = language === "ar" ? "rtl" : "ltr";
  const subject = t(`${kind}Subject`);
  const body = t(`${kind}Body`);
  const button = t(`${kind}Button`);
  const ignore = t("ignore");
  const href = escapeHtml(link);
  const html = `<!doctype html><html lang="${language}" dir="${dir}"><body style="margin:0;background:#f4f6f3;font-family:Arial,sans-serif;color:#17201d">
<div style="max-width:520px;margin:0 auto;padding:32px 24px;text-align:start">
<p style="font-size:22px;font-weight:700;margin:0 0 24px">${language === "ar" ? "سيجنو" : "Signo"}</p>
<p style="font-size:16px;line-height:1.7;margin:0 0 24px">${escapeHtml(body)}</p>
<p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;background:#0f5e5a;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">${escapeHtml(button)}</a></p>
<p style="font-size:13px;line-height:1.6;color:#56625d;margin:0">${escapeHtml(ignore)}</p>
</div></body></html>`;
  const text = `${body}\n\n${link}\n\n${ignore}`;
  return { subject, html, text };
}

export async function sendAuthEmail(to: string, kind: AuthEmail, language: Language, link: string) {
  const { subject, html, text } = await renderAuthEmail(kind, language, link);
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Local and CI runs have no email key. Never log the link: it is a secret.
    console.warn(`[email] RESEND_API_KEY not set; ${kind} email not sent`);
    return;
  }
  const res = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Signo <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend refused the ${kind} email (HTTP ${res.status})`);
}
