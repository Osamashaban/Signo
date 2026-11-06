import type { ReactNode } from "react";
import { ClockIcon, MailIcon } from "./icons";

// The status card: round icon, title, message, then actions.
export function StatusCard({
  icon,
  title,
  body,
  children,
}: {
  icon: "mail" | "clock";
  title: string;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className={`flex size-[88px] items-center justify-center rounded-full ${
            icon === "mail" ? "bg-accent-soft text-accent" : "bg-pending-bg text-pending-ink"
          }`}
        >
          {icon === "mail" ? <MailIcon /> : <ClockIcon />}
        </span>
        <h1 className="m-0 font-heading text-[26px] leading-[1.4] font-semibold">{title}</h1>
        <p className="m-0 text-base leading-[1.75] text-muted">{body}</p>
      </div>
      {children}
    </>
  );
}

export const primaryButton =
  "flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border-0 bg-accent text-base font-semibold text-on-accent disabled:opacity-55";
export const secondaryButton =
  "flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[15px] font-semibold text-ink disabled:opacity-55";
export const textLink = "font-semibold text-accent underline";
