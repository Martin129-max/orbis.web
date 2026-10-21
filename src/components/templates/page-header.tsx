import type { ReactNode } from "react";

export function PageHeader({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-black/10 px-4 sm:h-16 sm:px-6 dark:border-white/10">
      {children}
      {actions && (
        <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>
      )}
    </header>
  );
}
