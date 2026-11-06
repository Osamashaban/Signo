import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { logOutAction, switchLanguageAction } from "@/app/actions/auth";
import { CheckIcon, GridIcon, LogoutIcon } from "@/components/auth/icons";
import { currentMember } from "@/lib/auth/service.server";

// US-SGN-001 · Temporary clients page (AC5, AC9, AC14, D23 on the canvas).
// US-SGN-003 replaces the centre with the real clients list.
async function Content({ locale }: { locale: Locale }) {
  const member = await currentMember();
  if (!member) redirect({ locale, href: "/login" });
  if (!member!.verified) redirect({ locale, href: "/check-email" }); // AC4
  const t = await getTranslations({ locale, namespace: "Auth" });
  const other: Locale = locale === "ar" ? "en" : "ar";
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line bg-surface px-4 py-3 min-[900px]:px-8">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-accent text-on-accent">
            <CheckIcon size={16} strokeWidth={3} />
          </span>
          <span className="font-heading text-[19px] font-bold">{t("brand")}</span>
        </div>
        <span aria-hidden="true" className="h-6 w-px bg-line" />
        <span dir="auto" data-testid="agency-name" className="text-[15px] font-semibold">
          {member!.agencyName}
        </span>
        <span className="flex-1" />
        <div className="flex items-center gap-2">
          <form action={switchLanguageAction}>
            <input type="hidden" name="to" value={other} />
            <button type="submit" lang={other} data-testid="other-language"
              className="h-11 rounded-[10px] border border-line bg-surface px-3.5 text-sm font-semibold text-ink">
              {t("otherLang")}
            </button>
          </form>
          <form action={logOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="flex h-11 items-center gap-1.5 rounded-[10px] border-0 bg-transparent px-3.5 text-sm font-semibold text-accent">
              <LogoutIcon />
              {t("logout")}
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-auto flex-col items-center justify-center gap-[18px] px-5 py-10 text-center">
        <span aria-hidden="true" className="flex size-24 items-center justify-center rounded-3xl bg-accent-soft text-accent">
          <GridIcon />
        </span>
        <h1 className="m-0 font-heading text-[28px] leading-[1.4] font-semibold">{t("m16")}</h1>
      </main>
    </div>
  );
}

export default async function ClientsPage({ params }: PageProps<"/[locale]/clients">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <Suspense fallback={null}>
      <Content locale={locale as Locale} />
    </Suspense>
  );
}
