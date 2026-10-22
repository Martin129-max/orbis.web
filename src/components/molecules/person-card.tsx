import Link from "next/link";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import { IdentityCard } from "./identity-card";
import { UserLink } from "./user-link";

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
      avatar={
        <Link
          href={`/users/${username}`}
          aria-label={`View ${label}’s profile`}
          className="focus-ring block rounded-full"
        >
          <Atom.Avatar label={label} src={avatarUrl} seed={userId} presence={presence} />
        </Link>
      }
      title={
        <UserLink username={username} className="truncate text-[13px] font-semibold">
          {label}
        </UserLink>
      }
      subtitle={`@${username}`}
      badge={badge}
      action={action}
    />
  );
}
