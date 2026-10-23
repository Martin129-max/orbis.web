"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  createComment,
  getComments,
  type Comment,
  type Commentable,
} from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";
import { castVote } from "@/lib/votes";
import { useAuthStore } from "@/stores/auth-store";
import { PostComposer } from "./post-composer";
import { ReportButton } from "./report-content";

const MAX_INDENT = 5;

type CommentNode = Comment & { replies: CommentNode[] };

function buildTree(comments: Comment[]) {
  const nodes = new Map<number, CommentNode>(
    comments.map((comment) => [comment.id, { ...comment, replies: [] }]),
  );
  const roots: CommentNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId === null ? null : nodes.get(node.parentId);
    (parent ? parent.replies : roots).push(node);
  }

  const sort = (list: CommentNode[]) => {
    list.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
        a.id - b.id,
    );
    list.forEach((node) => sort(node.replies));
  };
  sort(roots);
  return roots;
}

function CommentItem({
  node,
  depth,
  onReply,
  onChange,
}: {
  node: CommentNode;
  depth: number;
  onReply: (content: string, parentId: number) => Promise<void>;
  onChange: (comment: Comment) => void;
}) {
  const [replying, setReplying] = useState(false);
  const author = displayName(node.author);

  return (
    <li className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <Atom.Avatar
            size="xs"
            label={author}
            src={node.author.avatarUrl}
            seed={node.author.id}
          />
          <Molecule.UserLink username={node.author.username} className="text-foreground">
            {author}
          </Molecule.UserLink>
          <time
            dateTime={node.createdAt}
            title={new Date(node.createdAt).toLocaleString()}
          >
            {timeAgo(node.createdAt)}
          </time>
        </p>
        <div
          className="rich-text"
          dangerouslySetInnerHTML={{ __html: node.content }}
        />
        <div className="flex items-center gap-2">
          <Molecule.VoteControl
            orientation="horizontal"
            score={node.score}
            myVote={node.myVote}
            onVote={(value) =>
              castVote({ type: "comment", id: node.id }, node, value, (result) =>
                onChange({ ...node, ...result }),
              )
            }
          />
          <button
            type="button"
            onClick={() => setReplying((open) => !open)}
            aria-expanded={replying}
            className="focus-ring rounded-sm px-1 text-xs font-semibold text-muted transition-colors hover:text-foreground"
          >
            Reply
          </button>
          <ReportButton type="comment" id={node.id} ownerId={node.author.id} variant="text" />
        </div>
        {replying && (
          <PostComposer
            autoFocus
            target={
              <p className="text-xs text-muted">
                Replying to @{node.author.username}
              </p>
            }
            placeholder="Write a reply…"
            submitLabel="Reply"
            onPost={(content) => onReply(content, node.id)}
            onPosted={() => setReplying(false)}
            onCancel={() => setReplying(false)}
          />
        )}
      </div>
      {node.replies.length > 0 && (
        <ul
          className={`flex flex-col gap-6 ${
            depth < MAX_INDENT ? "border-l border-divider pl-5" : ""
          }`}
        >
          {node.replies.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onReply={onReply}
              onChange={onChange}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CommentSection({
  target,
  onCommentsChange,
}: {
  target: Commentable;
  onCommentsChange: (comments: Comment[]) => void;
}) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { type, id } = target;

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    getComments(token, { type, id })
      .then((result) => {
        setFailed(false);
        setComments(result);
      })
      .catch(() => setFailed(true));
  }, [type, id, attempt]);

  async function handleReply(content: string, parentId?: number) {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error("Please log in again.");

    const comment = await createComment(token, { type, id }, content, parentId);
    const next = [...(comments ?? []), comment];
    setComments(next);
    onCommentsChange(next);
  }

  function handleChange(comment: Comment) {
    setComments((current) =>
      (current ?? []).map((existing) =>
        existing.id === comment.id ? { ...existing, ...comment } : existing,
      ),
    );
  }

  return (
    <section aria-label="Comments" className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl font-bold">
          {comments
            ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`
            : "Comments"}
        </h3>
        <span className="text-xs text-muted">Oldest first</span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold">Add a comment</p>
        <PostComposer
          placeholder="Write a comment…"
          submitLabel="Comment"
          onPost={(content) => handleReply(content)}
        />
      </div>
      {failed && !comments ? (
        <Molecule.ConnectionError
          onRetry={() => {
            setFailed(false);
            setAttempt((count) => count + 1);
          }}
        />
      ) : !comments ? (
        <div className="flex py-8">
          <Atom.Loader />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No comments yet.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-6">
            {buildTree(comments).map((node) => (
              <CommentItem
                key={node.id}
                node={node}
                depth={0}
                onReply={handleReply}
                onChange={handleChange}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
