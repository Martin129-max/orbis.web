"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Segmented } from "antd";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore, type ThemeMode } from "@/stores/theme-store";

const options = [
  { value: "system", icon: <Monitor size={14} />, title: "System theme" },
  { value: "light", icon: <Sun size={14} />, title: "Light theme" },
  { value: "dark", icon: <Moon size={14} />, title: "Dark theme" },
] satisfies { value: ThemeMode; icon: React.ReactNode; title: string }[];

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
