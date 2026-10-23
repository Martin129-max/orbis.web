import { create } from "zustand";
import * as api from "@/lib/api";
import type { ChatHistory, ChatMessage, Conversation, FriendUser } from "@/lib/api";
import { playMessageSound } from "@/lib/chat-sound";
import { useAuthStore } from "./auth-store";

export type ChatPerson = FriendUser;

type ChatWindow = { person: ChatPerson; minimized: boolean };

type History = ChatHistory & { failed?: boolean; loadingOlder?: boolean };

type MessagesState = {
  conversations: Conversation[];
  loaded: boolean;
  failed: boolean;
  histories: Record<number, History>;
  typing: Record<number, boolean>;
  windows: ChatWindow[];
  selected: ChatPerson | null;
  pageOpen: boolean;
  refresh: () => Promise<void>;
  loadHistory: (userId: number) => Promise<void>;
  loadOlder: (userId: number) => Promise<void>;
  send: (userId: number, text: string) => Promise<void>;
  markRead: (userId: number) => void;
  receive: (event: { conversation: Conversation; message: ChatMessage }) => void;
  changed: (event: Partial<Conversation> & { userId: number }) => void;
  removed: (userId: number) => void;
  seen: (event: { userId: number; readAt: string }) => void;
  setTyping: (event: { userId: number; typing: boolean }) => void;
  openChat: (person: ChatPerson) => void;
  closeChat: (userId: number) => void;
  toggleChat: (userId: number) => void;
  select: (person: ChatPerson | null) => void;
  setPageOpen: (open: boolean) => void;
  acceptRequest: (userId: number) => Promise<void>;
  declineRequest: (userId: number) => Promise<void>;
};

const MAX_WINDOWS = 3;
const TYPING_TIMEOUT_MS = 6000;

const empty = {
  conversations: [],
  loaded: false,
  failed: false,
  histories: {},
  typing: {},
  windows: [],
  selected: null,
  pageOpen: false,
};

const viewing = new Set<number>();
const typingTimers = new Map<number, ReturnType<typeof setTimeout>>();

export function markViewing(userId: number, active: boolean) {
  if (active) viewing.add(userId);
  else viewing.delete(userId);
}

export function personOf({ userId, username, name, avatarUrl }: ChatPerson) {
  return { userId, username, name, avatarUrl };
}

function tokenOrThrow() {
  const { token } = useAuthStore.getState();
  if (!token) throw new Error("Please log in again.");
  return token;
}

function appendMessage(history: History | undefined, message: ChatMessage) {
  if (!history || history.messages.some(({ id }) => id === message.id)) return history;
  return { ...history, messages: [...history.messages, message] };
}

