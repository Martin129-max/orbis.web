"use client";

import { Modal } from "antd";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { FeedItem, Thread } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";
import { castVote } from "@/lib/votes";
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
          {displayName(thread.author)} · {timeAgo(thread.createdAt)}
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
      </div>
    </article>
  );
}

export function DiscussionModal({
  item,
  onClose,
  onChange,
}: {
  item: FeedItem | null;
  onClose: () => void;
  onChange: (item: FeedItem) => void;
}) {
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
            eyebrow={`${item.community.name} / ${item.type === "thread" ? "Forum" : "Feed"}`}
            title="The discussion"
          />
          {item.type === "thread" ? (
            <ThreadDetail thread={item} onChange={onChange} />
          ) : (
            <PostCard post={item} showCommunity />
          )}
          <CommentSection
            key={`${item.type}-${item.id}`}
            target={{ type: item.type, id: item.id }}
            onCountChange={(commentCount) => onChange({ ...item, commentCount })}
          />
        </div>
      )}
    </Modal>
  );
}
