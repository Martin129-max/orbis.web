import Link from "next/link";
import * as Atom from "@atom";

export function CommunityTile({
  id,
  name,
  iconUrl,
  role,
}: {
  id: number;
  name: string;
  iconUrl: string | null;
  role: string;
}) {
  return (
    <Link
      href={`/communities/${id}`}
      className="focus-ring flex items-center gap-3 rounded-lg border border-transparent bg-background p-3 transition-colors hover:border-divider"
    >
      <span
        aria-hidden
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rail-item font-display text-[20px] leading-none font-bold text-foreground"
      >
        <Atom.CommunityIcon name={name} src={iconUrl} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold">{name}</span>
        <span className="text-xs text-muted">{role}</span>
      </span>
    </Link>
  );
}
