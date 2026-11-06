"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useHydrated } from "./useHydrated";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { type ForgotState, forgotAction } from "@/app/actions/auth";
import { Banner } from "./Banner";
import { Field, inputClass } from "./Field";
import { primaryButton, textLink } from "./Status";

export function ForgotForm({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");
  const ready = useHydrated();
  const [state, action, pending] = useActionState<ForgotState, FormData>(forgotAction, {});
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-heading text-[28px] font-semibold">{t("forgotTitle")}</h1>
        <p className="m-0 text-[15px] leading-[1.6] text-muted">{t("forgotSub")}</p>
      </div>
      {state.failed ? <Banner tone="error" testId="banner">{t("error")}</Banner> : null}
      <form action={action} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <Field id="email" label={t("email")} error={state.emailError ? t(state.emailError) : null}>
          <input id="email" name="email" type="email" dir="ltr" autoComplete="email" defaultValue={state.email}
            aria-invalid={!!state.emailError} className={inputClass(!!state.emailError)} />
        </Field>
        <button type="submit" disabled={!ready || pending} aria-busy={pending} className={primaryButton}>
          {t("forgotCta")}
        </button>
      </form>
      <p className="m-0 text-center text-sm text-muted">
        {t("remember")}{" "}
        <Link href="/login" className={textLink}>
          {t("back")}
        </Link>
      </p>
    </>
  );
}
