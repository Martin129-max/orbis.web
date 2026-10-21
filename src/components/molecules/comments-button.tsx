import { MessageCircle } from "lucide-react";

export function CommentsButton({
  count,
  onClick,
  invite = false,
}: {
  count: number;
  onClick: () => void;
  invite?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex w-fit items-center gap-2 rounded-sm text-xs text-muted transition-colors hover:text-foreground"
    >
      <MessageCircle size={invite ? 16 : 14} />
      {count} {count === 1 ? "comment" : "comments"}
      {invite && <span>· Join the discussion</span>}
    </button>
  );
}
