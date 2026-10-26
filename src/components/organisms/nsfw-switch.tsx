"use client";

import { Switch } from "antd";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function NsfwSwitch() {
  const profile = useAuthStore((state) => state.profile);

  async function handleChange(showNsfw: boolean) {
    const { token, profile: current } = useAuthStore.getState();
    if (!token || !current) return;

    useAuthStore.setState({ profile: { ...current, showNsfw } });
    try {
      await updatePreferences(token, { showNsfw });
    } catch {
      useAuthStore.setState({ profile: current });
    }
  }

  return (
    <Switch
      aria-label="Show NSFW content"
      checked={profile?.showNsfw ?? false}
      disabled={!profile}
      onChange={handleChange}
    />
  );
}
