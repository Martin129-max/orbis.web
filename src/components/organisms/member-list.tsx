"use client";

import { Popconfirm } from "antd";
import { Check, Clock, UserPlus, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { getMembers, type Member } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";

const profileButton = "h-6 shrink-0 gap-1 border-transparent px-2 text-xs hover:opacity-90";

export function FriendAction({
  userId,
  self,
  addLabel = "Add",
  buttonFor,
}: {
  userId: number;
  self: boolean;
  addLabel?: string;
  buttonFor?: string;
}) {
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
  const removeFriend = useFriendsStore((state) => state.removeFriend);

  if (status === "unknown") return null;

  if (buttonFor && (status === "friend" || status === "sent")) {
    const friend = status === "friend";
    return (
      <Popconfirm
        title={
          friend
            ? `Remove ${buttonFor} from your friends?`
            : `Cancel your friend request to ${buttonFor}?`
        }
        okText={friend ? "Remove" : "Cancel request"}
        cancelText={friend ? "Cancel" : "Keep"}
        okButtonProps={{ danger: true }}
        onConfirm={() => removeFriend(userId).catch(() => null)}
      >
        <Atom.Button
          size="small"
          variant="secondary"
          icon={friend ? <Check size={12} /> : <Clock size={12} />}
          aria-label={
            friend
              ? `Friends with ${buttonFor}. Remove friend`
              : `Friend request sent to ${buttonFor}. Cancel request`
          }
          className={`${profileButton} ${
            friend ? "bg-success text-success-foreground" : "bg-rail-item text-foreground"
          }`}
        >
          {friend ? "Friends" : "Requested"}
        </Atom.Button>
      </Popconfirm>
    );
  }

  if (status === "self" || status === "friend" || status === "sent") {
    const pill = {
      self: { label: "You", tone: "neutral", icon: <UserRound size={12} /> },
      friend: { label: "Friends", tone: "success", icon: <Check size={12} /> },
      sent: { label: "Sent", tone: "neutral", icon: <Clock size={12} /> },
    } as const;
    const { label, tone, icon } = pill[status];
    return (
      <Atom.Pill tone={tone} size="md" icon={icon}>
        {label}
      </Atom.Pill>
    );
  }

  const title = status === "incoming" ? "Accept friend request" : "Add friend";

  return (
    <Molecule.ReadOnlyGate action="add friends">
      <Atom.Button
        size="small"
        variant={status === "incoming" ? "primary" : "secondary"}
        title={title}
        aria-label={title}
        icon={buttonFor ? <UserPlus size={12} /> : undefined}
        onClick={() => addFriend({ userId }).catch(() => null)}
        className={
          buttonFor
            ? `${profileButton} ${
                status === "incoming"
                  ? "bg-success text-success-foreground"
                  : "bg-info text-info-foreground"
              }`
            : "shrink-0"
        }
      >
        {status === "incoming" ? "Accept" : buttonFor ? "Add friend" : addLabel}
      </Atom.Button>
    </Molecule.ReadOnlyGate>
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
                isVerified={member.isVerified}
                badge={
                  member.isOwner ? (
                    <Atom.RoleBadge role="owner" />
                  ) : member.isAdmin ? (
                    <Atom.RoleBadge role="admin" />
                  ) : undefined
                }
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
    getMembers(token, communityId)
      .then(setMembers)
      .catch(() => null);
  }, [communityId]);

  const staff = members.filter((member) => member.isOwner || member.isAdmin);
  const everyoneElse = members.filter(
    (member) => !member.isOwner && !member.isAdmin,
  );

  return (
    <Molecule.TabSection title="Members" count={members.length}>
      <MemberGroup title="Owner & admins" members={staff} myId={myId} />
      <MemberGroup title="Members" members={everyoneElse} myId={myId} />
    </Molecule.TabSection>
  );
}
