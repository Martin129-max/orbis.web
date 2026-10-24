"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { ChatPerson } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { MessageButton } from "./chat-dock";

export function PersonRow({
  person,
  label = displayName(person),
  presence,
  badge,
  subtitle = `@${person.username}`,
  trailing,
  actions,
}: {
  person: ChatPerson;
  label?: string;
  presence?: "online" | "offline";
  badge?: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  actions?: ReactNode;
}) {
  const me = useAuthStore((state) => state.profile?.userId);
  const self = person.userId === me;

  return (
    <li className="group flex flex-col gap-2 py-2">
      <div className="flex items-center gap-3">
        <div
          className={`flex min-w-0 flex-1 items-center gap-3 ${
            presence === "offline" ? "opacity-60" : ""
          }`}
        >
          <Link
            href={`/users/${person.username}`}
            aria-label={`${label}’s profile`}
            tabIndex={-1}
            className="shrink-0 rounded-full"
          >
            <Atom.Avatar
              size="sm"
              label={label}
              src={person.avatarUrl}
              seed={person.userId}
              presence={presence}
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex min-w-0 items-center gap-1.5">
              <Molecule.UserLink
                username={person.username}
                className="truncate text-[13px] font-semibold"
              >
                {label}
              </Molecule.UserLink>
              {badge}
            </span>
            <span className="truncate text-xs text-muted">{subtitle}</span>
          </div>
        </div>
        {!self && <MessageButton person={person} compact />}
        {trailing}
      </div>
      {actions && <div className="flex gap-2 pl-11">{actions}</div>}
    </li>
  );
}
