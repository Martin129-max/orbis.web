"use client";

import { Spin } from "antd";
import { useEffect, useRef } from "react";
import * as Atom from "@atom";

type LoadMoreProps = {
  onLoadMore: () => void;
  loading: boolean;
  failed: boolean;
};

export function LoadMore({ onLoadMore, loading, failed }: LoadMoreProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  const callback = useRef(onLoadMore);

  useEffect(() => {
    callback.current = onLoadMore;
  });

  useEffect(() => {
    const element = sentinel.current;
    if (!element || loading || failed) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback.current();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [loading, failed]);

  return (
    <div ref={sentinel} className="flex min-h-12 items-center justify-center py-4">
      {failed ? (
        <div role="alert" className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted">Couldn&apos;t load more posts.</p>
          <Atom.Button variant="secondary" onClick={onLoadMore}>
            Try again
          </Atom.Button>
        </div>
      ) : (
        loading && <Spin aria-label="Loading more posts" />
      )}
    </div>
  );
}
