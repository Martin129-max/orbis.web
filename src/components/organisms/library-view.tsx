"use client";

import { App, InputNumber, Segmented, Select } from "antd";
import {
  Bookmark,
  Check,
  CirclePlay,
  CircleX,
  LayoutGrid,
  Library,
  List,
  Lock,
  Minus,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  getLibrary,
  searchLibrary,
  type LibraryEntry,
  type LibraryStatus,
  type MediaResult,
  type MediaType,
  updateLibraryEntry,
} from "@/lib/api";
import { libraryStatuses, mediaPath, statusLabel } from "@/lib/library";
import { useAuthStore } from "@/stores/auth-store";
import { mediaTypes } from "./activity-card";
import { AddToLibraryButton, EntryMenu } from "./library-controls";

type View = "cards" | "list";

export function ProgressControl({
  entry,
  onChange,
}: {
  entry: LibraryEntry;
  onChange: (entry: LibraryEntry) => void;
}) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<number | null>(entry.progress);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(entry.progress);
  if (synced !== entry.progress) {
    setSynced(entry.progress);
    setDraft(entry.progress);
  }

  if (entry.mediaType === "game") return <span className="text-xs text-muted">—</span>;

  const unit = entry.mediaType === "manga" ? "chapters" : "episodes";
  const max = entry.total ?? undefined;

  async function save(value: number) {
    const next = Math.max(0, max === undefined ? value : Math.min(value, max));
    if (next === entry.progress) {
      setDraft(entry.progress);
      return;
    }
    const { token } = useAuthStore.getState();
    if (!token) return;
    setSaving(true);
    try {
      onChange(await updateLibraryEntry(token, entry.id, { progress: next }));
    } catch (e) {
      setDraft(entry.progress);
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1" aria-label={`Progress in ${unit}`}>
      <button
        type="button"
        aria-label={`One fewer ${unit.slice(0, -1)}`}
        disabled={saving || entry.progress <= 0}
        onClick={() => save(entry.progress - 1)}
        className="icon-button cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <InputNumber
        size="small"
        min={0}
        max={max}
        value={draft}
        disabled={saving}
        controls={false}
        aria-label={`${unit} done`}
        onChange={setDraft}
        onPressEnter={() => draft !== null && save(draft)}
        onBlur={() => (draft !== null ? save(draft) : setDraft(entry.progress))}
        className="w-14 text-center"
      />
      <span className="w-10 text-xs text-muted">/ {entry.total ?? "?"}</span>
      <button
        type="button"
        aria-label={`One more ${unit.slice(0, -1)}`}
        disabled={saving || (max !== undefined && entry.progress >= max)}
        onClick={() => save(entry.progress + 1)}
        className="icon-button cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function StatusSelect({
  entry,
  onChange,
}: {
  entry: LibraryEntry;
  onChange: (entry: LibraryEntry) => void;
}) {
  const { message } = App.useApp();

  async function change(status: LibraryStatus) {
    const { token } = useAuthStore.getState();
    if (!token) return;
    try {
      onChange(await updateLibraryEntry(token, entry.id, { status }));
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <Select<LibraryStatus>
      size="small"
      aria-label={`Status of ${entry.title}`}
      value={entry.status}
      onChange={change}
      popupMatchSelectWidth={false}
      className="w-36"
      options={libraryStatuses.map((value) => ({
        value,
        label: statusLabel(value, entry.mediaType),
      }))}
    />
  );
}

function ListView({
  entries,
  onChange,
  onRemove,
}: {
  entries: LibraryEntry[];
  onChange: (entry: LibraryEntry) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <ul className="flex flex-col divide-y divide-divider">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-wrap items-center gap-3 py-3">
          <Link
            href={mediaPath(entry.mediaType, entry.sourceId)}
            className="focus-ring rounded-md"
          >
            <MediaCover src={entry.coverImage} className="w-10" />
          </Link>
          <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1">
            <Link
              href={mediaPath(entry.mediaType, entry.sourceId)}
              className="focus-ring truncate rounded-sm text-sm font-semibold hover:underline"
            >
              {entry.title}
            </Link>
            <span className="flex items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                {mediaTypes[entry.mediaType].icon}
                {mediaTypes[entry.mediaType].label}
              </span>
              {!entry.isPublic && (
                <span className="flex items-center gap-1">
                  <Lock size={12} />
                  Private
                </span>
              )}
            </span>
          </div>
          <StatusSelect entry={entry} onChange={onChange} />
          <ProgressControl entry={entry} onChange={onChange} />
          <EntryMenu
            entry={entry}
            onChange={onChange}
            onRemove={onRemove}
            trigger={
              <button
                type="button"
                aria-label={`Options for ${entry.title}`}
                className="icon-button cursor-pointer"
              >
                <MoreHorizontal size={16} />
              </button>
            }
          />
        </li>
      ))}
    </ul>
  );
}

