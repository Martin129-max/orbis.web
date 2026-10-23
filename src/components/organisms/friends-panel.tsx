"use client";

import { X } from "lucide-react";
import { Popconfirm, Tooltip } from "antd";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { searchPeople, type FriendUser } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";
import { MessageButton } from "./chat-dock";
import { FriendAction } from "./member-list";
import { PanelHeading } from "./side-panel";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold text-muted uppercase">{title}</h3>
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
}

function FriendRow({
  user,
  presence,
  actions,
  trailing,
}: {
  user: FriendUser;
  presence?: "online" | "offline";
  actions?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <li className="group flex flex-col gap-2 py-2">
      <div className="flex items-center gap-3">
        <Atom.Avatar
          size="sm"
          label={displayName(user)}
          src={user.avatarUrl}
          seed={user.userId}
          presence={presence}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Molecule.UserLink
            username={user.username}
            className="truncate text-[13px] font-semibold"
          >
            {displayName(user)}
          </Molecule.UserLink>
          <span className="truncate text-xs text-muted">@{user.username}</span>
        </div>
        {trailing}
      </div>
      {actions && <div className="flex gap-2 pl-11">{actions}</div>}
    </li>
  );
}

function PeopleResults({ query }: { query: string }) {
  const [results, setResults] = useState<{
    query: string;
    users: FriendUser[] | null;
  } | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    let ignore = false;
    searchPeople(token, query)
      .then((users) => {
        if (!ignore) setResults({ query, users });
      })
      .catch(() => {
        if (!ignore) setResults({ query, users: null });
      });
    return () => {
      ignore = true;
    };
  }, [query]);

  if (!results || results.query !== query) {
    return (
      <div className="flex justify-center py-4">
        <Atom.Loader />
      </div>
    );
  }
  if (!results.users) {
    return <Atom.ErrorMessage>Could not search people.</Atom.ErrorMessage>;
  }
  if (results.users.length === 0) {
    return <p className="py-4 text-center text-sm text-muted">No one matches “{query}”.</p>;
  }

  return (
    <ul className="flex flex-col">
      {results.users.map((user) => (
        <li key={user.userId} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-rail-item/50">
          <Atom.Avatar size="sm" label={displayName(user)} src={user.avatarUrl} seed={user.userId} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Molecule.UserLink username={user.username} className="w-fit truncate text-[13px] font-semibold">
              {displayName(user)}
            </Molecule.UserLink>
            <span className="truncate text-xs text-muted">@{user.username}</span>
          </div>
          <FriendAction userId={user.userId} self={false} addLabel="Connect" />
        </li>
      ))}
    </ul>
  );
}

export function PeopleSearch() {
  return (
    <div data-tour="add-friend">
      <Molecule.HeaderSearch
        label="Search people"
        placeholder="Search people by name or @username…"
        renderResults={(search) => <PeopleResults query={search.replace(/^@/, "")} />}
      />
    </div>
  );
}

export function FriendsPanel() {
  const friends = useFriendsStore((state) => state.friends);
  const incoming = useFriendsStore((state) => state.incoming);
  const outgoing = useFriendsStore((state) => state.outgoing);
  const loaded = useFriendsStore((state) => state.loaded);
  const addFriend = useFriendsStore((state) => state.addFriend);
  const removeFriend = useFriendsStore((state) => state.removeFriend);

  const online = friends.filter((friend) => friend.online);
  const offline = friends.filter((friend) => !friend.online);
  const requests = incoming.length + outgoing.length;

  function removeAction(user: FriendUser) {
    return (
      <Popconfirm
        title={`Remove ${displayName(user)} from your friends?`}
        okText="Remove"
        okButtonProps={{ danger: true }}
        onConfirm={() => removeFriend(user.userId)}
      >
        <Tooltip title="Remove friend">
          <button
            type="button"
            aria-label={`Remove ${displayName(user)}`}
            className="icon-button opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X size={16} />
          </button>
        </Tooltip>
      </Popconfirm>
    );
  }

  const sections = [
    requests > 0 && (
      <Section key="requests" title={`Requests / ${requests}`}>
        {incoming.map((user) => (
          <FriendRow
            key={user.userId}
            user={user}
            actions={
              <>
                <Atom.Button
                  size="small"
                  onClick={() =>
                    addFriend({ userId: user.userId }).catch(() => null)
                  }
                >
                  Accept
                </Atom.Button>
                <Atom.Button
                  size="small"
                  variant="secondary"
                  onClick={() => removeFriend(user.userId).catch(() => null)}
                >
                  Decline
                </Atom.Button>
              </>
            }
          />
        ))}
        {outgoing.map((user) => (
          <FriendRow
            key={user.userId}
            user={user}
            actions={
              <Atom.Button
                size="small"
                variant="secondary"
                onClick={() => removeFriend(user.userId).catch(() => null)}
              >
                Cancel request
              </Atom.Button>
            }
          />
        ))}
      </Section>
    ),
    online.length > 0 && (
      <Section key="online" title={`Online / ${online.length}`}>
        {online.map((friend) => (
          <FriendRow
            key={friend.userId}
            user={friend}
            presence="online"
            trailing={
              <>
                <MessageButton person={friend} compact />
                {removeAction(friend)}
              </>
            }
          />
        ))}
      </Section>
    ),
    offline.length > 0 && (
      <Section key="offline" title={`Offline / ${offline.length}`}>
        {offline.map((friend) => (
          <FriendRow
            key={friend.userId}
            user={friend}
            presence="offline"
            trailing={
              <>
                <MessageButton person={friend} compact />
                {removeAction(friend)}
              </>
            }
          />
        ))}
      </Section>
    ),
  ].filter(Boolean);

  return (
    <>
      <PanelHeading title={`Friends / ${friends.length}`} label="Friends" />
      {!loaded ? (
        <div className="flex py-8">
          <Atom.Loader />
        </div>
      ) : sections.length === 0 ? (
        <p className="text-[13px] text-muted">
          No friends yet. Search for people on the home page, or add them from
          a community&apos;s member list.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.map((section, index) => (
            <Fragment key={index}>
              {index > 0 && <hr className="border-divider" />}
              {section}
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
}
