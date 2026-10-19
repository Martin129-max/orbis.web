import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "system" | "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const storageKey = "theme";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
}

export const themeScript = `try{var m=JSON.parse(localStorage.getItem("${storageKey}")).state.mode;if(m==="light"||m==="dark")document.documentElement.dataset.theme=m}catch(e){}`;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
    }),
    { name: storageKey, partialize: ({ mode }) => ({ mode }), skipHydration: true },
  ),
);
