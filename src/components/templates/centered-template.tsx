import type { ReactNode } from "react";

export function CenteredTemplate({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 font-sans">
      {children}
    </main>
  );
}
