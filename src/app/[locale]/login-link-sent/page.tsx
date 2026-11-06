import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { StatusCard, textLink } from "@/components/auth/Status";

// US-SGN-001 · Canvas: "Login link sent · MSG-001-06 (AC7)".
export default async function Page({ params }: PageProps<"/[locale]/login-link-sent">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Auth" });
  return (
    <AuthShell locale={locale as Locale} path="/login-link-sent">
      <StatusCard icon="mail" title={t("magicTitle")} body={t("m06")}>
        <Link href="/login" className={`self-center text-sm ${textLink}`}>
          {t("back")}
        </Link>
      </StatusCard>
    </AuthShell>
  );
}
