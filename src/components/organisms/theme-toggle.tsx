"use client";

import { DesktopOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import { useThemeStore, type ThemeMode } from "@/stores/theme-store";

const options = [
  { value: "system", icon: <DesktopOutlined />, title: "System theme" },
  { value: "light", icon: <SunOutlined />, title: "Light theme" },
  { value: "dark", icon: <MoonOutlined />, title: "Dark theme" },
] satisfies { value: ThemeMode; icon: React.ReactNode; title: string }[];

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <Segmented<ThemeMode>
      aria-label="Theme"
      options={options}
      value={mode}
      onChange={setMode}
    />
  );
}
