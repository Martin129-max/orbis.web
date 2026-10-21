"use client";

import { Check, X } from "lucide-react";
import { Button, Popconfirm, Tooltip } from "antd";
import { useState, type ReactNode } from "react";
import * as Atom from "@atom";
import type { FriendUser } from "@/lib/api";
import { useFriendsStore } from "@/stores/friends-store";

function label(user: FriendUser) {
  return user.name ?? user.email;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
        {title}
      </h2>
      <ul className="flex flex-col gap-1">{children}</ul>
    </section>
  );
}

function FriendRow({
  user,
  online,
  subtitle,
  children,
}: {
  user: FriendUser;
  online?: boolean;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${
        online === false ? "opacity-60" : ""
      }`}
    >
      <span className="relative">
        <Atom.Avatar label={label(user)} seed={user.userId} />
        {online !== undefined && (
          <span
            aria-hidden
            className={`absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${
              online ? "bg-emerald-500" : "bg-zinc-400"
            }`}
          />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{label(user)}</span>
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      </div>
      <div className="flex shrink-0 gap-1">{children}</div>
    </li>
  );
}

function Action({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Tooltip title={title}>
      <Button
        type="text"
        size="small"
        icon={icon}
        aria-label={title}
        onClick={onClick}
      />
    </Tooltip>
  );
}

function AddFriendForm() {
  const addFriend = useFriendsStore((state) => state.addFriend);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email")).trim();
    setError(null);
    setSent(false);
    setPending(true);

    try {
      await addFriend({ email });
      form.reset();
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Atom.Input
          name="email"
          type="email"
          required
          placeholder="Add a friend by email"
          aria-label="Friend's email"
          autoComplete="off"
          onChange={() => setSent(false)}
        />
        <Atom.Button type="submit" loading={pending}>
          Add
        </Atom.Button>
      </div>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      {sent && <p className="text-xs text-muted">Friend request sent.</p>}
    </form>
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
        title={`Remove ${label(user)} from your friends?`}
        okText="Remove"
        okButtonProps={{ danger: true }}
        onConfirm={() => removeFriend(user.userId)}
      >
        <span>
          <Action title="Remove friend" icon={<X size={16} />} />
        </span>
      </Popconfirm>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AddFriendForm />
      {!loaded ? (
        <div className="flex py-8">
          <Atom.Loader />
        </div>
      ) : (
        <>
          {requests > 0 && (
            <Section title={`Requests — ${requests}`}>
              {incoming.map((user) => (
                <FriendRow
                  key={user.userId}
                  user={user}
                  subtitle="Wants to be friends"
                >
                  <Action
                    title="Accept"
                    icon={<Check size={16} />}
                    onClick={() =>
                      addFriend({ userId: user.userId }).catch(() => null)
                    }
                  />
                  <Action
                    title="Decline"
                    icon={<X size={16} />}
                    onClick={() => removeFriend(user.userId).catch(() => null)}
                  />
                </FriendRow>
              ))}
              {outgoing.map((user) => (
                <FriendRow key={user.userId} user={user} subtitle="Request sent">
                  <Action
                    title="Cancel request"
                    icon={<X size={16} />}
                    onClick={() => removeFriend(user.userId).catch(() => null)}
                  />
                </FriendRow>
              ))}
            </Section>
          )}
          {friends.length === 0 ? (
            <div className="flex flex-col gap-1 py-4 text-center">
              <p className="text-sm font-medium">No friends yet</p>
              <p className="text-xs text-muted">
                Add people by email, or from a community&apos;s member list.
              </p>
            </div>
          ) : (
            <>
              <Section title={`Online — ${online.length}`}>
                {online.map((friend) => (
                  <FriendRow key={friend.userId} user={friend} online>
                    {removeAction(friend)}
                  </FriendRow>
                ))}
              </Section>
              {offline.length > 0 && (
                <Section title={`Offline — ${offline.length}`}>
                  {offline.map((friend) => (
                    <FriendRow key={friend.userId} user={friend} online={false}>
                      {removeAction(friend)}
                    </FriendRow>
                  ))}
                </Section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
