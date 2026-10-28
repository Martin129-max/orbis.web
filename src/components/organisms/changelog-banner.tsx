"use client";

import { App, Dropdown } from "antd";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { updatePreferences } from "@/lib/api";
import { type ChangelogDay } from "@/lib/changelog";
import { useAuthStore } from "@/stores/auth-store";

const HIDDEN_KEY = "orbis:changelog-hidden";
const HIDDEN_EVENT = "orbis:changelog-hidden";
const UNKNOWN = "unknown";

function readHidden() {
  try {
    return localStorage.getItem(HIDDEN_KEY);
  } catch {
    return null;
  }
}

function hideUpdate(date: string) {
  try {
    localStorage.setItem(HIDDEN_KEY, date);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(HIDDEN_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(HIDDEN_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(HIDDEN_EVENT, onChange);
  };
}

export function useChangelogShown(day: ChangelogDay | null) {
  const profile = useAuthStore((state) => state.profile);
  const hidden = useSyncExternalStore(subscribe, readHidden, () => UNKNOWN);

  return Boolean(
    day &&
      profile &&
      profile.showChangelog !== false &&
      hidden !== UNKNOWN &&
      hidden !== day.date,
  );
}

export function ChangelogBanner({ day }: { day: ChangelogDay }) {
  const { message } = App.useApp();
  const shown = useChangelogShown(day);

  if (!shown) return null;

  const version = day.versions?.[day.versions.length - 1];
  const [first, ...rest] = day.entries;

  async function turnOff() {
    const { token, profile: current } = useAuthStore.getState();
    if (!token || !current) return;

    useAuthStore.setState({ profile: { ...current, showChangelog: false } });
    try {
      await updatePreferences(token, { showChangelog: false });
      message.info("Update notes are off. You can turn them back on in Settings.");
    } catch {
      useAuthStore.setState({ profile: current });
      message.error("Couldn’t save that. Please try again.");
    }
  }

  return (
    <section
      aria-label="What’s new"
      className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
      >
        <Sparkles size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-semibold">
          {version ? `New version ${version} is out!` : "Orbis just got an update!"}
        </p>
        <p className="text-[13px] text-muted">
          {first.title}
          {rest.length > 0 && `, plus ${rest.length} more ${rest.length === 1 ? "change" : "changes"}`}.
        </p>
        <Link
          href="/changelog"
          onClick={() => hideUpdate(day.date)}
          className="focus-ring w-fit rounded-sm text-[13px] font-semibold text-accent hover:underline"
        >
          Read what’s new
        </Link>
      </div>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          items: [
            { key: "hide", label: "Hide this update" },
            { key: "off", label: "Don’t show updates" },
          ],
          onClick: ({ key }) => (key === "hide" ? hideUpdate(day.date) : turnOff()),
        }}
      >
        <button type="button" aria-label="Close update note" className="icon-button -mt-1 -mr-1 cursor-pointer">
          <X size={16} />
        </button>
      </Dropdown>
    </section>
  );
}
