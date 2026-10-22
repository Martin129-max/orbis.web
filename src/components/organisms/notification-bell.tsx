"use client";

import { Tooltip } from "antd";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotificationsStore } from "@/stores/notifications-store";

export function NotificationBell({
  className,
}: {
  className: (active: boolean) => string;
}) {
  const pathname = usePathname();
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const active = pathname === "/notifications";
  const label =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <Tooltip title="Notifications" placement="right">
      <Link
        href="/notifications"
        aria-label={label}
        aria-current={active ? "page" : undefined}
        data-tour="notifications"
        className={`relative ${className(active)}`}
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
      </Link>
    </Tooltip>
  );
}
