"use client";

import { Modal, Segmented } from "antd";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  createThread,
  getThreads,
  type ThreadSort,
} from "@/lib/api";
import { usePaged } from "@/lib/use-paged";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
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
    { types: ["thread"] },
  );

  return (
    <PostList
      feed={feed}
      empty={{
        title: "No threads yet.",
        description:
          "Start a thread to begin a discussion in this community.",
      }}
      end={<Molecule.FeedEnd label="That’s every thread" />}
    />
  );
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
  const communityName = useCommunityStore(
    (state) =>
      state.communities.find((community) => community.id === communityId)
        ?.name,
  );

  async function handlePost(content: string, linkUrl?: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");
    if (!title.trim()) throw new Error("Add a title for your thread.");

    await createThread(token, communityId, { title: title.trim(), content, linkUrl });
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
      width={640}
      destroyOnHidden
      title={null}
      styles={{ container: { padding: 24 } }}
    >
      <div className="flex flex-col gap-6">
        <Molecule.ModalHeader
          eyebrow={`${communityName ?? "Community"} / New thread`}
          title="Start a new thread."
          description="Ask a question or start a discussion with this community."
        />
        <Molecule.FormField
          label="Title"
          size="large"
          maxLength={300}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold">Body (optional)</p>
          <PostComposer
            allowEmpty
            linkPreview
            onCancel={close}
            placeholder="Add details or context…"
            submitLabel="Post thread"
            onPost={handlePost}
            onPosted={() => {
              setTitle("");
              onCreated();
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export function CommunityForum({ communityId }: { communityId: number }) {
  const [sort, setSort] = useState<ThreadSort>("hot");
  const [version, setVersion] = useState(0);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<ThreadSort>
          aria-label="Sort threads"
          options={sorts}
          value={sort}
          onChange={setSort}
        />
        <Atom.Button size="large" onClick={() => setCreating(true)}>
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
