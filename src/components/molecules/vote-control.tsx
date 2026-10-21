"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

type VoteControlProps = {
  score: number;
  myVote: number;
  onVote: (value: 1 | -1) => void;
  orientation?: "vertical" | "horizontal";
};

export function VoteControl({
  score,
  myVote,
  onVote,
  orientation = "vertical",
}: VoteControlProps) {
  const arrow = (active: boolean) =>
    `focus-ring flex rounded-sm transition-colors ${
      active ? "text-accent" : "text-muted hover:text-foreground"
    }`;

  return (
    <div
      className={`flex shrink-0 items-center rounded-lg bg-background ${
        orientation === "vertical"
          ? "w-10 flex-col gap-1 py-2"
          : "flex-row gap-2 p-2"
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={myVote === 1}
        onClick={() => onVote(1)}
        className={arrow(myVote === 1)}
      >
        <ArrowUp size={16} />
      </button>
      <span
        aria-label={`Score ${score}`}
        className={`text-xs leading-none font-bold tabular-nums ${
          myVote === 0 ? "text-foreground" : "text-accent"
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={myVote === -1}
        onClick={() => onVote(-1)}
        className={arrow(myVote === -1)}
      >
        <ArrowDown size={16} />
      </button>
    </div>
  );
}
