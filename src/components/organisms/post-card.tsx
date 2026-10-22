import { ChevronRight } from "lucide-react";
import * as Molecule from "@molecule";
import type { Post } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { timeAgo } from "@/lib/time";

type PostCardProps = {
  post: Post;
  showCommunity?: boolean;
  onOpenComments?: () => void;
};

export function PostCard({
  post,
  showCommunity = false,
  onOpenComments,
}: PostCardProps) {
  const wallUser =
    post.wallUser && post.wallUser.id !== post.author.id ? post.wallUser : null;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5">
      <header className="flex items-center gap-3">
        <Molecule.AuthorAvatar
          author={post.author}
          community={(showCommunity && post.community) || undefined}
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
      {onOpenComments && (
        <Molecule.CommentsButton
          invite
          count={post.commentCount}
          onClick={onOpenComments}
        />
      )}
    </article>
  );
}
