"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Compass,
  Folder,
  House,
  LibraryBig,
  LogOut,
  Plus,
  User,
} from "lucide-react";
import { Dropdown, Popover, Tooltip } from "antd";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as Atom from "@atom";
import type { Community, RailFolder } from "@/lib/api";
import {
  communityKey,
  folderKey,
  moveInLayout,
  normalizeLayout,
  ungroup,
  type RailDrop,
} from "@/lib/rail-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { useFriendsStore } from "@/stores/friends-store";
import { CreateCommunityModal } from "./create-community-modal";
import { FolderSettingsModal } from "./folder-settings-modal";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";

function itemClass(active: boolean) {
  return `focus-ring relative flex h-9 w-9 items-center justify-center rounded-full font-display text-[17px] leading-none font-bold sm:h-12 sm:w-12 sm:text-[23px] transition-colors motion-reduce:transition-none ${
    active
      ? "bg-accent text-accent-foreground"
      : "bg-rail-item text-foreground hover:bg-accent-soft"
  }`;
}

function RailSlot({
  label,
  dragging = false,
  slotRef,
  style,
  railKey,
  indicator,
  children,
}: {
  label: string;
  dragging?: boolean;
  slotRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  railKey?: string;
  indicator?: "before" | "after";
  children: ReactNode;
}) {
  return (
    <li
      ref={slotRef}
      style={style}
      data-rail-key={railKey}
      className={`relative flex w-full justify-center ${dragging ? "z-10" : ""}`}
    >
      {indicator && (
        <span
          aria-hidden
          className={`absolute left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-accent sm:w-10 ${
            indicator === "before" ? "-top-2.5" : "-bottom-2.5"
          }`}
        />
      )}
      <Tooltip
        title={label}
        placement="right"
        open={dragging ? false : undefined}
      >
        {children}
      </Tooltip>
    </li>
  );
}

const FADE = "24px";

function fadeMask({ above, below }: { above: boolean; below: boolean }) {
  if (!above && !below) return undefined;

  const mask = `linear-gradient(to bottom, ${above ? "transparent" : "#000"}, #000 ${FADE}, #000 calc(100% - ${FADE}), ${below ? "transparent" : "#000"})`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

const OPEN_FOLDERS_KEY = "orbis:rail-open-folders";
const noShift = () => null;

function readOpenFolders() {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(OPEN_FOLDERS_KEY) ?? "[]");
    return new Set(Array.isArray(saved) ? saved.filter(Number.isInteger) : []);
  } catch {
    return new Set<number>();
  }
}

function tint(color: string | null, alpha: string) {
  return color ? { backgroundColor: `${color}${alpha}` } : undefined;
}

function SortableCommunity({
  community,
  active,
  drop,
}: {
  community: Community;
  active: boolean;
  drop?: RailDrop;
}) {
  const target = drop === "combine";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: communityKey(community.id) });

  return (
    <RailSlot
      label={community.name}
      dragging={isDragging}
      slotRef={setNodeRef}
      railKey={communityKey(community.id)}
      indicator={drop === "combine" ? undefined : drop}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <Link
        {...attributes}
        {...listeners}
        role={undefined}
        href={`/communities/${community.id}`}
        aria-label={community.name}
        aria-current={active ? "page" : undefined}
        className={`${itemClass(active)} ${
          active || target ? "ring-2 ring-accent ring-offset-2 ring-offset-rail" : ""
        } ${target ? "scale-110" : ""} ${
          isDragging
            ? "cursor-grabbing border-2 border-dashed border-accent opacity-50"
            : ""
        }`}
      >
        <Atom.CommunityIcon name={community.name} src={community.iconUrl} />
      </Link>
    </RailSlot>
  );
}

