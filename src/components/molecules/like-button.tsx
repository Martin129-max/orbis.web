import { Heart } from "lucide-react";

export function LikeButton({
  liked,
  count,
  onToggle,
}: {
  liked: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={`focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-sm text-xs transition-colors ${
        liked ? "font-semibold text-accent" : "text-muted hover:text-foreground"
      }`}
    >
      <Heart
        size={14}
        fill={liked ? "currentColor" : "none"}
        className="transition-transform active:scale-125 motion-reduce:transition-none"
      />
      {count} {count === 1 ? "like" : "likes"}
    </button>
  );
}
