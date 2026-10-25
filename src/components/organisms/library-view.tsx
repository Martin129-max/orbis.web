"use client";

import { App, Dropdown, InputNumber, Select, Tooltip } from "antd";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
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
import { useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Template from "@template";
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
import {
  useLibraryPreferencesStore,
  type LibraryTypeFilter as TypeFilter,
  type LibraryStatusFilter as StatusFilter,
} from "@/stores/library-preferences-store";
import { mediaTypes } from "./activity-card";
import { FriendsPanel } from "./friends-panel";
import { AddToLibraryButton, EntryMenu } from "./library-controls";
import { SidePanel } from "./side-panel";
import { PageTour } from "./onboarding";

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

  if (entry.mediaType === "game") return null;

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
        <li key={entry.id} className="flex flex-wrap items-center gap-3 px-5 py-3 first:pt-0 last:pb-0">
          <Link
            href={mediaPath(entry.mediaType, entry.sourceId)}
            className="focus-ring rounded-md"
          >
            <MediaCover src={entry.coverImage} className="w-10" square />
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
          <ProgressStepper entry={entry} onChange={onChange} className="w-32 bg-rail-item" />
          <StatusSelect entry={entry} onChange={onChange} />
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

const statusIcons = {
  all: Library,
  current: CirclePlay,
  completed: Check,
  on_hold: Pause,
  dropped: CircleX,
  planned: Bookmark,
} satisfies Record<StatusFilter, typeof Library>;

const statusTones = {
  current: "info",
  completed: "success",
  on_hold: "warning",
  dropped: "neutral",
  planned: "special",
} as const satisfies Record<LibraryStatus, Atom.PillTone>;

function StatusPill({
  entry,
  onChange,
}: {
  entry: LibraryEntry;
  onChange: (entry: LibraryEntry) => void;
}) {
  const { message } = App.useApp();
  const label = statusLabel(entry.status, entry.mediaType);
  const Icon = statusIcons[entry.status];

  async function change(status: LibraryStatus) {
    const { token } = useAuthStore.getState();
    if (!token || status === entry.status) return;
    try {
      onChange(await updateLibraryEntry(token, entry.id, { status }));
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: libraryStatuses.map((status) => {
          const StatusIcon = statusIcons[status];
          return {
            key: status,
            label: statusLabel(status, entry.mediaType),
            icon: <StatusIcon size={14} />,
            extra: status === entry.status ? <Check size={14} /> : undefined,
          };
        }),
        onClick: ({ key }) => change(key as LibraryStatus),
      }}
    >
      <button
        type="button"
        aria-label={`${label}. Change status of ${entry.title}`}
        className="focus-ring w-full cursor-pointer rounded-full"
      >
        <Atom.Pill
          tone={statusTones[entry.status]}
          className="h-7 w-full! justify-between px-3 pointer-coarse:h-9"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <Icon size={13} aria-hidden className="shrink-0" />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown size={13} aria-hidden className="shrink-0" />
        </Atom.Pill>
      </button>
    </Dropdown>
  );
}

function ProgressStepper({
  entry,
  onChange,
  className = "",
}: {
  entry: LibraryEntry;
  onChange: (entry: LibraryEntry) => void;
  className?: string;
}) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<number | null>(entry.progress);
  const [saving, setSaving] = useState(false);

  if (entry.mediaType === "game") return null;

  const unit = entry.mediaType === "manga" ? "chapter" : "episode";
  const max = entry.total ?? undefined;
  const finished = max !== undefined && entry.progress >= max;

  async function save(value: number) {
    setEditing(false);
    const next = Math.max(0, max === undefined ? value : Math.min(value, max));
    const { token } = useAuthStore.getState();
    if (!token || next === entry.progress) return;
    setSaving(true);
    try {
      onChange(await updateLibraryEntry(token, entry.id, { progress: next }));
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      aria-label={`Progress in ${unit}s`}
      className={`flex h-7 items-center justify-between rounded-full text-foreground pointer-coarse:h-9 ${className}`}
    >
      <button
        type="button"
        aria-label={`One fewer ${unit}`}
        disabled={saving || entry.progress <= 0}
        onClick={() => save(entry.progress - 1)}
        className="focus-ring flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:h-9 pointer-coarse:w-9"
      >
        <ChevronDown size={15} />
      </button>
      {editing ? (
        <InputNumber
          size="small"
          autoFocus
          min={0}
          max={max}
          value={draft}
          controls={false}
          aria-label={`${unit}s done`}
          onChange={setDraft}
          onPressEnter={() => draft !== null && save(draft)}
          onBlur={() => (draft !== null ? save(draft) : setEditing(false))}
          className="w-14"
        />
      ) : (
        <button
          type="button"
          aria-label={`${entry.progress} of ${entry.total ?? "unknown"} ${unit}s. Type a number`}
          onClick={() => {
            setDraft(entry.progress);
            setEditing(true);
          }}
          className="focus-ring min-w-0 cursor-text truncate rounded-sm px-1 text-[11px] font-semibold whitespace-nowrap"
        >
          {entry.progress} / {entry.total ?? "?"}
        </button>
      )}
      <button
        type="button"
        aria-label={`One more ${unit}`}
        disabled={saving || finished}
        onClick={() => save(entry.progress + 1)}
        className="focus-ring flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:h-9 pointer-coarse:w-9"
      >
        <ChevronUp size={15} />
      </button>
    </div>
  );
}

