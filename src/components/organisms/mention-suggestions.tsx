"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import * as Atom from "@atom";
import { searchPeople, type FriendUser } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";

const SEARCH_DELAY_MS = 200;
const MAX_SUGGESTIONS = 5;
const MENTION_QUERY = /(?:^|[\s(])@(\w{0,20})$/;

type Match = { query: string; from: number; to: number };

function findMatch(editor: Editor): Match | null {
  const { selection } = editor.state;
  if (!selection.empty || editor.isActive("code") || editor.isActive("codeBlock")) return null;
  if (editor.isActive("link")) return null;

  const { $from } = selection;
  const before = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - 22),
    $from.parentOffset,
    undefined,
    "￼",
  );
  const found = MENTION_QUERY.exec(before);
  if (!found) return null;
  return { query: found[1], from: selection.from - found[1].length - 1, to: selection.from };
}

export function useMentionSuggestions(editor: Editor | null) {
  const listId = useId();
  const [match, setMatch] = useState<Match | null>(null);
  const [results, setResults] = useState<{ query: string; people: FriendUser[] } | null>(null);
  const [active, setActive] = useState(0);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [, setScrolled] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const next = editor.isFocused ? findMatch(editor) : null;
      setMatch((current) =>
        current?.query === next?.query && current?.from === next?.from ? current : next,
      );
    };
    const close = () => setMatch(null);
    editor.on("selectionUpdate", update);
    editor.on("update", update);
    editor.on("focus", update);
    editor.on("blur", close);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("update", update);
      editor.off("focus", update);
      editor.off("blur", close);
    };
  }, [editor]);

  const query = match && match.query.length >= 2 && match.from !== dismissedAt ? match.query : null;

  useEffect(() => {
    if (!query) return;
    const { token } = useAuthStore.getState();
    if (!token) return;
    let current = true;
    const timer = setTimeout(() => {
      searchPeople(token, query)
        .then((people) => {
          if (!current) return;
          setResults({ query, people: people.slice(0, MAX_SUGGESTIONS) });
          setActive(0);
        })
        .catch(() => undefined);
    }, SEARCH_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  const people = query && results?.query === query ? results.people : [];
  const open = Boolean(editor && match && people.length > 0);

  useEffect(() => {
    if (!open) return;
    const refresh = () => setScrolled((count) => count + 1);
    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
    };
  }, [open]);

  useEffect(() => {
    const dom = editor?.view.dom;
    if (!dom) return;
    if (open) {
      dom.setAttribute("aria-controls", listId);
      dom.setAttribute("aria-activedescendant", `${listId}-${active}`);
    } else {
      dom.removeAttribute("aria-controls");
      dom.removeAttribute("aria-activedescendant");
    }
  }, [editor, open, active, listId]);

  function pick(person: FriendUser) {
    if (!editor || !match) return;
    editor
      .chain()
      .focus()
      .insertContentAt({ from: match.from, to: match.to }, `@${person.username} `)
      .run();
    setMatch(null);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!open || !match || event.metaKey || event.ctrlKey || event.altKey) return false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + people.length) % people.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      pick(people[Math.min(active, people.length - 1)]);
    } else if (event.key === "Escape") {
      setDismissedAt(match.from);
    } else {
      return false;
    }
    event.stopPropagation();
    return true;
  }

  let popup = null;
  if (open && editor && match) {
    const caret = editor.view.coordsAtPos(match.from);
    const below = caret.bottom + 240 < window.innerHeight;
    popup = createPortal(
      <ul
        id={listId}
        role="listbox"
        aria-label="People to mention"
        style={{
          left: Math.min(caret.left, window.innerWidth - 272),
          ...(below
            ? { top: caret.bottom + 6 }
            : { bottom: window.innerHeight - caret.top + 6 }),
        }}
        className="fixed z-[1100] flex w-64 flex-col gap-0.5 rounded-lg border border-divider bg-surface p-1 shadow-lg"
      >
        {people.map((person, index) => (
          <li
            key={person.userId}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActive(index)}
            onClick={() => pick(person)}
            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 ${
              index === active ? "bg-accent-soft" : ""
            }`}
          >
            <Atom.Avatar
              size="sm"
              label={displayName(person)}
              src={person.avatarUrl}
              seed={person.userId}
            />
            <span className="flex min-w-0 flex-col">
              <span className="flex min-w-0 items-center gap-1 text-sm font-semibold">
                <span className="truncate">{displayName(person)}</span>
                {person.isVerified && <Atom.VerifiedBadge />}
              </span>
              <span className="truncate text-xs text-muted">@{person.username}</span>
            </span>
          </li>
        ))}
      </ul>,
      document.body,
    );
  }

  return { handleKeyDown, popup };
}
