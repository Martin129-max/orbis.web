"use client";

import { Switch } from "antd";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

function PreferenceSwitch({
  field,
  label,
  size,
}: {
  field: "appearOffline" | "busy";
  label: string;
  size?: "small" | "default";
}) {
  const profile = useAuthStore((state) => state.profile);

  async function handleChange(value: boolean) {
    const { token, profile: current } = useAuthStore.getState();
    if (!token || !current) return;

    useAuthStore.setState({ profile: { ...current, [field]: value } });
    try {
      await updatePreferences(token, field === "busy" ? { busy: value } : { appearOffline: value });
    } catch {
      useAuthStore.setState({ profile: current });
    }
  }

  return (
    <Switch
      size={size}
      aria-label={label}
      checked={profile?.[field] ?? false}
      disabled={!profile}
      onChange={handleChange}
    />
  );
}

export function AppearOfflineSwitch({ size }: { size?: "small" | "default" }) {
  return <PreferenceSwitch field="appearOffline" label="Appear offline" size={size} />;
}

export function BusySwitch({ size }: { size?: "small" | "default" }) {
  return <PreferenceSwitch field="busy" label="Busy" size={size} />;
}
