"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Compass,
  House,
  LibraryBig,
  LogOut,
  Plus,
  User,
} from "lucide-react";
import { Popover, Tooltip } from "antd";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as Atom from "@atom";
import type { Community } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { useFriendsStore } from "@/stores/friends-store";
import { CreateCommunityModal } from "./create-community-modal";
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
  children,
}: {
  label: string;
  dragging?: boolean;
  slotRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <li
      ref={slotRef}
      style={style}
      className={`flex w-full justify-center ${dragging ? "z-10" : ""}`}
    >
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

function SortableCommunity({
  community,
  active,
}: {
  community: Community;
  active: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: community.id });

  return (
    <RailSlot
      label={community.name}
      dragging={isDragging}
      slotRef={setNodeRef}
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
          active ? "ring-2 ring-accent ring-offset-2 ring-offset-rail" : ""
        } ${
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
            href="/profile"
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
  const fetchCommunities = useCommunityStore((state) => state.fetchCommunities);
  const reorderCommunities = useCommunityStore(
    (state) => state.reorderCommunities,
  );
  const [creating, setCreating] = useState(false);
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
  const ids = communities.map((community) => community.id);

  function finishDrag() {
    setTimeout(() => {
      suppressClick.current = false;
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    finishDrag();
    if (!over || active.id === over.id) return;
    reorderCommunities(
      arrayMove(
        ids,
        ids.indexOf(Number(active.id)),
        ids.indexOf(Number(over.id)),
      ),
    );
  }

  useEffect(() => {
    const list = scrollList.current;
    if (!list) return;

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(list);
    Array.from(list.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [communities.length]);

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
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={() => {
            suppressClick.current = true;
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={finishDrag}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {communities.map((community) => (
              <SortableCommunity
                key={community.id}
                community={community}
                active={String(community.id) === communityId}
              />
            ))}
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
    </nav>
  );
}
