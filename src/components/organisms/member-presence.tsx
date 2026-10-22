"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { getMembers, type Member } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";
import { PanelHeading } from "./side-panel";

function PresenceGroup({
  title,
  members,
  online,
  emptyText,
}: {
  title: string;
  members: Member[];
  online: boolean;
  emptyText: string;
}) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-[11px] font-bold text-muted uppercase">
        {title} / {members.length}
      </h3>
      {members.length === 0 ? (
        <p className="py-2 text-xs text-muted">{emptyText}</p>
      ) : (
        <ul className="flex flex-col">
          {members.map((member) => {
            const label = member.nickname ?? displayName(member);
            return (
              <li key={member.userId}>
                <Link
                  href={`/users/${member.username}`}
                  className={`focus-ring -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-rail-item ${online ? "" : "opacity-60"}`}
                >
                <Atom.Avatar
                  size="sm"
                  label={label}
                  src={member.avatarUrl}
                  seed={member.userId}
                  presence={online ? "online" : "offline"}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold">
                    {label}
                    {(member.isOwner || member.isAdmin) &&
                      ` · ${member.isOwner ? "Owner" : "Admin"}`}
                  </span>
                  <span className="truncate text-xs text-muted">
                    @{member.username}
                  </span>
                </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function MemberPresence({ communityId }: { communityId: number }) {
  const [members, setMembers] = useState<Member[]>([]);
  const profile = useAuthStore((state) => state.profile);
  const presence = useFriendsStore((state) => state.presence);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (token) {
      getMembers(token, communityId)
        .then(setMembers)
        .catch(() => null);
    }
  }, [communityId]);

  const isOnline = (member: Member) =>
    member.userId === profile?.userId
      ? !profile.appearOffline
      : (presence[member.userId] ?? member.online);
  const online = members.filter(isOnline);
  const offline = members.filter((member) => !isOnline(member));

  return (
    <>
      <PanelHeading title={`Members / ${members.length}`} label="Members" />
      <PresenceGroup
        title="Online"
        members={online}
        online
        emptyText="No one is online right now."
      />
      <PresenceGroup
        title="Offline"
        members={offline}
        online={false}
        emptyText="Everyone is online."
      />
    </>
  );
}
