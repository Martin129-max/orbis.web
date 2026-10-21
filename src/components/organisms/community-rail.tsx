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
import { HomeOutlined, LogoutOutlined, PlusOutlined } from "@ant-design/icons";
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
import { CreateCommunityModal } from "./create-community-modal";
import { ThemeToggle } from "./theme-toggle";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join("");
}

const itemBase =
  "flex h-12 w-12 items-center justify-center text-base font-semibold transition-[border-radius,background-color,color] duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function itemClass(active: boolean) {
  return `${itemBase} ${
    active
      ? "rounded-2xl bg-accent text-white"
      : "rounded-3xl bg-rail-item text-foreground hover:rounded-2xl hover:bg-accent hover:text-white"
  }`;
}

function RailSlot({
  label,
  active = false,
  dragging = false,
  slotRef,
  style,
  children,
}: {
  label: string;
  active?: boolean;
  dragging?: boolean;
  slotRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <li
      ref={slotRef}
      style={style}
      className={`group relative flex w-full justify-center ${dragging ? "z-10" : ""}`}
    >
      <span
        aria-hidden
        className={`absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r bg-foreground transition-[height] duration-200 motion-reduce:transition-none ${
          active ? "h-10" : "h-0 group-hover:h-5"
        }`}
      />
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
      active={active}
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
        className={`${itemClass(active)} ${isDragging ? "cursor-grabbing shadow-lg" : ""}`}
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

  const email = profile?.email ?? "Account";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="rightBottom"
      content={
        <div className="flex w-60 flex-col gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">{email}</p>
            {profile && (
              <p className="text-xs text-zinc-500">User #{profile.userId}</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Atom.TextLink href="/profile" onClick={() => setOpen(false)}>
              View profile
            </Atom.TextLink>
            <Atom.Button
              variant="secondary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Log out
            </Atom.Button>
          </div>
        </div>
      }
    >
      <button
        type="button"
        aria-label={`Account: ${email}`}
        aria-expanded={open}
        className={itemClass(open)}
      >
        {profile ? Array.from(profile.email)[0].toUpperCase() : null}
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
  }, [fetchCommunities]);

  return (
    <nav
      aria-label="Communities"
      className="flex w-[72px] shrink-0 flex-col bg-rail"
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <ul className="flex flex-1 flex-col items-center gap-2 overflow-y-auto py-3">
        <RailSlot label="Home" active={pathname === "/"}>
          <Link
            href="/"
            aria-label="Home"
            aria-current={pathname === "/" ? "page" : undefined}
            className={itemClass(pathname === "/")}
          >
            <HomeOutlined />
          </Link>
        </RailSlot>
        <li aria-hidden className="h-0.5 w-8 shrink-0 rounded bg-rail-divider" />
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
        <RailSlot label="Create a community">
          <button
            type="button"
            aria-label="Create a community"
            onClick={() => setCreating(true)}
            className={`${itemBase} rounded-3xl bg-rail-item text-accent hover:rounded-2xl hover:bg-accent hover:text-white`}
          >
            <PlusOutlined />
          </button>
        </RailSlot>
      </ul>
      <div className="flex justify-center border-t border-rail-divider py-3">
        <UserButton />
      </div>
      <CreateCommunityModal open={creating} onClose={() => setCreating(false)} />
    </nav>
  );
}
