"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useHydrated } from "./useHydrated";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { type LogInState, logInAction } from "@/app/actions/auth";
import { Banner } from "./Banner";
import { Field, inputClass } from "./Field";
import { MailIcon } from "./icons";
import { primaryButton, secondaryButton, textLink } from "./Status";

export function LogInForm({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");
  const ready = useHydrated();
  const [state, action, pending] = useActionState<LogInState, FormData>(logInAction, {});
  // After a password reset the page opens with ?changed=1 (MSG-001-09).
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the address once, after hydration
    setChanged(new URLSearchParams(window.location.search).get("changed") === "1");
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.banner === "m05") setPassword(""); // as drawn for the lockout
  }
  const locked = state.banner === "m05";
  const wrong = state.banner === "m04";
  const off = pending || locked || !ready;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-heading text-[28px] font-semibold">{t("loginTitle")}</h1>
        <p className="m-0 text-[15px] leading-[1.6] text-muted">{t("loginSub")}</p>
      </div>

      {state.banner === "m04" ? <Banner tone="error" testId="banner">{t("m04")}</Banner> : null}
      {locked ? (
        <Banner tone="error" testId="banner">
          {t("m05")}{" "}
          <Link href="/forgot-password" className="font-bold text-inherit underline">
            {t("resetLink")}
          </Link>
        </Banner>
      ) : null}
      {state.banner === "error" ? <Banner tone="error" testId="banner">{t("error")}</Banner> : null}
      {changed && !state.banner ? <Banner tone="ok" testId="banner">{t("m09")}</Banner> : null}

      <form action={action} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <Field id="email" label={t("email")} error={state.emailError ? t(state.emailError) : null}>
          <input id="email" name="email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            readOnly={pending} aria-invalid={!!state.emailError} className={inputClass(!!state.emailError)} />
        </Field>
        <Field
          id="password"
          label={t("password")}
          aside={
            <Link href="/forgot-password" className="text-[13px] font-semibold text-accent underline">
              {t("forgot")}
            </Link>
          }
        >
          <input id="password" name="password" type="password" dir="ltr" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            readOnly={pending} aria-invalid={wrong} className={inputClass(wrong)} />
        </Field>

        <button type="submit" name="intent" value="password" disabled={off} aria-busy={pending} className={primaryButton}>
          {pending ? <span aria-hidden="true" className="box-border size-[18px] animate-spin rounded-full border-[2.5px] border-current border-t-transparent" /> : null}
          {pending ? t("loginBusy") : t("loginCta")}
        </button>
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <span className="h-px flex-1 bg-line" />
          {t("or")}
          <span className="h-px flex-1 bg-line" />
        </div>
        <button type="submit" name="intent" value="magic" disabled={off} className={secondaryButton}>
          <MailIcon size={18} strokeWidth={2} />
          {t("magic")}
        </button>
      </form>

      <p className="m-0 text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/signup" className={textLink}>
          {t("create")}
        </Link>
      </p>
    </>
  );
}
