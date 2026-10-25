"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedContentType, FeedEntry, Page } from "@/lib/api";
import {
  feedContentTypes,
  useFeedPreferencesStore,
} from "@/stores/feed-preferences-store";
import { useAuthStore } from "@/stores/auth-store";

export type FetchPage<T extends FeedEntry> = (
  token: string | null,
  cursor?: string,
  excludedTypes?: FeedContentType[],
) => Promise<Page<T>>;

export type Paged<T extends FeedEntry> = {
  contentTypes: FeedContentType[];
  filtered: boolean;
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
  fetch: FetchPage<T>,
  {
    live = false,
    guest = false,
    types = feedContentTypes,
  }: { live?: boolean; guest?: boolean; types?: FeedContentType[] } = {},
): Paged<T> {
  const excluded = useFeedPreferencesStore((state) => state.excludedTypes);
  const remaining = types.filter((type) => !excluded.includes(type));
  const visibleTypes = remaining.length > 0 ? remaining : types;
  const filterKey = types.filter((type) => !visibleTypes.includes(type)).join(",");
  const fetchPage = useCallback<FetchPage<T>>(
    (token, cursor) =>
      fetch(token, cursor, filterKey ? (filterKey.split(",") as FeedContentType[]) : []),
    [fetch, filterKey],
  );
  const [source, setSource] = useState<FetchPage<T> | null>(null);
  const activeFetcher = useRef(fetchPage);
  useEffect(() => {
    activeFetcher.current = fetchPage;
  }, [fetchPage]);
  useEffect(() => {
    useFeedPreferencesStore.persist.rehydrate();
  }, []);
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
    if (!token && !guest) return;

    let ignore = false;
    fetchPage(token)
      .then((page) => {
        if (ignore) return;
        setSource(() => fetchPage);
        setLoadingMore(false);
        setMoreFailed(false);
        setFailed(false);
        setItems(page.items);
        setIncoming([]);
        setNextCursor(page.nextCursor);
      })
      .catch(() => {
        if (!ignore) {
          setSource(() => fetchPage);
          setLoadingMore(false);
          setItems(null);
          setIncoming([]);
          setNextCursor(null);
          setFailed(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, [fetchPage, attempt, guest]);

  useEffect(() => {
    loaded.current = source === fetchPage ? items : null;
  }, [items, source, fetchPage]);

  useEffect(() => {
    if (!live) return;

    let ignore = false;
    async function check() {
      const { token } = useAuthStore.getState();
      if ((!token && !guest) || !loaded.current || document.hidden) return;

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
              !filterKey.split(",").includes(item.type) &&
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
  }, [live, guest, fetchPage, filterKey]);

  const shown = new Set(items?.map(itemKey));
  const fresh = incoming.filter(
    (item) => visibleTypes.includes(item.type) && !shown.has(itemKey(item)),
  );

  function loadMore() {
    const { token } = useAuthStore.getState();
    if ((!token && !guest) || !nextCursor || loadingMore || source !== fetchPage) return;

    setLoadingMore(true);
    setMoreFailed(false);
    fetchPage(token, nextCursor)
      .then((page) => {
        if (activeFetcher.current !== fetchPage) return;
        setItems((current) => {
          const seen = new Set(current?.map(itemKey));
          return [
            ...(current ?? []),
            ...page.items.filter((item) => !seen.has(itemKey(item))),
          ];
        });
        setNextCursor(page.nextCursor);
      })
      .catch(() => {
        if (activeFetcher.current === fetchPage) setMoreFailed(true);
      })
      .finally(() => {
        if (activeFetcher.current === fetchPage) setLoadingMore(false);
      });
  }

  return {
    contentTypes: types,
    filtered: filterKey !== "",
    items:
      source === fetchPage
        ? (items?.filter((item) => visibleTypes.includes(item.type)) ?? null)
        : null,
    failed: source === fetchPage && failed,
    retry: () => {
      setFailed(false);
      setAttempt((count) => count + 1);
    },
    hasMore: source === fetchPage && nextCursor !== null,
    loadingMore: source === fetchPage && loadingMore,
    moreFailed: source === fetchPage && moreFailed,
    loadMore,
    prepend: (item) => {
      if (visibleTypes.includes(item.type))
        setItems((current) => [item, ...(current ?? [])]);
    },
    newCount: source === fetchPage ? fresh.length : 0,
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
