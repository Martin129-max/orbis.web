import { create } from "zustand";
import * as api from "@/lib/api";
import type { Community, CommunityImage, RailItem } from "@/lib/api";
import { useAuthStore } from "./auth-store";

type CommunityState = {
  communities: Community[];
  layout: RailItem[];
  fetchCommunities: () => Promise<void>;
  createCommunity: (name: string, isPublic: boolean) => Promise<Community>;
  joinCommunity: (communityId: number) => Promise<Community>;
  updateCommunity: (
    communityId: number,
    changes: Partial<Pick<Community, "name" | "isPublic">>,
  ) => Promise<Community>;
  setCommunityImage: (
    communityId: number,
    image: CommunityImage,
    file: File | null,
  ) => Promise<Community>;
  deleteCommunity: (communityId: number) => Promise<void>;
  updateLayout: (layout: RailItem[]) => Promise<void>;
};

export const useCommunityStore = create<CommunityState>()((set, get) => ({
  communities: [],
  layout: [],
  fetchCommunities: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ communities: [], layout: [] });
      return;
    }

    const [communities, layout] = await Promise.all([
      api.getCommunities(token).catch(() => null),
      api.getRailLayout(token).catch(() => null),
    ]);
    if (communities) set({ communities });
    if (layout) set({ layout });
  },
  createCommunity: async (name, isPublic) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const community = await api.createCommunity(token, name, isPublic);
    set((state) => ({
      communities: [...state.communities, community],
      layout: [...state.layout, { type: "community", communityId: community.id }],
    }));
    return community;
  },
  joinCommunity: async (communityId) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const community = await api.joinCommunity(token, communityId);
    set((state) =>
      state.communities.some(({ id }) => id === community.id)
        ? state
        : {
            communities: [...state.communities, community],
            layout: [...state.layout, { type: "community", communityId: community.id }],
          },
    );
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
  setCommunityImage: async (communityId, image, file) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const updated = file
      ? await api.uploadCommunityImage(token, communityId, image, file)
      : await api.removeCommunityImage(token, communityId, image);
    set((state) => ({
      communities: state.communities.map((community) =>
        community.id === communityId
          ? {
              ...community,
              iconUrl: updated.iconUrl,
              coverUrl: updated.coverUrl,
              backgroundUrl: updated.backgroundUrl,
            }
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
      layout: state.layout.flatMap((item): RailItem[] =>
        item.type === "community"
          ? item.communityId === communityId
            ? []
            : [item]
          : [{ ...item, communityIds: item.communityIds.filter((id) => id !== communityId) }],
      ),
    }));
  },
  updateLayout: async (layout) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ layout });
    try {
      const saved = await api.updateRailLayout(token, layout);
      if (get().layout === layout) set({ layout: saved });
    } catch {
      await get().fetchCommunities();
    }
  },
}));
