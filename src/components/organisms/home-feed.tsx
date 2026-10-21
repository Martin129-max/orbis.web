"use client";

import { Select } from "antd";
import { useState } from "react";
import { createPost, getFeed } from "@/lib/api";
import { usePaged } from "@/lib/use-paged";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { PostComposer } from "./post-composer";
import { PostList } from "./post-list";

export function HomeFeed() {
  const feed = usePaged(getFeed);
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
    feed.prepend(post);
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
        showCommunity
        feed={feed}
        empty="Posts from your communities will show up here."
      />
    </div>
  );
}
