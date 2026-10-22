import { Globe, Lock, Users } from "lucide-react";
import * as Atom from "@atom";
import type { InvitePreview } from "@/lib/api";
import { displayName } from "@/lib/display-name";

export function InviteSummary({ invite }: { invite: InvitePreview }) {
  const { community, creator } = invite;

  return (
    <section className="flex items-center gap-4 rounded-lg border border-divider bg-surface p-4">
      <span
        aria-hidden
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rail-item font-display text-[28px] leading-none font-bold"
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
    </section>
  );
}
