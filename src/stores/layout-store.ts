import { create } from "zustand";
import { persist } from "zustand/middleware";

type LayoutState = {
  panelCollapsed: boolean;
  drawerOpen: boolean;
  togglePanel: (isDesktop: boolean) => void;
  closeDrawer: () => void;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      panelCollapsed: false,
      drawerOpen: false,
      togglePanel: (isDesktop) =>
        set((state) =>
          isDesktop
            ? { panelCollapsed: !state.panelCollapsed }
            : { drawerOpen: !state.drawerOpen },
        ),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "layout",
      partialize: ({ panelCollapsed }) => ({ panelCollapsed }),
      skipHydration: true,
    },
  ),
);
