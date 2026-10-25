export function LiveTag({ large = false }: { large?: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-sm bg-danger font-sans leading-none font-bold tracking-wide text-white ${
        large
          ? "-bottom-2 px-1.5 py-0.5 text-[10px] sm:text-[11px]"
          : "-bottom-1.5 px-1 py-px text-[8px] sm:text-[9px]"
      }`}
    >
      LIVE
    </span>
  );
}
