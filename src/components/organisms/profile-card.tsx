"use client";

import { Camera, ImagePlus, LoaderCircle, LogOut, Mail, Moon, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { removeUserCover, uploadUserCover, type Profile } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { useFriendsStore } from "@/stores/friends-store";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { AvatarPicker } from "./avatar-picker";
import { ProfileHero, ProfileStat } from "./profile-hero";
import { ThemeToggle } from "./theme-toggle";

type ProfileCardProps = {
  profile: Profile;
  onLogout: () => void;
};

function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5 ${className}`}
    >
      <h3 className="flex items-center gap-2 font-display text-xl font-bold">
        <span className="text-muted">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

async function saveCover(request: (token: string) => Promise<Profile>) {
  const { token } = useAuthStore.getState();
  if (!token) throw new Error("Please log in again.");
  useAuthStore.setState({ profile: await request(token) });
}

function CoverButton({ hasCover }: { hasCover: boolean }) {
  return (
    <Molecule.ImageMenu
      noun="cover"
      hasImage={hasCover}
      onUpload={(file) => saveCover((token) => uploadUserCover(token, file))}
      onRemove={() => saveCover(removeUserCover)}
    >
      {(busy) => (
        <button
          type="button"
          className="focus-ring flex cursor-pointer items-center gap-1.5 rounded-full border border-divider bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-rail-item"
        >
          {busy ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : hasCover ? (
            <Camera size={14} />
          ) : (
            <ImagePlus size={14} />
          )}
          {hasCover ? "Edit cover" : "Add cover"}
        </button>
      )}
    </Molecule.ImageMenu>
  );
}

export function ProfileCard({ profile, onLogout }: ProfileCardProps) {
  const communities = useCommunityStore((state) => state.communities);
  const friends = useFriendsStore((state) => state.friends);

  return (
    <div className="flex flex-col gap-4">
      <ProfileHero
        username={profile.username}
        avatar={<AvatarPicker profile={profile} />}
        avatarUrl={profile.avatarUrl}
        coverUrl={profile.coverUrl}
        createdAt={profile.createdAt}
        isAdmin={profile.isAdmin}
        coverAction={<CoverButton hasCover={Boolean(profile.coverUrl)} />}
        actions={
          <Atom.ButtonLink
            href={`/users/${profile.username}`}
            variant="secondary"
            size="small"
          >
            View public profile
          </Atom.ButtonLink>
        }
        stats={
          <>
            <ProfileStat
              value={communities.length}
              label={communities.length === 1 ? "Community" : "Communities"}
            />
            <ProfileStat
              value={friends.length}
              label={friends.length === 1 ? "Friend" : "Friends"}
            />
          </>
        }
      />

      <Card title="Your communities" icon={<Users size={18} />}>
        {communities.length === 0 ? (
          <p className="text-sm text-muted">
            You haven’t joined any communities yet.{" "}
            <Link
              href="/explore"
              className="focus-ring rounded-sm font-semibold text-accent hover:underline"
            >
              Explore communities
            </Link>
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {communities.map((community) => (
              <li key={community.id}>
                <Molecule.CommunityTile
                  id={community.id}
                  name={community.name}
                  iconUrl={community.iconUrl}
                  role={community.ownerId === profile.userId ? "Owner" : "Member"}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card title="Preferences" icon={<Moon size={18} />}>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Theme</p>
            <ThemeToggle block />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">Appear offline</p>
              <AppearOfflineSwitch />
            </div>
            <p className="text-xs text-muted">
              Friends see you as offline. You can still post as usual.
            </p>
          </div>
        </Card>

        <Card title="Account" icon={<Mail size={18} />}>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Email</p>
            <p className="truncate text-sm">{profile.email}</p>
            <p className="text-xs text-muted">Only you can see this.</p>
          </div>
          <Atom.Button
            variant="secondary"
            icon={<LogOut size={16} />}
            onClick={onLogout}
            className="mt-auto self-start"
          >
            Log out
          </Atom.Button>
        </Card>
      </div>
    </div>
  );
}
