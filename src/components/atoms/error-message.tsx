import type { ReactNode } from "react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-accent-soft p-3 text-[13px] text-danger">
      {children}
    </p>
  );
}
