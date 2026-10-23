"use client";

import { Drawer, Tooltip } from "antd";
import { PanelRightClose, PanelRightOpen, X } from "lucide-react";
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
    return (
      <aside
        data-tour="side-panel"
        id="side-panel"
        aria-label={label}
        aria-hidden={collapsed}
        inert={collapsed}
        className={`hidden shrink-0 overflow-hidden border-divider bg-surface transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex ${
          collapsed ? "w-0" : "w-72 border-l"
        }`}
      >
        <div className="flex w-72 shrink-0 flex-col gap-6 overflow-y-auto p-6 pb-[max(1.5rem,var(--feedback-dock-space,0px))]">
          {children}
        </div>
      </aside>
    );
  }

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      placement="right"
      size={PANEL_WIDTH}
      title={null}
      closable={false}
      destroyOnHidden
      styles={{ body: { padding: 24 } }}
    >
      <div id="side-panel" aria-label={label} className="flex flex-col gap-6">
        {children}
      </div>
    </Drawer>
  );
}

export function PanelHeading({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  const isDesktop = useIsDesktop();

  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {!isDesktop && <SidePanelToggle label={label} />}
    </div>
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
        className="icon-button"
      >
        {!isDesktop && open ? (
          <X size={20} />
        ) : open ? (
          <PanelRightClose size={20} />
        ) : (
          <PanelRightOpen size={20} />
        )}
      </button>
    </Tooltip>
  );
}
