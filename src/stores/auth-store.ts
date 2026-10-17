import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "@/lib/api";
import type { Credentials, Profile } from "@/lib/api";

type AuthState = {
  token: string | null;
  profile: Profile | null;
  login: (credentials: Credentials) => Promise<void>;
  signup: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<Profile | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      profile: null,
      login: async (credentials) => {
        set({ token: await api.login(credentials) });
      },
      signup: async (credentials) => {
        set({ token: await api.signup(credentials) });
      },
      logout: () => set({ token: null, profile: null }),
      fetchProfile: async () => {
        const { token, logout } = get();
        const profile = token ? await api.getProfile(token) : null;

        if (profile) set({ profile });
        else logout();

        return profile;
      },
    }),
    { name: "auth", partialize: ({ token }) => ({ token }) },
  ),
);
