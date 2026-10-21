"use client";

import { Globe, Lock, Settings } from "lucide-react";
import Link from "next/link";
import { Tooltip } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Organism from "@organism";
import * as Template from "@template";
import { canManage, getCommunity, type Community } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type Loaded = { id: string; community: Community | null; failed?: boolean };

const tabs = [
  { value: "feed", label: "Feed" },
  { value: "forum", label: "Forum" },
] as const;

export default function CommunityPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const router = useRouter();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const tab = useSearchParams().get("tab") === "forum" ? "forum" : "feed";

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) {
      router.replace("/login");
      return;
    }

    getCommunity(token, communityId)
      .then((community) => setLoaded({ id: communityId, community }))
      .catch(() =>
        setLoaded({ id: communityId, community: null, failed: true }),
      );
  }, [communityId, router]);

  const current = loaded?.id === communityId ? loaded : null;

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
            It doesn&apos;t exist, or you&apos;re not a member.
          </p>
        </Template.CenteredTemplate>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <Template.PageHeader
            tagline="Your clubhouse"
            actions={
              <>
                {canManage(current.community) && (
                  <Tooltip title="Community settings">
                    <Link
                      href={`/communities/${current.community.id}/settings`}
                      aria-label="Community settings"
                      className="icon-button"
                    >
                      <Settings size={20} />
                    </Link>
                  </Tooltip>
                )}
                <Organism.SidePanelToggle label="Members" />
              </>
            }
          >
            <Atom.Heading className="min-w-0 truncate">
              {current.community.name}
            </Atom.Heading>
          </Template.PageHeader>
          <nav
            aria-label="Community sections"
            className="flex shrink-0 items-end gap-6 border-b border-divider px-4 sm:px-8"
          >
            {tabs.map(({ value, label }) => (
              <Link
                key={value}
                href={`/communities/${current.community!.id}${
                  value === "forum" ? "?tab=forum" : ""
                }`}
                aria-current={tab === value ? "page" : undefined}
                className={`focus-ring -mb-px rounded-t-sm border-b-2 px-1 py-3 text-sm transition-colors ${
                  tab === value
                    ? "border-accent text-accent"
                    : "border-transparent font-semibold text-foreground hover:text-accent"
                }`}
              >
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
          <div className="flex min-h-0 flex-1">
            <Template.PageColumn>
              {tab === "forum" ? (
                <Organism.CommunityForum
                  key={current.community.id}
                  communityId={current.community.id}
                />
              ) : (
                <Organism.CommunityFeed
                  key={current.community.id}
                  communityId={current.community.id}
                />
              )}
            </Template.PageColumn>
            <Organism.SidePanel label="Members">
              <Organism.MemberList
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
