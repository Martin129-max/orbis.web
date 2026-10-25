"use client";

import * as Template from "@template";
import { FriendsPanel } from "./friends-panel";
import { HomeFeed } from "./home-feed";
import { SidePanel } from "./side-panel";

export function HomeView() {
  return (
    <div className="flex min-h-0 flex-1">
      <Template.PageColumn>
        <HomeFeed />
      </Template.PageColumn>
      <SidePanel label="Friends">
        <FriendsPanel />
      </SidePanel>
    </div>
  );
}
