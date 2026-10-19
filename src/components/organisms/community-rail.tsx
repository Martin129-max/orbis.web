"use client";

import { LogoutOutlined, PlusOutlined } from "@ant-design/icons";
import { Popover, Tooltip } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { CreateCommunityModal } from "./create-community-modal";

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
  children,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <li className="group relative flex w-full justify-center">
      <span
        aria-hidden
        className={`absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r bg-foreground transition-[height] duration-200 motion-reduce:transition-none ${
          active ? "h-10" : "h-0 group-hover:h-5"
        }`}
      />
      <Tooltip title={label} placement="right">
        {children}
      </Tooltip>
    </li>
  );
}

function UserButton() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!useAuthStore.getState().profile) fetchProfile();
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
  const communities = useCommunityStore((state) => state.communities);
  const fetchCommunities = useCommunityStore((state) => state.fetchCommunities);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return (
    <nav
      aria-label="Communities"
      className="flex w-[72px] shrink-0 flex-col bg-rail"
    >
      <ul className="flex flex-1 flex-col items-center gap-2 overflow-y-auto py-3">
        {communities.map((community) => {
          const active = String(community.id) === communityId;
          return (
            <RailSlot key={community.id} label={community.name} active={active}>
              <Link
                href={`/communities/${community.id}`}
                aria-label={community.name}
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                {initials(community.name)}
              </Link>
            </RailSlot>
          );
        })}
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
