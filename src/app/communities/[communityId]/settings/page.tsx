"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Organism from "@organism";
import * as Template from "@template";
import { canManage, getCommunity, type Community } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type Loaded = { id: string; community: Community | null; failed?: boolean };

export default function CommunitySettingsPage() {
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
      ) : !current.community || !canManage(current.community) ? (
        <Template.CenteredTemplate>
          <Atom.Heading>No access</Atom.Heading>
          <p className="text-sm text-muted">
            Only the community&apos;s owner and admins can change its settings.
          </p>
        </Template.CenteredTemplate>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <Template.PageHeader>
            <Link
              href={`/communities/${current.community.id}`}
              aria-label={`Back to ${current.community.name}`}
              className="icon-button -ml-1.5"
            >
              <ArrowLeft size={20} />
            </Link>
            <Atom.Heading className="min-w-0 truncate">Settings</Atom.Heading>
          </Template.PageHeader>
          <Template.PageColumn>
            <Organism.CommunitySettings
              key={current.community.id}
              community={current.community}
            />
          </Template.PageColumn>
        </main>
      )}
    </Template.AppTemplate>
  );
}
