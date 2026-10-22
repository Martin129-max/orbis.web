import { io, type Socket } from "socket.io-client";
import { create } from "zustand";
import * as api from "@/lib/api";
import type { Friend, FriendTarget, FriendUser } from "@/lib/api";
import { useAuthStore } from "./auth-store";

type FriendsState = {
  friends: Friend[];
  incoming: FriendUser[];
  outgoing: FriendUser[];
  presence: Record<number, boolean>;
  loaded: boolean;
  connect: () => void;
  fetchFriends: () => Promise<void>;
  addFriend: (target: FriendTarget) => Promise<void>;
  removeFriend: (userId: number) => Promise<void>;
};

const empty = {
  friends: [],
  incoming: [],
  outgoing: [],
  presence: {},
  loaded: false,
};

let socket: Socket | null = null;

export const useFriendsStore = create<FriendsState>()((set, get) => ({
  ...empty,
  connect: () => {
    const { token } = useAuthStore.getState();
    if (!token || socket) return;

    socket = io(api.API_URL, { auth: { token } });
    socket.on("connect", () => get().fetchFriends());
    socket.on("friends:changed", () => get().fetchFriends());
    socket.on(
      "presence",
      ({ userId, online }: { userId: number; online: boolean }) =>
        set((state) => ({
          friends: state.friends.map((friend) =>
            friend.userId === userId ? { ...friend, online } : friend,
          ),
          presence: { ...state.presence, [userId]: online },
        })),
    );
    get().fetchFriends();
  },
  fetchFriends: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    const list = await api.getFriends(token).catch(() => null);
    if (list) set({ ...list, loaded: true });
  },
  addFriend: async (target) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    try {
      await api.addFriend(token, target);
    } finally {
      await get().fetchFriends();
    }
  },
  removeFriend: async (userId) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      await api.removeFriend(token, userId);
    } finally {
      await get().fetchFriends();
    }
  },
}));

useAuthStore.subscribe(({ token }) => {
  if (token || !socket) return;

  socket.disconnect();
  socket = null;
  useFriendsStore.setState(empty);
});
