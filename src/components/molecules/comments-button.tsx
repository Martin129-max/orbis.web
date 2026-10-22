import { MessageCircle } from "lucide-react";

export function CommentsButton({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-sm text-xs text-muted transition-colors hover:text-foreground"
    >
      <MessageCircle size={14} />
      {count} {count === 1 ? "comment" : "comments"}
    </button>
  );
}
