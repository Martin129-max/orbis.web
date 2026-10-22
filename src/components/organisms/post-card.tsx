import { ChevronRight } from "lucide-react";
import * as Molecule from "@molecule";
import type { Post } from "@/lib/api";
import { toggleLike } from "@/lib/votes";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";

type PostCardProps = {
  post: Post;
  showCommunity?: boolean;
  onOpenComments?: () => void;
  onChange?: (post: Post) => void;
  preview?: boolean;
};

export function PostCard({
  post,
  showCommunity = false,
  onOpenComments,
  onChange,
  preview = true,
}: PostCardProps) {
  const wallUser =
    post.wallUser && post.wallUser.id !== post.author.id ? post.wallUser : null;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5">
      <header className="flex items-center gap-3">
        <Molecule.AuthorAvatar
          author={post.author}
          community={(showCommunity && post.community) || undefined}
          wallUser={wallUser ?? undefined}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex min-w-0 items-center gap-1 text-sm">
            <Molecule.UserLink username={post.author.username} className="min-w-0 truncate">
              {displayName(post.author)}
            </Molecule.UserLink>
            {wallUser && (
              <>
                <ChevronRight size={14} aria-label="on the wall of" className="shrink-0 text-muted" />
                <Molecule.UserLink username={wallUser.username} className="min-w-0 truncate">
                  {displayName(wallUser)}
                </Molecule.UserLink>
              </>
            )}
          </span>
          <span className="truncate text-xs text-muted">
            {showCommunity && post.community && `${post.community.name} · `}
            <time
              dateTime={post.createdAt}
              title={new Date(post.createdAt).toLocaleString()}
            >
              {timeAgo(post.createdAt)}
            </time>
          </span>
        </div>
      </header>
      <div
        className="rich-text"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="flex items-center gap-4">
        <Molecule.LikeButton
          liked={post.liked}
          count={post.likeCount}
          onToggle={() =>
            toggleLike({ type: "post", id: post.id }, post, (result) =>
              onChange?.({ ...post, ...result }),
            )
          }
        />
        {onOpenComments && (
          <Molecule.CommentsButton count={post.commentCount} onClick={onOpenComments} />
        )}
      </div>
      {preview && onOpenComments && (
        <Molecule.CommentPreview
          comments={post.previewComments}
          total={post.commentCount}
          onViewAll={onOpenComments}
        />
      )}
    </article>
  );
}
