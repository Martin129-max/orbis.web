"use client";

import { Bell, CheckCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Atom from "@atom";
import { getNotifications, type Notification } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { HEADER_POPOVER_LIMIT, HeaderPopover, HeaderPopoverNote } from "./header-popover";
import { NotificationRow } from "./notification-center";

export function NotificationBell({
  className,
}: {
  className: (active: boolean) => string;
}) {
  const pathname = usePathname();
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [failed, setFailed] = useState(false);
  const active = open || pathname === "/notifications";
  const label =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  function handleOpenChange(next: boolean) {
    setOpen(next);
    const { token } = useAuthStore.getState();
    if (!next || !token) return;

    setFailed(false);
    getNotifications(token)
      .then((page) => setItems(page.items.slice(0, HEADER_POPOVER_LIMIT)))
      .catch(() => setFailed(true));
  }

  async function readAll() {
    setMarking(true);
    try {
      await markAllRead();
      const readAt = new Date().toISOString();
      setItems(
        (current) => current?.map((item) => (item.readAt ? item : { ...item, readAt })) ?? null,
      );
    } finally {
      setMarking(false);
    }
  }

  function openNotification(notification: Notification) {
    setOpen(false);
    if (notification.readAt) return;
    markRead(notification.id);
    setItems(
      (current) =>
        current?.map((item) =>
          item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
        ) ?? null,
    );
  }

  return (
    <HeaderPopover
      open={open}
      onOpenChange={handleOpenChange}
      title="Notifications"
      href="/notifications"
      action="See all notifications"
      headerAction={
        unreadCount > 0 && (
          <Atom.Button
            size="small"
            variant="secondary"
            icon={<CheckCheck size={14} />}
            loading={marking}
            onClick={readAll}
          >
            Mark all as read
          </Atom.Button>
        )
      }
      content={
        failed && !items ? (
          <HeaderPopoverNote>Notifications couldn’t be loaded.</HeaderPopoverNote>
        ) : !items ? (
          <div className="flex py-6">
            <Atom.Loader />
          </div>
        ) : items.length === 0 ? (
          <HeaderPopoverNote>No notifications yet.</HeaderPopoverNote>
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                compact
                onOpen={() => openNotification(notification)}
              />
            ))}
          </ul>
        )
      }
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        data-tour="notifications"
        className={`relative cursor-pointer ${className(active)}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-rail bg-accent px-1 font-sans text-[10px] leading-none font-bold text-accent-foreground"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </HeaderPopover>
  );
}
