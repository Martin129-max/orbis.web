"use client";

import { SendHorizontal } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import * as Atom from "@atom";
import type { ChatMember, ChatMessage, Conversation as Chat } from "@/lib/api";
import { chatTitle } from "@/lib/chat";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { emitTyping } from "@/stores/friends-store";
import { markViewing, useMessagesStore } from "@/stores/messages-store";

const TYPING_IDLE_MS = 3000;
const TYPING_REPEAT_MS = 2000;
const TIME_GAP_MS = 60 * 60 * 1000;
const MESSAGE_MAX_LENGTH = 2000;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

function formatTime(sentAt: string) {
  return new Date(sentAt).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function readersByMessage(messages: ChatMessage[], members: ChatMember[]) {
  const readers = new Map<number, ChatMember[]>();
  for (const member of members) {
    if (!member.readAt) continue;
    const readAt = new Date(member.readAt).getTime();
    const last = messages.findLast(
      (message) => !message.system && new Date(message.sentAt).getTime() <= readAt,
    );
    if (last) readers.set(last.id, [...(readers.get(last.id) ?? []), member]);
  }
  return readers;
}

export function ChatConversation({ id, active }: { id: number; active: boolean }) {
  const me = useAuthStore((state) => state.profile?.userId);
  const loaded = useMessagesStore((state) => state.loaded);
  const failed = useMessagesStore((state) => state.failed);
  const conversation = useMessagesStore((state) =>
    state.conversations.find((current) => current.id === id),
  );

  if (!me || !loaded) {
    return (
      <div className="flex flex-1">
        <Atom.Loader />
      </div>
    );
  }
  if (failed || !conversation) {
    return (
      <p className="m-auto max-w-[240px] p-4 text-center text-[13px] text-muted">
        {failed
          ? "Messages aren’t available right now. Try again in a little while."
          : "This chat isn’t available anymore."}
      </p>
    );
  }
  return <Conversation key={id} me={me} conversation={conversation} active={active} />;
}

function Conversation({
  me,
  conversation,
  active,
}: {
  me: number;
  conversation: Chat;
  active: boolean;
}) {
  const { id, isGroup, members, unread } = conversation;
  const history = useMessagesStore((state) => state.histories[id]);
  const typers = useMessagesStore((state) => state.typing[id]);
  const loadHistory = useMessagesStore((state) => state.loadHistory);
  const loadOlder = useMessagesStore((state) => state.loadOlder);
  const markRead = useMessagesStore((state) => state.markRead);
  const visible = usePageVisible();
  const list = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const restoreFrom = useRef<number | null>(null);
  const viewing = active && visible;
  const request = conversation.status === "request";
  const messages = history?.messages;
  const missing = history === undefined;
  const typing = members.filter(({ userId }) => typers?.includes(userId));
  const nameOf = (userId: number, fallback: string) =>
    userId === me ? "You" : fallback;

  useEffect(() => {
    if (missing) loadHistory(id);
  }, [missing, loadHistory, id]);

  useEffect(() => {
    markViewing(id, viewing);
    return () => markViewing(id, false);
  }, [id, viewing]);

  useEffect(() => {
    if (viewing && unread > 0) markRead(id);
  }, [viewing, unread, markRead, id]);

  useEffect(() => {
    const element = list.current!;
    const observer = new ResizeObserver(() => {
      if (atBottom.current) element.scrollTop = element.scrollHeight;
    });
    observer.observe(element);
    observer.observe(content.current!);
    return () => observer.disconnect();
  }, []);

  const firstId = messages?.[0]?.id;

  useLayoutEffect(() => {
    const element = list.current;
    if (!element || restoreFrom.current === null) return;
    element.scrollTop = element.scrollHeight - restoreFrom.current;
    restoreFrom.current = null;
  }, [firstId]);

  function handleScroll() {
    const element = list.current!;
    atBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
    if (element.scrollTop < 48 && history?.hasMore && !history.loadingOlder) {
      restoreFrom.current = element.scrollHeight - element.scrollTop;
      loadOlder(id);
    }
  }

  const chatted = messages?.filter((message) => !message.system) ?? [];
  const latest = chatted.at(-1);
  const otherReadAt = history?.members[0]?.readAt;
  const seenDirect =
    !isGroup &&
    latest?.senderId === me &&
    otherReadAt != null &&
    new Date(otherReadAt) >= new Date(latest.sentAt);
  const readers = isGroup && messages && history ? readersByMessage(messages, history.members) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={list}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 [overflow-anchor:none]"
      >
        <div ref={content} className="flex flex-1 flex-col">
          {messages === undefined ? (
            <Atom.Loader />
          ) : history?.failed ? (
            <p className="m-auto text-center text-[13px] text-muted">
              Couldn’t load this chat. Try again in a little while.
            </p>
          ) : !isGroup && messages.length === 0 ? (
            <div className="m-auto flex flex-col items-center gap-2 py-6 text-center">
              {members[0] && (
                <Atom.Avatar
                  label={displayName(members[0])}
                  src={members[0].avatarUrl}
                  seed={members[0].userId}
                  size="lg"
                />
              )}
              <p className="font-semibold">{chatTitle(conversation)}</p>
              <p className="text-[13px] text-muted">Say hi to start the conversation.</p>
            </div>
          ) : (
            <ol className="mt-auto flex flex-col gap-0.5">
              {messages.map((message, index) => {
                const previous = messages[index - 1];
                const next = messages[index + 1];
                const sentAt = new Date(message.sentAt).getTime();
                const showTime =
                  !previous || sentAt - new Date(previous.sentAt).getTime() > TIME_GAP_MS;

                if (message.system) {
                  return (
                    <li key={message.id} className="flex flex-col">
                      {showTime && <TimeLabel sentAt={message.sentAt} />}
                      <p className="my-1.5 text-center text-xs text-muted">
                        {nameOf(message.senderId, displayName(message.sender))} {message.text}
                      </p>
                    </li>
                  );
                }

                const mine = message.senderId === me;
                const sameAsPrevious =
                  previous &&
                  !previous.system &&
                  previous.senderId === message.senderId &&
                  !showTime;
                const endsGroup =
                  !next ||
                  next.system ||
                  next.senderId !== message.senderId ||
                  new Date(next.sentAt).getTime() - sentAt > TIME_GAP_MS;
                const seenBy = readers?.get(message.id);
                const senderName = displayName(message.sender);

                return (
                  <li key={message.id} className="flex flex-col">
                    {showTime && <TimeLabel sentAt={message.sentAt} />}
                    {isGroup && !mine && !sameAsPrevious && (
                      <p className="mt-1 mb-0.5 pl-9 text-[11px] text-muted">{senderName}</p>
                    )}
                    <div
                      className={`flex items-end gap-2 ${mine ? "justify-end" : ""} ${
                        endsGroup && !seenBy?.length ? "mb-1.5" : ""
                      }`}
                    >
                      {!mine && (
                        <span className={`w-7 shrink-0 ${endsGroup ? "" : "invisible"}`}>
                          <Atom.Avatar
                            label={senderName}
                            src={message.sender.avatarUrl}
                            seed={message.senderId}
                            size="xs"
                          />
                        </span>
                      )}
                      <p
                        title={formatTime(message.sentAt)}
                        className={`max-w-[78%] rounded-2xl px-3 py-1.5 text-sm whitespace-pre-wrap [overflow-wrap:anywhere] ${
                          mine ? "bg-accent text-accent-foreground" : "bg-rail-item text-foreground"
                        }`}
                      >
                        {message.text}
                      </p>
                    </div>
                    {seenBy && seenBy.length > 0 && (
                      <div
                        className="mt-0.5 mb-1.5 flex justify-end gap-0.5"
                        aria-label={`Seen by ${seenBy.map(displayName).join(", ")}`}
                      >
                        {seenBy.map((reader) => (
                          <span key={reader.userId} title={displayName(reader)}>
                            <Atom.Avatar
                              label={displayName(reader)}
                              src={reader.avatarUrl}
                              seed={reader.userId}
                              size="2xs"
                            />
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
              {seenDirect && (
                <li className="-mt-0.5 mb-1 text-right text-[11px] text-muted">Seen</li>
              )}
              {typing.length > 0 && (
                <li
                  className="flex items-end gap-2"
                  aria-label={`${typing.map(displayName).join(", ")} ${
                    typing.length === 1 ? "is" : "are"
                  } typing`}
                >
                  <span className="flex w-7 shrink-0 -space-x-2">
                    {typing.slice(0, 2).map((typer) => (
                      <Atom.Avatar
                        key={typer.userId}
                        label={displayName(typer)}
                        src={typer.avatarUrl}
                        seed={typer.userId}
                        size="xs"
                      />
                    ))}
                  </span>
                  <span className="flex gap-1 rounded-2xl bg-rail-item px-3 py-2.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        style={{ animationDelay: `${delay}ms` }}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted motion-reduce:animate-none"
                      />
                    ))}
                  </span>
                </li>
              )}
            </ol>
          )}
        </div>
      </div>
      {request && <RequestBanner conversation={conversation} />}
      <Composer conversation={conversation} />
    </div>
  );
}

function TimeLabel({ sentAt }: { sentAt: string }) {
  return <p className="my-2 text-center text-[11px] text-muted">{formatTime(sentAt)}</p>;
}

function RequestBanner({ conversation }: { conversation: Chat }) {
  const acceptRequest = useMessagesStore((state) => state.acceptRequest);
  const declineRequest = useMessagesStore((state) => state.declineRequest);
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: number) => Promise<void>) {
    setError(null);
    action(conversation.id).catch((cause: Error) => setError(cause.message));
  }

  return (
    <div className="flex flex-col gap-2 border-t border-divider px-3 py-3 text-[13px]">
      <p className="text-muted">
        {conversation.isGroup
          ? "You were added to this group by someone who isn’t one of your friends. Accept to join the chat, or delete it."
          : `${chatTitle(conversation)} isn’t one of your friends. Accept to move this chat into your chats, or delete the request.`}
      </p>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      <div className="flex gap-2">
        <Atom.Button size="small" onClick={() => run(acceptRequest)}>
          Accept
        </Atom.Button>
        <Atom.Button size="small" variant="secondary" onClick={() => run(declineRequest)}>
          Delete
        </Atom.Button>
      </div>
    </div>
  );
}

function Composer({ conversation }: { conversation: Chat }) {
  const { id } = conversation;
  const send = useMessagesStore((state) => state.send);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const lastTyping = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function stopTyping() {
    clearTimeout(idle.current);
    if (lastTyping.current === 0) return;
    lastTyping.current = 0;
    emitTyping(id, false);
  }

  useEffect(() => {
    const sent = lastTyping;
    const timer = idle;
    return () => {
      clearTimeout(timer.current);
      if (sent.current !== 0) emitTyping(id, false);
    };
  }, [id]);

  function handleChange(value: string) {
    setText(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    if (Date.now() - lastTyping.current > TYPING_REPEAT_MS) {
      lastTyping.current = Date.now();
      emitTyping(id, true);
    }
    clearTimeout(idle.current);
    idle.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const message = text.trim();
    if (!message) return;

    setText("");
    setError(null);
    stopTyping();
    try {
      await send(id, message);
    } catch (cause) {
      setText((current) => current || message);
      setError((cause as Error).message);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 border-t border-divider p-2">
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MESSAGE_MAX_LENGTH}
          aria-label={`Message ${chatTitle(conversation)}`}
          placeholder="Aa"
          className="focus-ring max-h-32 min-h-9 flex-1 resize-none rounded-2xl bg-rail-item px-3 py-2 text-sm [field-sizing:content] placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!text.trim()}
          className="focus-ring flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-accent transition-colors hover:bg-rail-item disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </form>
  );
}
