"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { useSyncExternalStore, type ReactNode } from "react";

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

  return (
    <AntdRegistry layer>
      <ConfigProvider
        theme={{
          algorithm: prefersDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: { fontFamily: "var(--font-geist-sans)" },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
