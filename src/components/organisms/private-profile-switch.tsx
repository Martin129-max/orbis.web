"use client";

import { Switch } from "antd";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function PrivateProfileSwitch() {
  const profile = useAuthStore((state) => state.profile);

  async function handleChange(isPrivate: boolean) {
    const { token, profile: current } = useAuthStore.getState();
    if (!token || !current) return;

    const isPublic = !isPrivate;
    useAuthStore.setState({ profile: { ...current, isPublic } });
    try {
      await updatePreferences(token, { isPublic });
    } catch {
      useAuthStore.setState({ profile: current });
    }
  }

  return (
    <Switch
      aria-label="Private profile"
      checked={profile ? !profile.isPublic : false}
      disabled={!profile}
      onChange={handleChange}
    />
  );
}
