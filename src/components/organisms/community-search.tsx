"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { searchCommunities, type CommunitySearchResult } from "@/lib/api";
import { initials } from "@/lib/initials";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";

export function CommunitySearch() {
  const router = useRouter();
  const joinCommunity = useCommunityStore((state) => state.joinCommunity);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommunitySearchResult[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [joining, setJoining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) {
      router.replace("/login");
      return;
    }

    let ignore = false;
    const timer = setTimeout(() => {
      searchCommunities(token, query.trim())
        .then((found) => {
          if (ignore) return;
          setFailed(false);
          setResults(found);
        })
        .catch(() => {
          if (!ignore) setFailed(true);
        });
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, attempt, router]);

  async function handleJoin(communityId: number) {
    setError(null);
    setJoining(communityId);

    try {
      await joinCommunity(communityId);
      router.push(`/communities/${communityId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setJoining(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Atom.Input
        size="large"
        allowClear
        autoFocus
        prefix={<Search size={18} />}
        placeholder="Search public communities"
        aria-label="Search public communities"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      {failed && !results ? (
        <div className="py-16">
          <Molecule.ConnectionError
            onRetry={() => {
              setFailed(false);
              setAttempt((count) => count + 1);
            }}
          />
        </div>
      ) : !results ? (
        <div className="flex py-16">
          <Atom.Loader />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-1 py-16 text-center">
          <p className="font-medium">No communities found</p>
          <p className="text-sm text-muted">
            {query.trim()
              ? "Try a different name."
              : "No one has made a public community yet."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((community) => (
            <li
              key={community.id}
              className="flex items-center gap-4 rounded-xl border border-black/10 bg-surface p-4 dark:border-white/10"
            >
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent font-semibold text-white"
              >
                {initials(community.name)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{community.name}</span>
                <span className="text-sm text-muted">
                  {community.memberCount}{" "}
                  {community.memberCount === 1 ? "member" : "members"}
                </span>
              </div>
              {community.joined ? (
                <Atom.ButtonLink
                  href={`/communities/${community.id}`}
                  variant="secondary"
                >
                  Open
                </Atom.ButtonLink>
              ) : (
                <Atom.Button
                  loading={joining === community.id}
                  disabled={joining !== null && joining !== community.id}
                  onClick={() => handleJoin(community.id)}
                >
                  Join
                </Atom.Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
