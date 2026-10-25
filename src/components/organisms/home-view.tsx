"use client";

import { useSearchParams } from "next/navigation";
import * as Template from "@template";
import { FriendsPanel } from "./friends-panel";
import { HomeFeed } from "./home-feed";
import { MessagesView } from "./messages-view";
import { SidePanel } from "./side-panel";

export function HomeView() {
  const tab = useSearchParams().get("tab") === "messages" ? "messages" : "feed";

  return (
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
  );
}
