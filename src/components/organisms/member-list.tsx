"use client";

import Image from "next/image";
import Link from "next/link";
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
            <li
              key={member.userId}
              className="flex flex-col overflow-hidden rounded-lg border border-transparent bg-background transition-colors hover:border-divider"
            >
              <div className="relative h-14 bg-gradient-to-br from-accent-soft to-rail-item">
                {member.coverUrl && (
                  <Image
                    src={member.coverUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex items-end gap-3 px-3 pb-3">
                <Link
                  href={`/users/${member.username}`}
                  className="focus-ring -mt-5 shrink-0 rounded-full border-[3px] border-background bg-background"
                >
                  <Atom.Avatar
                    label={label}
                    src={member.avatarUrl}
                    seed={member.userId}
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col pt-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Molecule.UserLink
                      username={member.username}
                      className="truncate text-[13px] font-semibold"
                    >
                      {label}
                    </Molecule.UserLink>
                    {(member.isOwner || member.isAdmin) && (
                      <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-px text-[10px] font-semibold text-accent">
                        {member.isOwner ? "Owner" : "Admin"}
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted">
                    @{member.username}
                  </span>
                </div>
                {myId !== undefined && (
                  <FriendAction userId={member.userId} self={member.userId === myId} />
                )}
              </div>
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
