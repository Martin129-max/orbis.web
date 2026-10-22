"use client";

import { Segmented } from "antd";
import { Library, Lock } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { LibraryStatus, MediaType } from "@/lib/api";
import { libraryStatuses, mediaPath, statusLabel } from "@/lib/library";
import { MediaCover, StatusBadge } from "./library-view";

type ShelfEntry = {
  id: number;
  mediaType: MediaType;
  sourceId: string;
  title: string;
  coverImage: string | null;
  status: LibraryStatus;
  progress: number;
  total: number | null;
  isPublic?: boolean;
};

export function ProfileLibrary({
  entries,
  action,
}: {
  entries: ShelfEntry[];
  action?: ReactNode;
}) {
  const [status, setStatus] = useState<"all" | LibraryStatus>("all");
  const shown = entries.filter((entry) => status === "all" || entry.status === status);
  const tabs = (["all", ...libraryStatuses] as const).filter(
    (value) => value === "all" || entries.some((entry) => entry.status === value),
  );

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold">
          <Library size={18} className="text-muted" />
          Library / {entries.length}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {entries.length > 0 && (
            <Segmented<"all" | LibraryStatus>
              size="small"
              value={status}
              onChange={setStatus}
              options={tabs.map((value) => ({
                value,
                label: `${value === "all" ? "All" : statusLabel(value)} · ${
                  value === "all"
                    ? entries.length
                    : entries.filter((entry) => entry.status === value).length
                }`,
              }))}
            />
          )}
          {action}
        </div>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">Nothing in the library yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {shown.map((entry) => (
            <li key={entry.id}>
              <Link
                href={mediaPath(entry.mediaType, entry.sourceId)}
                className="focus-ring group flex flex-col gap-2 rounded-md"
              >
                <span className="relative">
                  <MediaCover
                    src={entry.coverImage}
                    className="w-full transition-opacity group-hover:opacity-90"
                  />
                  {entry.isPublic === false && (
                    <span
                      title="Private"
                      className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm"
                    >
                      <Lock size={12} />
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-[13px] leading-snug font-semibold group-hover:underline">
                  {entry.title}
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={entry.status} type={entry.mediaType} />
                  {entry.mediaType !== "game" && entry.progress > 0 && (
                    <span className="text-[11px] text-muted">
                      {entry.progress} / {entry.total ?? "?"}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
