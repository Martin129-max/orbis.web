import type { ComponentProps } from "react";

export function Input(props: ComponentProps<"input">) {
  return (
    <input
      className="rounded border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
      {...props}
    />
  );
}
