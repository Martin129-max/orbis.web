import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DirectoryViewMode = "cards" | "list";

type DirectoryPreferences = {
  view: DirectoryViewMode;
  setView: (view: DirectoryViewMode) => void;
};

export const useDirectoryPreferencesStore = create<DirectoryPreferences>()(
  persist(
    (set) => ({
      view: "list",
      setView: (view) => set({ view }),
    }),
    {
      name: "directory-preferences",
      partialize: ({ view }) => ({ view }),
      skipHydration: true,
      merge: (saved, current) => {
        const view = (saved as Partial<DirectoryPreferences> | null)?.view;
        return { ...current, view: view === "cards" || view === "list" ? view : current.view };
      },
    },
  ),
);
