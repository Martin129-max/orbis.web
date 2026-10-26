"use client";

import { Switch } from "antd";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  disconnectSteam,
  getSteamStatus,
  setSteamTrackGames,
  type SteamStatus,
} from "@/lib/api";
import { startSteamConnect } from "@/lib/oauth";
import { useAuthStore } from "@/stores/auth-store";

export function SteamConnection() {
  const [status, setStatus] = useState<SteamStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getSteamStatus(token)
      .then(setStatus)
      .catch(() => setFailed(true));
  }, []);

  async function run(action: (token: string) => Promise<SteamStatus | void>) {
    const { token } = useAuthStore.getState();
    if (!token) return;
    setPending(true);
    setError(null);
    try {
      const next = await action(token);
      if (next) setStatus(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (failed) return <Atom.ErrorMessage>Couldn’t load your Steam connection.</Atom.ErrorMessage>;
  if (!status || (!status.enabled && !status.account)) return null;

  const { account } = status;

  return (
    <div className="flex flex-col gap-3 border-t border-divider pt-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171a21] text-white"
        >
          <Molecule.SteamIcon size={16} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold">Steam</span>
          <span className="truncate text-xs text-muted">
            {account
              ? `Connected as ${account.personaName} · ${account.matched} of ${account.games} games found`
              : "Bring your Steam games and playtime into your library"}
          </span>
        </div>
        {account ? (
          <Atom.Button
            size="small"
            variant="secondary"
            loading={pending}
            onClick={() =>
              run(async (token) => {
                await disconnectSteam(token);
                setStatus({ ...status, account: null });
              })
            }
          >
            Disconnect
          </Atom.Button>
        ) : (
          <Atom.Button size="small" loading={pending} onClick={() => run(startSteamConnect)}>
            Connect
          </Atom.Button>
        )}
      </div>
      {account && (
        <label className="flex items-center justify-between gap-3 pl-11 text-xs">
          <span className="text-muted">
            Add games to my library as Playing the first time I play them
          </span>
          <Switch
            size="small"
            aria-label="Add games to my library the first time I play them"
            checked={account.trackGames}
            disabled={pending}
            onChange={(trackGames) => run((token) => setSteamTrackGames(token, trackGames))}
          />
        </label>
      )}
      {account?.gamesPrivate && (
        <p className="pl-11 text-xs text-warning">
          Your Steam game details are private, so Orbis can’t see your games. In Steam, open
          your profile’s Privacy Settings and set Game details to Public.
        </p>
      )}
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
    </div>
  );
}
