import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { SignUpForm } from "@/components/auth/SignUpForm";

// US-SGN-001 · Sign up (AC1–AC3, AC11). Canvas: "Sign up", "Field errors",
// "Weak password", "Email exists".
export async function generateMetadata({ params }: PageProps<"/[locale]/signup">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Auth" });
  return { title: t("metaSignup") };
}

export default async function SignUpPage({ params }: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <AuthShell locale={locale as Locale} path="/signup">
      <SignUpForm locale={locale as Locale} />
    </AuthShell>
  );
}
