import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FeedContentType } from "@/lib/api";

export const feedContentTypes: FeedContentType[] = [
  "post",
  "thread",
  "activity",
];

export type FeedViewMode = "card" | "compact";

type FeedPreferences = {
  view: FeedViewMode;
  setView: (view: FeedViewMode) => void;
  excludedTypes: FeedContentType[];
  toggleType: (type: FeedContentType) => void;
  showAll: () => void;
};

export const useFeedPreferencesStore = create<FeedPreferences>()(
  persist(
    (set) => ({
      view: "card",
      setView: (view) => set({ view }),
      excludedTypes: [],
      toggleType: (type) =>
        set((state) => ({
          excludedTypes: state.excludedTypes.includes(type)
            ? state.excludedTypes.filter((value) => value !== type)
            : [...state.excludedTypes, type],
        })),
      showAll: () => set({ excludedTypes: [] }),
    }),
    {
      name: "feed-preferences",
      skipHydration: true,
      partialize: ({ excludedTypes, view }) => ({ excludedTypes, view }),
      merge: (saved, current) => {
        const value =
          saved && typeof saved === "object"
            ? (saved as Partial<FeedPreferences>).excludedTypes
            : undefined;
        const view =
          saved && typeof saved === "object"
            ? (saved as Partial<FeedPreferences>).view
            : undefined;
        return {
          ...current,
          view: view === "card" || view === "compact" ? view : current.view,
          excludedTypes: Array.isArray(value)
            ? feedContentTypes.filter((type) => value.includes(type))
            : current.excludedTypes,
        };
      },
    },
  ),
);
