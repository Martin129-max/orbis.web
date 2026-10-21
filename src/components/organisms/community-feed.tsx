"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { createPost, getPosts, type Post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { PostCard } from "./post-card";
import { PostComposer } from "./post-composer";

export function CommunityFeed({ communityId }: { communityId: number }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    getPosts(token, communityId)
      .then((result) => {
        setFailed(false);
        setPosts(result);
      })
      .catch(() => setFailed(true));
  }, [communityId, attempt]);

  async function handlePost(content: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const post = await createPost(token, communityId, content);
    setPosts((current) => [post, ...(current ?? [])]);
  }

  return (
    <div className="flex flex-col gap-4">
      <PostComposer onPost={handlePost} />
      {failed && !posts ? (
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
            Be the first to share something.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
