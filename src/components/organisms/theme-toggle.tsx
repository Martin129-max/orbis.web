"use client";

import { Segmented } from "antd";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore, type ThemeMode } from "@/stores/theme-store";

const options = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] satisfies { value: ThemeMode; label: string }[];

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  function handleChange(theme: ThemeMode) {
    setMode(theme);

    const { token } = useAuthStore.getState();
    if (token) updatePreferences(token, { theme }).catch(() => null);
  }

  return (
    <Segmented<ThemeMode>
      aria-label="Theme"
      options={options}
      value={mode}
      onChange={handleChange}
    />
  );
}
