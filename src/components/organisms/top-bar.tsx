"use client";

import { Tooltip } from "antd";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useLayoutStore } from "@/stores/layout-store";
import { useMessagesStore } from "@/stores/messages-store";
import { NotificationBell } from "./notification-bell";
import { PeopleSearch } from "./friends-panel";
import { UserMenu } from "./user-menu";

function itemClass(active: boolean) {
  return `focus-ring relative flex h-10 w-10 items-center justify-center rounded-full transition-colors motion-reduce:transition-none ${
    active
      ? "bg-accent text-accent-foreground"
      : "text-foreground hover:bg-rail-item"
  }`;
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
      <Link href="/?tab=messages" aria-label={label} className={itemClass(false)}>
        <MessageCircle size={20} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-accent px-1 font-sans text-[10px] leading-none font-bold text-accent-foreground"
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
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-divider px-4 sm:h-16 sm:gap-6 sm:px-8">
      <div className="w-full max-w-md min-w-0 flex-1">
        <div ref={setSearchSlot} className="contents" />
        {!hasPageSearch && <PeopleSearch />}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <MessagesButton />
        <NotificationBell className={itemClass} />
        <UserMenu />
      </div>
    </header>
  );
}
