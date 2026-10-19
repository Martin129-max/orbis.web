"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useThemeStore } from "@/stores/theme-store";

const darkQuery = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(darkQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function usePrefersDark() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(darkQuery).matches,
    () => false,
  );
}

export function AntdProvider({ children }: { children: ReactNode }) {
  const prefersDark = usePrefersDark();
  const mode = useThemeStore((state) => state.mode);
  const isDark = mode === "dark" || (mode === "system" && prefersDark);

  useEffect(() => {
    useThemeStore.persist.rehydrate();
  }, []);

  return (
    <AntdRegistry layer>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: { fontFamily: "var(--font-geist-sans)" },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
