"use client";

import { Switch } from "antd";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import {
  disconnectOAuth,
  getOAuthConnections,
  getOAuthProviders,
  setShowLive,
  type OAuthConnections as Connections,
  type OAuthProvider,
} from "@/lib/api";
import { OAUTH_PROVIDERS, oauthColors, oauthLabels, startOAuth } from "@/lib/oauth";
import { useAuthStore } from "@/stores/auth-store";
import { OAuthIcon } from "./oauth-buttons";

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

  async function toggleLive(showLive: boolean) {
    const { token } = useAuthStore.getState();
    if (!token || !data) return;
    setError(null);
    const before = data;
    setData({
      ...data,
      connections: {
        ...data.connections,
        connections: data.connections.connections.map((item) =>
          item.provider === "twitch" ? { ...item, showLive } : item,
        ),
      },
    });
    try {
      await setShowLive(token, "twitch", showLive);
    } catch (e) {
      setData(before);
      setError(e instanceof Error ? e.message : "Something went wrong.");
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
            <li key={provider} className="flex flex-col gap-3 py-3">
              <div className="flex items-center gap-3">
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${oauthColors[provider]}`}
              >
                <OAuthIcon provider={provider} />
              </span>
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
              </div>
              {provider === "twitch" && connection && (
                <label className="flex items-center justify-between gap-3 pl-11 text-xs">
                  <span className="text-muted">Show when I’m live on Twitch</span>
                  <Switch size="small" checked={connection.showLive} onChange={toggleLive} />
                </label>
              )}
            </li>
          );
        })}
      </ul>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
    </div>
  );
}
