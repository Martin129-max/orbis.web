"use client";

import * as Molecule from "@molecule";
import type { Profile } from "@/lib/api";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { ThemeToggle } from "./theme-toggle";

export function ProfileSettings({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-8">
      <Molecule.PageIntro
        eyebrow={`@${profile.username}`}
        title="Settings"
        description="Change how Orbis looks and how others see you. Edit your picture, cover, and wallpaper right on your profile."
      />
      <Molecule.SettingsSection title="Preferences">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Theme</p>
          <ThemeToggle block />
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">Appear offline</span>
            <AppearOfflineSwitch />
          </label>
          <p className="text-xs text-muted">
            Friends see you as offline. You can still post as usual.
          </p>
        </div>
      </Molecule.SettingsSection>
      <Molecule.SettingsSection title="Account">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Email</p>
          <p className="truncate text-sm">{profile.email}</p>
          <p className="text-xs text-muted">Only you can see this.</p>
        </div>
      </Molecule.SettingsSection>
    </div>
  );
}
