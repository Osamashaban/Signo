import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { CheckCircleIcon, CheckIcon } from "./icons";

// The two-column auth layout from the canvas: the teal brand panel on
// desktop, the form or status card beside it. On phones the panel is
// replaced by a small logo above the content.
export async function AuthShell({
  locale,
  path,
  children,
}: {
  locale: Locale;
  path: string;
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Auth" });
  const other: Locale = locale === "ar" ? "en" : "ar";
  return (
    <div className="box-border flex min-h-dvh flex-wrap bg-bg text-ink">
      <section
        data-testid="brand-panel"
        className="box-border hidden flex-[1_1_420px] flex-col justify-between gap-10 bg-accent px-14 py-12 text-on-accent min-[900px]:flex"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full border-2 border-current">
            <CheckIcon size={20} />
          </span>
          <span className="font-heading text-2xl font-bold">{t("brand")}</span>
        </div>
        <div className="flex max-w-[460px] flex-col gap-5">
          <h2 className="m-0 font-heading text-[34px] leading-[1.4] font-semibold">{t("pitch")}</h2>
          {(["point1", "point2", "point3"] as const).map((k) => (
            <div key={k} className="flex items-start gap-2.5 text-base leading-[1.6]">
              <CheckCircleIcon className="mt-1 flex-none" />
              <span>{t(k)}</span>
            </div>
          ))}
        </div>
        <span className="text-[13px] opacity-85">{t("foot")}</span>
      </section>

      <section className="box-border flex flex-[1_1_480px] flex-col items-center gap-6 px-5 pt-5 pb-8 min-[900px]:px-6 min-[900px]:pt-8 min-[900px]:pb-12">
        <div className="flex items-center justify-between gap-3 self-stretch">
          <div className="flex items-center gap-2 min-[900px]:hidden">
            <span aria-hidden="true" className="flex size-[30px] items-center justify-center rounded-full bg-accent text-on-accent">
              <CheckIcon size={15} strokeWidth={3} />
            </span>
            <span className="font-heading text-lg font-bold">{t("brand")}</span>
          </div>
          <span className="flex-1" />
          <Link
            href={path}
            locale={other}
            lang={other}
            hrefLang={other}
            data-testid="other-language"
            className="flex h-11 items-center rounded-[10px] border border-line bg-surface px-3.5 text-sm font-semibold text-ink no-underline"
          >
            {t("otherLang")}
          </Link>
        </div>
        <div className="flex w-full max-w-[420px] flex-auto flex-col justify-center gap-5">{children}</div>
      </section>
    </div>
  );
}
