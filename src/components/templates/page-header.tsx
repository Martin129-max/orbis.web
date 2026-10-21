import type { ReactNode } from "react";

export function PageHeader({
  children,
  tagline,
  actions,
}: {
  children: ReactNode;
  tagline?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-b border-divider px-4 sm:h-[72px] sm:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      {tagline && (
        <p className="hidden shrink-0 text-xs text-muted uppercase md:block">
          {tagline}
        </p>
      )}
      {actions && (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      )}
    </header>
  );
}
