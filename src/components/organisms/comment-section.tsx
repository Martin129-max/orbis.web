"use client";

import { Reply } from "lucide-react";
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
        b.score - a.score ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
      <div className="flex gap-3">
        <Atom.Avatar label={author} seed={node.author.id} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
            <span className="text-sm font-semibold text-foreground">
              {author}
            </span>
            <time
              dateTime={node.createdAt}
              title={new Date(node.createdAt).toLocaleString()}
            >
              {timeAgo(node.createdAt)}
            </time>
          </p>
          <div
            className="rich-text text-sm"
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
              className="focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              <Reply size={14} />
              Reply
            </button>
          </div>
          {replying && (
            <div className="pt-1">
              <PostComposer
                autoFocus
                placeholder={`Reply to ${author}…`}
                submitLabel="Reply"
                onPost={(content) => onReply(content, node.id)}
                onPosted={() => setReplying(false)}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>
      {node.replies.length > 0 && (
        <ul
          className={`flex flex-col gap-4 ${
            depth < MAX_INDENT
              ? "ml-4 border-l border-black/10 pl-4 dark:border-white/10"
              : ""
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
  onCountChange,
}: {
  target: Commentable;
  onCountChange: (count: number) => void;
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
    onCountChange(next.length);
  }

  function handleChange(comment: Comment) {
    setComments((current) =>
      (current ?? []).map((existing) =>
        existing.id === comment.id ? { ...existing, ...comment } : existing,
      ),
    );
  }

  return (
    <section aria-label="Comments" className="flex flex-col gap-4">
      <PostComposer
        placeholder="Add a comment…"
        submitLabel="Comment"
        onPost={(content) => handleReply(content)}
      />
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
          No comments yet. Start the conversation.
        </p>
      ) : (
        <>
          <h3 className="text-sm font-semibold">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </h3>
          <ul className="flex flex-col gap-5">
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
