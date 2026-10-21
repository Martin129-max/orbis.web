import type { ReactNode } from "react";

export function PageColumn({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6 sm:py-6">
        {children}
      </div>
    </div>
  );
}
