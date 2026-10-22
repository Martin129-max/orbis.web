import Image from "next/image";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import * as Template from "@template";
import type { Community } from "@/lib/api";

export function CommunityHeader({
  community,
  collapsed,
  actions,
}: {
  community: Community;
  collapsed: boolean;
  actions: ReactNode;
}) {
  if (!community.coverUrl) {
    return (
      <Template.PageHeader actions={actions}>
        <Atom.Heading className="min-w-0 truncate">{community.name}</Atom.Heading>
      </Template.PageHeader>
    );
  }

  return (
    <header
      className={`relative shrink-0 overflow-hidden border-b border-divider transition-[height] duration-300 ease-out motion-reduce:transition-none ${
        collapsed ? "h-14 sm:h-[72px]" : "h-44 sm:h-64"
      }`}
    >
      <Image
        src={community.coverUrl}
        alt=""
        fill
        unoptimized
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10" />
      <div
        className={`absolute inset-0 flex gap-3 px-4 pr-28 sm:gap-4 sm:px-8 sm:pr-32 ${
          collapsed ? "items-center" : "items-end pb-4 sm:pb-6"
        }`}
      >
        <span
          aria-hidden
          className={`relative flex shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-rail-item font-display leading-none font-bold text-foreground transition-[width,height] duration-300 motion-reduce:transition-none ${
            collapsed
              ? "h-8 w-8 text-[17px] sm:h-10 sm:w-10"
              : "h-14 w-14 text-[28px] sm:h-20 sm:w-20 sm:text-[40px]"
          }`}
        >
          <Atom.CommunityIcon name={community.name} src={community.iconUrl} />
        </span>
        <Atom.Heading
          className={`min-w-0 truncate text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] ${
            collapsed ? "" : "sm:text-4xl"
          }`}
        >
          {community.name}
        </Atom.Heading>
      </div>
      <div className="absolute top-2.5 right-4 flex items-center gap-1 rounded-lg bg-surface/85 p-0.5 backdrop-blur sm:top-4 sm:right-8">
        {actions}
      </div>
    </header>
  );
}
