import { Camera, LoaderCircle } from "lucide-react";

export function EditOverlay({
  busy,
  badge = true,
}: {
  busy: boolean;
  badge?: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white transition-opacity motion-reduce:transition-none ${
          busy
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        {busy ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          <Camera size={20} />
        )}
      </span>
      {badge && !busy && (
        <span
          aria-hidden
          className="absolute -right-0.5 -bottom-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-divider bg-surface text-foreground shadow-sm"
        >
          <Camera size={14} />
        </span>
      )}
    </>
  );
}
