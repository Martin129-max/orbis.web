"use client";

import {
  CheckOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { getMembers, type Member } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";

function FriendAction({ userId }: { userId: number }) {
  const status = useFriendsStore((state) =>
    !state.loaded
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

  if (status === "unknown" || status === "friend") return null;

  const { title, icon } = {
    sent: { title: "Friend request sent", icon: <ClockCircleOutlined /> },
    incoming: { title: "Accept friend request", icon: <CheckOutlined /> },
    none: { title: "Add friend", icon: <UserAddOutlined /> },
  }[status];

  return (
    <Tooltip title={title}>
      <Button
        type="text"
        size="small"
        icon={icon}
        aria-label={title}
        disabled={status === "sent"}
        onClick={() => addFriend({ userId }).catch(() => null)}
      />
    </Tooltip>
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
    <aside
      aria-label="Members"
      className="hidden w-64 shrink-0 flex-col gap-3 overflow-y-auto border-l border-black/10 bg-surface px-4 py-6 lg:flex dark:border-white/10"
    >
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
        Members — {members.length}
      </h2>
      <ul className="flex flex-col gap-1">
        {members.map((member) => {
          const label = member.nickname ?? member.name ?? member.email;
          return (
            <li
              key={member.userId}
              className="flex items-center gap-3 rounded-md px-2 py-1.5"
            >
              <Atom.Avatar label={label} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{label}</span>
                {member.isOwner && (
                  <span className="text-xs text-accent">Owner</span>
                )}
              </div>
              {myId !== undefined && member.userId !== myId && (
                <FriendAction userId={member.userId} />
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
