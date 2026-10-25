"use client";

import { Popover } from "antd";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { useAuthStore } from "@/stores/auth-store";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { ThemeToggle } from "./theme-toggle";

export function UserMenu() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!useAuthStore.getState().profile) fetchProfile().catch(() => null);
  }, [fetchProfile]);

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  const username = profile ? `@${profile.username}` : "Account";
  const menuRow =
    "focus-ring -mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-rail-item hover:text-foreground";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      align={{ offset: [0, 8] }}
      styles={{ container: { padding: 20, borderRadius: 12 } }}
      content={
        <div className="flex w-[300px] flex-col gap-4">
          <div className="flex items-center gap-3">
            {profile && (
              <>
                <Atom.Avatar
                  label={profile.username}
                  src={profile.avatarUrl}
                  seed={profile.userId}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{profile.username}</span>
                  <span className="truncate text-xs text-muted">{username}</span>
                </div>
              </>
            )}
            <label className="ml-auto flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted">Appear offline</span>
              <AppearOfflineSwitch size="small" />
            </label>
          </div>
          <hr className="border-divider" />
          <p className="text-xs text-muted uppercase">Theme</p>
          <ThemeToggle block />
          <hr className="border-divider" />
          <Link
            href={profile ? `/users/${profile.username}` : "/profile"}
            onClick={() => setOpen(false)}
            className={menuRow}
          >
            <User size={18} />
            View profile
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)} className={menuRow}>
            <Settings size={18} />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={menuRow}
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      }
    >
      <button
        type="button"
        aria-label={`Account: ${username}`}
        data-tour="account"
        aria-expanded={open}
        className="focus-ring rounded-full"
      >
        <Atom.Avatar
          size="rail"
          label={profile?.username ?? "?"}
          src={profile?.avatarUrl}
          seed={profile?.userId ?? 0}
          presence={profile?.appearOffline ? "offline" : "online"}
        />
      </button>
    </Popover>
  );
}
