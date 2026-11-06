"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { useHydrated } from "./useHydrated";
import type { Locale } from "@/i18n/routing";
import { type NewPasswordState, newPasswordAction } from "@/app/actions/auth";
import { type FieldError, checkPassword } from "@/lib/auth/rules";
import { Banner } from "./Banner";
import { Field, inputClass } from "./Field";
import { primaryButton } from "./Status";

export function NewPasswordForm({ locale, token, email }: { locale: Locale; token: string; email: string | null }) {
  const t = useTranslations("Auth");
  const ready = useHydrated();
  const [state, action, pending] = useActionState<NewPasswordState, FormData>(newPasswordAction, {});
  const [clientError, setClientError] = useState<FieldError | null>(null);
  const error = clientError ?? state.error ?? null;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-heading text-[28px] font-semibold">{t("newTitle")}</h1>
        {email ? <p dir="ltr" className="m-0 text-start text-[15px] leading-[1.6] text-muted">{email}</p> : null}
      </div>
      {state.failed ? <Banner tone="error" testId="banner">{t("error")}</Banner> : null}
      <form
        action={action}
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          const found = checkPassword(String(new FormData(e.currentTarget).get("password") ?? ""));
          setClientError(found);
          if (found) e.preventDefault();
        }}
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="token" value={token} />
        <Field id="password" label={t("newPassword")} error={error ? t(error) : null} hint={t("passwordHint")}>
          <input id="password" name="password" type="password" dir="ltr" autoComplete="new-password"
            aria-invalid={!!error} aria-describedby={error ? "password-error" : "password-hint"} className={inputClass(!!error)} />
        </Field>
        <button type="submit" disabled={!ready || pending} aria-busy={pending} className={primaryButton}>
          {t("newCta")}
        </button>
      </form>
    </>
  );
}
