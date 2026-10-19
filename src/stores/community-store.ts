import { create } from "zustand";
import * as api from "@/lib/api";
import type { Community } from "@/lib/api";
import { useAuthStore } from "./auth-store";

type CommunityState = {
  communities: Community[];
  fetchCommunities: () => Promise<void>;
  createCommunity: (name: string) => Promise<Community>;
};

export const useCommunityStore = create<CommunityState>()((set) => ({
  communities: [],
  fetchCommunities: async () => {
    const { token } = useAuthStore.getState();
    set({ communities: token ? await api.getCommunities(token) : [] });
  },
  createCommunity: async (name) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const community = await api.createCommunity(token, name);
    set((state) => ({ communities: [...state.communities, community] }));
    return community;
  },
}));
