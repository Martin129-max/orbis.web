import { create } from "zustand";
import * as api from "@/lib/api";
import type { Onboarding } from "@/lib/api";
import { useAuthStore } from "./auth-store";

type OnboardingState = {
  onboarding: Onboarding | null;
  tourOpen: boolean;
  tourRun: number;
  fetchOnboarding: () => Promise<void>;
  refresh: () => void;
  startTour: () => void;
  finishTour: () => Promise<void>;
  completeTour: (name: string) => Promise<void>;
  resetTours: () => Promise<void>;
  setChecklistDismissed: (dismissed: boolean) => Promise<void>;
};

async function save(changes: Parameters<typeof api.updateOnboarding>[1]) {
  const { token } = useAuthStore.getState();
  if (!token) return null;
  return api.updateOnboarding(token, changes).catch(() => null);
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  onboarding: null,
  tourOpen: false,
  tourRun: 0,
  fetchOnboarding: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    const onboarding = await api.getOnboarding(token).catch(() => null);
    if (onboarding) set({ onboarding });
  },
  refresh: () => {
    const { onboarding, fetchOnboarding } = get();
    if (onboarding && !onboarding.checklistDismissed) fetchOnboarding();
  },
  startTour: () => set((state) => ({ tourOpen: true, tourRun: state.tourRun + 1 })),
  finishTour: async () => {
    set((state) => ({
      tourOpen: false,
      onboarding: state.onboarding && { ...state.onboarding, tourCompleted: true },
    }));
    const onboarding = await save({ tourCompleted: true });
    if (onboarding) set({ onboarding });
  },
  completeTour: async (name) => {
    set((state) => ({
      onboarding: state.onboarding && {
        ...state.onboarding,
        completedTours: [...state.onboarding.completedTours, name],
      },
    }));
    const onboarding = await save({ completedTour: name });
    if (onboarding) set({ onboarding });
  },
  resetTours: async () => {
    const onboarding = await save({ resetTours: true });
    if (!onboarding) throw new Error("Could not restart the tours. Please try again.");
    set({ onboarding });
  },
  setChecklistDismissed: async (checklistDismissed) => {
    set((state) => ({
      onboarding: state.onboarding && { ...state.onboarding, checklistDismissed },
    }));
    const onboarding = await save({ checklistDismissed });
    if (onboarding) set({ onboarding });
  },
}));

useAuthStore.subscribe(({ token }) => {
  if (!token) useOnboardingStore.setState({ onboarding: null, tourOpen: false });
});
