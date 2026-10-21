"use client";

import { useEffect, useState } from "react";
import { getFeed, getPosts, type Post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 10;

export type PagedPosts = {
  posts: Post[] | null;
  failed: boolean;
  retry: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  moreFailed: boolean;
  loadMore: () => void;
  prepend: (post: Post) => void;
};

function fetchPage(token: string, communityId?: number, cursor?: number) {
  return communityId === undefined
    ? getFeed(token, cursor)
    : getPosts(token, communityId, cursor);
}

export function usePagedPosts(communityId?: number): PagedPosts {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    fetchPage(token, communityId)
      .then((result) => {
        setFailed(false);
        setPosts(result);
        setHasMore(result.length === PAGE_SIZE);
      })
      .catch(() => setFailed(true));
  }, [communityId, attempt]);

  function loadMore() {
    const { token } = useAuthStore.getState();
    const last = posts?.at(-1);
    if (!token || !last || loadingMore || !hasMore) return;

    setLoadingMore(true);
    setMoreFailed(false);
    fetchPage(token, communityId, last.id)
      .then((result) => {
        setPosts((current) => {
          const seen = new Set(current?.map(({ id }) => id));
          return [
            ...(current ?? []),
            ...result.filter(({ id }) => !seen.has(id)),
          ];
        });
        setHasMore(result.length === PAGE_SIZE);
      })
      .catch(() => setMoreFailed(true))
      .finally(() => setLoadingMore(false));
  }

  return {
    posts,
    failed,
    retry: () => {
      setFailed(false);
      setAttempt((count) => count + 1);
    },
    hasMore,
    loadingMore,
    moreFailed,
    loadMore,
    prepend: (post) => setPosts((current) => [post, ...(current ?? [])]),
  };
}
