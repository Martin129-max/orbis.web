"use client";

import { Drawer } from "antd";
import { PanelRightClose, PanelRightOpen, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import * as Atom from "@atom";
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
      <div className="relative hidden shrink-0 lg:flex">
        <aside
          data-tour="side-panel"
          id="side-panel"
          aria-label={label}
          className={`flex overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none ${
            collapsed ? "w-12" : "w-72 border-l border-divider bg-surface"
          }`}
        >
          <div
            aria-hidden={collapsed}
            inert={collapsed}
            className={`flex w-72 shrink-0 flex-col gap-6 overflow-y-auto p-6 pb-[max(1.5rem,var(--feedback-dock-space,0px))] ${
              collapsed ? "invisible" : ""
            }`}
          >
            {children}
          </div>
        </aside>
        <div
          inert={!collapsed}
          className={`absolute top-3 right-3 ${
            collapsed
              ? "translate-x-0 opacity-100 transition-[opacity,translate] delay-100 duration-300 ease-out motion-reduce:transition-none"
              : "pointer-events-none translate-x-full opacity-0"
          }`}
        >
          <SidePanelToggle label={label} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-12 shrink-0 items-start justify-center pt-3">
        <SidePanelToggle label={label} />
      </div>
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
    </>
  );
}

export function PanelHeading({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <SidePanelToggle label={label} />
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

  if (!open) {
    return (
      <Atom.Button
        size="small"
        variant="secondary"
        aria-label={title}
        aria-expanded={open}
        aria-controls="side-panel"
        onClick={() => togglePanel(isDesktop)}
        icon={<PanelRightOpen size={14} />}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={title}
      aria-expanded={open}
      aria-controls="side-panel"
      onClick={() => togglePanel(isDesktop)}
      className="icon-button"
    >
      {isDesktop ? <PanelRightClose size={20} /> : <X size={20} />}
    </button>
  );
}
