"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { palette } from "@/lib/palette";
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
  const colors = isDark ? palette.dark : palette.light;

  useEffect(() => {
    useThemeStore.persist.rehydrate();
  }, []);

  return (
    <AntdRegistry layer>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 14,
            borderRadius: 8,
            borderRadiusLG: 12,
            controlHeight: 36,
            controlHeightLG: 44,
            controlHeightSM: 32,
            colorPrimary: colors.accent,
            colorLink: colors.accent,
            colorError: colors.danger,
            colorSuccess: colors.online,
            colorText: colors.foreground,
            colorTextSecondary: colors.muted,
            colorTextTertiary: colors.muted,
            colorTextPlaceholder: colors.muted,
            colorTextLightSolid: colors.accentForeground,
            colorBorder: colors.divider,
            colorBorderSecondary: colors.divider,
            colorSplit: colors.divider,
            colorBgContainer: colors.surface,
            colorBgElevated: colors.surface,
            colorBgLayout: colors.background,
            colorFillSecondary: colors.railItem,
          },
          components: {
            Segmented: {
              trackBg: colors.rail,
              itemSelectedBg: colors.surface,
              itemColor: colors.foreground,
              itemHoverColor: colors.foreground,
              itemSelectedColor: colors.foreground,
              trackPadding: 4,
            },
            Switch: {
              colorTextQuaternary: colors.railItem,
              colorTextTertiary: colors.divider,
            },
            Input: {
              activeBorderColor: colors.accent,
              hoverBorderColor: colors.muted,
              activeShadow: `0 0 0 1px ${colors.accent}`,
              inputFontSizeLG: 14,
            },
            Form: {
              labelFontSize: 13,
              verticalLabelPadding: "0 0 8px",
              itemMarginBottom: 0,
            },
            Tooltip: {
              colorBgSpotlight: colors.foreground,
              colorTextLightSolid: colors.background,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
