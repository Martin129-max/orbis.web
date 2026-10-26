import { Tooltip } from "antd";
import { Heart } from "lucide-react";

export function LikeButton({
  liked,
  count,
  onToggle,
  disabledReason,
}: {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabledReason?: string;
}) {
  const disabled = Boolean(disabledReason);
  const button = (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      aria-disabled={disabled || undefined}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onToggle();
      }}
      className={`focus-ring inline-flex w-fit items-center gap-1.5 rounded-sm text-xs transition-colors ${
        disabled
          ? "cursor-not-allowed text-muted opacity-60"
          : liked
            ? "cursor-pointer font-semibold text-accent"
            : "cursor-pointer text-muted hover:text-foreground"
      }`}
    >
      <Heart
        size={14}
        fill={liked ? "currentColor" : "none"}
        className={
          disabled ? undefined : "transition-transform active:scale-125 motion-reduce:transition-none"
        }
      />
      {count} {count === 1 ? "like" : "likes"}
    </button>
  );

  return disabledReason ? <Tooltip title={disabledReason}>{button}</Tooltip> : button;
}
