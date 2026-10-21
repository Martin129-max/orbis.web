import Link from "next/link";

export function Brand({ className = "text-[32px]" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`focus-ring w-fit rounded-sm font-display leading-none font-extrabold text-accent ${className}`}
    >
      orbis.
    </Link>
  );
}
