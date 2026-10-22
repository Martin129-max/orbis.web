import { create } from "zustand";
import * as api from "@/lib/api";
import { useAuthStore } from "./auth-store";

type NotificationsState = {
  unreadCount: number;
  version: number;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  unreadCount: 0,
  version: 0,
  refresh: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    const unreadCount = await api.getUnreadCount(token).catch(() => null);
    set((state) => ({
      version: state.version + 1,
      ...(unreadCount !== null && { unreadCount }),
    }));
  },
  markRead: async (id) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
    await api.markNotificationRead(token, id).catch(() => null);
  },
  markAllRead: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ unreadCount: 0 });
    await api.markAllNotificationsRead(token).catch(() => null);
  },
}));

useAuthStore.subscribe(({ token }) => {
  if (!token) useNotificationsStore.setState({ unreadCount: 0 });
});
