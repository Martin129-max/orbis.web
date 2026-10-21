"use client";

import { Drawer, Tooltip } from "antd";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { useLayoutStore } from "@/stores/layout-store";

const PANEL_WIDTH = 288;

export function SidePanel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const isDesktop = useIsDesktop();
  const collapsed = useLayoutStore((state) => state.panelCollapsed);
  const drawerOpen = useLayoutStore((state) => state.drawerOpen);
  const closeDrawer = useLayoutStore((state) => state.closeDrawer);

  useEffect(() => {
    useLayoutStore.persist.rehydrate();
    return () => useLayoutStore.getState().closeDrawer();
  }, []);

  if (isDesktop) {
    return collapsed ? null : (
      <aside
        id="side-panel"
        aria-label={label}
        className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-black/10 bg-surface px-4 py-6 lg:flex dark:border-white/10"
      >
        {children}
      </aside>
    );
  }

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      placement="right"
      size={PANEL_WIDTH}
      title={label}
      destroyOnHidden
      styles={{ body: { padding: "1rem" } }}
    >
      <div id="side-panel">{children}</div>
    </Drawer>
  );
}

export function SidePanelToggle({ label }: { label: string }) {
  const isDesktop = useIsDesktop();
  const collapsed = useLayoutStore((state) => state.panelCollapsed);
  const drawerOpen = useLayoutStore((state) => state.drawerOpen);
  const togglePanel = useLayoutStore((state) => state.togglePanel);
  const open = isDesktop ? !collapsed : drawerOpen;
  const title = `${open ? "Hide" : "Show"} ${label.toLowerCase()}`;

  return (
    <Tooltip title={title}>
      <button
        type="button"
        aria-label={title}
        aria-expanded={open}
        aria-controls="side-panel"
        onClick={() => togglePanel(isDesktop)}
        className="flex shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
      >
        {open ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
      </button>
    </Tooltip>
  );
}