export const useMessagesStore = create<MessagesState>()((set, get) => {
  function patchHistory(userId: number, patch: (history: History) => History | undefined) {
    const history = get().histories[userId];
    const next = history && patch(history);
    if (next && next !== history) {
      set(({ histories }) => ({ histories: { ...histories, [userId]: next } }));
    }
  }

  function patchConversation(userId: number, patch: Partial<Conversation>) {
    set(({ conversations }) => ({
      conversations: conversations.map((conversation) =>
        conversation.userId === userId ? { ...conversation, ...patch } : conversation,
      ),
    }));
  }

  return {
    ...empty,
    refresh: async () => {
      const { token } = useAuthStore.getState();
      if (!token) return;

      try {
        const conversations = await api.getConversations(token);
        set({ conversations, histories: {}, loaded: true, failed: false });
      } catch {
        set({ loaded: true, failed: true });
      }
    },
    loadHistory: async (userId) => {
      try {
        const history = await api.getChatHistory(tokenOrThrow(), userId);
        set(({ histories }) => ({ histories: { ...histories, [userId]: history } }));
      } catch {
        set(({ histories }) => ({
          histories: {
            ...histories,
            [userId]: { messages: [], seenAt: null, hasMore: false, failed: true },
          },
        }));
      }
    },
    loadOlder: async (userId) => {
      const history = get().histories[userId];
      if (!history?.hasMore || history.loadingOlder || history.messages.length === 0) return;

      patchHistory(userId, (current) => ({ ...current, loadingOlder: true }));
      try {
        const older = await api.getChatHistory(
          tokenOrThrow(),
          userId,
          history.messages[0].id,
        );
        patchHistory(userId, (current) => ({
          ...current,
          messages: [...older.messages, ...current.messages],
          hasMore: older.hasMore,
          loadingOlder: false,
        }));
      } catch {
        patchHistory(userId, (current) => ({ ...current, loadingOlder: false }));
      }
    },
    send: async (userId, text) => {
      const message = await api.sendMessage(tokenOrThrow(), userId, text);
      patchHistory(userId, (history) => appendMessage(history, message));
    },
    markRead: (userId) => {
      const { token } = useAuthStore.getState();
      if (!token) return;
      patchConversation(userId, { unread: 0 });
      api.markMessagesRead(token, userId).catch(() => null);
    },
    receive: ({ conversation, message }) => {
      const { userId } = conversation;
      set(({ conversations }) => ({
        conversations: [
          conversation,
          ...conversations.filter((current) => current.userId !== userId),
        ],
      }));
      patchHistory(userId, (history) => appendMessage(history, message));

      const incoming = message.senderId === userId;
      if (incoming) get().setTyping({ userId, typing: false });
      if (!incoming || conversation.status !== "accepted") return;

      const { pageOpen, windows } = get();
      if (!pageOpen && !windows.some(({ person }) => person.userId === userId)) {
        get().openChat(personOf(conversation));
      }
      if (document.hidden || !viewing.has(userId)) playMessageSound();
    },
    changed: ({ userId, ...patch }) => patchConversation(userId, patch),
    removed: (userId) => {
      set(({ conversations, histories }) => {
        const rest = { ...histories };
        delete rest[userId];
        return {
          conversations: conversations.filter((conversation) => conversation.userId !== userId),
          histories: rest,
        };
      });
      get().closeChat(userId);
      if (get().selected?.userId === userId) set({ selected: null });
    },
    seen: ({ userId, readAt }) =>
      patchHistory(userId, (history) => ({ ...history, seenAt: readAt })),
    setTyping: ({ userId, typing }) => {
      clearTimeout(typingTimers.get(userId));
      typingTimers.delete(userId);
      if (typing) {
        typingTimers.set(
          userId,
          setTimeout(() => get().setTyping({ userId, typing: false }), TYPING_TIMEOUT_MS),
        );
      }
      if ((get().typing[userId] ?? false) !== typing) {
        set((state) => ({ typing: { ...state.typing, [userId]: typing } }));
      }
    },
    openChat: (person) =>
      set(({ windows }) => {
        if (windows.some((window) => window.person.userId === person.userId)) {
          return {
            windows: windows.map((window) =>
              window.person.userId === person.userId
                ? { ...window, minimized: false }
                : window,
            ),
          };
        }
        return {
          windows: [{ person, minimized: false }, ...windows].slice(0, MAX_WINDOWS),
        };
      }),
    closeChat: (userId) =>
      set(({ windows }) => ({
        windows: windows.filter(({ person }) => person.userId !== userId),
      })),
    toggleChat: (userId) =>
      set(({ windows }) => ({
        windows: windows.map((window) =>
          window.person.userId === userId
            ? { ...window, minimized: !window.minimized }
            : window,
        ),
      })),
    select: (selected) => set({ selected }),
    setPageOpen: (pageOpen) => set({ pageOpen }),
    acceptRequest: async (userId) => {
      await api.acceptMessageRequest(tokenOrThrow(), userId);
      patchConversation(userId, { status: "accepted" });
    },
    declineRequest: async (userId) => {
      await api.declineMessageRequest(tokenOrThrow(), userId);
      get().removed(userId);
    },
  };
});

useAuthStore.subscribe(({ token }) => {
  if (token) return;

  viewing.clear();
  typingTimers.forEach((timer) => clearTimeout(timer));
  typingTimers.clear();
  useMessagesStore.setState(empty);
});
