import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
    >
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm text-white"
      >
        O
      </span>
      Orbis
    </Link>
  );
}
