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

export const themeScript = `var m="dark";try{m=JSON.parse(localStorage.getItem("${storageKey}")).state.mode}catch(e){}if(m==="light"||m==="dark")document.documentElement.dataset.theme=m;`;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "dark",
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
    }),
    { name: storageKey, partialize: ({ mode }) => ({ mode }), skipHydration: true },
  ),
);
