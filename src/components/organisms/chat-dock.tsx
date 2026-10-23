"use client";

import { Tooltip } from "antd";
import { MessageCircle, Minus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Atom from "@atom";
import { displayName } from "@/lib/display-name";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { useAuthStore } from "@/stores/auth-store";
import { personOf, useMessagesStore, type ChatPerson } from "@/stores/messages-store";
import { ChatConversation } from "./chat-conversation";

export function useStartChat() {
  const router = useRouter();
  const desktop = useIsDesktop();

  return (person: ChatPerson) => {
    const { pageOpen, select, openChat } = useMessagesStore.getState();
    if (desktop && !pageOpen) {
      openChat(person);
      return;
    }
    select(person);
    if (!pageOpen) router.push("/?tab=messages");
  };
}

export function MessageButton({
  person,
  compact = false,
}: {
  person: ChatPerson;
  compact?: boolean;
}) {
  const startChat = useStartChat();
  const label = `Message ${displayName(person)}`;

  if (compact) {
    return (
      <Tooltip title="Message">
        <button
          type="button"
          aria-label={label}
          onClick={() => startChat(personOf(person))}
          className="icon-button"
        >
          <MessageCircle size={16} />
        </button>
      </Tooltip>
    );
  }
  return (
    <Atom.Button
      size="small"
      variant="secondary"
      aria-label={label}
      icon={<MessageCircle size={14} />}
      onClick={() => startChat(personOf(person))}
      className="shrink-0"
    >
      Message
    </Atom.Button>
  );
}

export function ChatDock() {
  const profile = useAuthStore((state) => state.profile);
  const windows = useMessagesStore((state) => state.windows);
  const pageOpen = useMessagesStore((state) => state.pageOpen);

  if (!profile || pageOpen || windows.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-24 bottom-0 z-40 hidden flex-row-reverse items-end gap-3 lg:flex">
      {windows.map(({ person, minimized }) => (
        <ChatWindow
          key={person.userId}
          person={person}
          minimized={minimized}
        />
      ))}
    </div>
  );
}

function ChatWindow({
  person,
  minimized,
}: {
  person: ChatPerson;
  minimized: boolean;
}) {
  const toggleChat = useMessagesStore((state) => state.toggleChat);
  const closeChat = useMessagesStore((state) => state.closeChat);
  const unread = useMessagesStore(
    (state) =>
      state.conversations.find(({ userId }) => userId === person.userId)?.unread ?? 0,
  );
  const name = displayName(person);

  return (
    <section
      aria-label={`Chat with ${name}`}
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-t-2xl border border-b-0 border-divider bg-surface shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ${
        minimized ? "w-60" : "h-[440px] max-h-[calc(100dvh-5rem)] w-[328px]"
      }`}
    >
      <header className="flex shrink-0 items-center gap-1 border-b border-divider py-1.5 pr-1.5 pl-2">
        <button
          type="button"
          onClick={() => toggleChat(person.userId)}
          aria-expanded={!minimized}
          className="focus-ring flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg p-1 text-left hover:bg-rail-item"
        >
          <Atom.Avatar label={name} src={person.avatarUrl} seed={person.userId} size="sm" />
          <span className="truncate text-sm font-semibold">{name}</span>
          {minimized && unread > 0 && (
            <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] leading-[18px] font-bold text-accent-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
        {!minimized && (
          <>
            <Link
              href={`/users/${person.username}`}
              className="focus-ring rounded-md px-1.5 py-1 text-xs text-muted hover:text-accent"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => toggleChat(person.userId)}
              aria-label={`Minimize chat with ${name}`}
              className="icon-button"
            >
              <Minus size={16} />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => closeChat(person.userId)}
          aria-label={`Close chat with ${name}`}
          className="icon-button"
        >
          <X size={16} />
        </button>
      </header>
      {!minimized && <ChatConversation person={person} active />}
    </section>
  );
}
