"use client";

import { MessageCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Template from "@template";
import { useMessagesStore } from "@/stores/messages-store";
import { FriendsPanel } from "./friends-panel";
import { HomeFeed } from "./home-feed";
import { MessagesView } from "./messages-view";
import { SidePanel } from "./side-panel";

const tabs = [
  { value: "feed", label: "Feed", href: "/", icon: Newspaper },
  { value: "messages", label: "Messages", href: "/?tab=messages", icon: MessageCircle },
] as const;

export function HomeView() {
  const tab = useSearchParams().get("tab") === "messages" ? "messages" : "feed";
  const unread = useMessagesStore(
    (state) =>
      state.conversations.filter(({ status, unread }) => status === "accepted" && unread > 0)
        .length,
  );

  return (
    <>
      <nav
        aria-label="Home sections"
        className="flex shrink-0 items-end gap-6 border-b border-divider px-4 sm:px-8"
      >
        {tabs.map(({ value, label, href, icon: Icon }) => (
          <Link
            key={value}
            href={href}
            data-tour={value === "messages" ? "messages-tab" : undefined}
            aria-current={tab === value ? "page" : undefined}
            className={`focus-ring -mb-px flex items-center gap-2 rounded-t-sm border-b-2 px-1 py-3 text-sm transition-colors ${
              tab === value
                ? "border-accent text-accent"
                : "border-transparent font-semibold text-foreground hover:text-accent"
            }`}
          >
            <Icon size={16} aria-hidden />
            {label}
            {value === "messages" && unread > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-[11px] leading-[18px] font-bold text-accent-foreground">
                {unread > 99 ? "99+" : unread}
                <span className="sr-only"> unread</span>
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="flex min-h-0 flex-1">
        {tab === "messages" ? (
          <MessagesView />
        ) : (
          <Template.PageColumn>
            <HomeFeed />
          </Template.PageColumn>
        )}
        <SidePanel label="Friends">
          <FriendsPanel />
        </SidePanel>
      </div>
    </>
  );
}
