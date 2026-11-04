import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

// v0 "Coming soon" screen, built from the Claude Design canvas
// "Signo UI/UX project", page "v0 · Coming soon" (Ready for development).
// Phone values apply below 640px, desktop values from 640px up.

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "ComingSoon" });
  return { title: t("metaTitle") };
}

export default async function ComingSoonPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "ComingSoon" });
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  return (
    <main className="box-border flex min-h-dvh flex-col items-center gap-8 bg-bg px-5 pt-5 pb-7 text-ink sm:px-8 sm:pt-7 sm:pb-9">
      <div className="flex self-stretch justify-end">
        <Link
          href="/"
          locale={otherLocale}
          lang={otherLocale}
          hrefLang={otherLocale}
          data-testid="other-language"
          className="flex h-[42px] items-center rounded-[10px] border border-line bg-surface px-3.5 text-sm font-semibold text-ink no-underline"
        >
          {t("otherLang")}
        </Link>
      </div>

      <div className="flex w-full max-w-[640px] flex-auto flex-col items-center justify-center gap-7 text-center">
        <span
          aria-hidden="true"
          className="flex size-[104px] -rotate-[8deg] items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_0_0_10px_var(--acs),0_0_0_11px_var(--line)] sm:size-[132px]"
        >
          <svg
            width="50%"
            height="50%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-heading text-[40px] leading-[1.15] font-bold sm:text-[56px]">
            {t("brand")}
          </span>
          <span className="text-[15px] text-muted">{t("brandAlt")}</span>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-pending-bg px-3.5 py-1.5 text-sm font-semibold text-pending-ink">
          <span
            aria-hidden="true"
            className="box-border size-2 rounded-full border-2 border-current"
          />
          {t("badge")}
        </span>

        <h1 className="m-0 font-heading text-2xl leading-[1.45] font-semibold sm:text-[34px]">
          {t("title")}
        </h1>
        <p className="m-0 max-w-[520px] text-[17px] leading-[1.8] text-muted">
          {t("body")}
        </p>
      </div>

      <footer className="flex items-center gap-1.5 text-[13px] text-muted">
        {t("foot")}
      </footer>
    </main>
  );
}
