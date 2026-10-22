import Link from "next/link";

export function Brand({ className = "text-[32px]" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`focus-ring flex w-fit flex-col gap-[0.18em] rounded-sm ${className}`}
    >
      <span className="font-display leading-none font-extrabold text-accent">
        orbis.
      </span>
      <span className="font-sans text-[max(10px,0.24em)] leading-none font-medium tracking-[0.08em] text-muted">
        By <span className="font-semibold text-foreground">Polsar Studio</span>
      </span>
    </Link>
  );
}
