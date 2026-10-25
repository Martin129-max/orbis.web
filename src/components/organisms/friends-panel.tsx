"use client";

import { Inbox, Send, UserPlus } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Template from "@template";
import { searchPeople, type FriendUser } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";
import { FriendAction } from "./member-list";
import { PersonRow } from "./person-row";
import { PanelHeading, SidePanel } from "./side-panel";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold text-muted uppercase">{title}</h3>
      <ul className="flex flex-col">{children}</ul>
    </section>
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
  const loaded = useFriendsStore((state) => state.loaded);

  const online = friends.filter((friend) => friend.online);
  const offline = friends.filter((friend) => !friend.online);

  const sections = [
    online.length > 0 && (
      <Section key="online" title={`Online / ${online.length}`}>
        {online.map((friend) => (
          <PersonRow
            key={friend.userId}
            person={friend}
            presence="online"
          />
        ))}
      </Section>
    ),
    offline.length > 0 && (
      <Section key="offline" title={`Offline / ${offline.length}`}>
        {offline.map((friend) => (
          <PersonRow
            key={friend.userId}
            person={friend}
            presence="offline"
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

function RequestCard({ person, actions }: { person: FriendUser; actions: ReactNode }) {
  const label = displayName(person);

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={`/users/${person.username}`}
          aria-label={`${label}’s profile`}
          tabIndex={-1}
          className="shrink-0 rounded-full"
        >
          <Atom.Avatar label={label} src={person.avatarUrl} seed={person.userId} />
        </Link>
        <div className="flex min-w-0 flex-col">
          <Molecule.UserLink username={person.username} className="truncate text-[15px] font-semibold">
            {label}
          </Molecule.UserLink>
          <span className="truncate text-xs text-muted">@{person.username}</span>
        </div>
      </div>
      <div className="flex gap-2">{actions}</div>
    </li>
  );
}

export function FriendRequests() {
  const incoming = useFriendsStore((state) => state.incoming);
  const outgoing = useFriendsStore((state) => state.outgoing);
  const loaded = useFriendsStore((state) => state.loaded);
  const addFriend = useFriendsStore((state) => state.addFriend);
  const removeFriend = useFriendsStore((state) => state.removeFriend);
  const [tab, setTab] = useState<"received" | "sent">("received");

  const tabs = [
    { value: "received", label: "Received", count: incoming.length, icon: <Inbox size={16} aria-hidden /> },
    { value: "sent", label: "Sent", count: outgoing.length, icon: <Send size={16} aria-hidden /> },
  ] as const;
  const people = tab === "received" ? incoming : outgoing;

  return (
    <>
      <nav
        aria-label="Friend requests"
        className="flex shrink-0 items-end gap-6 border-b border-divider px-4 sm:px-8"
      >
        <div className="-mb-px flex min-w-0 items-end gap-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
          {tabs.map(({ value, label, count, icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              className={`focus-ring flex shrink-0 cursor-pointer items-center gap-2 rounded-t-sm border-b-2 px-1 py-3 text-sm whitespace-nowrap transition-colors ${
                tab === value
                  ? "border-accent text-accent"
                  : "border-transparent font-semibold text-foreground hover:text-accent"
              }`}
            >
              {icon}
              {label}
              <span className="text-xs text-muted tabular-nums">{count}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="flex min-h-0 flex-1">
        <Template.PageColumn>
          {!loaded ? (
            <Molecule.FeedSkeleton label="Loading requests…" />
          ) : people.length === 0 ? (
            <Molecule.FeedState
              eyebrow="Empty"
              icon={<UserPlus size={24} strokeWidth={1.5} />}
              title={tab === "received" ? "No friend requests." : "No sent requests."}
              description={
                tab === "received"
                  ? "When someone sends you a friend request, it’ll show up here."
                  : "Requests you send show up here until they’re accepted."
              }
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {people.map((person) => (
                <RequestCard
                  key={person.userId}
                  person={person}
                  actions={
                    tab === "received" ? (
                      <>
                        <Atom.Button
                          size="small"
                          className="flex-1"
                          onClick={() => addFriend({ userId: person.userId }).catch(() => null)}
                        >
                          Accept
                        </Atom.Button>
                        <Atom.Button
                          size="small"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => removeFriend(person.userId).catch(() => null)}
                        >
                          Decline
                        </Atom.Button>
                      </>
                    ) : (
                      <Atom.Button
                        size="small"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => removeFriend(person.userId).catch(() => null)}
                      >
                        Cancel request
                      </Atom.Button>
                    )
                  }
                />
              ))}
            </ul>
          )}
        </Template.PageColumn>
        <SidePanel label="Friends">
          <FriendsPanel />
        </SidePanel>
      </div>
    </>
  );
}
