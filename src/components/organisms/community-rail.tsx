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
import { Compass, House, LogOut, Plus, User } from "lucide-react";
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
import { initials } from "@/lib/initials";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { useFriendsStore } from "@/stores/friends-store";
import { CreateCommunityModal } from "./create-community-modal";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { ThemeToggle } from "./theme-toggle";

function itemClass(active: boolean) {
  return `focus-ring flex h-9 w-9 items-center justify-center rounded-full font-display text-[17px] leading-none font-bold sm:h-12 sm:w-12 sm:text-[23px] transition-colors motion-reduce:transition-none ${
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
          isDragging
            ? "cursor-grabbing border-2 border-dashed border-accent opacity-50"
            : ""
        }`}
      >
        {initials(community.name)}
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
    "focus-ring flex w-full items-center gap-3 rounded-sm text-left text-sm transition-colors";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="rightBottom"
      arrow={false}
      styles={{ container: { padding: 20, borderRadius: 12 } }}
      content={
        <div className="flex w-[264px] flex-col gap-4">
          {profile && (
            <div className="flex items-center gap-3">
              <Atom.Avatar label={profile.username} seed={profile.userId} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate">{profile.username}</span>
                <span className="truncate text-xs text-muted">{username}</span>
              </div>
            </div>
          )}
          <hr className="border-divider" />
          <p className="text-xs text-muted uppercase">Theme</p>
          <ThemeToggle />
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm">Appear offline</span>
            <AppearOfflineSwitch />
          </label>
          <hr className="border-divider" />
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className={`${menuRow} hover:text-accent`}
          >
            <User size={18} />
            View profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`${menuRow} text-accent hover:underline`}
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
        aria-expanded={open}
        className="focus-ring rounded-full"
      >
        <Atom.Avatar
          size="rail"
          label={profile?.username ?? "?"}
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
            aria-current={pathname === "/" ? "page" : undefined}
            className={itemClass(pathname === "/")}
          >
            <House size={20} />
          </Link>
        </RailSlot>
        <li aria-hidden className="h-px w-full shrink-0 bg-divider" />
      </ul>
      <ul className="-mx-2 flex min-h-0 w-[calc(100%+1rem)] flex-1 flex-col items-center gap-4 overflow-y-auto px-2 py-1 [scrollbar-width:none] sm:-mx-4 sm:w-[calc(100%+2rem)] sm:px-4">
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
        <li aria-hidden className="h-px w-full shrink-0 bg-divider" />
        <RailSlot label="Create a community">
          <button
            type="button"
            aria-label="Create a community"
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
            aria-current={pathname === "/explore" ? "page" : undefined}
            className={itemClass(pathname === "/explore")}
          >
            <Compass size={20} />
          </Link>
        </RailSlot>
      </ul>
      <div className="shrink-0">
        <UserButton />
      </div>
      <CreateCommunityModal open={creating} onClose={() => setCreating(false)} />
    </nav>
  );
}
