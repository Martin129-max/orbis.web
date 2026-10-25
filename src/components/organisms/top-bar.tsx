"use client";

import { Tooltip } from "antd";
import { MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useFriendsStore } from "@/stores/friends-store";
import { useLayoutStore } from "@/stores/layout-store";
import { useMessagesStore } from "@/stores/messages-store";
import { NotificationBell } from "./notification-bell";
import { PeopleSearch } from "./friends-panel";
import { SidePanelOpener } from "./side-panel";
import { UserMenu } from "./user-menu";

function itemClass(active: boolean) {
  return `focus-ring relative flex h-10 w-10 items-center justify-center rounded-full transition-colors motion-reduce:transition-none ${
    active
      ? "bg-accent text-accent-foreground"
      : "text-foreground hover:bg-rail-item"
  }`;
}

function RequestsButton() {
  const pending = useFriendsStore((state) => state.incoming.length);
  const label = pending > 0 ? `Friend requests, ${pending} pending` : "Friend requests";

  return (
    <Tooltip title="Friend requests" placement="bottom">
      <Link href="/requests" data-tour="friend-requests" aria-label={label} className={itemClass(false)}>
        <UserPlus size={20} />
        {pending > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-rail bg-accent px-1 font-sans text-[10px] leading-none font-bold text-accent-foreground"
          >
            {pending > 99 ? "99+" : pending}
          </span>
        )}
      </Link>
    </Tooltip>
  );
}

function MessagesButton() {
  const unread = useMessagesStore(
    (state) =>
      state.conversations.filter(({ status, unread }) => status === "accepted" && unread > 0)
        .length,
  );
  const label = unread > 0 ? `Messages, ${unread} unread` : "Messages";

  return (
    <Tooltip title="Messages" placement="bottom">
      <Link href="/?tab=messages" data-tour="messages" aria-label={label} className={itemClass(false)}>
        <MessageCircle size={20} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-rail bg-accent px-1 font-sans text-[10px] leading-none font-bold text-accent-foreground"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    </Tooltip>
  );
}

export function TopBar() {
  const setSearchSlot = useLayoutStore((state) => state.setSearchSlot);
  const hasPageSearch = useLayoutStore((state) => state.pageSearches > 0);

  return (
    <header className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-rail px-4 sm:h-16 sm:grid-cols-[1fr_minmax(0,28rem)_1fr] sm:gap-6 sm:px-8">
      <div aria-hidden className="hidden sm:block" />
      <div className="min-w-0">
        <div ref={setSearchSlot} className="contents" />
        {!hasPageSearch && <PeopleSearch />}
      </div>
      <div className="flex items-center justify-end gap-1 sm:gap-2">
        <RequestsButton />
        <MessagesButton />
        <NotificationBell className={itemClass} />
        <UserMenu />
        <SidePanelOpener />
      </div>
    </header>
  );
}
