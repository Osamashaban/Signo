import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { ForgotForm } from "@/components/auth/ForgotForm";

// US-SGN-001 · Forgot password (AC8). Canvas: "Forgot password".
export default async function ForgotPage({ params }: PageProps<"/[locale]/forgot-password">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <AuthShell locale={locale as Locale} path="/forgot-password">
      <ForgotForm locale={locale as Locale} />
    </AuthShell>
  );
}
