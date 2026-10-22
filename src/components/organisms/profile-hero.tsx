import { CalendarDays } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

export function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-2xl leading-none font-bold">
        {value.toLocaleString()}
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export function ProfileHero({
  username,
  name,
  avatar,
  avatarUrl,
  coverUrl,
  createdAt,
  isAdmin,
  status,
  coverAction,
  actions,
  stats,
}: {
  username: string;
  name?: string | null;
  avatar: ReactNode;
  avatarUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
  isAdmin: boolean;
  status?: ReactNode;
  coverAction?: ReactNode;
  actions?: ReactNode;
  stats: ReactNode;
}) {
  const joined = new Date(createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="overflow-hidden rounded-lg border border-divider bg-surface">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-accent-soft to-rail-item sm:h-40">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill unoptimized priority className="object-cover" />
        ) : (
          avatarUrl && (
            <Image
              src={avatarUrl}
              alt=""
              fill
              unoptimized
              className="scale-125 object-cover opacity-70 blur-2xl"
            />
          )
        )}
        {coverAction && (
          <div className="absolute right-3 bottom-3">{coverAction}</div>
        )}
      </div>
      <div className="flex flex-col gap-4 px-5 pb-5">
        <div className="-mt-12 flex items-end justify-between gap-4">
          <div className="relative rounded-full border-4 border-surface bg-surface">
            {avatar}
          </div>
          <div className="mb-1 flex flex-wrap items-center justify-end gap-2">
            {isAdmin && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                Site admin
              </span>
            )}
            {actions}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate font-display text-4xl leading-[1.04] font-bold">
            {name || username}
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>@{username}</span>
            {status}
            <span className="flex items-center gap-1">
              <CalendarDays size={14} aria-hidden />
              Joined {joined}
            </span>
          </p>
        </div>
        <div className="flex gap-8 border-t border-divider pt-4">{stats}</div>
      </div>
    </section>
  );
}
