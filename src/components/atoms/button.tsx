import type { ComponentProps } from "react";

const variants = {
  primary: "bg-foreground text-background",
  secondary: "border border-black/15 dark:border-white/20",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded px-3 py-2 disabled:opacity-50 ${variants[variant]}`}
      {...props}
    />
  );
}