function SortableFolder({
  folder,
  communities,
  open,
  active,
  drop,
  onToggle,
  onEdit,
  onUngroup,
}: {
  folder: RailFolder;
  communities: Community[];
  open: boolean;
  active: boolean;
  drop?: RailDrop;
  onToggle: () => void;
  onEdit: () => void;
  onUngroup: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folderKey(folder.id) });
  const label = folder.name || communities.map(({ name }) => name).join(", ");
  const target = drop === "combine";

  return (
    <RailSlot
      label={label}
      dragging={isDragging}
      slotRef={setNodeRef}
      railKey={folderKey(folder.id)}
      indicator={drop === "combine" ? undefined : drop}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <Dropdown
        trigger={["contextMenu"]}
        menu={{
          items: [
            { key: "edit", label: "Folder settings", onClick: onEdit },
            { key: "ungroup", label: "Ungroup folder", onClick: onUngroup },
          ],
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`${folder.name || "Folder"}, ${communities.length} communities`}
          aria-expanded={open}
          onClick={onToggle}
          style={open ? undefined : tint(folder.color, "40")}
          className={`focus-ring relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[14px] transition-[background-color,transform] sm:h-12 sm:w-12 sm:rounded-2xl motion-reduce:transition-none ${
            open ? "" : folder.color ? "" : "bg-rail-item"
          } ${
            active && !open ? "ring-2 ring-accent ring-offset-2 ring-offset-rail" : ""
          } ${target ? "scale-110 ring-2 ring-accent ring-offset-2 ring-offset-rail" : ""} ${
            isDragging ? "cursor-grabbing opacity-50" : ""
          }`}
        >
          {open ? (
            <Folder
              size={20}
              aria-hidden
              style={{ color: folder.color ?? undefined }}
              fill={folder.color ?? "currentColor"}
              fillOpacity={0.35}
            />
          ) : (
            <span className="grid grid-cols-2 gap-0.5 sm:gap-1">
              {communities.slice(0, 4).map((community) => (
                <span
                  key={community.id}
                  className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-surface font-display text-[7px] leading-none font-bold text-foreground sm:h-[18px] sm:w-[18px] sm:text-[9px]"
                >
                  <Atom.CommunityIcon name={community.name} src={community.iconUrl} />
                </span>
              ))}
            </span>
          )}
        </button>
      </Dropdown>
    </RailSlot>
  );
}

function UserButton() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!useAuthStore.getState().profile) fetchProfile().catch(() => null);
  }, [fetchProfile]);

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  const username = profile ? `@${profile.username}` : "Account";
  const menuRow =
    "focus-ring -mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-rail-item hover:text-foreground";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="rightBottom"
      arrow={false}
      align={{ offset: [12, 0] }}
      styles={{ container: { padding: 20, borderRadius: 12 } }}
      content={
        <div className="flex w-[300px] flex-col gap-4">
          {profile && (
            <div className="flex items-center gap-3">
              <Atom.Avatar
                label={profile.username}
                src={profile.avatarUrl}
                seed={profile.userId}
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate">{profile.username}</span>
                <span className="truncate text-xs text-muted">{username}</span>
              </div>
            </div>
          )}
          <hr className="border-divider" />
          <p className="text-xs text-muted uppercase">Theme</p>
          <ThemeToggle block />
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm">Appear offline</span>
            <AppearOfflineSwitch />
          </label>
          <hr className="border-divider" />
          <Link
            href={profile ? `/users/${profile.username}` : "/profile"}
            onClick={() => setOpen(false)}
            className={menuRow}
          >
            <User size={18} />
            View profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={menuRow}
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      }
    >
      <button
        type="button"
        aria-label={`Account: ${username}`}
        data-tour="account"
        aria-expanded={open}
        className="focus-ring rounded-full"
      >
        <Atom.Avatar
          size="rail"
          label={profile?.username ?? "?"}
          src={profile?.avatarUrl}
          seed={profile?.userId ?? 0}
          presence={profile?.appearOffline ? "offline" : "online"}
        />
      </button>
    </Popover>
  );
}

