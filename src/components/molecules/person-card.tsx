import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import * as Atom from "@atom";
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
    <div className="flex flex-col overflow-hidden rounded-lg border border-transparent bg-background transition-colors hover:border-divider">
      <div className="relative h-14 bg-gradient-to-br from-accent-soft to-rail-item">
        {coverUrl && (
          <Image src={coverUrl} alt="" fill unoptimized className="object-cover" />
        )}
      </div>
      <div className="flex items-end gap-3 px-3 pb-3">
        <Link
          href={`/users/${username}`}
          className="focus-ring -mt-5 shrink-0 rounded-full border-[3px] border-background bg-background"
        >
          <Atom.Avatar label={label} src={avatarUrl} seed={userId} presence={presence} />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col pt-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <UserLink username={username} className="truncate text-[13px] font-semibold">
              {label}
            </UserLink>
            {badge}
          </span>
          <span className="truncate text-xs text-muted">@{username}</span>
        </div>
        {action}
      </div>
    </div>
  );
}
