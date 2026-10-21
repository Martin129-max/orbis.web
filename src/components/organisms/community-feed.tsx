"use client";

import { useCallback } from "react";
import { createPost, getPosts } from "@/lib/api";
import { usePaged } from "@/lib/use-paged";
import { useAuthStore } from "@/stores/auth-store";
import { PostComposer } from "./post-composer";
import { PostList } from "./post-list";

export function CommunityFeed({ communityId }: { communityId: number }) {
  const feed = usePaged(
    useCallback(
      (token: string, cursor?: string) => getPosts(token, communityId, cursor),
      [communityId],
    ),
  );

  async function handlePost(content: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    feed.prepend(await createPost(token, communityId, content));
  }

  return (
    <div className="flex flex-col gap-4">
      <PostComposer onPost={handlePost} />
      <PostList feed={feed} empty="Be the first to share something." />
    </div>
  );
}
