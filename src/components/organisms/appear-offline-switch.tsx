"use client";

import { Switch } from "antd";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AppearOfflineSwitch({ size }: { size?: "small" | "default" }) {
  const profile = useAuthStore((state) => state.profile);

  async function handleChange(appearOffline: boolean) {
    const { token, profile: current } = useAuthStore.getState();
    if (!token || !current) return;

    useAuthStore.setState({ profile: { ...current, appearOffline } });
    try {
      await updatePreferences(token, { appearOffline });
    } catch {
      useAuthStore.setState({ profile: current });
    }
  }

  return (
    <Switch
      size={size}
      aria-label="Appear offline"
      checked={profile?.appearOffline ?? false}
      disabled={!profile}
      onChange={handleChange}
    />
  );
}
