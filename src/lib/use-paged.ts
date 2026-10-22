"use client";

import { useEffect, useState } from "react";
import type { FeedEntry, Page } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export type FetchPage<T extends FeedEntry> = (
  token: string,
  cursor?: string,
) => Promise<Page<T>>;

export type Paged<T extends FeedEntry> = {
  items: T[] | null;
  failed: boolean;
  retry: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  moreFailed: boolean;
  loadMore: () => void;
  prepend: (item: T) => void;
  update: (item: T) => void;
};

export function itemKey({ type, id }: FeedEntry) {
  return `${type}-${id}`;
}

export function usePaged<T extends FeedEntry>(
  fetchPage: FetchPage<T>,
): Paged<T> {
  const [items, setItems] = useState<T[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    let ignore = false;
    fetchPage(token)
      .then((page) => {
        if (ignore) return;
        setFailed(false);
        setItems(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });

    return () => {
      ignore = true;
    };
  }, [fetchPage, attempt]);

  function loadMore() {
    const { token } = useAuthStore.getState();
    if (!token || !nextCursor || loadingMore) return;

    setLoadingMore(true);
    setMoreFailed(false);
    fetchPage(token, nextCursor)
      .then((page) => {
        setItems((current) => {
          const seen = new Set(current?.map(itemKey));
          return [
            ...(current ?? []),
            ...page.items.filter((item) => !seen.has(itemKey(item))),
          ];
        });
        setNextCursor(page.nextCursor);
      })
      .catch(() => setMoreFailed(true))
      .finally(() => setLoadingMore(false));
  }

  return {
    items,
    failed,
    retry: () => {
      setFailed(false);
      setAttempt((count) => count + 1);
    },
    hasMore: nextCursor !== null,
    loadingMore,
    moreFailed,
    loadMore,
    prepend: (item) => setItems((current) => [item, ...(current ?? [])]),
    update: (item) =>
      setItems((current) =>
        (current ?? []).map((existing) =>
          itemKey(existing) === itemKey(item) ? item : existing,
        ),
      ),
  };
}
