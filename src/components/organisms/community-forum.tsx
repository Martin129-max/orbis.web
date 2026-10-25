"use client";

import { Segmented } from "antd";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  createThread,
  getThreads,
  type ThreadSort,
} from "@/lib/api";
import { usePaged } from "@/lib/use-paged";
import { useAuthStore } from "@/stores/auth-store";
import { PostComposer } from "./post-composer";
import { PostList } from "./post-list";

const sorts = [
  { value: "hot", label: "Hot", icon: <Flame size={14} /> },
  { value: "new", label: "New", icon: <Sparkles size={14} /> },
  { value: "top", label: "Top", icon: <TrendingUp size={14} /> },
] satisfies { value: ThreadSort; label: string; icon: React.ReactNode }[];

function ForumThreads({
  communityId,
  sort,
  trailing,
}: {
  communityId: number;
  sort: ThreadSort;
  trailing: ReactNode;
}) {
  const feed = usePaged(
    useCallback(
      (token: string | null, cursor?: string) =>
        getThreads(token, communityId, sort, cursor),
      [communityId, sort],
    ),
    { guest: true, types: ["thread"] },
  );

  return (
    <PostList
      feed={feed}
      trailing={trailing}
      empty={{
        title: "No threads yet.",
        description:
          "Start a thread to begin a discussion in this community.",
      }}
      end={<Molecule.FeedEnd label="That’s every thread" />}
    />
  );
}

function ThreadComposer({
  communityId,
  onCreated,
}: {
  communityId: number;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");

  async function handlePost(content: string, linkUrl?: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");
    if (!title.trim()) throw new Error("Add a title for your thread.");

    await createThread(token, communityId, { title: title.trim(), content, linkUrl });
  }

  return (
    <PostComposer
      allowEmpty
      linkPreview
      placeholder="Add details or context…"
      submitLabel="Post thread"
      target={
        <Atom.Input
          variant="borderless"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={300}
          placeholder="Thread title"
          aria-label="Thread title"
          className="font-display text-2xl font-bold"
        />
      }
      onPost={handlePost}
      onPosted={() => {
        setTitle("");
        onCreated();
      }}
    />
  );
}

export function CommunityForum({
  communityId,
  joinPrompt,
}: {
  communityId: number;
  joinPrompt?: ReactNode;
}) {
  const [sort, setSort] = useState<ThreadSort>("hot");
  const [version, setVersion] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {joinPrompt ?? (
        <ThreadComposer
          communityId={communityId}
          onCreated={() => {
            setSort("new");
            setVersion((count) => count + 1);
          }}
        />
      )}
      <ForumThreads
        key={`${sort}-${version}`}
        communityId={communityId}
        sort={sort}
        trailing={
          <Segmented<ThreadSort>
            aria-label="Sort threads"
            options={sorts}
            value={sort}
            onChange={setSort}
          />
        }
      />
    </div>
  );
}
