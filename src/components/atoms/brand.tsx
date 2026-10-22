import Link from "next/link";

export function Brand({ className = "text-[32px]" }: { className?: string }) {
  return (
    <div className={`flex w-fit flex-col gap-[0.18em] ${className}`}>
      <Link
        href="/"
        className="focus-ring w-fit rounded-sm font-display leading-none font-extrabold text-accent"
      >
        orbis.
      </Link>
      <span className="font-sans text-[max(10px,0.24em)] leading-none font-medium tracking-[0.08em] text-muted">
        By{" "}
        <a
          href="https://polsar.studio"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-sm font-semibold text-foreground transition-colors hover:text-accent"
        >
          Polsar Studio
        </a>
      </span>
    </div>
  );
}
