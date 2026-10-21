"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { getMembers, type Member } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function MemberList({ communityId }: { communityId: number }) {
  const [members, setMembers] = useState<Member[]>([]);

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
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{label}</span>
                {member.isOwner && (
                  <span className="text-xs text-accent">Owner</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
