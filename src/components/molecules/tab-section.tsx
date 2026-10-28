import type { ReactNode } from "react";

export function TabSection({
  title,
  count,
  actions,
  children,
}: {
  title: string;
  count?: number;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">
          {count === undefined ? title : `${title} / ${count}`}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
