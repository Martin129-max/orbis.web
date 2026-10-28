"use client";

import { Lightbulb, X } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { tips } from "@/lib/tips";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

const SEEN_KEY = "orbis:tips-seen";
const SEEN_EVENT = "orbis:tips-seen";
const UNKNOWN = "unknown";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

type Seen = { ids: string[]; week: number | null };

function currentWeek() {
  return Math.floor((Date.now() + 3 * DAY_MS) / WEEK_MS);
}

function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}

function parseSeen(raw: string | null): Seen {
  try {
    const seen = JSON.parse(raw ?? "null");
    return {
      ids: Array.isArray(seen?.ids) ? seen.ids.filter((id: unknown) => typeof id === "string") : [],
      week: typeof seen?.week === "number" ? seen.week : null,
    };
  } catch {
    return { ids: [], week: null };
  }
}

function markSeen(seen: Seen, id: string, week: number) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify({ ids: [...seen.ids, id], week }));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(SEEN_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SEEN_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SEEN_EVENT, onChange);
  };
}

export function TipOfTheWeek() {
  const profile = useAuthStore((state) => state.profile);
  const onboarding = useOnboardingStore((state) => state.onboarding);
  const raw = useSyncExternalStore(subscribe, readSeen, () => UNKNOWN);
  const [week] = useState(currentWeek);

  if (!profile || !onboarding || raw === UNKNOWN) return null;

  const seen = parseSeen(raw);
  if (seen.week === week) return null;

  const fresh = tips.filter(
    (tip) => !seen.ids.includes(tip.id) && !(tip.used && onboarding.used?.[tip.used]),
  );
  if (fresh.length === 0) return null;
  const tip = fresh[week % fresh.length];
  const dismiss = () => markSeen(seen, tip.id, week);

  return (
    <section
      aria-label="Tip of the week"
      className="flex items-start gap-3 rounded-lg border border-info/40 bg-info/10 p-4"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info text-info-foreground"
      >
        <Lightbulb size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[11px] font-bold text-muted uppercase">Tip of the week</p>
        <p className="text-sm font-semibold">{tip.title}</p>
        <p className="text-[13px] text-muted">{tip.body}</p>
        {tip.action && (
          <Link
            href={tip.action.href}
            onClick={dismiss}
            className="focus-ring w-fit rounded-sm text-[13px] font-semibold text-info hover:underline"
          >
            {tip.action.label}
          </Link>
        )}
      </div>
      <button
        type="button"
        aria-label="Hide this tip"
        onClick={dismiss}
        className="icon-button -mt-1 -mr-1 cursor-pointer"
      >
        <X size={16} />
      </button>
    </section>
  );
}
