import { Globe, Lock, Users } from "lucide-react";
import Image from "next/image";
import * as Atom from "@atom";
import type { InvitePreview } from "@/lib/api";
import { displayName } from "@/lib/display-name";

export function InviteSummary({ invite }: { invite: InvitePreview }) {
  const { community, creator } = invite;

  return (
    <section>
      <div className="relative h-32 bg-gradient-to-br from-accent-soft to-rail-item">
        {community.coverUrl && (
          <Image src={community.coverUrl} alt="" fill unoptimized className="object-cover" />
        )}
      </div>
      <div className="flex flex-col gap-3 px-6">
        <span
          aria-hidden
          className="relative -mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-rail-item font-display text-[32px] leading-none font-bold"
        >
          <Atom.CommunityIcon name={community.name} src={community.iconUrl} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs text-muted">
            {displayName(creator)} invited you to join
          </p>
          <h2 className="truncate font-display text-2xl leading-tight font-bold">
            {community.name}
          </h2>
          <p className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Users size={14} aria-hidden />
              {community.memberCount.toLocaleString()}{" "}
              {community.memberCount === 1 ? "member" : "members"}
            </span>
            <span className="flex items-center gap-1">
              {community.isPublic ? (
                <Globe size={14} aria-hidden />
              ) : (
                <Lock size={14} aria-hidden />
              )}
              {community.isPublic ? "Public" : "Private"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
