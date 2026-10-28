"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnfinishedDiscord, type UnfinishedDiscord } from "@/lib/api";
import { oauthColors } from "@/lib/oauth";
import { useAuthStore } from "@/stores/auth-store";
import { OAuthIcon } from "./oauth-buttons";

export const DISCORD_CHECK_MS = 5 * 60 * 1000;

export function DiscordWidgetSteps({ server }: { server: string | null }) {
  return (
    <ol className="flex list-decimal flex-col gap-0.5 pl-5 text-[13px] text-muted">
      <li>In Discord, open the server settings for {server ?? "your server"}.</li>
      <li>Go to Engagement, then Server Widget.</li>
      <li>Turn on Enable Server Widget.</li>
      <li>Pick an Invite Channel so people can join from Orbis.</li>
    </ol>
  );
}

export function useUnfinishedDiscord() {
  const token = useAuthStore((state) => state.token);
  const [unfinished, setUnfinished] = useState<UnfinishedDiscord[]>([]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const check = () =>
      getUnfinishedDiscord(token)
        .then((communities) => {
          if (active) setUnfinished(communities);
        })
        .catch(() => undefined);

    check();
    const timer = setInterval(check, DISCORD_CHECK_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [token]);

  return token ? unfinished : [];
}

export function DiscordSetupReminder({ community }: { community: UnfinishedDiscord }) {
  return (
    <section
      aria-label="Discord setup"
      className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4"
    >
      <span
        aria-hidden
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${oauthColors.discord}`}
      >
        <OAuthIcon provider="discord" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[11px] font-bold text-muted uppercase">Discord setup</p>
        <p className="text-sm font-semibold">
          Your Discord connection for {community.name} isn’t finished
        </p>
        <p className="text-[13px] text-muted">
          To show how many people are online there, turn on the server widget in Discord:
        </p>
        <DiscordWidgetSteps server={community.discordGuildName} />
        <p className="text-[13px] text-muted">
          Orbis checks every 5 minutes, and this goes away once the widget is on.
        </p>
        <Link
          href={`/communities/${community.id}/settings?tab=connections`}
          className="focus-ring w-fit rounded-sm text-[13px] font-semibold text-accent hover:underline"
        >
          Open Discord settings
        </Link>
      </div>
    </section>
  );
}
