import type { ReactNode } from "react";
import { AlertCircleIcon, CheckCircleIcon } from "./icons";

export function Banner({ tone, children, testId }: { tone: "error" | "ok"; children: ReactNode; testId?: string }) {
  const error = tone === "error";
  return (
    <div
      role={error ? "alert" : "status"}
      data-testid={testId}
      className={`flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-start text-[14.5px] leading-[1.6] ${
        error ? "bg-error-bg text-error-ink" : "bg-ok-bg text-ok-ink"
      }`}
    >
      {error ? <AlertCircleIcon className="mt-[3px] flex-none" /> : <CheckCircleIcon size={16} strokeWidth={2.4} className="mt-[3px] flex-none" />}
      <span className="flex-auto">{children}</span>
    </div>
  );
}
