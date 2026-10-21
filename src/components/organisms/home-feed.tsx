"use client";

import { Select } from "antd";
import { ChevronDown, CircleCheck } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { createPost, getFeed } from "@/lib/api";
import { usePaged } from "@/lib/use-paged";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { PostComposer } from "./post-composer";
import { PostList } from "./post-list";

export function HomeFeed() {
  const feed = usePaged(getFeed);
  const profile = useAuthStore((state) => state.profile);
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
    <div className="flex flex-col gap-6">
      <Molecule.PageIntro
        title={`Good to see you${profile ? `, ${profile.username}` : ""}.`}
        description="The latest posts and discussions from your communities."
      />
      {target && (
        <PostComposer
          onPost={handlePost}
          placeholder="Share an update with your community…"
          target={
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-divider bg-rail-item font-display text-[17.6px] leading-none font-bold"
              >
                <Atom.CommunityIcon name={target.name} src={target.iconUrl} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs text-muted uppercase">Post to</span>
                <Select
                  aria-label="Community"
                  variant="borderless"
                  size="small"
                  value={target.id}
                  onChange={setSelectedId}
                  suffixIcon={<ChevronDown size={12} />}
                  options={communities.map((community) => ({
                    value: community.id,
                    label: community.name,
                  }))}
                  popupMatchSelectWidth={false}
                  className="-ml-[7px] w-fit max-w-full text-[13px] font-semibold"
                />
              </div>
            </div>
          }
        />
      )}
      <p className="text-xs uppercase">From your communities</p>
      <PostList
        showCommunity
        feed={feed}
        empty={{
          title: "No posts yet.",
          description:
            "Posts and threads from your communities will appear here.",
        }}
        end={
          <Molecule.FeedState
            eyebrow="End of feed"
            icon={<CircleCheck size={24} strokeWidth={1.5} />}
            title="You’re all caught up."
            description="You’ve seen all recent posts and threads from your communities. Explore other communities to find more discussions."
            action={
              <Atom.ButtonLink href="/explore" variant="secondary">
                Explore communities
              </Atom.ButtonLink>
            }
          />
        }
      />
    </div>
  );
}
