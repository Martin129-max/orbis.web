import type { ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { PagedPosts } from "@/lib/use-paged-posts";
import { PostCard } from "./post-card";

type PostListProps = {
  feed: PagedPosts;
  empty: ReactNode;
};

export function PostList({ feed, empty }: PostListProps) {
  const { posts, failed, retry, hasMore, loadingMore, moreFailed, loadMore } =
    feed;

  if (failed && !posts) {
    return (
      <div className="py-16">
        <Molecule.ConnectionError onRetry={retry} />
      </div>
    );
  }

  if (!posts) {
    return (
      <div className="flex py-16">
        <Atom.Loader />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-16 text-center">
        <p className="font-medium">No posts yet</p>
        <p className="text-sm text-muted">{empty}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
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
    </div>
  );
}
