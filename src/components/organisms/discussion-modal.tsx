"use client";

import { Modal } from "antd";
import * as Molecule from "@molecule";
import type { FeedItem, Thread } from "@/lib/api";
import { castVote } from "@/lib/votes";
import { CommentSection } from "./comment-section";
import { PostCard } from "./post-card";
import { ThreadMeta } from "./thread-card";

function ThreadDetail({
  thread,
  onChange,
}: {
  thread: Thread;
  onChange: (thread: Thread) => void;
}) {
  return (
    <article className="flex gap-3">
      <Molecule.VoteControl
        score={thread.score}
        myVote={thread.myVote}
        onVote={(value) =>
          castVote({ type: "thread", id: thread.id }, thread, value, (result) =>
            onChange({ ...thread, ...result }),
          )
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <ThreadMeta thread={thread} showCommunity />
        <h2 className="text-xl font-semibold">{thread.title}</h2>
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
      width={760}
      destroyOnHidden
      title={item?.type === "thread" ? "Thread" : "Post"}
    >
      {item && (
        <div className="flex flex-col gap-6 pt-2">
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
