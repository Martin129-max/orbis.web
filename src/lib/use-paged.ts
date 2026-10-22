"use client";

import { useEffect, useRef, useState } from "react";
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
  newCount: number;
  showNew: () => void;
};

const LIVE_INTERVAL = 30_000;

export function itemKey({ type, id }: FeedEntry) {
  return `${type}-${id}`;
}

export function usePaged<T extends FeedEntry>(
  fetchPage: FetchPage<T>,
  { live = false }: { live?: boolean } = {},
): Paged<T> {
  const [items, setItems] = useState<T[] | null>(null);
  const [incoming, setIncoming] = useState<T[]>([]);
  const loaded = useRef<T[] | null>(null);
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
        setIncoming([]);
        setNextCursor(page.nextCursor);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });

    return () => {
      ignore = true;
    };
  }, [fetchPage, attempt]);

  useEffect(() => {
    loaded.current = items;
  }, [items]);

  useEffect(() => {
    if (!live) return;

    let ignore = false;
    async function check() {
      const { token } = useAuthStore.getState();
      if (!token || !loaded.current || document.hidden) return;

      try {
        const page = await fetchPage(token);
        const current = loaded.current;
        if (ignore || !current) return;

        const seen = new Set(current.map(itemKey));
        const newest = Math.max(
          0,
          ...current.map((item) => new Date(item.createdAt).getTime()),
        );
        setIncoming(
          page.items.filter(
            (item) =>
              !seen.has(itemKey(item)) &&
              new Date(item.createdAt).getTime() > newest,
          ),
        );
      } catch {}
    }

    const timer = setInterval(check, LIVE_INTERVAL);
    document.addEventListener("visibilitychange", check);
    return () => {
      ignore = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [live, fetchPage]);

  const shown = new Set(items?.map(itemKey));
  const fresh = incoming.filter((item) => !shown.has(itemKey(item)));

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
    newCount: fresh.length,
    showNew: () => {
      setItems((current) => [...fresh, ...(current ?? [])]);
      setIncoming([]);
    },
    update: (item) =>
      setItems((current) =>
        (current ?? []).map((existing) =>
          itemKey(existing) === itemKey(item) ? item : existing,
        ),
      ),
  };
}
