"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import type { Community, CommunityImage } from "@/lib/api";
import { useCommunityStore } from "@/stores/community-store";
import { ReportButton } from "./report-content";

type ImageChange = (image: CommunityImage, file: File | null) => Promise<unknown>;

function CommunityBadge({
  community,
  className,
  onImage,
  live,
}: {
  community: Community;
  className: string;
  onImage?: ImageChange;
  live?: { ring: string; large?: boolean };
}) {
  const badgeClass = `relative flex shrink-0 items-center justify-center rounded-full bg-rail-item font-display leading-none font-bold text-foreground ${className} ${live?.ring ?? ""}`;

  if (!onImage) {
    return (
      <span aria-hidden className={badgeClass}>
        <Atom.CommunityIcon name={community.name} src={community.iconUrl} />
        {live && <Atom.LiveTag large={live.large} />}
      </span>
    );
  }

  return (
    <Molecule.ImageMenu
      noun="icon"
      hasImage={Boolean(community.iconUrl)}
      onUpload={(file) => onImage("icon", file)}
      onRemove={() => onImage("icon", null)}
    >
      {(busy) => (
        <button
          type="button"
          aria-label="Change community icon"
          className={`focus-ring group cursor-pointer ${badgeClass}`}
        >
          <Atom.CommunityIcon name={community.name} src={community.iconUrl} />
          <Atom.EditOverlay busy={busy} badge={false} />
          {live && <Atom.LiveTag large={live.large} />}
        </button>
      )}
    </Molecule.ImageMenu>
  );
}

export function CommunityHeader({
  community,
  collapsed,
  actions,
  onImage,
}: {
  community: Community;
  collapsed: boolean;
  actions: ReactNode;
  onImage?: ImageChange;
}) {
  const storeLive = useCommunityStore(
    (state) => state.communities.find((item) => item.id === community.id)?.live,
  );
  const live = storeLive ?? community.live ?? false;

  if (!community.coverUrl) {
    return (
      <header className="flex h-14 shrink-0 items-center gap-6 border-b border-divider px-4 sm:h-[72px] sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CommunityBadge
            community={community}
            onImage={onImage}
            className="h-8 w-8 text-[17px] sm:h-10 sm:w-10 sm:text-[22px]"
            live={live ? { ring: "ring-2 ring-danger ring-offset-2 ring-offset-background" } : undefined}
          />
          <Atom.Heading className="min-w-0 truncate">{community.name}</Atom.Heading>
          {live && <span className="sr-only">Live on Twitch</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onImage && (
            <Molecule.CoverButton
              hasImage={false}
              onUpload={(file) => onImage("cover", file)}
              onRemove={() => onImage("cover", null)}
            />
          )}
          <div className="flex items-center gap-1">
            <ReportButton type="community" id={community.id} ownerId={community.ownerId} />
            {actions}
          </div>
        </div>
      </header>
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
        <CommunityBadge
          community={community}
          onImage={onImage}
          className={`border-2 border-white/80 transition-[width,height] duration-300 motion-reduce:transition-none ${
            collapsed
              ? "h-8 w-8 text-[17px] sm:h-10 sm:w-10"
              : "h-14 w-14 text-[28px] sm:h-20 sm:w-20 sm:text-[40px]"
          }`}
          live={live ? { ring: "ring-2 ring-danger", large: !collapsed } : undefined}
        />
        <Atom.Heading
          className={`min-w-0 truncate text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] ${
            collapsed ? "" : "sm:text-4xl"
          }`}
        >
          {community.name}
        </Atom.Heading>
        {live && <span className="sr-only">Live on Twitch</span>}
      </div>
      <div className="absolute top-2.5 right-4 flex items-center gap-1 rounded-lg bg-surface/85 p-0.5 backdrop-blur sm:top-4 sm:right-8">
        <ReportButton type="community" id={community.id} ownerId={community.ownerId} />
        {actions}
      </div>
      {onImage && !collapsed && (
        <Molecule.CoverButton
          hasImage
          onUpload={(file) => onImage("cover", file)}
          onRemove={() => onImage("cover", null)}
          className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6"
        />
      )}
    </header>
  );
}
