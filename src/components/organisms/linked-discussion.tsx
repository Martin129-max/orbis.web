"use client";

import { App } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getCommunityActivity,
  getCommunityPost,
  getThread,
  type FeedEntry,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { DiscussionModal } from "./discussion-modal";

const linkTypes = ["post", "thread", "activity"] as const;

type LinkType = (typeof linkTypes)[number];

function linkedTarget(params: URLSearchParams) {
  for (const type of linkTypes) {
    const id = Number(params.get(type));
    if (Number.isInteger(id) && id > 0) return { type, id };
  }
  return null;
}

function loadLinked(communityId: number, type: LinkType, id: number): Promise<FeedEntry> {
  const { token } = useAuthStore.getState();
  if (type === "post") return getCommunityPost(token, communityId, id);
  if (type === "activity") return getCommunityActivity(token, communityId, id);
  return getThread(token, id).then((thread) => {
    if (thread.communityId !== communityId) throw new Error("That thread isn’t available.");
    return thread;
  });
}

export function LinkedDiscussion({ communityId }: { communityId: number }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();
  const target = linkedTarget(params);
  const type = target?.type;
  const id = target?.id;
  const [item, setItem] = useState<FeedEntry | null>(null);

  const clearLink = useCallback(() => {
    const next = new URLSearchParams(params);
    for (const linkType of linkTypes) next.delete(linkType);
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  useEffect(() => {
    if (!type || !id) return;
    let current = true;
    loadLinked(communityId, type, id)
      .then((loaded) => {
        if (current) setItem(loaded);
      })
      .catch((error: Error) => {
        if (!current) return;
        message.info(error.message);
        clearLink();
      });
    return () => {
      current = false;
    };
  }, [communityId, type, id, message, clearLink]);

  function close() {
    setItem(null);
    clearLink();
  }

  return <DiscussionModal item={item} onClose={close} onChange={setItem} />;
}
