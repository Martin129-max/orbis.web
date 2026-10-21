"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";

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
  const button =
    "focus-ring flex rounded-md p-0.5 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10";

  return (
    <div
      className={`flex shrink-0 items-center gap-0.5 ${
        orientation === "vertical" ? "flex-col" : "flex-row"
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={myVote === 1}
        onClick={() => onVote(1)}
        className={`${button} ${myVote === 1 ? "text-orange-600 hover:text-orange-600" : "hover:text-orange-600"}`}
      >
        <ArrowBigUp size={20} fill={myVote === 1 ? "currentColor" : "none"} />
      </button>
      <span
        aria-label={`Score ${score}`}
        className={`min-w-6 text-center text-sm font-semibold tabular-nums ${
          myVote === 1
            ? "text-orange-600"
            : myVote === -1
              ? "text-indigo-500"
              : ""
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={myVote === -1}
        onClick={() => onVote(-1)}
        className={`${button} ${myVote === -1 ? "text-indigo-500 hover:text-indigo-500" : "hover:text-indigo-500"}`}
      >
        <ArrowBigDown size={20} fill={myVote === -1 ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
