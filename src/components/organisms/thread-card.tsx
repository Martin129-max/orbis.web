"use client";

import Link from "next/link";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { Thread } from "@/lib/api";
import { displayName } from "@/lib/display-name";
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
    <div className="flex flex-col gap-2">
      {showCommunity && (
        <Link
          href={`/communities/${thread.community.id}?tab=forum`}
          onClick={(event) => event.stopPropagation()}
          className="focus-ring flex w-fit items-center gap-2 rounded-sm text-xs font-semibold hover:underline"
        >
          <span
            aria-hidden
            className="relative flex h-5 w-5 items-center justify-center rounded-full bg-rail-item font-display text-[9.6px] leading-none font-bold"
          >
            <Atom.CommunityIcon
              name={thread.community.name}
              src={thread.community.iconUrl}
            />
          </span>
          {thread.community.name}
        </Link>
      )}
      <p className="text-xs text-muted">
        <Molecule.UserLink username={thread.author.username}>
          {displayName(thread.author)}
        </Molecule.UserLink>{" "}
        ·{" "}
        <time
          dateTime={thread.createdAt}
          title={new Date(thread.createdAt).toLocaleString()}
        >
          {timeAgo(thread.createdAt)}
        </time>
      </p>
    </div>
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
      className="flex cursor-pointer gap-4 rounded-lg border border-divider bg-surface p-5 transition-colors hover:border-muted"
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
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <ThreadMeta thread={thread} showCommunity={showCommunity} />
        <h3 className="text-xl font-bold">
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
            className="rich-text line-clamp-2 text-sm text-muted"
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
