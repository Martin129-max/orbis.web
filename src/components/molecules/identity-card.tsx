import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function IdentityCard({
  coverUrl,
  avatar,
  title,
  subtitle,
  badge,
  action,
  href,
  linkLabel,
  children,
}: {
  coverUrl: string | null;
  avatar: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-divider bg-surface transition-colors hover:border-muted">
      {href && (
        <Link
          href={href}
          aria-label={linkLabel}
          className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        />
      )}
      <div className="relative h-14 shrink-0 bg-gradient-to-br from-accent-soft to-rail-item">
        {coverUrl && (
          <Image src={coverUrl} alt="" fill unoptimized className="object-cover" />
        )}
      </div>
      <div className="flex items-end gap-3 px-3 pb-3">
        <div className="relative -mt-5 shrink-0 rounded-full border-[3px] border-surface bg-surface">
          {avatar}
        </div>
        <div className="flex min-w-0 flex-1 flex-col pt-2">
          <span className="flex min-w-0 items-center gap-1.5">
            {title}
            {badge}
          </span>
          <span className="truncate text-xs text-muted">{subtitle}</span>
        </div>
        {action && <div className="relative z-20 shrink-0">{action}</div>}
      </div>
      {children && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
