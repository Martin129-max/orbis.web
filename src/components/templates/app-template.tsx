import type { ReactNode } from "react";
import * as Organism from "@organism";

export function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="shrink-0 authenticated:hidden">
        <Organism.SiteHeader />
      </div>
      <div className="flex min-h-0 flex-1 authenticated:bg-rail">
        <div className="hidden authenticated:contents">
          <Organism.CommunityRail />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="hidden authenticated:contents">
            <Organism.TopBar />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background authenticated:rounded-tl-2xl authenticated:border-t authenticated:border-l authenticated:border-divider">
            {children}
          </div>
        </div>
        <Organism.ChatDock />
        <Organism.NotificationToasts />
        <Organism.FeedbackDock />
      </div>
    </div>
  );
}
