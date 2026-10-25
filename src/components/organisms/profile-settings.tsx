"use client";

import { App } from "antd";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { Profile } from "@/lib/api";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { OAuthConnections } from "./oauth-connections";
import { PrivateProfileSwitch } from "./private-profile-switch";
import { ThemeToggle } from "./theme-toggle";

function RestartTours() {
  const { message } = App.useApp();
  const resetTours = useOnboardingStore((state) => state.resetTours);
  const [pending, setPending] = useState(false);

  async function restart() {
    setPending(true);
    try {
      await resetTours();
      message.success("Tours restarted. They’ll show again as you visit each page.");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">Guided tours</p>
      <p className="text-xs text-muted">
        Watch the welcome tour on Home and the tips on each page again.
      </p>
      <Atom.Button
        variant="secondary"
        icon={<RotateCcw size={14} />}
        loading={pending}
        onClick={restart}
        className="w-fit"
      >
        Restart tours
      </Atom.Button>
    </div>
  );
}

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
        <div className="flex flex-col gap-1">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">Private profile</span>
            <PrivateProfileSwitch />
          </label>
          <p className="text-xs text-muted">
            Only your friends can see your posts, friends, communities, and library. Everyone else sees just your name and picture.
          </p>
        </div>
        <RestartTours />
      </Molecule.SettingsSection>
      <Molecule.SettingsSection title="Account">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Email</p>
          <p className="truncate text-sm">{profile.email}</p>
          <p className="text-xs text-muted">Only you can see this.</p>
        </div>
      </Molecule.SettingsSection>
      <Molecule.SettingsSection
        title="Connections"
        description="Log in with Discord or Twitch. If their verified email matches your Orbis email, they connect automatically."
      >
        <OAuthConnections />
      </Molecule.SettingsSection>
    </div>
  );
}
