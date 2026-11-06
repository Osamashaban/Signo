"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { useHydrated } from "./useHydrated";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { type SignUpState, signUpAction } from "@/app/actions/auth";
import { COUNTRIES, type SignUpErrors, checkSignUp } from "@/lib/auth/rules";
import { Banner } from "./Banner";
import { Field, inputClass } from "./Field";
import { primaryButton, textLink } from "./Status";

const COUNTRY_LABEL = { egypt: "countryEgypt", saudi_arabia: "countrySaudi", uae: "countryUae", other: "countryOther" } as const;

export function SignUpForm({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");
  const ready = useHydrated();
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUpAction, { errors: {} });
  const [clientErrors, setClientErrors] = useState<SignUpErrors | null>(null);
  const [language, setLanguage] = useState<Locale>(locale); // BR11: starts on the page language
  const errors = clientErrors ?? state.errors;
  const [v, setV] = useState({ fullName: "", email: "", password: "", agencyName: "", country: "egypt" });
  const bind = (k: keyof typeof v) => ({ value: v[k], onChange: (e: { target: { value: string } }) => {
      const value = e.target.value;
      setV((prev) => ({ ...prev, [k]: value }));
    } });
  const err = (k: keyof SignUpErrors) => (errors[k] ? t(errors[k]!) : null);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-heading text-[28px] font-semibold">{t("signupTitle")}</h1>
        <p className="m-0 text-[15px] leading-[1.6] text-muted">{t("signupSub")}</p>
      </div>

      {state.exists && !clientErrors ? (
        <Banner tone="error" testId="banner">
          {t("m02")}{" "}
          <Link href="/login" className="font-bold text-inherit underline">
            {t("login")}
          </Link>
        </Banner>
      ) : null}
      {state.failed && !clientErrors ? <Banner tone="error" testId="banner">{t("error")}</Banner> : null}

      <form
        action={action}
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          // AC3 / AC11: wrong fields are shown at once and the form is not sent.
          const f = new FormData(e.currentTarget);
          const found = checkSignUp({
            fullName: String(f.get("fullName") ?? ""),
            email: String(f.get("email") ?? ""),
            password: String(f.get("password") ?? ""),
            agencyName: String(f.get("agencyName") ?? ""),
            country: String(f.get("country") ?? ""),
            language: String(f.get("language") ?? ""),
          });
          if (Object.keys(found).length) {
            e.preventDefault();
            setClientErrors(found);
          } else {
            setClientErrors(null);
          }
        }}
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="language" value={language} />

        <Field id="fullName" label={t("fullName")} error={err("fullName")} hint={t("fullNameHint")}>
          <input id="fullName" name="fullName" type="text" dir="auto" autoComplete="name" {...bind("fullName")}
            aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : "fullName-hint"} className={inputClass(!!errors.fullName)} />
        </Field>
        <Field id="email" label={t("email")} error={err("email")} hint={t("emailHint")}>
          <input id="email" name="email" type="email" dir="ltr" autoComplete="email" {...bind("email")}
            aria-invalid={!!errors.email || !!state.exists} aria-describedby={errors.email ? "email-error" : "email-hint"} className={inputClass(!!errors.email || (!!state.exists && !clientErrors))} />
        </Field>
        <Field id="password" label={t("password")} error={err("password")} hint={t("passwordHint")}>
          <input id="password" name="password" type="password" dir="ltr" autoComplete="new-password" {...bind("password")}
            aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : "password-hint"} className={inputClass(!!errors.password)} />
        </Field>
        <Field id="agencyName" label={t("agencyName")} error={err("agencyName")} hint={t("agencyNameHint")}>
          <input id="agencyName" name="agencyName" type="text" dir="auto" autoComplete="organization" {...bind("agencyName")}
            aria-invalid={!!errors.agencyName} aria-describedby={errors.agencyName ? "agencyName-error" : "agencyName-hint"} className={inputClass(!!errors.agencyName)} />
        </Field>
        <Field id="country" label={t("country")} error={err("country")} hint={t("countryHint")}>
          <select id="country" name="country" {...bind("country")} aria-describedby="country-hint"
            className="box-border h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink">
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {t(COUNTRY_LABEL[c])}
              </option>
            ))}
          </select>
        </Field>
        <Field id="language" label={t("language")} hint={t("languageHint")}>
          <div id="language" role="radiogroup" aria-label={t("language")} aria-describedby="language-hint"
            className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
            {(["ar", "en"] as const).map((l) => (
              <button key={l} type="button" role="radio" aria-checked={language === l} lang={l} onClick={() => setLanguage(l)}
                className={`h-11 rounded-[9px] border-0 text-[15px] font-semibold ${
                  language === l ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,.12)]" : "bg-transparent text-muted"
                }`}>
                {l === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>
        </Field>

        <button type="submit" disabled={!ready || pending} aria-busy={pending} className={primaryButton}>
          {t("signupCta")}
        </button>
      </form>

      <p className="m-0 text-center text-sm text-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className={textLink}>
          {t("login")}
        </Link>
      </p>
    </>
  );
}
