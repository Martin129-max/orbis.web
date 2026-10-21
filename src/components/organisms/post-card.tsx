import { Tooltip } from "antd";
import Link from "next/link";
import * as Atom from "@atom";
import type { Post } from "@/lib/api";
import { initials } from "@/lib/initials";
import { timeAgo } from "@/lib/time";

export function PostCard({ post }: { post: Post }) {
  const author = post.author.name ?? post.author.email;

  return (
    <article className="flex gap-3 rounded-xl border border-black/10 bg-surface p-4 dark:border-white/10">
      <div className="relative h-fit shrink-0">
        <Atom.Avatar label={author} seed={post.author.id} />
        {post.community && (
          <Tooltip title={post.community.name}>
            <Link
              href={`/communities/${post.community.id}`}
              aria-label={`Posted in ${post.community.name}`}
              className="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-accent text-[8px] leading-none font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              {initials(post.community.name)}
            </Link>
          </Tooltip>
        )}
      </div>
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
      </div>
    </article>
  );
}
