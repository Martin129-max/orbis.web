import type { ReactNode } from "react";

export function SettingsSection({
  title,
  aside,
  description,
  danger = false,
  children,
}: {
  title: string;
  aside?: string;
  description?: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-5 rounded-lg border bg-surface p-5 sm:p-6 ${
        danger ? "border-danger/60" : "border-divider"
      }`}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={`font-display text-xl font-bold ${danger ? "text-danger" : ""}`}>{title}</h3>
          {aside && <span className="text-xs text-muted uppercase">{aside}</span>}
        </div>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
