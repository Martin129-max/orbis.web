"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import * as Atom from "@atom";
import * as Template from "@template";
import { connectSteam } from "@/lib/api";
import { takeOAuthNonce } from "@/lib/oauth";
import { useAuthStore } from "@/stores/auth-store";

function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function finish() {
      const { token } = useAuthStore.getState();
      const state = params.get("state");
      const nonce = takeOAuthNonce();
      if (!token) throw new Error("Log in to Orbis, then connect Steam again.");
      if (params.get("openid.mode") === "cancel") throw new Error("Connecting Steam was cancelled.");
      if (!state || !nonce) throw new Error("That Steam link didn’t work. Please try again.");

      const openId = Object.fromEntries(
        [...params.entries()].filter(([key]) => key.startsWith("openid.")),
      );
      await connectSteam(token, { state, nonce, params: openId });
      router.replace("/settings");
    }

    finish().catch((cause: Error) => setError(cause.message));
  }, [params, router]);

  if (error) {
    return (
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Atom.Heading>Couldn’t connect Steam</Atom.Heading>
        <Atom.ErrorMessage>{error}</Atom.ErrorMessage>
        <Link href="/settings" className="focus-ring rounded-sm text-sm text-accent hover:underline">
          Back to settings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Atom.Loader />
      <p className="text-sm text-muted">Connecting Steam and looking at your games…</p>
    </div>
  );
}

export default function SteamCallbackPage() {
  return (
    <Template.AppTemplate>
      <Template.CenteredTemplate>
        <Suspense>
          <Callback />
        </Suspense>
      </Template.CenteredTemplate>
    </Template.AppTemplate>
  );
}
