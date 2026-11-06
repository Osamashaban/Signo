import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/Shell";
import { StatusCard, textLink } from "@/components/auth/Status";

// US-SGN-001 · Canvas: "Reset link sent · MSG-001-07".
export default async function Page({ params }: PageProps<"/[locale]/reset-link-sent">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Auth" });
  return (
    <AuthShell locale={locale as Locale} path="/reset-link-sent">
      <StatusCard icon="mail" title={t("resetTitle")} body={t("m07")}>
        <Link href="/login" className={`self-center text-sm ${textLink}`}>
          {t("back")}
        </Link>
      </StatusCard>
    </AuthShell>
  );
}
