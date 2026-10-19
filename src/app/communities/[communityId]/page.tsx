"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Template from "@template";
import { getCommunity, type Community } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type Loaded = { id: string; community: Community | null };

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

    getCommunity(token, communityId).then((community) =>
      setLoaded({ id: communityId, community }),
    );
  }, [communityId, router]);

  const current = loaded?.id === communityId ? loaded : null;

  return (
    <Template.AppTemplate>
      {!current ? (
        <Template.CenteredTemplate>
          <Atom.Loader />
        </Template.CenteredTemplate>
      ) : !current.community ? (
        <Template.CenteredTemplate>
          <Atom.Heading>Community not found</Atom.Heading>
          <p className="text-sm text-zinc-500">
            It doesn&apos;t exist, or you&apos;re not a member.
          </p>
        </Template.CenteredTemplate>
      ) : (
        <main className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center border-b border-black/10 pr-36 pl-6 dark:border-white/10">
            <Atom.Heading>{current.community.name}</Atom.Heading>
          </header>
          <section className="flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
            <p className="font-medium">No posts yet</p>
            <p className="text-sm text-zinc-500">
              Posts from members will show up here.
            </p>
          </section>
        </main>
      )}
    </Template.AppTemplate>
  );
}
