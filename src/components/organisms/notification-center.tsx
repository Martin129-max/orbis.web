"use client";

import { Segmented, Switch } from "antd";
import {
  Bell,
  CircleCheck,
  CloudOff,
  MessageSquare,
  Reply,
  Search,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  getNotifications,
  type Notification,
  type NotificationFilter,
  type NotificationType,
} from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationsStore } from "@/stores/notifications-store";

const typeIcons: Record<NotificationType, ReactNode> = {
  post_comment: <MessageSquare size={12} />,
  thread_comment: <MessageSquare size={12} />,
  comment_reply: <Reply size={12} />,
  friend_request: <UserPlus size={12} />,
  friend_accepted: <UserCheck size={12} />,
  report_status: <CircleCheck size={12} />,
};

const filters: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "comments", label: "Comments" },
  { value: "friends", label: "Friends" },
  { value: "reports", label: "Reports" },
];

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: () => void;
}) {
  const { actor } = notification;
  const name = actor ? displayName(actor) : "Orbis";
  const unread = !notification.readAt;

  return (
    <li>
      <Link
        href={notification.link}
        prefetch={false}
        onClick={onOpen}
        className={`focus-ring flex items-start gap-3 rounded-lg border p-4 transition-colors hover:border-muted ${
          unread ? "border-accent/40 bg-accent-soft" : "border-divider bg-surface"
        }`}
      >
        <span className="relative shrink-0">
          <Atom.Avatar label={name} src={actor?.avatarUrl} seed={actor?.id ?? 0} />
          <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-divider bg-surface text-foreground">
            {typeIcons[notification.type]}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm">
            <span className="font-semibold">{name}</span> {notification.message}
          </span>
          <span className="text-xs text-muted">{timeAgo(notification.createdAt)}</span>
        </span>
        {unread && (
          <span aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
        )}
      </Link>
    </li>
  );
}

export function NotificationCenter() {
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const version = useNotificationsStore((state) => state.version);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    let ignore = false;
    getNotifications(token, { q: search, filter, unread: unreadOnly })
      .then((page) => {
        if (ignore) return;
        setFailed(false);
        setItems(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });

    return () => {
      ignore = true;
    };
  }, [search, filter, unreadOnly, version, attempt]);

  function loadMore() {
    const { token } = useAuthStore.getState();
    if (!token || !nextCursor || loadingMore) return;

    setLoadingMore(true);
    setMoreFailed(false);
    getNotifications(token, { cursor: nextCursor, q: search, filter, unread: unreadOnly })
      .then((page) => {
        setItems((current) => {
          const seen = new Set(current?.map(({ id }) => id));
          return [...(current ?? []), ...page.items.filter(({ id }) => !seen.has(id))];
        });
        setNextCursor(page.nextCursor);
      })
      .catch(() => setMoreFailed(true))
      .finally(() => setLoadingMore(false));
  }

  function open(notification: Notification) {
    if (notification.readAt) return;
    markRead(notification.id);
    setItems((current) =>
      current?.map((item) =>
        item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
      ) ?? null,
    );
  }

  function readAll() {
    markAllRead();
    const now = new Date().toISOString();
    setItems((current) =>
      unreadOnly ? [] : (current?.map((item) => ({ ...item, readAt: item.readAt ?? now })) ?? null),
    );
  }

  const filtered = Boolean(search) || filter !== "all" || unreadOnly;

  return (
    <div className="flex flex-col gap-6">
      <Molecule.PageIntro
        eyebrow="Inbox"
        title="Notifications."
        description="Comments, replies, friend requests, and updates on your reports."
      />
      <div className="flex flex-col gap-3 rounded-lg border border-divider bg-surface p-4">
        <Atom.Input
          aria-label="Search notifications"
          allowClear
          prefix={<Search size={16} className="text-muted" />}
          placeholder="Search by name or message…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented<NotificationFilter>
            options={filters}
            value={filter}
            onChange={setFilter}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs">
              <Switch size="small" checked={unreadOnly} onChange={setUnreadOnly} />
              Unread only
            </label>
            <Atom.Button
              size="small"
              variant="secondary"
              disabled={unreadCount === 0}
              onClick={readAll}
            >
              Mark all as read
            </Atom.Button>
          </div>
        </div>
      </div>
      {failed && !items ? (
        <Molecule.FeedState
          role="alert"
          eyebrow="Connection error"
          icon={<CloudOff size={24} strokeWidth={1.5} />}
          title="Notifications couldn’t be loaded."
          description="Check your connection and try again."
          action={<Atom.Button onClick={() => setAttempt((count) => count + 1)}>Try again</Atom.Button>}
        />
      ) : !items ? (
        <Molecule.FeedSkeleton label="Loading notifications…" />
      ) : items.length === 0 ? (
        <Molecule.FeedState
          eyebrow={filtered ? "No matches" : "Empty"}
          icon={<Bell size={24} strokeWidth={1.5} />}
          title={filtered ? "Nothing matches." : "No notifications yet."}
          description={
            filtered
              ? "Try a different search or filter."
              : "When someone comments, replies, or adds you, it’ll show up here."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          <ul className="flex flex-col gap-2">
            {items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onOpen={() => open(notification)}
              />
            ))}
          </ul>
          {nextCursor ? (
            <Molecule.LoadMore onLoadMore={loadMore} loading={loadingMore} failed={moreFailed} />
          ) : (
            <Molecule.FeedEnd label="That’s everything" />
          )}
        </div>
      )}
    </div>
  );
}
