import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { ResendButton } from "@/components/auth/ResendButton";
import { StatusCard, primaryButton, textLink } from "@/components/auth/Status";
import { currentMember } from "@/lib/auth/service.server";

// US-SGN-001 · Expired links (AC7, AC8, AC13). Canvas: "Expired verification
// link" (with Resend email) and "Expired login / reset link" (Request a new link).
async function Content({ locale, searchParams }: { locale: Locale; searchParams: PageProps<"/[locale]/link-expired">["searchParams"] }) {
  const { kind } = await searchParams;
  const t = await getTranslations({ locale, namespace: "Auth" });
  if (kind === "verify") {
    const member = await currentMember();
    return (
      <StatusCard icon="clock" title={t("expiredTitle")} body={t("m08")}>
        {member && !member.verified ? (
          <ResendButton locale={locale} email={`⁨${member.email}⁩`} initial={{}} />
        ) : (
          <Link href="/login" className={`${primaryButton} no-underline`}>
            {t("resend")}
          </Link>
        )}
        <Link href="/login" className={`self-center text-sm ${textLink}`}>
          {t("back")}
        </Link>
      </StatusCard>
    );
  }
  return (
    <StatusCard icon="clock" title={t("expiredTitle")} body={t("m08")}>
      <Link href={kind === "reset" ? "/forgot-password" : "/login"} className={`${primaryButton} no-underline`}>
        {t("newLink")}
      </Link>
      <Link href="/login" className={`self-center text-sm ${textLink}`}>
        {t("back")}
      </Link>
    </StatusCard>
  );
}

export default async function LinkExpiredPage({ params, searchParams }: PageProps<"/[locale]/link-expired">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <AuthShell locale={locale as Locale} path="/login">
      <Suspense fallback={null}>
        <Content locale={locale as Locale} searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
