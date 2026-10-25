"use client";

import { ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import * as Atom from "@atom";
import { getLibrary, type LibraryEntry } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useLayoutStore } from "@/stores/layout-store";
import { useLibraryPreferencesStore } from "@/stores/library-preferences-store";
import { filterLibrary, LibraryCard, LibraryTabs } from "./library-view";

const PANEL_HEIGHT = 352;
const PULL_DISTANCE = 40;
const notchCorners = [
  "before:pointer-events-none before:absolute before:right-full before:bottom-0 before:size-2.5 before:content-['']",
  "before:bg-[radial-gradient(circle_at_0_0,transparent_8.5px,var(--color-divider)_9px,var(--color-divider)_10px,var(--color-rail)_10.5px)]",
  "after:pointer-events-none after:absolute after:bottom-0 after:left-full after:size-2.5 after:content-['']",
  "after:bg-[radial-gradient(circle_at_100%_0,transparent_8.5px,var(--color-divider)_9px,var(--color-divider)_10px,var(--color-rail)_10.5px)]",
].join(" ");

function DockShelf({
  entries,
  onChange,
  onRemove,
}: {
  entries: LibraryEntry[] | null;
  onChange: (entry: LibraryEntry) => void;
  onRemove: (id: number) => void;
}) {
  const status = useLibraryPreferencesStore((state) => state.status);
  const type = useLibraryPreferencesStore((state) => state.type);

  if (!entries) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Atom.Loader />
      </div>
    );
  }

  const shown = filterLibrary(entries, type, status);

  if (shown.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted">Nothing here yet.</p>
        {entries.length === 0 && (
          <Link href="/library" className="focus-ring rounded-sm text-sm text-accent hover:underline">
            Add your first anime, manga, or game
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul
      className="flex min-h-0 flex-1 snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pt-4 pb-3 sm:scroll-px-8 sm:px-8"
      onWheel={(event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.currentTarget.scrollLeft += event.deltaY;
        }
      }}
    >
      {shown.map((entry) => (
        <li key={entry.id} className="w-32 shrink-0 snap-start">
          <LibraryCard entry={entry} onChange={onChange} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  );
}

export function LibraryDock() {
  const profile = useAuthStore((state) => state.profile);
  const pathname = usePathname();
  const open = useLayoutStore((state) => state.dockOpen);
  const setOpen = useLayoutStore((state) => state.setDockOpen);
  const restoreDock = useLayoutStore((state) => state.restoreDock);
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<number | null>(null);
  const dragged = useRef(false);
  const shown = profile !== null && pathname !== "/library";
  const height = shown
    ? Math.min(PANEL_HEIGHT, Math.max(0, (open ? PANEL_HEIGHT : 0) - (drag ?? 0)))
    : 0;

  useLayoutEffect(() => {
    restoreDock();
    useLibraryPreferencesStore.persist.rehydrate();
  }, [restoreDock]);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!open || !shown || !token) return;

    let ignore = false;
    getLibrary(token)
      .then((library) => {
        if (!ignore) setEntries(library);
      })
      .catch(() => {
        if (!ignore) setEntries([]);
      });
    return () => {
      ignore = true;
    };
  }, [open, shown]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--library-dock-height", `${height}px`);
    return () => {
      root.style.removeProperty("--library-dock-height");
    };
  }, [height]);

  if (!shown) return null;

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = event.clientY;
    dragged.current = false;
    setDrag(0);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (start.current === null) return;
    const distance = event.clientY - start.current;
    if (Math.abs(distance) > 4) dragged.current = true;
    setDrag(distance);
  }

  function handlePointerUp() {
    const distance = drag ?? 0;
    start.current = null;
    setDrag(null);
    if (distance < -PULL_DISTANCE) setOpen(true);
    else if (distance > PULL_DISTANCE) setOpen(false);
  }

  const replace = (entry: LibraryEntry) =>
    setEntries((current) => current?.map((item) => (item.id === entry.id ? entry : item)) ?? null);
  const remove = (id: number) =>
    setEntries((current) => current?.filter((item) => item.id !== id) ?? null);

  return (
    <section
      aria-label="Your library"
      data-dock={height > 0 ? "open" : undefined}
      style={{ height }}
      className={`relative z-10 shrink-0 bg-rail ${
        drag === null
          ? "transition-[height] duration-300 ease-out motion-reduce:transition-none"
          : ""
      }`}
    >
      <button
        type="button"
        data-tour="library-dock"
        aria-label={open ? "Hide your library" : "Show your library"}
        aria-expanded={open}
        aria-controls="library-dock-panel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          setOpen(!open);
        }}
        className={`focus-ring absolute bottom-full left-1/2 flex h-7 -translate-x-1/2 cursor-grab touch-none items-center rounded-t-lg border border-b-0 border-divider bg-rail px-5 select-none active:cursor-grabbing ${notchCorners}`}
      >
        <ChevronUp
          size={16}
          aria-hidden
          className={`transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div id="library-dock-panel" inert={!open} className="h-full overflow-hidden">
        <div style={{ height: PANEL_HEIGHT }} className="flex flex-col">
          <LibraryTabs entries={entries} bordered={false} />
          <div className="flex min-h-0 flex-1 flex-col rounded-tl-2xl border-t border-l border-divider bg-background">
            <DockShelf entries={entries} onChange={replace} onRemove={remove} />
          </div>
        </div>
      </div>
    </section>
  );
}
