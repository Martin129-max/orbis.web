"use client";

import Link from "next/link";
import * as Molecule from "@molecule";
import type { Thread } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { initials } from "@/lib/initials";
import { timeAgo } from "@/lib/time";
import { castVote } from "@/lib/votes";

export function ThreadMeta({
  thread,
  showCommunity,
}: {
  thread: Thread;
  showCommunity: boolean;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted">
      {showCommunity && (
        <>
          <Link
            href={`/communities/${thread.community.id}?tab=forum`}
            onClick={(event) => event.stopPropagation()}
            className="focus-ring flex items-center gap-1.5 rounded-sm font-semibold text-foreground hover:underline"
          >
            <span
              aria-hidden
              className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[8px] leading-none font-bold text-white"
            >
              {initials(thread.community.name)}
            </span>
            {thread.community.name}
          </Link>
          <span aria-hidden>·</span>
        </>
      )}
      <span>{displayName(thread.author)}</span>
      <span aria-hidden>·</span>
      <time
        dateTime={thread.createdAt}
        title={new Date(thread.createdAt).toLocaleString()}
      >
        {timeAgo(thread.createdAt)}
      </time>
    </p>
  );
}

type ThreadCardProps = {
  thread: Thread;
  showCommunity?: boolean;
  onOpen: () => void;
  onChange: (thread: Thread) => void;
};

export function ThreadCard({
  thread,
  showCommunity = false,
  onOpen,
  onChange,
}: ThreadCardProps) {
  return (
    <article
      onClick={onOpen}
      className="flex cursor-pointer gap-3 rounded-xl border border-black/10 bg-surface p-4 transition-colors hover:border-black/25 dark:border-white/10 dark:hover:border-white/25"
    >
      <Molecule.VoteControl
        score={thread.score}
        myVote={thread.myVote}
        onVote={(value) =>
          castVote({ type: "thread", id: thread.id }, thread, value, (result) =>
            onChange({ ...thread, ...result }),
          )
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <ThreadMeta thread={thread} showCommunity={showCommunity} />
        <h3 className="text-base font-semibold">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            className="focus-ring rounded-sm text-left hover:underline"
          >
            {thread.title}
          </button>
        </h3>
        {thread.content && (
          <div
            className="rich-text line-clamp-3 text-sm text-muted"
            dangerouslySetInnerHTML={{ __html: thread.content }}
          />
        )}
        <div onClick={(event) => event.stopPropagation()}>
          <Molecule.CommentsButton count={thread.commentCount} onClick={onOpen} />
        </div>
      </div>
    </article>
  );
}
