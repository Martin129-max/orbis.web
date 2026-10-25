import type { ReactNode } from "react";
import * as Organism from "@organism";

export function PageHeader({
  children,
  tagline,
  center,
  actions,
}: {
  children: ReactNode;
  tagline?: string;
  center?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-divider px-4 sm:h-[72px] sm:gap-6 sm:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      {center && <Organism.PageSearch>{center}</Organism.PageSearch>}
      {tagline && (
        <p className="hidden shrink-0 text-xs text-muted uppercase md:block">
          {tagline}
        </p>
      )}
      {actions && (
        <div className="flex shrink-0 items-center justify-end gap-1">
          {actions}
        </div>
      )}
    </header>
  );
}
