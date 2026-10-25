"use client";

import { Check } from "lucide-react";
import { updatePreferences, type PresenceStatus } from "@/lib/api";
import * as Atom from "@atom";
import { presenceLabel } from "@/lib/presence";
import { useAuthStore } from "@/stores/auth-store";

const choices: PresenceStatus[] = ["online", "idle", "busy", "offline"];

export function StatusPicker() {
  const profile = useAuthStore((state) => state.profile);
  const current = profile && (profile.appearOffline ? "offline" : profile.status);

  async function choose(choice: PresenceStatus) {
    const { token, profile: before } = useAuthStore.getState();
    if (!token || !before) return;

    const preferences =
      choice === "offline" ? { appearOffline: true } : { appearOffline: false, status: choice };
    useAuthStore.setState({ profile: { ...before, ...preferences } });
    try {
      await updatePreferences(token, preferences);
    } catch {
      useAuthStore.setState({ profile: before });
    }
  }

  return (
    <div role="radiogroup" aria-label="Status" className="-mx-2 flex flex-col">
      {choices.map((choice) => (
        <button
          key={choice}
          type="button"
          role="radio"
          aria-checked={current === choice}
          disabled={!profile}
          onClick={() => choose(choice)}
          className="focus-ring flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-rail-item disabled:cursor-default"
        >
          <span aria-hidden className="flex h-3.5 w-3.5 shrink-0">
            <Atom.StatusDot status={choice} />
          </span>
          <span className="flex-1">{choice === "offline" ? "Appear offline" : presenceLabel[choice]}</span>
          {current === choice && <Check size={16} aria-hidden className="text-accent" />}
        </button>
      ))}
    </div>
  );
}
