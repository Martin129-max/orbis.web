"use client";

import Link from "next/link";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { deleteThread, updateThread, type Thread } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";
import { castVote } from "@/lib/votes";
import { useAuthStore } from "@/stores/auth-store";
import { ContentActions } from "./content-actions";
import { PostComposer } from "./post-composer";
import { HiddenNotice } from "./report-content";

export function ThreadEditor({
  thread,
  onSaved,
  onCancel,
}: {
  thread: Thread;
  onSaved: (thread: Thread) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(thread.title);

  async function save(content: string, linkUrl?: string) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");
    if (!title.trim()) throw new Error("Add a title for your thread.");
    onSaved(await updateThread(token, thread.id, { title: title.trim(), content, linkUrl }));
  }

  return (
    <div onClick={(event) => event.stopPropagation()} className="cursor-auto">
      <PostComposer
        allowEmpty
        autoFocus
        linkPreview
        initialContent={thread.content}
        initialLink={thread.linkUrl}
        placeholder="Add details or context…"
        submitLabel="Save"
        submitDisabled={!title.trim()}
        target={
          <Atom.Input
            variant="borderless"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={300}
            placeholder="Thread title"
            aria-label="Thread title"
            className="font-display text-2xl font-bold"
          />
        }
        onPost={save}
        onPosted={onCancel}
        onCancel={onCancel}
      />
    </div>
  );
}

export function useThreadActions(thread: Thread, onDelete?: (thread: Thread) => void) {
  async function remove() {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");
    await deleteThread(token, thread.id);
    onDelete?.(thread);
  }
  return { remove };
}

export function ThreadMeta({
  thread,
  showCommunity,
}: {
  thread: Thread;
  showCommunity: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {showCommunity && (
        <Link
          href={`/communities/${thread.community.id}?tab=forum`}
          onClick={(event) => event.stopPropagation()}
          className="focus-ring flex w-fit items-center gap-2 rounded-sm text-xs font-semibold hover:underline"
        >
          <span
            aria-hidden
            className="relative flex h-5 w-5 items-center justify-center rounded-full bg-rail-item font-display text-[9.6px] leading-none font-bold"
          >
            <Atom.CommunityIcon
              name={thread.community.name}
              src={thread.community.iconUrl}
            />
          </span>
          {thread.community.name}
        </Link>
      )}
      <p className="text-xs text-muted">
        <Molecule.UserLink username={thread.author.username}>
          {displayName(thread.author)}
        </Molecule.UserLink>{" "}
        ·{" "}
        <time
          dateTime={thread.createdAt}
          title={new Date(thread.createdAt).toLocaleString()}
        >
          {timeAgo(thread.createdAt)}
        </time>{" "}
        <Molecule.EditedMark editedAt={thread.editedAt} />
      </p>
    </div>
  );
}

type ThreadCardProps = {
  thread: Thread;
  showCommunity?: boolean;
  onOpen: () => void;
  onChange: (thread: Thread) => void;
  onDelete?: (thread: Thread) => void;
};

export function ThreadCard({
  thread,
  showCommunity = false,
  onOpen,
  onChange,
  onDelete,
}: ThreadCardProps) {
  const [editing, setEditing] = useState(false);
  const { remove } = useThreadActions(thread, onDelete);

  return (
    <article
      onClick={editing ? undefined : onOpen}
      className="flex cursor-pointer gap-4 rounded-lg border border-divider bg-surface p-5 transition-colors hover:border-muted"
    >
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
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <ThreadMeta thread={thread} showCommunity={showCommunity} />
          <ContentActions
            type="thread"
            id={thread.id}
            ownerId={thread.author.id}
            canDelete={thread.canDelete}
            onEdit={() => setEditing(true)}
            onDelete={remove}
            className="-mt-1 -mr-1.5"
          />
        </div>
        {thread.hiddenAt && <HiddenNotice />}
        {editing ? (
          <ThreadEditor
            thread={thread}
            onSaved={(updated) => onChange({ ...thread, ...updated })}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <h3 className="text-xl font-bold">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen();
                }}
                className="focus-ring rounded-sm text-left hover:underline"
              >
                {thread.title}
              </button>
            </h3>
            {thread.content && (
              <div
                className="rich-text line-clamp-2 text-sm text-muted"
                dangerouslySetInnerHTML={{ __html: thread.content }}
              />
            )}
            {thread.linkUrl && (
              <div onClick={(event) => event.stopPropagation()}>
                <Molecule.LinkPreview url={thread.linkUrl} />
              </div>
            )}
          </>
        )}
        <div onClick={(event) => event.stopPropagation()}>
          <Molecule.CommentsButton count={thread.commentCount} onClick={onOpen} />
        </div>
        {thread.previewComments && (
          <div onClick={(event) => event.stopPropagation()} className="cursor-auto">
            <Molecule.CommentPreview
              comments={thread.previewComments}
              total={thread.commentCount}
              onViewAll={onOpen}
            />
          </div>
        )}
      </div>
    </article>
  );
}
