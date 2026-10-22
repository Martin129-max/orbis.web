import type { ReactNode } from "react";

const tones = {
  neutral: "bg-rail-item text-foreground",
  accent: "bg-accent text-accent-foreground",
  danger: "bg-danger text-accent-foreground",
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  special: "bg-special text-special-foreground",
} as const;

const sizes = {
  xs: "gap-1 px-1.5 py-px text-[10px] leading-4",
  sm: "gap-1 px-2 py-0.5 text-[11px]",
  md: "gap-1.5 px-2.5 py-1 text-xs",
} as const;

export type PillTone = keyof typeof tones;

export function Pill({
  tone = "neutral",
  size = "sm",
  icon,
  className = "",
  children,
}: {
  tone?: PillTone;
  size?: keyof typeof sizes;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full font-semibold ${tones[tone]} ${sizes[size]} ${className}`}
    >
      {icon && <span aria-hidden className="flex">{icon}</span>}
      {children}
    </span>
  );
}