export function CommunityRail() {
  const { communityId } = useParams<{ communityId?: string }>();
  const pathname = usePathname();
  const communities = useCommunityStore((state) => state.communities);
  const layout = useCommunityStore((state) => state.layout);
  const fetchCommunities = useCommunityStore((state) => state.fetchCommunities);
  const updateLayout = useCommunityStore((state) => state.updateLayout);
  const [creating, setCreating] = useState(false);
  const [openFolders, setOpenFolders] = useState(readOpenFolders);
  const [closingFolders, setClosingFolders] = useState<Set<number>>(new Set());
  const closeTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const [dragging, setDragging] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ overKey: string; drop: RailDrop } | null>(null);
  const [editing, setEditing] = useState<RailFolder | null>(null);
  const suppressClick = useRef(false);
  const scrollList = useRef<HTMLUListElement>(null);
  const [overflow, setOverflow] = useState({ above: false, below: false });

  function measureOverflow() {
    const list = scrollList.current;
    if (!list) return;

    const above = list.scrollTop > 0;
    const below = list.scrollTop + list.clientHeight < list.scrollHeight - 1;
    setOverflow((current) =>
      current.above === above && current.below === below
        ? current
        : { above, below },
    );
  }
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ["Space"],
        cancel: ["Escape"],
        end: ["Space", "Enter"],
      },
    }),
  );
  const ids = useMemo(() => communities.map(({ id }) => id), [communities]);
  const byId = useMemo(
    () => new Map(communities.map((community) => [community.id, community])),
    [communities],
  );
  const items = useMemo(() => normalizeLayout(layout, ids), [layout, ids]);
  const isOpen = (folder: RailFolder) =>
    openFolders.has(folder.id) && dragging !== folderKey(folder.id);
  const visible = items.flatMap((item) =>
    item.type === "community"
      ? [communityKey(item.communityId)]
      : [
          folderKey(item.id),
          ...(isOpen(item) ? item.communityIds.map(communityKey) : []),
        ],
  );
  const activeId = Number(communityId);

  useEffect(() => {
    const timers = closeTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  function setFolderOpen(folderId: number, open: boolean) {
    setOpenFolders((current) => {
      const next = new Set(current);
      if (open) next.add(folderId);
      else next.delete(folderId);
      try {
        localStorage.setItem(OPEN_FOLDERS_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  function setFolderClosing(folderId: number, closing: boolean) {
    setClosingFolders((current) => {
      const next = new Set(current);
      if (closing) next.add(folderId);
      else next.delete(folderId);
      return next;
    });
  }

  function toggleFolder(folderId: number) {
    const timer = closeTimers.current.get(folderId);
    if (timer) {
      clearTimeout(timer);
      closeTimers.current.delete(folderId);
      setFolderClosing(folderId, false);
      return;
    }
    if (!openFolders.has(folderId)) {
      setFolderOpen(folderId, true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFolderOpen(folderId, false);
      return;
    }

    setFolderClosing(folderId, true);
    closeTimers.current.set(
      folderId,
      setTimeout(() => {
        closeTimers.current.delete(folderId);
        setFolderClosing(folderId, false);
        setFolderOpen(folderId, false);
      }, 200),
    );
  }

  function saveLayout(next: typeof items) {
    updateLayout(normalizeLayout(next, ids));
  }

  function finishDrag() {
    setDragging(null);
    setDrop(null);
    setTimeout(() => {
      suppressClick.current = false;
    });
  }

  function trackDrop({ active, over, activatorEvent, delta }: DragMoveEvent) {
    const activeKey = String(active.id);
    const overKey = over ? String(over.id) : null;
    const node =
      overKey && overKey !== activeKey
        ? document.querySelector(`[data-rail-key="${overKey}"]`)
        : null;
    let next: typeof drop = null;

    if (overKey && node) {
      const rect = node.getBoundingClientRect();
      const center = rect.top + rect.height / 2;

      if (activatorEvent instanceof PointerEvent) {
        const pointer = activatorEvent.clientY + delta.y;
        next = {
          overKey,
          drop:
            activeKey.startsWith("c:") && Math.abs(pointer - center) < rect.height * 0.3
              ? "combine"
              : pointer < center
                ? "before"
                : "after",
        };
      } else {
        next = {
          overKey,
          drop: visible.indexOf(activeKey) < visible.indexOf(overKey) ? "after" : "before",
        };
      }
    }

    setDrop((current) =>
      current?.overKey === next?.overKey && current?.drop === next?.drop ? current : next,
    );
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const target = drop;
    const open = new Set(items.flatMap((item) => (item.type === "folder" && isOpen(item) ? [item.id] : [])));
    finishDrag();
    if (!over || !target) return;
    saveLayout(
      moveInLayout(items, String(active.id), target.overKey, target.drop, open, -Date.now()),
    );
  }

  useEffect(() => {
    const list = scrollList.current;
    if (!list) return;

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(list);
    Array.from(list.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [visible.length]);

  useEffect(() => {
    fetchCommunities();
    useFriendsStore.getState().connect();
  }, [fetchCommunities]);

  return (
    <nav
      aria-label="Communities"
      className="flex h-dvh w-14 shrink-0 flex-col items-center gap-4 bg-rail px-2 py-5 sm:w-20 sm:px-4"
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Link
        href="/"
        aria-label="Orbis home"
        className="focus-ring rounded-sm font-display text-2xl leading-none font-extrabold text-accent sm:text-[32px]"
      >
        o.
      </Link>
      <ul className="flex w-full shrink-0 flex-col items-center gap-4">
        <RailSlot label="Home">
          <Link
            href="/"
            aria-label="Home"
            data-tour="home"
            aria-current={pathname === "/" ? "page" : undefined}
            className={itemClass(pathname === "/")}
          >
            <House size={20} />
          </Link>
        </RailSlot>
        <RailSlot label="Library">
          <Link
            href="/library"
            aria-label="Library"
            aria-current={pathname === "/library" ? "page" : undefined}
            data-tour="library"
            className={itemClass(pathname === "/library")}
          >
            <LibraryBig size={20} />
          </Link>
        </RailSlot>
        <li aria-hidden className="h-px w-full shrink-0 bg-divider" />
      </ul>
      <ul
        ref={scrollList}
        onScroll={measureOverflow}
        style={fadeMask(overflow)}
        className="-mx-2 flex min-h-0 w-[calc(100%+1rem)] flex-1 flex-col items-center gap-4 overflow-y-auto px-2 py-1 [scrollbar-width:none] sm:-mx-4 sm:w-[calc(100%+2rem)] sm:px-4"
      >
        {communities.length > 0 && (
        <li data-tour="communities" className="w-full">
        <ul className="flex w-full flex-col items-center gap-4">
        <DndContext
          id="community-rail"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          autoScroll={{ threshold: { x: 0, y: 0.1 } }}
          onDragStart={({ active }) => {
            suppressClick.current = true;
            setDragging(String(active.id));
          }}
          onDragMove={trackDrop}
          onDragOver={trackDrop}
          onDragEnd={handleDragEnd}
          onDragCancel={finishDrag}
        >
          <SortableContext
            items={visible}
            strategy={noShift}
          >
            {items.map((item) => {
              if (item.type === "community") {
                const community = byId.get(item.communityId);
                return (
                  community && (
                    <SortableCommunity
                      key={communityKey(community.id)}
                      community={community}
                      active={community.id === activeId}
                      drop={drop?.overKey === communityKey(community.id) ? drop.drop : undefined}
                    />
                  )
                );
              }

              const members = item.communityIds.flatMap((id) => byId.get(id) ?? []);
              const open = isOpen(item);
              const closing = closingFolders.has(item.id);
              const folder = (
                <SortableFolder
                  key={folderKey(item.id)}
                  folder={item}
                  communities={members}
                  open={open}
                  active={item.communityIds.includes(activeId)}
                  drop={drop?.overKey === folderKey(item.id) ? drop.drop : undefined}
                  onToggle={() => toggleFolder(item.id)}
                  onEdit={() => setEditing(item)}
                  onUngroup={() => saveLayout(ungroup(items, item.id))}
                />
              );
              if (!open) return folder;

              return (
                <li
                  key={folderKey(item.id)}
                  className="-mx-1 w-[calc(100%+0.5rem)] sm:-mx-1.5 sm:w-[calc(100%+0.75rem)]"
                >
                  <ul
                    style={closing ? undefined : tint(item.color, "26")}
                    className={`flex flex-col items-center rounded-[22px] py-1 transition-colors duration-200 starting:bg-transparent sm:rounded-[30px] sm:py-1.5 motion-reduce:transition-none ${
                      closing ? "bg-transparent" : item.color ? "" : "bg-rail-item/60"
                    }`}
                  >
                    {folder}
                    <li
                      className={`grid w-full transition-[grid-template-rows,opacity] duration-200 ease-out starting:grid-rows-[0fr] starting:opacity-0 motion-reduce:transition-none ${
                        closing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                      }`}
                    >
                      <div className="-mt-1 -mb-3 min-h-0 overflow-hidden">
                        <ul className="flex flex-col items-center gap-4 pt-5 pb-3">
                          {members.map((community) => (
                            <SortableCommunity
                              key={communityKey(community.id)}
                              community={community}
                              active={community.id === activeId}
                              drop={drop?.overKey === communityKey(community.id) ? drop.drop : undefined}
                            />
                          ))}
                        </ul>
                      </div>
                    </li>
                  </ul>
                </li>
              );
            })}
          </SortableContext>
        </DndContext>
        </ul>
        </li>
        )}
        <li aria-hidden className="h-px w-full shrink-0 bg-divider" />
        <RailSlot label="Create a community">
          <button
            type="button"
            aria-label="Create a community"
            data-tour="create"
            onClick={() => setCreating(true)}
            className={itemClass(false)}
          >
            <Plus size={20} />
          </button>
        </RailSlot>
        <RailSlot label="Explore communities">
          <Link
            href="/explore"
            aria-label="Explore communities"
            data-tour="explore"
            aria-current={pathname === "/explore" ? "page" : undefined}
            className={itemClass(pathname === "/explore")}
          >
            <Compass size={20} />
          </Link>
        </RailSlot>
      </ul>
      <div aria-hidden className="h-px w-full shrink-0 bg-divider" />
      <div className="shrink-0">
        <NotificationBell className={itemClass} />
      </div>
      <div className="shrink-0">
        <UserButton />
      </div>
      <CreateCommunityModal open={creating} onClose={() => setCreating(false)} />
      <FolderSettingsModal
        folder={editing}
        onClose={() => setEditing(null)}
        onSave={(changes) =>
          editing &&
          saveLayout(
            items.map((item) =>
              item.type === "folder" && item.id === editing.id ? { ...item, ...changes } : item,
            ),
          )
        }
        onUngroup={() => editing && saveLayout(ungroup(items, editing.id))}
      />
    </nav>
  );
}
