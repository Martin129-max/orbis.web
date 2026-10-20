"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Organism from "@organism";
import * as Template from "@template";
import { getCommunity, type Community } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type Loaded = { id: string; community: Community | null; failed?: boolean };

export default function CommunityPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const router = useRouter();
  const [loaded, setLoaded] = useState<Loaded | null>(null);

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
          <p className="text-sm text-zinc-500">
            It doesn&apos;t exist, or you&apos;re not a member.
          </p>
        </Template.CenteredTemplate>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center border-b border-black/10 px-6 dark:border-white/10">
            <Atom.Heading className="min-w-0 truncate">
              {current.community.name}
            </Atom.Heading>
          </header>
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-2xl px-6 py-6">
                <Organism.CommunityFeed
                  key={current.community.id}
                  communityId={current.community.id}
                />
              </div>
            </div>
            <Organism.MemberList
              key={current.community.id}
              communityId={current.community.id}
            />
          </div>
        </main>
      )}
    </Template.AppTemplate>
  );
}
