"use client";

import { Check } from "lucide-react";
import { updatePreferences, type UserStatus } from "@/lib/api";
import { presenceDot, presenceLabel } from "@/lib/presence";
import { useAuthStore } from "@/stores/auth-store";

const choices: (UserStatus | "offline")[] = ["online", "idle", "busy", "offline"];

export function StatusPicker() {
  const profile = useAuthStore((state) => state.profile);
  const current = profile && (profile.appearOffline ? "offline" : profile.status);

  async function choose(choice: UserStatus | "offline") {
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
          <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${presenceDot[choice]}`} />
          <span className="flex-1">{choice === "offline" ? "Appear offline" : presenceLabel[choice]}</span>
          {current === choice && <Check size={16} aria-hidden className="text-accent" />}
        </button>
      ))}
    </div>
  );
}
