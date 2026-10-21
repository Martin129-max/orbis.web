"use client";

import { X } from "lucide-react";
import { Popconfirm, Tooltip } from "antd";
import { Fragment, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import type { FriendUser } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useFriendsStore } from "@/stores/friends-store";
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
          seed={user.userId}
          presence={presence}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold">
            {displayName(user)}
          </span>
          <span className="truncate text-xs text-muted">@{user.username}</span>
        </div>
        {trailing}
      </div>
      {actions && <div className="flex gap-2 pl-11">{actions}</div>}
    </li>
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
    const username = String(new FormData(form).get("username"))
      .trim()
      .replace(/^@/, "");
    setError(null);
    setSent(false);
    setPending(true);

    try {
      await addFriend({ username });
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
      <label htmlFor="friend-username" className="text-[13px] font-semibold">
        Add a friend
      </label>
      <Atom.Input
        id="friend-username"
        name="username"
        size="large"
        required
        placeholder="Enter @username"
        autoCapitalize="none"
        autoComplete="off"
        onChange={() => setSent(false)}
      />
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      {sent && <p className="text-xs text-muted">Friend request sent.</p>}
      <Atom.Button
        type="submit"
        variant="secondary"
        size="large"
        loading={pending}
        className="w-fit"
      >
        Send request
      </Atom.Button>
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
                  variant="text"
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
                variant="text"
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
            trailing={removeAction(friend)}
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
            trailing={removeAction(friend)}
          />
        ))}
      </Section>
    ),
  ].filter(Boolean);

  return (
    <>
      <PanelHeading title={`Friends / ${friends.length}`} label="Friends" />
      <AddFriendForm />
      {!loaded ? (
        <div className="flex py-8">
          <Atom.Loader />
        </div>
      ) : sections.length === 0 ? (
        <p className="text-[13px] text-muted">
          No friends yet. Add people by username, or from a community&apos;s
          member list.
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
      <p className="text-xs text-muted">A little company between episodes.</p>
    </>
  );
}
