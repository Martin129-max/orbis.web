"use client";

import { CloudOff, NotebookPen } from "lucide-react";
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
  empty: { title: ReactNode; description: ReactNode; action?: ReactNode };
  end?: ReactNode;
  showCommunity?: boolean;
};

export function PostList<T extends FeedItem>({
  feed,
  empty,
  end = <Molecule.FeedEnd label="You’re all caught up" />,
  showCommunity = false,
}: PostListProps<T>) {
  const { items, failed, retry, hasMore, loadingMore, moreFailed, loadMore } =
    feed;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = items?.find((item) => itemKey(item) === openKey) ?? null;
  const update = (item: FeedItem) => feed.update(item as T);

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

  if (items.length === 0) {
    return (
      <Molecule.FeedState
        eyebrow="Empty"
        icon={<NotebookPen size={24} strokeWidth={1.5} />}
        title={empty.title}
        description={empty.description}
        action={empty.action}
      />
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
