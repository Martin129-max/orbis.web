"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import type { Profile } from "@/lib/api";
import { useCommunityStore } from "@/stores/community-store";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { AvatarPicker } from "./avatar-picker";
import { ThemeToggle } from "./theme-toggle";

type ProfileCardProps = {
  profile: Profile;
  onLogout: () => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-divider pt-8">
      <h3 className="font-display text-2xl font-bold">{title}</h3>
      {children}
    </section>
  );
}

export function ProfileCard({ profile, onLogout }: ProfileCardProps) {
  const communities = useCommunityStore((state) => state.communities);
  const memberSince = new Date(profile.createdAt).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <p className="text-xs font-bold text-accent uppercase">
          Your profile
        </p>
        <div className="flex items-center gap-6">
          <AvatarPicker profile={profile} />
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="truncate font-display text-4xl leading-[1.04] font-bold sm:text-5xl">
              {profile.username}
            </h2>
            <p className="text-sm text-muted">@{profile.username}</p>
            <p className="text-xs text-muted">Member since {memberSince}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-surface p-4">
          <p className="text-[11px] font-bold text-muted uppercase">
            Email · Only you can see this
          </p>
          <p className="truncate text-sm">{profile.email}</p>
        </div>
      </div>

      <Section title="Preferences">
        <div className="flex flex-col gap-3">
          <p className="text-sm">Theme</p>
          <p className="text-xs text-muted">
            Choose how Orbis looks. System follows your device’s setting.
          </p>
          <ThemeToggle />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-6">
            <p className="text-sm">Appear offline</p>
            <AppearOfflineSwitch />
          </div>
          <p className="text-xs text-muted">
            Friends will see you as offline. You can still read, post, and
            comment as usual.
          </p>
        </div>
      </Section>

      <Section title="Your communities">
        {communities.length === 0 ? (
          <p className="text-sm text-muted">
            You haven’t joined any communities yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {communities.map((community) => (
              <li key={community.id}>
                <Link
                  href={`/communities/${community.id}`}
                  className="focus-ring flex items-center gap-4 rounded-md py-2 hover:text-accent"
                >
                  <span
                    aria-hidden
                    className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rail-item font-display text-[17.6px] leading-none font-bold text-foreground"
                  >
                    <Atom.CommunityIcon
                      name={community.name}
                      src={community.iconUrl}
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {community.name}
                  </span>
                  <span className="text-xs text-muted">
                    {community.ownerId === profile.userId ? "Owner" : "Member"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="border-t border-divider pt-6">
        <Atom.Button variant="secondary" onClick={onLogout}>
          Log out
        </Atom.Button>
      </div>
    </div>
  );
}
