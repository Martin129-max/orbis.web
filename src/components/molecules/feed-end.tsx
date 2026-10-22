import { CircleCheck } from "lucide-react";

export function FeedEnd({ label }: { label: string }) {
  return (
    <div className="flex justify-center pt-6">
      <p className="flex items-center gap-2 rounded-full border border-divider bg-surface py-1.5 pr-4 pl-2 text-xs font-semibold text-foreground">
        <CircleCheck size={18} strokeWidth={2} aria-hidden className="text-online" />
        {label}
      </p>
    </div>
  );
}
