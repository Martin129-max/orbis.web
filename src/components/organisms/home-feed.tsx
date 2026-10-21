"use client";

import { Select } from "antd";
import { ArrowDownWideNarrow, ChevronDown, CircleCheck } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { createPost, getFeed } from "@/lib/api";
import { initials } from "@/lib/initials";
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
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-divider bg-rail-item font-display text-[17.6px] leading-none font-bold"
              >
                {initials(target.name)}
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
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="uppercase">From your communities</p>
        <p className="flex items-center gap-2 text-muted">
          <ArrowDownWideNarrow size={16} />
          Newest first
        </p>
      </div>
      <PostList
        showCommunity
        feed={feed}
        empty={{
          title: "Every clubhouse starts with a hello.",
          description:
            "No posts yet. Share your current watchlist, introduce yourself, or ask the question you’ve been saving.",
        }}
        end={
          <Molecule.FeedState
            eyebrow="End of feed / You’re all caught up"
            icon={<CircleCheck size={24} strokeWidth={1.5} />}
            title="Roll the credits."
            description="You’ve seen everything new in your communities. Watch an episode, touch some grass, or discover another little world."
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
