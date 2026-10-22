import type { ReactNode } from "react";
import * as Atom from "@atom";
import { IdentityCard } from "./identity-card";

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
  const icon = (
    <span
      aria-hidden
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-divider bg-rail-item font-display text-[20px] leading-none font-bold"
    >
      <Atom.CommunityIcon name={name} src={iconUrl} />
    </span>
  );

  return (
    <IdentityCard
      coverUrl={coverUrl}
      avatar={icon}
      title={<span className="truncate text-[13px] font-semibold">{name}</span>}
      subtitle={`${memberCount.toLocaleString()} ${memberCount === 1 ? "member" : "members"}`}
      badge={badge}
      action={action}
    />
  );
}
