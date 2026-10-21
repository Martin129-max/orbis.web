"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { getMembers, type Member } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";
import { PanelHeading } from "./side-panel";

function FriendAction({ userId, self }: { userId: number; self: boolean }) {
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

  return (
    <>
      <PanelHeading title={`Members / ${members.length}`} label="Members" />
      <ul className="flex flex-col">
        {members.map((member) => {
          const label = member.nickname ?? displayName(member);
          return (
            <li key={member.userId} className="flex items-center gap-3 py-2">
              <Atom.Avatar
                size="sm"
                label={label}
                src={member.avatarUrl}
                seed={member.userId}
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
              {myId !== undefined && (
                <FriendAction
                  userId={member.userId}
                  self={member.userId === myId}
                />
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">
        Everyone in this community.
      </p>
    </>
  );
}
