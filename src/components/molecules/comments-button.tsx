import { MessageSquare } from "lucide-react";

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
      className="-ml-1.5 inline-flex w-fit items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
    >
      <MessageSquare size={16} />
      {count} {count === 1 ? "comment" : "comments"}
    </button>
  );
}
