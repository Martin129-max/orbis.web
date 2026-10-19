import type { ReactNode } from "react";
import * as Organism from "@organism";

export function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh">
      <Organism.CommunityRail />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
