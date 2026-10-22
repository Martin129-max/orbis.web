import type { ReactNode } from "react";

export function SettingsSection({
  title,
  aside,
  description,
  children,
}: {
  title: string;
  aside?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-divider pt-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl font-bold">{title}</h3>
          {aside && <span className="text-xs text-muted uppercase">{aside}</span>}
        </div>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
