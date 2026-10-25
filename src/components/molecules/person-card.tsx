import type { ReactNode } from "react";
import * as Atom from "@atom";
import { IdentityCard } from "./identity-card";

export function PersonCard({
  userId,
  username,
  label,
  avatarUrl,
  coverUrl,
  badge,
  presence,
  action,
}: {
  userId: number;
  username: string;
  label: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  badge?: ReactNode;
  presence?: "online" | "offline";
  action?: ReactNode;
}) {
  return (
    <IdentityCard
      coverUrl={coverUrl}
      avatar={<Atom.Avatar label={label} src={avatarUrl} seed={userId} presence={presence} />}
      title={<span className="truncate text-[13px] font-semibold">{label}</span>}
      subtitle={`@${username}`}
      badge={badge}
      action={action}
      href={`/users/${username}`}
      linkLabel={`View ${label}’s profile`}
    />
  );
}
