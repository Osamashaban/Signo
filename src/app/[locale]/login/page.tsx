import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { LogInForm } from "@/components/auth/LogInForm";

// US-SGN-001 · Log in (AC4–AC7). Canvas: "Log in", "loading", "Wrong
// credentials", "Lockout", "Password changed".
export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Auth" });
  return { title: t("metaLogin") };
}

export default async function LogInPage({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <AuthShell locale={locale as Locale} path="/login">
      <LogInForm locale={locale as Locale} />
    </AuthShell>
  );
}
