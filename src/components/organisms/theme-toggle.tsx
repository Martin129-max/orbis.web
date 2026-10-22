"use client";

import { Segmented } from "antd";
import { Monitor, Moon, Sun } from "lucide-react";
import { updatePreferences } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore, type ThemeMode } from "@/stores/theme-store";

const options = [
  { value: "dark", label: "Dark", icon: <Moon size={14} /> },
  { value: "light", label: "Light", icon: <Sun size={14} /> },
  { value: "system", label: "System", icon: <Monitor size={14} /> },
] satisfies { value: ThemeMode; label: string; icon: React.ReactNode }[];

export function ThemeToggle({ block = false }: { block?: boolean }) {
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
      block={block}
      options={options}
      value={mode}
      onChange={handleChange}
    />
  );
}
