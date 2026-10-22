"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { getMembers, type Member } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";

export function FriendAction({ userId, self }: { userId: number; self: boolean }) {
  const status = useFriendsStore((state) =>
    self
      ? "self"
      : !state.loaded
        ? "unknown"
        : state.friends.some((friend) => friend.userId === userId)
          ? "friend"
          : state.outgoing.some((user) => user.userId === userId)
            ? "sent"
            : state.incoming.some((user) => user.userId === userId)
              ? "incoming"
              : "none",
  );
  const addFriend = useFriendsStore((state) => state.addFriend);

  if (status === "unknown") return null;

  const { label, title } = {
    self: { label: "You", title: "This is you" },
    friend: { label: "Friends", title: "You're friends" },
    sent: { label: "Sent", title: "Friend request sent" },
    incoming: { label: "Accept", title: "Accept friend request" },
    none: { label: "Add", title: "Add friend" },
  }[status];
  const actionable = status === "none" || status === "incoming";

  return (
    <Atom.Button
      size="small"
      variant="secondary"
      title={title}
      aria-label={actionable ? title : undefined}
      disabled={!actionable}
      onClick={() => addFriend({ userId }).catch(() => null)}
      className="shrink-0"
    >
      {label}
    </Atom.Button>
  );
}

function MemberGroup({
  title,
  members,
  myId,
}: {
  title: string;
  members: Member[];
  myId?: number;
}) {
  if (members.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold text-muted uppercase">
        {title} / {members.length}
      </h3>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {members.map((member) => {
          const label = member.nickname ?? displayName(member);
          return (
            <li key={member.userId}>
              <Molecule.PersonCard
                userId={member.userId}
                username={member.username}
                label={label}
                avatarUrl={member.avatarUrl}
                coverUrl={member.coverUrl}
                badge={member.isOwner ? "Owner" : member.isAdmin ? "Admin" : undefined}
                action={
                  myId !== undefined && (
                    <FriendAction userId={member.userId} self={member.userId === myId} />
                  )
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MemberList({ communityId }: { communityId: number }) {
  const [members, setMembers] = useState<Member[]>([]);
  const myId = useAuthStore((state) => state.profile?.userId);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (token) {
      getMembers(token, communityId)
        .then(setMembers)
        .catch(() => null);
    }
  }, [communityId]);

  const staff = members.filter((member) => member.isOwner || member.isAdmin);
  const everyoneElse = members.filter(
    (member) => !member.isOwner && !member.isAdmin,
  );

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-divider bg-surface p-5">
      <h2 className="font-display text-2xl font-bold">
        Members / {members.length}
      </h2>
      <MemberGroup title="Owner & admins" members={staff} myId={myId} />
      <MemberGroup title="Members" members={everyoneElse} myId={myId} />
    </section>
  );
}
