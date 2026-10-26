"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { getMembers, type Member, type PresenceStatus } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";
import { PersonRow } from "./person-row";
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
          {members.map((member) => (
            <PersonRow
              key={member.userId}
              person={member}
              label={member.nickname ?? displayName(member)}
              presence={online ? member.status : "offline"}
              playing={member.playing}
              badge={
                (member.isOwner || member.isAdmin) && (
                  <Atom.RoleBadge role={member.isOwner ? "owner" : "admin"} />
                )
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export function MemberPresence({ communityId }: { communityId: number }) {
  const [members, setMembers] = useState<Member[]>([]);
  const profile = useAuthStore((state) => state.profile);
  const presence = useFriendsStore((state) => state.presence);
  const statuses = useFriendsStore((state) => state.statuses);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    getMembers(token, communityId)
      .then(setMembers)
      .catch(() => null);
  }, [communityId]);

  const isOnline = (member: Member) =>
    member.userId === profile?.userId
      ? !profile.appearOffline
      : (presence[member.userId] ?? member.online);
  const statusOf = (member: Member): PresenceStatus => {
    if (member.userId !== profile?.userId) return statuses[member.userId] ?? member.status;
    return profile.appearOffline ? "offline" : profile.status;
  };
  const online = members.filter(isOnline).map((member) => ({ ...member, status: statusOf(member) }));
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
