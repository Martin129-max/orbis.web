"use client";

import { MessagesSquare, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  getMembers,
  searchCommunity,
  type FeedEntry,
  type FeedItem,
  type Member,
} from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { DiscussionModal } from "./discussion-modal";
import { PersonRow } from "./person-row";

const MEMBER_LIMIT = 8;

function plainText(html: string) {
  return new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
}

function memberMatches(member: Member, query: string) {
  const needle = query.toLowerCase();
  return [member.username, member.name, member.nickname].some((value) =>
    value?.toLowerCase().includes(needle),
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="px-2 text-[11px] font-bold text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

function ContentRow({ item, onOpen }: { item: FeedItem; onOpen: () => void }) {
  const text = plainText(item.content);

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-rail-item"
      >
        <span className="mt-0.5 shrink-0 text-muted" aria-hidden>
          {item.type === "thread" ? <MessagesSquare size={16} /> : <Newspaper size={16} />}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">
            {item.type === "thread" ? item.title : displayName(item.author)}
          </span>
          {text && <span className="line-clamp-2 text-xs text-muted">{text}</span>}
        </span>
      </button>
    </li>
  );
}

function CommunityResults({
  communityId,
  query,
  members,
  onOpen,
}: {
  communityId: number;
  query: string;
  members: Member[];
  onOpen: (item: FeedItem) => void;
}) {
  const [results, setResults] = useState<{ query: string; items: FeedItem[] | null } | null>(
    null,
  );

  useEffect(() => {
    const { token } = useAuthStore.getState();
    let ignore = false;
    searchCommunity(token, communityId, query)
      .then((items) => {
        if (!ignore) setResults({ query, items });
      })
      .catch(() => {
        if (!ignore) setResults({ query, items: null });
      });
    return () => {
      ignore = true;
    };
  }, [communityId, query]);

  if (!results || results.query !== query) {
    return (
      <div className="flex justify-center py-4">
        <Atom.Loader />
      </div>
    );
  }
  if (!results.items) {
    return <Atom.ErrorMessage>Could not search this community.</Atom.ErrorMessage>;
  }

  const threads = results.items.filter((item) => item.type === "thread");
  const posts = results.items.filter((item) => item.type === "post");
  const people = members.filter((member) => memberMatches(member, query)).slice(0, MEMBER_LIMIT);

  if (threads.length + posts.length + people.length === 0) {
    return <p className="py-4 text-center text-sm text-muted">Nothing in this community matches “{query}”.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {threads.length > 0 && (
        <ResultSection title="Threads">
          <ul>
            {threads.map((item) => (
              <ContentRow key={`thread-${item.id}`} item={item} onOpen={() => onOpen(item)} />
            ))}
          </ul>
        </ResultSection>
      )}
      {posts.length > 0 && (
        <ResultSection title="Posts">
          <ul>
            {posts.map((item) => (
              <ContentRow key={`post-${item.id}`} item={item} onOpen={() => onOpen(item)} />
            ))}
          </ul>
        </ResultSection>
      )}
      {people.length > 0 && (
        <ResultSection title="Members">
          <ul className="px-2">
            {people.map((member) => (
              <PersonRow
                key={member.userId}
                person={member}
                label={member.nickname ?? displayName(member)}
              />
            ))}
          </ul>
        </ResultSection>
      )}
    </div>
  );
}

export function CommunityContentSearch({
  communityId,
  communityName,
}: {
  communityId: number;
  communityName: string;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState<FeedEntry | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    getMembers(token, communityId)
      .then(setMembers)
      .catch(() => null);
  }, [communityId]);

  return (
    <>
      <Molecule.HeaderSearch
        label={`Search ${communityName}`}
        placeholder={`Search ${communityName}…`}
        renderResults={(search) => (
          <CommunityResults
            communityId={communityId}
            query={search}
            members={members}
            onOpen={setOpen}
          />
        )}
      />
      <DiscussionModal item={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </>
  );
}
