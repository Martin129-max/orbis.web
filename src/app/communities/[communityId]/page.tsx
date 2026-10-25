"use client";

import {
  Globe,
  Lock,
  MessagesSquare,
  Newspaper,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, type UIEvent } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Organism from "@organism";
import * as Template from "@template";
import {
  canManage,
  getCommunity,
  type Community,
  type CommunityImage,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";

type Loaded = { id: string; community: Community | null; failed?: boolean };

const tabs = [
  { value: "feed", label: "Feed", icon: <Newspaper size={16} /> },
  { value: "forum", label: "Forum", icon: <MessagesSquare size={16} /> },
  { value: "members", label: "Members", icon: <Users size={16} /> },
] as const;

type Tab = (typeof tabs)[number]["value"];

export default function CommunityPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const requested = useSearchParams().get("tab");
  const tab: Tab =
    tabs.find(({ value }) => value === requested)?.value ?? "feed";
  const [collapsed, setCollapsed] = useState(false);
  const setCommunityImage = useCommunityStore(
    (state) => state.setCommunityImage,
  );
  const joinCommunity = useCommunityStore((state) => state.joinCommunity);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleImage(image: CommunityImage, file: File | null) {
    const community = await setCommunityImage(Number(communityId), image, file);
    setLoaded({ id: communityId, community });
  }

  async function handleJoin() {
    const community = loaded?.id === communityId ? loaded.community : null;
    if (!community || community.role) return;

    setJoining(true);
    setJoinError(null);
    try {
      const joined = await joinCommunity(community.id);
      setLoaded({
        id: communityId,
        community: { ...community, ...joined, role: "member" },
      });
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "Could not join the community.",
      );
    } finally {
      setJoining(false);
    }
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const room = scrollHeight - clientHeight;
    setCollapsed((current) =>
      current ? scrollTop > 0 : scrollTop > 32 && room > 240,
    );
  }

  useEffect(() => {
    const { token } = useAuthStore.getState();

    getCommunity(token, communityId)
      .then((community) => setLoaded({ id: communityId, community }))
      .catch(() =>
        setLoaded({ id: communityId, community: null, failed: true }),
      );
  }, [communityId]);

  const current = loaded?.id === communityId ? loaded : null;
  const signedIn = useAuthStore((state) => Boolean(state.token));
  const joinPrompt =
    current?.community && !current.community.role ? (
      <Organism.JoinCommunityPrompt
        guest={!signedIn}
        description={current.community.description}
        joining={joining}
        error={joinError}
        onJoin={handleJoin}
      />
    ) : undefined;

  return (
    <Template.AppTemplate>
      {!current ? (
        <Template.CenteredTemplate>
          <Atom.Loader />
        </Template.CenteredTemplate>
      ) : current.failed ? (
        <Template.CenteredTemplate>
          <Molecule.ConnectionError onRetry={() => window.location.reload()} />
        </Template.CenteredTemplate>
      ) : !current.community ? (
        <Template.CenteredTemplate>
          <Atom.Heading>Community not found</Atom.Heading>
          <p className="text-sm text-muted">
            It doesn&apos;t exist, or it isn&apos;t public.
          </p>
        </Template.CenteredTemplate>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <Organism.PageSearch>
            <Organism.CommunityContentSearch
              key={current.community.id}
              communityId={current.community.id}
              communityName={current.community.name}
            />
          </Organism.PageSearch>
          <Organism.CommunityHeader
            community={current.community}
            collapsed={collapsed}
            onImage={canManage(current.community) ? handleImage : undefined}
            actions={
              canManage(current.community) && (
                <span data-tour="community-settings" className="flex">
                  <Molecule.SettingsLink
                    href={`/communities/${current.community.id}/settings`}
                    label="Community settings"
                  />
                </span>
              )
            }
          />
          {!joinPrompt && <Organism.PageTour name="community" />}
          <nav
            aria-label="Community sections"
            data-tour="community-tabs"
            className="flex shrink-0 items-end gap-6 border-b border-divider px-4 sm:px-8"
          >
            {tabs.map(({ value, label, icon }) => (
              <Link
                key={value}
                href={`/communities/${current.community!.id}${
                  value === "feed" ? "" : `?tab=${value}`
                }`}
                aria-current={tab === value ? "page" : undefined}
                className={`focus-ring -mb-px flex items-center gap-2 rounded-t-sm border-b-2 px-1 py-3 text-sm transition-colors ${
                  tab === value
                    ? "border-accent text-accent"
                    : "border-transparent font-semibold text-foreground hover:text-accent"
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
            <p className="ml-auto hidden items-center gap-2 self-center text-xs text-muted sm:flex">
              {current.community.isPublic ? (
                <Globe size={14} aria-hidden />
              ) : (
                <Lock size={14} aria-hidden />
              )}
              {current.community.isPublic
                ? "Public community"
                : "Private community"}
              {current.community.memberCount !== undefined &&
                ` · ${current.community.memberCount.toLocaleString()} ${
                  current.community.memberCount === 1 ? "member" : "members"
                }`}
            </p>
          </nav>
          <div className="relative isolate flex min-h-0 flex-1">
            <Molecule.PageWallpaper
              src={current.community.backgroundUrl}
              onUpload={
                canManage(current.community)
                  ? (file) => handleImage("background", file)
                  : undefined
              }
              onRemove={
                canManage(current.community)
                  ? () => handleImage("background", null)
                  : undefined
              }
            />
            <Template.PageColumn onScroll={handleScroll}>
              {tab === "members" ? (
                <Organism.MemberList
                  key={current.community.id}
                  communityId={current.community.id}
                />
              ) : tab === "forum" ? (
                <Organism.CommunityForum
                  key={current.community.id}
                  communityId={current.community.id}
                  joinPrompt={joinPrompt}
                />
              ) : (
                <Organism.CommunityFeed
                  key={current.community.id}
                  communityId={current.community.id}
                  joinPrompt={joinPrompt}
                />
              )}
            </Template.PageColumn>
            <Organism.SidePanel label="Members">
              {!joinPrompt && (
                <div className="flex gap-2">
                  <Organism.InviteButton
                    key={`invite-${current.community.id}`}
                    community={current.community}
                  />
                  <Organism.InviteCardButton
                    key={`card-${current.community.id}`}
                    community={current.community}
                  />
                </div>
              )}
              <Organism.MemberPresence
                key={current.community.id}
                communityId={current.community.id}
              />
            </Organism.SidePanel>
          </div>
        </main>
      )}
    </Template.AppTemplate>
  );
}
