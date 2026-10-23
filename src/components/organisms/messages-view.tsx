"use client";

import { Segmented } from "antd";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";
import type { Conversation } from "@/lib/api";
import { personOf, useMessagesStore } from "@/stores/messages-store";
import { ChatConversation } from "./chat-conversation";

type Folder = "chats" | "requests";

export function MessagesView() {
  const conversations = useMessagesStore((state) => state.conversations);
  const loaded = useMessagesStore((state) => state.loaded);
  const selected = useMessagesStore((state) => state.selected);
  const select = useMessagesStore((state) => state.select);
  const setPageOpen = useMessagesStore((state) => state.setPageOpen);
  const [folder, setFolder] = useState<Folder>("chats");

  useEffect(() => {
    setPageOpen(true);
    return () => setPageOpen(false);
  }, [setPageOpen]);

  const requests = conversations.filter(({ status }) => status === "request");
  const shown = folder === "requests" ? requests : conversations.filter(({ status }) => status === "accepted");
  const selectedName = selected && displayName(selected);

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div
        className={`min-h-0 w-full shrink-0 flex-col border-divider sm:flex sm:w-80 sm:border-r ${
          selected ? "hidden" : "flex"
        }`}
      >
        <div className="shrink-0 px-4 pt-4 pb-3">
          <Segmented<Folder>
            block
            value={folder}
            onChange={setFolder}
            options={[
              { value: "chats", label: "Chats" },
              {
                value: "requests",
                label: requests.length > 0 ? `Requests (${requests.length})` : "Requests",
              },
            ]}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {!loaded ? (
            <div className="flex py-8">
              <Atom.Loader />
            </div>
          ) : shown.length === 0 ? (
            <p className="px-2 py-6 text-center text-[13px] text-muted">
              {folder === "requests"
                ? "No message requests. Messages from people who aren’t your friends land here first."
                : "No chats yet. Message someone from their profile or your friends list."}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {shown.map((conversation) => (
                <ConversationRow
                  key={conversation.userId}
                  conversation={conversation}
                  active={selected?.userId === conversation.userId}
                  onSelect={() => select(personOf(conversation))}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className={`min-h-0 min-w-0 flex-1 flex-col ${selected ? "flex" : "hidden sm:flex"}`}>
        {selected ? (
          <>
            <div className="flex shrink-0 items-center gap-3 border-b border-divider px-4 py-3">
              <button
                type="button"
                aria-label="Back to chats"
                onClick={() => select(null)}
                className="icon-button sm:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              <Link
                href={`/users/${selected.username}`}
                className="focus-ring flex min-w-0 items-center gap-3 rounded-lg"
              >
                <Atom.Avatar
                  label={selectedName!}
                  src={selected.avatarUrl}
                  seed={selected.userId}
                  size="md"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{selectedName}</span>
                  <span className="truncate text-xs text-muted">@{selected.username}</span>
                </span>
              </Link>
            </div>
            <ChatConversation person={selected} active />
          </>
        ) : (
          <div className="m-auto flex flex-col items-center gap-3 p-6 text-center text-muted">
            <MessageCircle size={32} strokeWidth={1.5} aria-hidden />
            <p className="text-sm">Pick a chat to read it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  const me = useAuthStore((state) => state.profile?.userId);
  const online = useFriendsStore(
    (state) => state.friends.find(({ userId }) => userId === conversation.userId)?.online,
  );
  const name = displayName(conversation);
  const unread = conversation.unread > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={`focus-ring flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
          active ? "bg-rail-item" : "hover:bg-rail-item/60"
        }`}
      >
        <Atom.Avatar
          label={name}
          src={conversation.avatarUrl}
          seed={conversation.userId}
          size="md"
          presence={online === undefined ? undefined : online ? "online" : "offline"}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"}`}>
            {name}
          </span>
          <span className={`flex gap-1 text-xs ${unread ? "font-semibold text-foreground" : "text-muted"}`}>
            <span className="truncate">
              {conversation.lastSenderId === me ? "You: " : ""}
              {conversation.lastText}
            </span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{timeAgo(conversation.lastAt)}</span>
          </span>
        </span>
        {unread && (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </button>
    </li>
  );
}
