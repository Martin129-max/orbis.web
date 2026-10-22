"use client";

import { ArrowUp, CloudOff, NotebookPen } from "lucide-react";
import { useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { FeedEntry } from "@/lib/api";
import { itemKey, type Paged } from "@/lib/use-paged";
import { ActivityCard } from "./activity-card";
import { DiscussionModal } from "./discussion-modal";
import { PostCard } from "./post-card";
import { ThreadCard } from "./thread-card";

type PostListProps<T extends FeedEntry> = {
  feed: Paged<T>;
  empty: { title: ReactNode; description: ReactNode; action?: ReactNode };
  end?: ReactNode;
  showCommunity?: boolean;
};

export function PostList<T extends FeedEntry>({
  feed,
  empty,
  end = <Molecule.FeedEnd label="You’re all caught up" />,
  showCommunity = false,
}: PostListProps<T>) {
  const { items, failed, retry, hasMore, loadingMore, moreFailed, loadMore } =
    feed;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = items?.find((item) => itemKey(item) === openKey) ?? null;
  const update = (item: FeedEntry) => feed.update(item as T);

  if (failed && !items) {
    return (
      <Molecule.FeedState
        role="alert"
        eyebrow="Connection error"
        icon={<CloudOff size={24} strokeWidth={1.5} />}
        title="The feed couldn’t be loaded."
        description="Check your connection and try again. Anything you were writing has been kept."
        action={<Atom.Button onClick={retry}>Try again</Atom.Button>}
      />
    );
  }

  if (!items) {
    return <Molecule.FeedSkeleton label="Loading posts…" />;
  }

  const newPosts = feed.newCount > 0 && (
    <button
      type="button"
      onClick={feed.showNew}
      className="focus-ring mx-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90"
    >
      <ArrowUp size={14} aria-hidden />
      Show {feed.newCount} new {feed.newCount === 1 ? "post" : "posts"}
    </button>
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {newPosts}
        <Molecule.FeedState
          eyebrow="Empty"
          icon={<NotebookPen size={24} strokeWidth={1.5} />}
          title={empty.title}
          description={empty.description}
          action={empty.action}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {newPosts}
      {items.map((item) =>
        item.type === "activity" ? (
          <ActivityCard
            key={itemKey(item)}
            activity={item}
            onOpenComments={() => setOpenKey(itemKey(item))}
            onChange={update}
          />
        ) : item.type === "thread" ? (
          <ThreadCard
            key={itemKey(item)}
            thread={item}
            showCommunity={showCommunity}
            onOpen={() => setOpenKey(itemKey(item))}
            onChange={update}
          />
        ) : (
          <PostCard
            key={itemKey(item)}
            post={item}
            showCommunity={showCommunity}
            onOpenComments={() => setOpenKey(itemKey(item))}
            onChange={update}
          />
        ),
      )}
      {hasMore ? (
        <Molecule.LoadMore
          onLoadMore={loadMore}
          loading={loadingMore}
          failed={moreFailed}
        />
      ) : (
        end
      )}
      <DiscussionModal
        item={open}
        onClose={() => setOpenKey(null)}
        onChange={update}
      />
    </div>
  );
}
