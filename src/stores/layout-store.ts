import { create } from "zustand";
import { persist } from "zustand/middleware";

type LayoutState = {
  panelCollapsed: boolean;
  drawerOpen: boolean;
  searchSlot: HTMLElement | null;
  pageSearches: number;
  togglePanel: (isDesktop: boolean) => void;
  closeDrawer: () => void;
  setSearchSlot: (slot: HTMLElement | null) => void;
  registerPageSearch: () => () => void;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      panelCollapsed: false,
      drawerOpen: false,
      searchSlot: null,
      pageSearches: 0,
      togglePanel: (isDesktop) =>
        set((state) =>
          isDesktop
            ? { panelCollapsed: !state.panelCollapsed }
            : { drawerOpen: !state.drawerOpen },
        ),
      closeDrawer: () => set({ drawerOpen: false }),
      setSearchSlot: (searchSlot) => set({ searchSlot }),
      registerPageSearch: () => {
        set((state) => ({ pageSearches: state.pageSearches + 1 }));
        return () => set((state) => ({ pageSearches: state.pageSearches - 1 }));
      },
    }),
    {
      name: "layout",
      partialize: ({ panelCollapsed }) => ({ panelCollapsed }),
      skipHydration: true,
    },
  ),
);
