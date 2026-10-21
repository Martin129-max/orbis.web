import type { ReactNode } from "react";

export function FeedState({
  eyebrow,
  icon,
  title,
  description,
  action,
  role,
}: {
  eyebrow?: string;
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div role={role} className="flex flex-col items-start gap-4 py-10">
      {eyebrow && (
        <p className="text-xs font-bold text-accent uppercase">{eyebrow}</p>
      )}
      <span aria-hidden className="text-foreground">
        {icon}
      </span>
      <h3 className="font-display text-3xl leading-[1.04] font-bold sm:text-[32px]">
        {title}
      </h3>
      <p className="max-w-xl text-[13px] text-muted">{description}</p>
      {action}
    </div>
  );
}
