import { create } from "zustand";

const PANEL_KEY = "panel-collapsed";

function savedPanel() {
  try {
    return localStorage.getItem(PANEL_KEY) === "true";
  } catch {
    return false;
  }
}

function savePanel(collapsed: boolean) {
  try {
    localStorage.setItem(PANEL_KEY, String(collapsed));
  } catch {
    return;
  }
}

type LayoutState = {
  panelCollapsed: boolean;
  drawerOpen: boolean;
  searchSlot: HTMLElement | null;
  pageSearches: number;
  panelLabel: string | null;
  togglePanel: (isDesktop: boolean) => void;
  restorePanel: () => void;
  closeDrawer: () => void;
  setSearchSlot: (slot: HTMLElement | null) => void;
  registerPageSearch: () => () => void;
  setPanelLabel: (label: string | null) => void;
};

export const useLayoutStore = create<LayoutState>()((set, get) => ({
  panelCollapsed: false,
  drawerOpen: false,
  searchSlot: null,
  pageSearches: 0,
  panelLabel: null,
  togglePanel: (isDesktop) => {
    if (!isDesktop) {
      set((state) => ({ drawerOpen: !state.drawerOpen }));
      return;
    }
    const panelCollapsed = !get().panelCollapsed;
    savePanel(panelCollapsed);
    set({ panelCollapsed });
  },
  restorePanel: () => set({ panelCollapsed: savedPanel() }),
  closeDrawer: () => set({ drawerOpen: false }),
  setSearchSlot: (searchSlot) => set({ searchSlot }),
  setPanelLabel: (panelLabel) => set({ panelLabel }),
  registerPageSearch: () => {
    set((state) => ({ pageSearches: state.pageSearches + 1 }));
    return () => set((state) => ({ pageSearches: state.pageSearches - 1 }));
  },
}));
