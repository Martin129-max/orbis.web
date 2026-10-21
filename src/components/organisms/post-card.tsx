import Link from "next/link";
import * as Atom from "@atom";
import type { Post } from "@/lib/api";
import { timeAgo } from "@/lib/time";

export function PostCard({ post }: { post: Post }) {
  const author = post.author.name ?? post.author.email;

  return (
    <article className="flex gap-3 rounded-xl border border-black/10 bg-surface p-4 dark:border-white/10">
      <Atom.Avatar label={author} />
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
          {post.community && (
            <Link
              href={`/communities/${post.community.id}`}
              className="truncate text-xs text-accent hover:underline"
            >
              {post.community.name}
            </Link>
          )}
        </header>
        <div
          className="rich-text"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
