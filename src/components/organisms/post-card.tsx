import * as Molecule from "@molecule";
import type { Post } from "@/lib/api";
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
  const author = post.author.name ?? post.author.email;

  return (
    <article className="flex gap-3 rounded-xl border border-black/10 bg-surface p-4 dark:border-white/10">
      <Molecule.AuthorAvatar
        author={post.author}
        community={showCommunity ? post.community : undefined}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <header className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate font-semibold">{author}</span>
          <time
            dateTime={post.createdAt}
            title={new Date(post.createdAt).toLocaleString()}
            className="text-xs text-muted"
          >
            {timeAgo(post.createdAt)}
          </time>
        </header>
        <div
          className="rich-text"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {onOpenComments && (
          <div className="pt-1">
            <Molecule.CommentsButton
              count={post.commentCount}
              onClick={onOpenComments}
            />
          </div>
        )}
      </div>
    </article>
  );
}
