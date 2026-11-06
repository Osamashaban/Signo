"use client";

import type { ReactNode } from "react";
import { AlertCircleIcon } from "./icons";

// One form field as drawn: label (and an optional link beside it), the
// control, then either the error (red, MSG-001-xx) or the hint.
export function Field({
  id,
  label,
  aside,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  aside?: ReactNode;
  error?: string | null;
  hint?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <span id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-[13.5px] leading-[1.5] text-error-ink">
          <AlertCircleIcon size={14} strokeWidth={2.6} className="mt-0.5 flex-none" />
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-[13px] leading-[1.5] text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function inputClass(invalid: boolean) {
  return `box-border h-12 w-full rounded-xl bg-surface px-3.5 text-start text-[15px] text-ink disabled:opacity-60 read-only:bg-surface-2 read-only:text-muted ${
    invalid ? "border-2 border-error-ink" : "border border-line"
  }`;
}
