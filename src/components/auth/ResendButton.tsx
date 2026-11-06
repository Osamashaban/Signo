"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useHydrated } from "./useHydrated";
import type { Locale } from "@/i18n/routing";
import { type ResendActionState, resendAction } from "@/app/actions/auth";
import { Banner } from "./Banner";
import { ClockIcon } from "./icons";
import { primaryButton } from "./Status";

// "Resend email" with the 60-second countdown (MSG-001-13/14) and the
// hourly limit (MSG-001-15), as drawn for AC12.
export function ResendButton({
  locale,
  email,
  initial,
}: {
  locale: Locale;
  email: string;
  initial: ResendActionState;
}) {
  const t = useTranslations("Auth");
  const ready = useHydrated();
  const [state, action, pending] = useActionState<ResendActionState, FormData>(resendAction, initial);
  const [left, setLeft] = useState(state.seconds ?? 0);
  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    setLeft(state.state === "resent" || state.state === "cooldown" ? (state.seconds ?? 60) : 0);
  }
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const limited = state.state === "limit";
  const waiting = left > 0;
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      {state.state === "resent" ? <Banner tone="ok" testId="banner">{t("m13", { email })}</Banner> : null}
      {limited ? <Banner tone="error" testId="banner">{t("m15")}</Banner> : null}
      <button type="submit" disabled={!ready || pending || limited || waiting} aria-busy={pending} className={primaryButton} data-testid="resend">
        {waiting ? <ClockIcon size={16} strokeWidth={2.2} /> : null}
        {waiting ? t("m14", { seconds: left }) : t("resend")}
      </button>
    </form>
  );
}
