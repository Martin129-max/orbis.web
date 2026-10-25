"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { getOAuthProviders, type OAuthProvider } from "@/lib/api";
import { oauthColors, oauthLabels, startOAuth } from "@/lib/oauth";

export function OAuthButtons() {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOAuthProviders()
      .then(setProviders)
      .catch(() => null);
  }, []);

  if (providers.length === 0) return null;

  async function start(provider: OAuthProvider) {
    setPending(provider);
    setError(null);
    try {
      await startOAuth(provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs text-muted uppercase">
        <hr className="flex-1 border-divider" />
        or
        <hr className="flex-1 border-divider" />
      </div>
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          disabled={pending !== null}
          onClick={() => start(provider)}
          className={`focus-ring flex h-10 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60 ${oauthColors[provider]}`}
        >
          {pending === provider ? "Opening…" : `Continue with ${oauthLabels[provider]}`}
        </button>
      ))}
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
    </div>
  );
}
