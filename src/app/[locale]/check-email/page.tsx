import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { ResendButton } from "@/components/auth/ResendButton";
import { StatusCard, textLink } from "@/components/auth/Status";
import { currentMember, verificationState } from "@/lib/auth/service.server";

// US-SGN-001 · Check your email (AC1, AC4, AC12). Canvas: "Check your email",
// "New link sent + countdown", "Resend limit".
const isolate = (s: string) => `⁨${s}⁩`; // keeps the address left-to-right (rule 9)

async function Content({ locale }: { locale: Locale }) {
  const member = await currentMember();
  if (!member) redirect({ locale, href: "/login" });
  if (member!.verified) redirect({ locale: member!.language, href: "/clients" });
  const t = await getTranslations({ locale, namespace: "Auth" });
  const s = await verificationState(member!.userId);
  // As drawn: "Resend email" is ready on arrival; the 60-second wait shows
  // after a resend (the server still enforces it), the hourly limit at once.
  const initial = s.kind === "limit" ? { state: "limit" as const } : {};
  return (
    <StatusCard icon="mail" title={t("checkTitle")} body={t("m01", { email: isolate(member!.email) })}>
      <ResendButton locale={locale} email={isolate(member!.email)} initial={initial} />
      <Link href="/login" className={`self-center text-sm ${textLink}`}>
        {t("back")}
      </Link>
    </StatusCard>
  );
}

export default async function CheckEmailPage({ params }: PageProps<"/[locale]/check-email">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <AuthShell locale={locale as Locale} path="/check-email">
      <Suspense fallback={null}>
        <Content locale={locale as Locale} />
      </Suspense>
    </AuthShell>
  );
}
