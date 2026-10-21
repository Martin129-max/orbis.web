"use client";

import { useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { FeedItem } from "@/lib/api";
import { itemKey, type Paged } from "@/lib/use-paged";
import { DiscussionModal } from "./discussion-modal";
import { PostCard } from "./post-card";
import { ThreadCard } from "./thread-card";

type PostListProps<T extends FeedItem> = {
  feed: Paged<T>;
  empty: ReactNode;
  showCommunity?: boolean;
};

export function PostList<T extends FeedItem>({
  feed,
  empty,
  showCommunity = false,
}: PostListProps<T>) {
  const { items, failed, retry, hasMore, loadingMore, moreFailed, loadMore } =
    feed;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = items?.find((item) => itemKey(item) === openKey) ?? null;
  const update = (item: FeedItem) => feed.update(item as T);

  if (failed && !items) {
    return (
      <div className="py-16">
        <Molecule.ConnectionError onRetry={retry} />
      </div>
    );
  }

  if (!items) {
    return (
      <div className="flex py-16">
        <Atom.Loader />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-16 text-center">
        <p className="font-medium">Nothing here yet</p>
        <p className="text-sm text-muted">{empty}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) =>
        item.type === "thread" ? (
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
        <p className="py-4 text-center text-sm text-muted">
          You&apos;re all caught up.
        </p>
      )}
      <DiscussionModal
        item={open}
        onClose={() => setOpenKey(null)}
        onChange={update}
      />
    </div>
  );
}
