"use client";

import { Select } from "antd";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { createPost, getFeed, type Post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { PostCard } from "./post-card";
import { PostComposer } from "./post-composer";

export function HomeFeed() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const communities = useCommunityStore((state) => state.communities);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const target =
    communities.find((community) => community.id === selectedId) ??
    communities[0];

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    getFeed(token)
      .then((result) => {
        setFailed(false);
        setPosts(result);
      })
      .catch(() => setFailed(true));
  }, [attempt]);

  async function handlePost(content: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");
    if (!target) throw new Error("Choose a community to post in.");

    const post = await createPost(token, target.id, content);
    setPosts((current) => [
      { ...post, community: { id: target.id, name: target.name } },
      ...(current ?? []),
    ]);
  }

  const feed = failed && !posts ? (
    <div className="py-16">
      <Molecule.ConnectionError
        onRetry={() => {
          setFailed(false);
          setAttempt((count) => count + 1);
        }}
      />
    </div>
  ) : !posts ? (
    <div className="flex py-16">
      <Atom.Loader />
    </div>
  ) : posts.length === 0 ? (
    <div className="flex flex-col items-center gap-1 py-16 text-center">
      <p className="font-medium">No posts yet</p>
      <p className="text-sm text-muted">
        Posts from your communities will show up here.
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {target && (
        <PostComposer
          onPost={handlePost}
          target={
            <Select
              aria-label="Community"
              value={target.id}
              onChange={setSelectedId}
              options={communities.map((community) => ({
                value: community.id,
                label: community.name,
              }))}
              popupMatchSelectWidth={false}
              className="w-48 max-w-full"
            />
          }
        />
      )}
      {feed}
    </div>
  );
}
