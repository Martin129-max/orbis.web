import Image from "next/image";
import type { ReactNode } from "react";
import * as Atom from "@atom";

export function CommunityCard({
  name,
  iconUrl,
  coverUrl,
  memberCount,
  badge,
  action,
}: {
  name: string;
  iconUrl: string | null;
  coverUrl: string | null;
  memberCount: number;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-divider bg-surface">
      <div className="relative aspect-[3/1] bg-rail-item">
        {coverUrl && (
          <Image src={coverUrl} alt="" fill unoptimized className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <span
          aria-hidden
          className="relative -mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-rail-item font-display text-[26px] leading-none font-bold"
        >
          <Atom.CommunityIcon name={name} src={iconUrl} />
        </span>
        <div className="flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate font-semibold">{name}</span>
              {badge}
            </span>
            <span className="text-xs text-muted">
              {memberCount.toLocaleString()} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
