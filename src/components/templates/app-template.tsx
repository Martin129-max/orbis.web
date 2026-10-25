import type { ReactNode } from "react";
import * as Organism from "@organism";

export function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="shrink-0 authenticated:hidden">
        <Organism.SiteHeader />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden authenticated:contents">
          <Organism.CommunityRail />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
        <Organism.ChatDock />
        <Organism.NotificationToasts />
        <Organism.FeedbackDock />
      </div>
    </div>
  );
}
