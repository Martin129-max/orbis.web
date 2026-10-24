import { create } from "zustand";
import * as api from "@/lib/api";
import type { Notification } from "@/lib/api";
import { useAuthStore } from "./auth-store";

export type NotificationToast = { id: number; notification: Notification };

type NotificationsState = {
  unreadCount: number;
  version: number;
  toasts: NotificationToast[];
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  showToasts: (notifications: Notification[]) => void;
  dismissToast: (id: number) => void;
};

const MAX_TOASTS = 3;

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  unreadCount: 0,
  version: 0,
  toasts: [],
  showToasts: (notifications) =>
    set((state) => {
      const incoming = notifications.map((notification) => ({
        id: notification.id,
        notification,
      }));
      const ids = new Set(incoming.map(({ id }) => id));
      return {
        toasts: [...incoming, ...state.toasts.filter((toast) => !ids.has(toast.id))].slice(
          0,
          MAX_TOASTS,
        ),
      };
    }),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
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
    set((state) => ({ version: state.version + 1 }));
  },
}));

useAuthStore.subscribe(({ token }) => {
  if (!token) useNotificationsStore.setState({ unreadCount: 0, toasts: [] });
});
