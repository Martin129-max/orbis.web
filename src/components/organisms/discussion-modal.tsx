"use client";

import { Modal } from "antd";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { FeedEntry, Thread } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";
import { castVote } from "@/lib/votes";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { ActivityCard } from "./activity-card";
import { CommentSection } from "./comment-section";
import { PostCard } from "./post-card";


function ThreadDetail({
  thread,
  onChange,
}: {
  thread: Thread;
  onChange: (thread: Thread) => void;
}) {
  return (
    <article className="flex gap-4">
      <Molecule.VoteControl
        symbols="thumbs"
        score={thread.score}
        myVote={thread.myVote}
        onVote={(value) =>
          castVote({ type: "thread", id: thread.id }, thread, value, (result) =>
            onChange({ ...thread, ...result }),
          )
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="flex items-center gap-2 text-xs text-muted">
          <Atom.Avatar
            size="xs"
            label={displayName(thread.author)}
            src={thread.author.avatarUrl}
            seed={thread.author.id}
          />
          <Molecule.UserLink username={thread.author.username}>
            {displayName(thread.author)}
          </Molecule.UserLink>
          · {timeAgo(thread.createdAt)}
        </p>
        <h3 className="font-display text-3xl leading-[1.04] font-bold sm:text-4xl">
          {thread.title}
        </h3>
        {thread.content && (
          <div
            className="rich-text"
            dangerouslySetInnerHTML={{ __html: thread.content }}
          />
        )}
        {thread.linkUrl && <Molecule.LinkPreview url={thread.linkUrl} />}
      </div>
    </article>
  );
}

export function DiscussionModal({
  item,
  onClose,
  onChange,
}: {
  item: FeedEntry | null;
  onClose: () => void;
  onChange: (item: FeedEntry) => void;
}) {
  const communityId = item && item.type !== "activity" ? item.communityId : null;
  const signedIn = useAuthStore((state) => Boolean(state.token));
  const member = useCommunityStore(
    (state) =>
      communityId === null ||
      state.communities.some(({ id }) => id === communityId),
  );
  const canComment = signedIn && member;

  return (
    <Modal
      open={item !== null}
      onCancel={onClose}
      footer={null}
      width={840}
      destroyOnHidden
      title={null}
      styles={{ container: { padding: 32 } }}
    >
      {item && (
        <div className="flex flex-col gap-6">
          <Molecule.ModalHeader
            eyebrow={
              item.type === "activity"
                ? `${displayName(item.author)} / Library`
                : item.community
                  ? `${item.community.name} / ${item.type === "thread" ? "Threads" : "Feed"}`
                  : `${item.type === "post" && item.wallUser ? displayName(item.wallUser) : "Profile"} / Wall`
            }
            title="The discussion"
          />
          {item.type === "thread" ? (
            <ThreadDetail thread={item} onChange={onChange} />
          ) : item.type === "activity" ? (
            <ActivityCard activity={item} onChange={onChange} preview={false} />
          ) : (
            <PostCard post={item} showCommunity onChange={onChange} preview={false} />
          )}
          <CommentSection
            key={`${item.type}-${item.id}`}
            target={{ type: item.type, id: item.id }}
            canComment={canComment}
            onCommentsChange={(comments) =>
              onChange({
                ...item,
                commentCount: comments.length,
                previewComments: comments
                  .filter((comment) => comment.parentId === null)
                  .slice(-3),
              })
            }
          />
        </div>
      )}
    </Modal>
  );
}
