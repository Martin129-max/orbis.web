import { create } from "zustand";
import * as api from "@/lib/api";
import type { Community } from "@/lib/api";
import { useAuthStore } from "./auth-store";

type CommunityState = {
  communities: Community[];
  fetchCommunities: () => Promise<void>;
  createCommunity: (name: string, isPublic: boolean) => Promise<Community>;
  joinCommunity: (communityId: number) => Promise<Community>;
  updateCommunity: (
    communityId: number,
    changes: Partial<Pick<Community, "name" | "isPublic">>,
  ) => Promise<Community>;
  setCommunityIcon: (communityId: number, file: File | null) => Promise<Community>;
  deleteCommunity: (communityId: number) => Promise<void>;
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
  createCommunity: async (name, isPublic) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const community = await api.createCommunity(token, name, isPublic);
    set((state) => ({ communities: [...state.communities, community] }));
    return community;
  },
  joinCommunity: async (communityId) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const community = await api.joinCommunity(token, communityId);
    set((state) => ({
      communities: state.communities.some(({ id }) => id === community.id)
        ? state.communities
        : [...state.communities, community],
    }));
    return community;
  },
  updateCommunity: async (communityId, changes) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const updated = await api.updateCommunity(token, communityId, changes);
    set((state) => ({
      communities: state.communities.map((community) =>
        community.id === communityId
          ? { ...community, name: updated.name, isPublic: updated.isPublic }
          : community,
      ),
    }));
    return updated;
  },
  setCommunityIcon: async (communityId, file) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const updated = file
      ? await api.uploadCommunityIcon(token, communityId, file)
      : await api.removeCommunityIcon(token, communityId);
    set((state) => ({
      communities: state.communities.map((community) =>
        community.id === communityId
          ? { ...community, iconUrl: updated.iconUrl }
          : community,
      ),
    }));
    return updated;
  },
  deleteCommunity: async (communityId) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    await api.deleteCommunity(token, communityId);
    set((state) => ({
      communities: state.communities.filter(({ id }) => id !== communityId),
    }));
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