export function LibraryCard({
  entry,
  onChange,
  onRemove,
  className = "",
}: {
  entry: LibraryEntry;
  onChange: (entry: LibraryEntry) => void;
  onRemove: (id: number) => void;
  className?: string;
}) {
  const tracksProgress = entry.mediaType !== "game";

  return (
    <div className={`@container relative overflow-hidden rounded-md ${className}`}>
      <Link
        href={mediaPath(entry.mediaType, entry.sourceId)}
        aria-label={entry.title}
        className="focus-ring block rounded-md"
      >
        <MediaCover src={entry.coverImage} className="w-full" />
      </Link>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start gap-2 bg-gradient-to-b from-black/85 via-black/50 to-transparent p-2 pb-8">
        <span className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug font-semibold text-white">
          {!entry.isPublic && (
            <Lock
              size={12}
              aria-label="Private"
              className="pointer-events-auto mr-1 inline-block align-[-1px]"
            />
          )}
          {entry.title}
        </span>
        <div className="pointer-events-auto hidden shrink-0 pointer-coarse:@max-[11rem]:block">
          <EntryMenu entry={entry} onChange={onChange} onRemove={onRemove} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2 pt-8">
        {tracksProgress && (
          <div className="flex items-center gap-1">
            <ProgressStepper
              entry={entry}
              onChange={onChange}
              className="pointer-events-auto min-w-0 flex-1 bg-surface/90 shadow-sm"
            />
            <div className="pointer-events-auto shrink-0 pointer-coarse:@max-[11rem]:hidden">
              <EntryMenu entry={entry} onChange={onChange} onRemove={onRemove} />
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="pointer-events-auto min-w-0 flex-1">
            <StatusPill entry={entry} onChange={onChange} />
          </div>
          {!tracksProgress && (
            <div className="pointer-events-auto shrink-0 pointer-coarse:@max-[11rem]:hidden">
              <EntryMenu entry={entry} onChange={onChange} onRemove={onRemove} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const LIBRARY_SEARCH_ID = "library-search";
const SEARCH_SUGGESTIONS = ["Frieren", "One Piece", "Chainsaw Man", "Stardew Valley", "Berserk"];

const emptyCopy = {
  all: {
    title: "Nothing here yet.",
    description: "There’s nothing of this type in your library yet. Search for a title to add it.",
  },
  current: {
    title: "Nothing in progress.",
    description: "Start something from your plan list, or find something new to dive into.",
  },
  completed: {
    title: "Nothing finished yet.",
    description: "Everything you complete lands here, so you can look back on it.",
  },
  on_hold: {
    title: "Nothing on hold.",
    description: "Pause a title to park it here until you’re ready to pick it back up.",
  },
  dropped: {
    title: "Nothing dropped.",
    description: "Titles you stop watching, reading, or playing end up here.",
  },
  planned: {
    title: "Nothing planned.",
    description: "Save titles you want to get to next, and they’ll wait for you here.",
  },
} satisfies Record<StatusFilter, { title: string; description: string }>;

let focusSearchOnMount = false;

export function focusLibrarySearch() {
  document.getElementById(LIBRARY_SEARCH_ID)?.focus();
}

export function openLibrarySearch() {
  focusSearchOnMount = true;
}

export function LibraryEmptyState({
  entries,
  onSearch,
  onSuggest,
  compact = false,
}: {
  entries: LibraryEntry[];
  onSearch: () => void;
  onSuggest?: (query: string) => void;
  compact?: boolean;
}) {
  const status = useLibraryPreferencesStore((state) => state.status);
  const type = useLibraryPreferencesStore((state) => state.type);
  const setStatus = useLibraryPreferencesStore((state) => state.setStatus);
  const empty = entries.length === 0;
  const planned = filterLibrary(entries, type, "planned").length;
  const { title, description } = empty
    ? {
        title: "Your library is empty.",
        description:
          "Track the anime, manga, and games you love, and share your progress with your communities. Search for a title to add it.",
      }
    : emptyCopy[status];
  const Icon = statusIcons[empty ? "all" : status];

  return (
    <div
      className={`flex flex-col items-center gap-3 text-center ${compact ? "m-auto px-4" : "py-8"}`}
    >
      <span
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full bg-rail-item text-muted"
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <h3 className={`font-display font-bold ${compact ? "text-xl" : "text-2xl"}`}>{title}</h3>
      <p className="max-w-sm text-[13px] text-muted">{description}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <Atom.Button size="small" icon={<Search size={14} />} onClick={onSearch}>
          Search titles
        </Atom.Button>
        {status === "current" && planned > 0 && (
          <Atom.Button size="small" variant="secondary" onClick={() => setStatus("planned")}>
            Pick from your plan list · {planned}
          </Atom.Button>
        )}
      </div>
      {empty && onSuggest && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-xs text-muted">Try</span>
          {SEARCH_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggest(suggestion)}
              className="focus-ring cursor-pointer rounded-full border border-divider px-2.5 py-1 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function filterLibrary(
  entries: LibraryEntry[],
  type: TypeFilter,
  status: StatusFilter,
) {
  return entries.filter(
    (entry) =>
      (type === "all" || entry.mediaType === type) &&
      (status === "all" || entry.status === status),
  );
}

export function MediaCover({
  src,
  className = "",
  square = false,
}: {
  src: string | null;
  className?: string;
  square?: boolean;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md border border-divider bg-rail-item ${
        square ? "aspect-square" : "aspect-[2/3]"
      } ${className}`}
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
  return <Atom.Pill tone={statusTones[status]}>{statusLabel(status, type)}</Atom.Pill>;
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

function ViewToggle() {
  const view = useLibraryPreferencesStore((state) => state.view);
  const setView = useLibraryPreferencesStore((state) => state.setView);

  return (
    <div role="group" aria-label="Library view" className="flex items-center gap-0.5">
      {(
        [
          { value: "cards", label: "Cards", icon: <LayoutGrid size={16} /> },
          { value: "list", label: "List", icon: <List size={16} /> },
        ] as const
      ).map((option) => (
        <Tooltip key={option.value} title={option.label}>
          <button
            type="button"
            aria-label={option.label}
            aria-pressed={view === option.value}
            onClick={() => setView(option.value)}
            className={`icon-button cursor-pointer ${
              view === option.value ? "bg-rail-item text-foreground" : ""
            }`}
          >
            {option.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

function typeLabel(value: TypeFilter, compact = false) {
  return (
    <span className="flex items-center gap-1.5">
      {value === "all" ? <Library size={12} /> : mediaTypes[value].icon}
      <span className={compact ? "hidden sm:inline" : undefined}>
        {value === "all" ? "All types" : value === "game" ? "Games" : mediaTypes[value].label}
      </span>
    </span>
  );
}

export function LibraryTabs({
  entries,
  actions,
  bordered = true,
}: {
  entries: LibraryEntry[] | null;
  actions?: ReactNode;
  bordered?: boolean;
}) {
  const status = useLibraryPreferencesStore((state) => state.status);
  const type = useLibraryPreferencesStore((state) => state.type);
  const setStatus = useLibraryPreferencesStore((state) => state.setStatus);
  const setType = useLibraryPreferencesStore((state) => state.setType);

  const ofType = (entries ?? []).filter((entry) => type === "all" || entry.mediaType === type);
  const count = (value: StatusFilter) =>
    value === "all" ? ofType.length : ofType.filter((entry) => entry.status === value).length;
  const typeForLabels = type === "all" ? undefined : type;

  return (
    <nav
      aria-label="Library sections"
      className={`flex shrink-0 items-end gap-6 px-4 sm:px-8 ${bordered ? "border-b border-divider" : ""}`}
    >
      <div
        data-tour="library-tabs"
        className="-mb-px flex min-w-0 items-end gap-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
      >
        {(["all", ...libraryStatuses] as StatusFilter[]).map((value) => {
          const Icon = statusIcons[value];
          const active = status === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setStatus(value)}
              className={`focus-ring flex shrink-0 cursor-pointer items-center gap-2 rounded-t-sm border-b-2 px-1 py-3 text-sm whitespace-nowrap transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent font-semibold text-foreground hover:text-accent"
              }`}
            >
              <Icon size={16} aria-hidden />
              {value === "all" ? "All" : statusLabel(value, typeForLabels)}
              {entries && <span className="text-xs font-normal text-muted">{count(value)}</span>}
            </button>
          );
        })}
      </div>
      <div data-tour="library-view" className="ml-auto flex shrink-0 items-center gap-2 self-center">
        <Select<TypeFilter>
          size="small"
          aria-label="Media type"
          value={type}
          onChange={setType}
          popupMatchSelectWidth={false}
          className="w-16 sm:w-32"
          labelRender={({ value }) => typeLabel(value as TypeFilter, true)}
          options={(["all", "anime", "manga", "game"] as const).map((value) => ({
            value,
            label: typeLabel(value),
          }))}
        />
        {actions}
      </div>
    </nav>
  );
}

function LibraryShelf({
  entries,
  onChange,
  onRemove,
  onSuggest,
}: {
  entries: LibraryEntry[];
  onChange: (entry: LibraryEntry) => void;
  onRemove: (id: number) => void;
  onSuggest: (query: string) => void;
}) {
  const status = useLibraryPreferencesStore((state) => state.status);
  const type = useLibraryPreferencesStore((state) => state.type);
  const view = useLibraryPreferencesStore((state) => state.view);

  const shown = filterLibrary(entries, type, status);

  const boxed = shown.length === 0 || view === "list";

  return (
    <section
      className={`flex flex-col gap-4 ${
        boxed
          ? `rounded-lg border border-divider bg-surface ${shown.length > 0 ? "py-5" : "p-5"}`
          : ""
      }`}
    >
      {shown.length === 0 ? (
        <LibraryEmptyState
          entries={entries}
          onSearch={focusLibrarySearch}
          onSuggest={onSuggest}
        />
      ) : view === "list" ? (
        <ListView entries={shown} onChange={onChange} onRemove={onRemove} />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3 sm:grid-cols-3 md:grid-cols-4">
          {shown.map((entry) => (
            <li key={entry.id}>
              <LibraryCard entry={entry} onChange={onChange} onRemove={onRemove} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LibrarySearch({
  entries,
  onAdded,
  query,
  onQueryChange,
}: {
  entries: LibraryEntry[];
  onAdded: (entry: LibraryEntry) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
}) {
  useEffect(() => {
    const input = document.getElementById(LIBRARY_SEARCH_ID);
    if (!focusSearchOnMount || !input) return;
    focusSearchOnMount = false;
    input.focus();
  }, []);

  return (
    <div data-tour="library-search">
      <Molecule.HeaderSearch
        id={LIBRARY_SEARCH_ID}
        label="Search anime, manga, and games"
        placeholder="Search anime, manga, and games…"
        query={query}
        onQueryChange={onQueryChange}
        renderResults={(search) => (
          <SearchResults query={search} entries={entries} onAdded={onAdded} />
        )}
      />
    </div>
  );
}

export function TitleSearch({ onAdded }: { onAdded: (entry: LibraryEntry) => void }) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getLibrary(token)
      .then(setEntries)
      .catch(() => null);
  }, []);

  return (
    <LibrarySearch
      entries={entries}
      onAdded={(entry) => {
        setEntries((current) => [entry, ...current]);
        onAdded(entry);
      }}
    />
  );
}

export function LibraryView() {
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    useLibraryPreferencesStore.persist.rehydrate();
  }, []);

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
    <>
      <PageTour name="library" />
      <Template.PageHeader
        center={
          <LibrarySearch
            entries={entries ?? []}
            onAdded={(entry) => setEntries((current) => [entry, ...(current ?? [])])}
            query={query}
            onQueryChange={setQuery}
          />
        }
      >
        <Atom.Heading>Library</Atom.Heading>
      </Template.PageHeader>
      <LibraryTabs entries={entries} actions={<ViewToggle />} />
      <div className="flex min-h-0 flex-1">
        <Template.PageColumn>
          <div className="flex flex-col gap-6">
            {failed ? (
              <Atom.ErrorMessage>Could not load your library.</Atom.ErrorMessage>
            ) : !entries ? (
              <Molecule.FeedSkeleton label="Loading your library…" />
            ) : (
              <LibraryShelf
                entries={entries}
                onSuggest={(suggestion) => {
                  setQuery(suggestion);
                  focusLibrarySearch();
                }}
                onChange={replace}
                onRemove={(id) =>
                  setEntries((current) => current?.filter((item) => item.id !== id) ?? null)
                }
              />
            )}
          </div>
        </Template.PageColumn>
        <SidePanel label="Friends">
          <FriendsPanel />
        </SidePanel>
      </div>
    </>
  );
}
