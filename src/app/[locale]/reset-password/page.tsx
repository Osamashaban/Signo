import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { resetLinkEmail } from "@/lib/auth/service.server";

// US-SGN-001 · Set new password (AC8). Canvas: "Set new password",
// "New password too weak". Opened from the reset email.
async function Content({ locale, searchParams }: { locale: Locale; searchParams: PageProps<"/[locale]/reset-password">["searchParams"] }) {
  const { token, error } = await searchParams;
  if (typeof token !== "string" || !token || error) {
    redirect({ locale, href: "/link-expired?kind=reset" });
  }
  const email = await resetLinkEmail(token as string);
  return <NewPasswordForm locale={locale} token={token as string} email={email} />;
}

export default async function ResetPasswordPage({ params, searchParams }: PageProps<"/[locale]/reset-password">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <AuthShell locale={locale as Locale} path="/forgot-password">
      <Suspense fallback={null}>
        <Content locale={locale as Locale} searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
