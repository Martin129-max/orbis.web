"use client";

import { Select } from "antd";
import { useState } from "react";
import { createPost } from "@/lib/api";
import { usePagedPosts } from "@/lib/use-paged-posts";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { PostComposer } from "./post-composer";
import { PostList } from "./post-list";

export function HomeFeed() {
  const feed = usePagedPosts();
  const communities = useCommunityStore((state) => state.communities);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const target =
    communities.find((community) => community.id === selectedId) ??
    communities[0];

  async function handlePost(content: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");
    if (!target) throw new Error("Choose a community to post in.");

    const post = await createPost(token, target.id, content);
    feed.prepend({ ...post, community: { id: target.id, name: target.name } });
  }

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
      <PostList
        feed={feed}
        empty="Posts from your communities will show up here."
      />
    </div>
  );
}
