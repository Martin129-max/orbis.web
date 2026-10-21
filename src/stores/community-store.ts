import { create } from "zustand";
import * as api from "@/lib/api";
import type { Community } from "@/lib/api";
import { useAuthStore } from "./auth-store";

type CommunityState = {
  communities: Community[];
  fetchCommunities: () => Promise<void>;
  createCommunity: (name: string) => Promise<Community>;
  reorderCommunities: (communityIds: number[]) => Promise<void>;
};

export const useCommunityStore = create<CommunityState>()((set, get) => ({
  communities: [],
  fetchCommunities: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ communities: [] });
      return;
    }

    const communities = await api.getCommunities(token).catch(() => null);
    if (communities) set({ communities });
  },
  createCommunity: async (name) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const community = await api.createCommunity(token, name);
    set((state) => ({ communities: [...state.communities, community] }));
    return community;
  },
  reorderCommunities: async (communityIds) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    const byId = new Map(get().communities.map((community) => [community.id, community]));
    set({ communities: communityIds.flatMap((id) => byId.get(id) ?? []) });

    try {
      await api.reorderCommunities(token, communityIds);
    } catch {
      await get().fetchCommunities();
    }
  },
}));
