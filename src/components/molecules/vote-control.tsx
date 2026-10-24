"use client";

import { ArrowDown, ArrowUp, ThumbsDown, ThumbsUp } from "lucide-react";

const symbols = {
  arrows: { up: ArrowUp, down: ArrowDown },
  thumbs: { up: ThumbsUp, down: ThumbsDown },
};

type VoteControlProps = {
  score: number;
  myVote: number;
  onVote: (value: 1 | -1) => void;
  orientation?: "vertical" | "horizontal";
  symbols?: keyof typeof symbols;
};

export function VoteControl({
  score,
  myVote,
  onVote,
  orientation = "vertical",
  symbols: style = "arrows",
}: VoteControlProps) {
  const { up: Up, down: Down } = symbols[style];
  const arrow = (active: boolean) =>
    `focus-ring flex rounded-sm transition-colors ${
      active ? "text-accent" : "text-muted hover:text-foreground"
    }`;

  return (
    <div
      className={`flex shrink-0 items-center ${
        orientation === "vertical"
          ? "w-10 flex-col gap-1 py-2"
          : "flex-row gap-2 py-1"
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
        <Up size={16} />
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
        <Down size={16} />
      </button>
    </div>
  );
}
