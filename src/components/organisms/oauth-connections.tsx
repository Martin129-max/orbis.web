"use client";

import { useEffect, useState } from "react";
import * as Atom from "@atom";
import {
  disconnectOAuth,
  getOAuthConnections,
  getOAuthProviders,
  type OAuthConnections as Connections,
  type OAuthProvider,
} from "@/lib/api";
import { OAUTH_PROVIDERS, oauthColors, oauthLabels, startOAuth } from "@/lib/oauth";
import { useAuthStore } from "@/stores/auth-store";

export function OAuthConnections() {
  const [data, setData] = useState<{ enabled: OAuthProvider[]; connections: Connections } | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    const { token } = useAuthStore.getState();
    if (!token) return;
    Promise.all([getOAuthProviders(), getOAuthConnections(token)])
      .then(([enabled, connections]) => setData({ enabled, connections }))
      .catch(() => setFailed(true));
  }

  useEffect(load, []);

  async function connect(provider: OAuthProvider) {
    const { token } = useAuthStore.getState();
    if (!token) return;
    setPending(provider);
    setError(null);
    try {
      await startOAuth(provider, token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(null);
    }
  }

  async function disconnect(provider: OAuthProvider) {
    const { token } = useAuthStore.getState();
    if (!token) return;
    setPending(provider);
    setError(null);
    try {
      await disconnectOAuth(token, provider);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(null);
    }
  }

  if (failed) return <Atom.ErrorMessage>Couldn’t load your connections.</Atom.ErrorMessage>;
  if (!data) return <Atom.Loader />;

  const { enabled, connections } = data;
  const onlyWay = !connections.hasPassword && connections.connections.length === 1;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-divider">
        {OAUTH_PROVIDERS.map((provider) => {
          const connection = connections.connections.find((item) => item.provider === provider);
          if (!connection && !enabled.includes(provider)) return null;
          const locked = Boolean(connection) && onlyWay;

          return (
            <li key={provider} className="flex items-center gap-3 py-3">
              <span aria-hidden className={`h-3 w-3 shrink-0 rounded-full ${oauthColors[provider]}`} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{oauthLabels[provider]}</span>
                <span className="truncate text-xs text-muted">
                  {connection
                    ? locked
                      ? `Connected as ${connection.username}. It’s how you log in, so it can’t be disconnected.`
                      : `Connected as ${connection.username}`
                    : "Not connected"}
                </span>
              </div>
              {connection ? (
                <Atom.Button
                  size="small"
                  variant="secondary"
                  disabled={locked || pending !== null}
                  loading={pending === provider}
                  onClick={() => disconnect(provider)}
                >
                  Disconnect
                </Atom.Button>
              ) : (
                <Atom.Button
                  size="small"
                  disabled={pending !== null}
                  loading={pending === provider}
                  onClick={() => connect(provider)}
                >
                  Connect
                </Atom.Button>
              )}
            </li>
          );
        })}
      </ul>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
    </div>
  );
}
