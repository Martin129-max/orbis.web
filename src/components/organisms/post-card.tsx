import * as Atom from "@atom";
import type { Post } from "@/lib/api";
import { timeAgo } from "@/lib/time";

export function PostCard({ post }: { post: Post }) {
  const author = post.author.name ?? post.author.email;

  return (
    <article className="flex gap-3 border-b border-black/10 py-5 dark:border-white/10">
      <Atom.Avatar label={author} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <header className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate font-semibold">{author}</span>
          <time
            dateTime={post.createdAt}
            title={new Date(post.createdAt).toLocaleString()}
            className="text-xs text-zinc-500"
          >
            {timeAgo(post.createdAt)}
          </time>
        </header>
        <div
          className="rich-text"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
