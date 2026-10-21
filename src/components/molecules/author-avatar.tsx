"use client";

import { Tooltip } from "antd";
import Link from "next/link";
import * as Atom from "@atom";
import type { Author, CommunitySummary } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { initials } from "@/lib/initials";

export function AuthorAvatar({
  author,
  community,
}: {
  author: Author;
  community?: CommunitySummary;
}) {
  return (
    <div className="relative h-fit shrink-0">
      <Atom.Avatar label={displayName(author)} seed={author.id} />
      {community && (
        <Tooltip title={community.name}>
          <Link
            href={`/communities/${community.id}`}
            aria-label={`Posted in ${community.name}`}
            onClick={(event) => event.stopPropagation()}
            className="focus-ring absolute -right-[5px] -bottom-[5px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-accent text-[8px] leading-none font-bold text-accent-foreground"
          >
            {initials(community.name)}
          </Link>
        </Tooltip>
      )}
    </div>
  );
}
