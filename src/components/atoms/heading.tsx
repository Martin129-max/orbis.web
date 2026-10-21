import type { ReactNode } from "react";

export function Heading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`m-0 font-display text-2xl leading-tight font-bold sm:text-[28px] ${className}`}
    >
      {children}
    </h1>
  );
}
