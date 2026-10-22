"use client";

import { UserX, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { getPublicProfile, type PublicProfile as Profile } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";
import { FriendAction } from "./member-list";
import { ProfileHero, ProfileStat } from "./profile-hero";

type Loaded = { username: string; profile: Profile | null; failed?: boolean };

export function PublicProfile({ username }: { username: string }) {
  const router = useRouter();
  const me = useAuthStore((state) => state.profile);
  const livePresence = useFriendsStore((state) => state.presence);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (me && me.username === username.toLowerCase()) router.replace("/profile");
  }, [me, username, router]);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getPublicProfile(token, username)
      .then((profile) => setLoaded({ username, profile }))
      .catch(() => setLoaded({ username, profile: null, failed: true }));
  }, [username]);

  const current = loaded?.username === username ? loaded : null;
  if (!current) return <Atom.Loader />;

  if (!current.profile) {
    return (
      <Molecule.FeedState
        role={current.failed ? "alert" : undefined}
        eyebrow={current.failed ? "Connection error" : "Not found"}
        icon={<UserX size={24} strokeWidth={1.5} />}
        title={current.failed ? "This profile couldn’t be loaded." : "No one goes by that name."}
        description={
          current.failed
            ? "Check your connection and try again."
            : `There’s no user called @${username}.`
        }
      />
    );
  }

  const profile = current.profile;
  const online = livePresence[profile.userId] ?? profile.online;
  const hidden = profile.communityCount - profile.communities.length;

  return (
    <div className="flex flex-col gap-4">
      <ProfileHero
        username={profile.username}
        name={profile.name}
        avatar={
          <Atom.Avatar
            size="lg"
            label={profile.name ?? profile.username}
            src={profile.avatarUrl}
            seed={profile.userId}
            presence={online ? "online" : "offline"}
          />
        }
        avatarUrl={profile.avatarUrl}
        coverUrl={profile.coverUrl}
        createdAt={profile.createdAt}
        isAdmin={profile.isAdmin}
        status={
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${online ? "bg-online" : "bg-offline"}`}
            />
            {online ? "Online" : "Offline"}
          </span>
        }
        actions={me && <FriendAction userId={profile.userId} self={false} />}
        stats={
          <>
            <ProfileStat
              value={profile.postCount}
              label={profile.postCount === 1 ? "Post" : "Posts"}
            />
            <ProfileStat
              value={profile.friendCount}
              label={profile.friendCount === 1 ? "Friend" : "Friends"}
            />
            <ProfileStat
              value={profile.communityCount}
              label={profile.communityCount === 1 ? "Community" : "Communities"}
            />
          </>
        }
      />
      <section className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold">
          <Users size={18} className="text-muted" />
          Communities
        </h3>
        {profile.communities.length === 0 ? (
          <p className="text-sm text-muted">
            {hidden > 0
              ? "They’re only in private communities you’re not part of."
              : "They haven’t joined any communities yet."}
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {profile.communities.map((community) => (
                <li key={community.id}>
                  <Molecule.CommunityTile
                    id={community.id}
                    name={community.name}
                    iconUrl={community.iconUrl}
                    role={community.isOwner ? "Owner" : "Member"}
                  />
                </li>
              ))}
            </ul>
            {hidden > 0 && (
              <p className="text-xs text-muted">
                Plus {hidden} private {hidden === 1 ? "community" : "communities"}.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
