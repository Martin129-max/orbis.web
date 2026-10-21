"use client";

import { Modal, Segmented } from "antd";
import { Flame, Plus, Sparkles, TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";
import * as Atom from "@atom";
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
}: {
  communityId: number;
  sort: ThreadSort;
}) {
  const feed = usePaged(
    useCallback(
      (token: string, cursor?: string) =>
        getThreads(token, communityId, sort, cursor),
      [communityId, sort],
    ),
  );

  return <PostList feed={feed} empty="Start the first discussion." />;
}

function NewThreadModal({
  communityId,
  open,
  onClose,
  onCreated,
}: {
  communityId: number;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");

  async function handlePost(content: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");
    if (!title.trim()) throw new Error("Add a title for your thread.");

    await createThread(token, communityId, { title: title.trim(), content });
  }

  function close() {
    setTitle("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      width={680}
      destroyOnHidden
      title="New thread"
    >
      <div className="flex flex-col gap-3 pt-2">
        <Atom.Input
          size="large"
          placeholder="Title"
          aria-label="Thread title"
          maxLength={300}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
        <PostComposer
          allowEmpty
          placeholder="Add more detail (optional)…"
          submitLabel="Post thread"
          onPost={handlePost}
          onPosted={() => {
            setTitle("");
            onCreated();
          }}
        />
      </div>
    </Modal>
  );
}

export function CommunityForum({ communityId }: { communityId: number }) {
  const [sort, setSort] = useState<ThreadSort>("hot");
  const [version, setVersion] = useState(0);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<ThreadSort>
          aria-label="Sort threads"
          options={sorts}
          value={sort}
          onChange={setSort}
        />
        <Atom.Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
          New thread
        </Atom.Button>
      </div>
      <ForumThreads
        key={`${sort}-${version}`}
        communityId={communityId}
        sort={sort}
      />
      <NewThreadModal
        communityId={communityId}
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => {
          setCreating(false);
          setSort("new");
          setVersion((count) => count + 1);
        }}
      />
    </div>
  );
}
