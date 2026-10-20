export function Avatar({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
    >
      {Array.from(label)[0]?.toUpperCase()}
    </span>
  );
}
