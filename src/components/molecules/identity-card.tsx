import Image from "next/image";
import type { ReactNode } from "react";

export function IdentityCard({
  coverUrl,
  avatar,
  title,
  subtitle,
  badge,
  action,
}: {
  coverUrl: string | null;
  avatar: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-transparent bg-background transition-colors hover:border-divider">
      <div className="relative h-14 shrink-0 bg-gradient-to-br from-accent-soft to-rail-item">
        {coverUrl && (
          <Image src={coverUrl} alt="" fill unoptimized className="object-cover" />
        )}
      </div>
      <div className="flex items-end gap-3 px-3 pb-3">
        <div className="relative -mt-5 shrink-0 rounded-full border-[3px] border-background bg-background">
          {avatar}
        </div>
        <div className="flex min-w-0 flex-1 flex-col pt-2">
          <span className="flex min-w-0 items-center gap-1.5">
            {title}
            {badge}
          </span>
          <span className="truncate text-xs text-muted">{subtitle}</span>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