type TypeFilter = "all" | MediaType;
type StatusFilter = "all" | LibraryStatus;

const statusIcons = {
  all: Library,
  current: CirclePlay,
  completed: Check,
  on_hold: Pause,
  dropped: CircleX,
  planned: Bookmark,
} satisfies Record<StatusFilter, typeof Library>;

export function MediaCover({
  src,
  className = "",
}: {
  src: string | null;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-md border border-divider bg-rail-item ${className}`}
    >
      {src && <Image src={src} alt="" fill unoptimized className="object-cover" />}
    </div>
  );
}

export function StatusBadge({
  status,
  type,
}: {
  status: LibraryStatus;
  type?: MediaType;
}) {
  const tone = (
    {
      current: "info",
      completed: "success",
      on_hold: "warning",
      dropped: "neutral",
      planned: "special",
    } as const
  )[status];

  return <Atom.Pill tone={tone}>{statusLabel(status, type)}</Atom.Pill>;
}

function SearchResults({
  query,
  entries,
  onAdded,
}: {
  query: string;
  entries: LibraryEntry[];
  onAdded: (entry: LibraryEntry) => void;
}) {
  const [results, setResults] = useState<{
    query: string;
    data: Record<MediaType, MediaResult[]> | null;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    let ignore = false;
    searchLibrary(token, query)
      .then((data) => {
        if (!ignore) setResults({ query, data });
      })
      .catch((e: Error) => {
        if (!ignore) setResults({ query, data: null, error: e.message });
      });
    return () => {
      ignore = true;
    };
  }, [query]);

  if (!results || results.query !== query) return <Molecule.FeedSkeleton label="Searching…" />;
  if (!results.data) return <Atom.ErrorMessage>{results.error}</Atom.ErrorMessage>;

  const saved = new Map(entries.map((entry) => [entry.mediaId, entry]));
  const groups = (Object.keys(mediaTypes) as MediaType[]).filter(
    (type) => results.data![type].length > 0,
  );
  if (groups.length === 0) {
    return <p className="py-6 text-sm text-muted">Nothing matches “{query}”.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((type) => (
        <section key={type} className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase">
            {mediaTypes[type].icon}
            {mediaTypes[type].label}
          </h3>
          <ul className="flex flex-col gap-2">
            {results.data![type].map((item) => {
              const entry = saved.get(item.id);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-divider bg-surface p-3"
                >
                  <Link href={mediaPath(item.type, item.sourceId)} className="focus-ring rounded-md">
                    <MediaCover src={item.coverImage} className="w-12" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      href={mediaPath(item.type, item.sourceId)}
                      className="focus-ring truncate rounded-sm text-sm font-semibold hover:underline"
                    >
                      {item.title}
                    </Link>
                    <span className="text-xs text-muted">
                      {[item.year, item.score !== null && `★ ${item.score.toFixed(1)}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  {entry ? (
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-online">
                      <Check size={14} />
                      {statusLabel(entry.status, entry.mediaType)}
                    </span>
                  ) : (
                    <AddToLibraryButton media={item} onAdded={onAdded} />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function LibraryShelf({
  entries,
  onChange,
  onRemove,
}: {
  entries: LibraryEntry[];
  onChange: (entry: LibraryEntry) => void;
  onRemove: (id: number) => void;
}) {
  const [status, setStatus] = useState<StatusFilter>("current");
  const [type, setType] = useState<TypeFilter>("all");
  const [view, setView] = useState<View>("list");
  const ofType = entries.filter((entry) => type === "all" || entry.mediaType === type);
  const shown = ofType.filter((entry) => status === "all" || entry.status === status);
  const count = (value: StatusFilter) =>
    value === "all" ? ofType.length : ofType.filter((entry) => entry.status === value).length;
  const typeForLabels = type === "all" ? undefined : type;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Library size={20} className="text-muted" />
          Your library / {entries.length}
        </h2>
        <div className="ml-auto max-w-full overflow-x-auto">
          <Segmented<TypeFilter>
            size="small"
            aria-label="Media type"
            value={type}
            onChange={setType}
            options={(["all", "anime", "manga", "game"] as const).map((value) => ({
              value,
              label: value === "all" ? "All types" : value === "game" ? "Games" : mediaTypes[value].label,
              icon: (
                <span aria-hidden className="inline-flex items-center align-middle">
                  {value === "all" ? <Library size={14} /> : mediaTypes[value].icon}
                </span>
              ),
            }))}
          />
        </div>
      </div>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="-mx-1 min-w-0 overflow-x-auto px-1">
          <Segmented<StatusFilter>
            size="small"
            aria-label="Library status"
            value={status}
            onChange={setStatus}
            options={(["all", ...libraryStatuses] as StatusFilter[]).map((value) => {
              const Icon = statusIcons[value];
              return {
                value,
                label: `${value === "all" ? "All" : statusLabel(value, typeForLabels)} · ${count(value)}`,
                icon: <Icon size={14} aria-hidden className="inline-block align-middle" />,
              };
            })}
          />
        </div>
        <div className="shrink-0">
          <Segmented<View>
            size="small"
            aria-label="Library view"
            value={view}
            onChange={setView}
            options={[
              { value: "cards", icon: <LayoutGrid size={14} />, title: "Cards" },
              { value: "list", icon: <List size={14} />, title: "List" },
            ]}
          />
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {entries.length === 0
            ? "Nothing here yet. Search above to add your first anime, manga, or game."
            : "Nothing here yet."}
        </p>
      ) : view === "list" ? (
        <ListView entries={shown} onChange={onChange} onRemove={onRemove} />
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {shown.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-2">
              <div className="relative">
                <Link
                  href={mediaPath(entry.mediaType, entry.sourceId)}
                  className="focus-ring block rounded-md"
                >
                  <MediaCover src={entry.coverImage} className="w-full" />
                </Link>
                {!entry.isPublic && (
                  <span
                    title="Private"
                    className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm"
                  >
                    <Lock size={13} />
                  </span>
                )}
                <div className="absolute top-2 right-2">
                  <EntryMenu entry={entry} onChange={onChange} onRemove={onRemove} />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={mediaPath(entry.mediaType, entry.sourceId)}
                  className="focus-ring line-clamp-2 rounded-sm text-sm leading-snug font-semibold hover:underline"
                >
                  {entry.title}
                </Link>
                <span className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={entry.status} type={entry.mediaType} />
                  {entry.mediaType !== "game" && (
                    <span className="text-[11px] text-muted">
                      {entry.progress} / {entry.total ?? "?"}{" "}
                      {entry.mediaType === "manga" ? "ch" : "ep"}
                    </span>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function LibraryView() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getLibrary(token)
      .then(setEntries)
      .catch(() => setFailed(true));
  }, []);

  const replace = (entry: LibraryEntry) =>
    setEntries((current) => current?.map((item) => (item.id === entry.id ? entry : item)) ?? null);

  return (
    <div className="flex flex-col gap-6">
      <Molecule.PageIntro
        eyebrow="Library"
        title="Your library."
        description="Track what you’re watching, reading, and playing. Public entries and their updates show up in your communities’ feeds."
      />
      <div className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-4">
        <Atom.Input
          aria-label="Search anime, manga, and games"
          size="large"
          allowClear
          prefix={<Search size={16} className="text-muted" />}
          placeholder="Search anime, manga, and games…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {search.length >= 2 ? (
          <SearchResults
            query={search}
            entries={entries ?? []}
            onAdded={(entry) => setEntries((current) => [entry, ...(current ?? [])])}
          />
        ) : (
          <p className="text-xs text-muted">Type at least 2 characters to search.</p>
        )}
      </div>
      {failed ? (
        <Atom.ErrorMessage>Could not load your library.</Atom.ErrorMessage>
      ) : !entries ? (
        <Molecule.FeedSkeleton label="Loading your library…" />
      ) : (
        <LibraryShelf
          entries={entries}
          onChange={replace}
          onRemove={(id) =>
            setEntries((current) => current?.filter((item) => item.id !== id) ?? null)
          }
        />
      )}
    </div>
  );
}
