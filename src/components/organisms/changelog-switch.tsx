"use client";

import { Switch } from "antd";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function ChangelogSwitch() {
  const profile = useAuthStore((state) => state.profile);

  async function handleChange(showChangelog: boolean) {
    const { token, profile: current } = useAuthStore.getState();
    if (!token || !current) return;

    useAuthStore.setState({ profile: { ...current, showChangelog } });
    try {
      await updatePreferences(token, { showChangelog });
    } catch {
      useAuthStore.setState({ profile: current });
    }
  }

  return (
    <Switch
      aria-label="Show update notes"
      checked={profile ? profile.showChangelog !== false : true}
      disabled={!profile}
      onChange={handleChange}
    />
  );
}
