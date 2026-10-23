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
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { emitTyping } from "@/stores/friends-store";
import { markViewing, useMessagesStore, type ChatPerson } from "@/stores/messages-store";

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

export function ChatConversation({
  person,
  active,
}: {
  person: ChatPerson;
  active: boolean;
}) {
  const me = useAuthStore((state) => state.profile?.userId);
  const loaded = useMessagesStore((state) => state.loaded);
  const failed = useMessagesStore((state) => state.failed);

  if (!me || !loaded) {
    return (
      <div className="flex flex-1">
        <Atom.Loader />
      </div>
    );
  }
  if (failed) {
    return (
      <p className="m-auto max-w-[240px] p-4 text-center text-[13px] text-muted">
        Messages aren’t available right now. Try again in a little while.
      </p>
    );
  }
  return <Conversation key={person.userId} me={me} person={person} active={active} />;
}

function Conversation({
  me,
  person,
  active,
}: {
  me: number;
  person: ChatPerson;
  active: boolean;
}) {
  const { userId } = person;
  const history = useMessagesStore((state) => state.histories[userId]);
  const conversation = useMessagesStore((state) =>
    state.conversations.find((current) => current.userId === userId),
  );
  const typing = useMessagesStore((state) => state.typing[userId] ?? false);
  const loadHistory = useMessagesStore((state) => state.loadHistory);
  const loadOlder = useMessagesStore((state) => state.loadOlder);
  const markRead = useMessagesStore((state) => state.markRead);
  const visible = usePageVisible();
  const list = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const restoreFrom = useRef<number | null>(null);
  const name = displayName(person);
  const viewing = active && visible;
  const unread = conversation?.unread ?? 0;
  const request = conversation?.status === "request";
  const messages = history?.messages;
  const missing = history === undefined;

  useEffect(() => {
    if (missing) loadHistory(userId);
  }, [missing, loadHistory, userId]);

  useEffect(() => {
    markViewing(userId, viewing);
    return () => markViewing(userId, false);
  }, [userId, viewing]);

  useEffect(() => {
    if (viewing && unread > 0) markRead(userId);
  }, [viewing, unread, markRead, userId]);

  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    if (restoreFrom.current !== null) {
      element.scrollTop = element.scrollHeight - restoreFrom.current;
      restoreFrom.current = null;
    } else if (atBottom.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, typing]);

  function handleScroll() {
    const element = list.current!;
    atBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
    if (element.scrollTop < 48 && history?.hasMore && !history.loadingOlder) {
      restoreFrom.current = element.scrollHeight - element.scrollTop;
      loadOlder(userId);
    }
  }

  const latest = messages?.at(-1);
  const seen =
    latest !== undefined &&
    latest.senderId === me &&
    history?.seenAt != null &&
    new Date(history.seenAt) >= new Date(latest.sentAt);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={list}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3"
      >
        {messages === undefined ? (
          <Atom.Loader />
        ) : history?.failed ? (
          <p className="m-auto text-center text-[13px] text-muted">
            Couldn’t load this chat. Try again in a little while.
          </p>
        ) : messages.length === 0 ? (
          <div className="m-auto flex flex-col items-center gap-2 py-6 text-center">
            <Atom.Avatar label={name} src={person.avatarUrl} seed={userId} size="lg" />
            <p className="font-semibold">{name}</p>
            <p className="text-[13px] text-muted">Say hi to start the conversation.</p>
          </div>
        ) : (
          <ol className="mt-auto flex flex-col gap-0.5">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const next = messages[index + 1];
              const mine = message.senderId === me;
              const sentAt = new Date(message.sentAt).getTime();
              const showTime =
                !previous || sentAt - new Date(previous.sentAt).getTime() > TIME_GAP_MS;
              const endsGroup =
                !next ||
                next.senderId !== message.senderId ||
                new Date(next.sentAt).getTime() - sentAt > TIME_GAP_MS;
              return (
                <li key={message.id} className="flex flex-col">
                  {showTime && (
                    <p className="my-2 text-center text-[11px] text-muted">
                      {formatTime(message.sentAt)}
                    </p>
                  )}
                  <div
                    className={`flex items-end gap-2 ${mine ? "justify-end" : ""} ${
                      endsGroup ? "mb-1.5" : ""
                    }`}
                  >
                    {!mine && (
                      <span className={`w-5 shrink-0 ${endsGroup ? "" : "invisible"}`}>
                        <Atom.Avatar label={name} src={person.avatarUrl} seed={userId} size="xs" />
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
                </li>
              );
            })}
            {seen && <li className="-mt-0.5 mb-1 text-right text-[11px] text-muted">Seen</li>}
            {typing && (
              <li className="flex items-end gap-2" aria-label={`${name} is typing`}>
                <span className="w-5 shrink-0">
                  <Atom.Avatar label={name} src={person.avatarUrl} seed={userId} size="xs" />
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
      {request && <RequestBanner person={person} />}
      <Composer person={person} />
    </div>
  );
}

function RequestBanner({ person }: { person: ChatPerson }) {
  const acceptRequest = useMessagesStore((state) => state.acceptRequest);
  const declineRequest = useMessagesStore((state) => state.declineRequest);
  const [error, setError] = useState<string | null>(null);

  function run(action: (userId: number) => Promise<void>) {
    setError(null);
    action(person.userId).catch((cause: Error) => setError(cause.message));
  }

  return (
    <div className="flex flex-col gap-2 border-t border-divider px-3 py-3 text-[13px]">
      <p className="text-muted">
        {displayName(person)} isn’t one of your friends. Accept to move this chat into your chats,
        or delete the request.
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

function Composer({ person }: { person: ChatPerson }) {
  const { userId } = person;
  const send = useMessagesStore((state) => state.send);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const lastTyping = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function stopTyping() {
    clearTimeout(idle.current);
    if (lastTyping.current === 0) return;
    lastTyping.current = 0;
    emitTyping(userId, false);
  }

  useEffect(() => {
    const sent = lastTyping;
    const timer = idle;
    return () => {
      clearTimeout(timer.current);
      if (sent.current !== 0) emitTyping(userId, false);
    };
  }, [userId]);

  function handleChange(value: string) {
    setText(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    if (Date.now() - lastTyping.current > TYPING_REPEAT_MS) {
      lastTyping.current = Date.now();
      emitTyping(userId, true);
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
      await send(userId, message);
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
          aria-label={`Message ${displayName(person)}`}
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
