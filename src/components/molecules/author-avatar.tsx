"use client";

import { Tooltip } from "antd";
import Link from "next/link";
import * as Atom from "@atom";
import type { Author, CommunitySummary } from "@/lib/api";
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
      <Atom.Avatar label={author.name ?? author.email} seed={author.id} />
      {community && (
        <Tooltip title={community.name}>
          <Link
            href={`/communities/${community.id}`}
            aria-label={`Posted in ${community.name}`}
            onClick={(event) => event.stopPropagation()}
            className="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-accent text-[8px] leading-none font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          >
            {initials(community.name)}
          </Link>
        </Tooltip>
      )}
    </div>
  );
}
