"use client";

import {
  Globe,
  Lock,
  MessagesSquare,
  Newspaper,
  Settings,
} from "lucide-react";
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
  { value: "feed", label: "Feed", icon: <Newspaper size={16} /> },
  { value: "forum", label: "Forum", icon: <MessagesSquare size={16} /> },
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-black/10 px-6 dark:border-white/10">
            <Atom.Heading className="min-w-0 truncate">
              {current.community.name}
            </Atom.Heading>
            <Tooltip
              title={
                current.community.isPublic
                  ? "Public: anyone can find and join it"
                  : "Private: only members can see it"
              }
            >
              <span
                role="img"
                aria-label={
                  current.community.isPublic
                    ? "Public community"
                    : "Private community"
                }
                className="flex shrink-0 text-lg text-muted"
              >
                {current.community.isPublic ? (
                  <Globe size={18} />
                ) : (
                  <Lock size={18} />
                )}
              </span>
            </Tooltip>
            <div className="ml-auto flex items-center gap-1">
              {canManage(current.community) && (
                <Tooltip title="Community settings">
                  <Link
                    href={`/communities/${current.community.id}/settings`}
                    aria-label="Community settings"
                    className="flex shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                  >
                    <Settings size={20} />
                  </Link>
                </Tooltip>
              )}
              <Organism.SidePanelToggle label="Members" />
            </div>
          </header>
          <nav
            aria-label="Community sections"
            className="flex shrink-0 gap-1 border-b border-black/10 px-6 dark:border-white/10"
          >
            {tabs.map(({ value, label, icon }) => (
              <Link
                key={value}
                href={`/communities/${current.community!.id}${
                  value === "forum" ? "?tab=forum" : ""
                }`}
                aria-current={tab === value ? "page" : undefined}
                className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === value
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-2xl px-6 py-6">
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
              </div>
            </div>
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
