import type { ReactNode } from "react";

export function PageColumn({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 overflow-y-auto px-4 sm:px-8">
      <div className="mx-auto w-full max-w-[672px] pt-6 pb-12 sm:pt-8">
        {children}
      </div>
    </div>
  );
}
