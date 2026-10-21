"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { searchCommunities, type CommunitySearchResult } from "@/lib/api";
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
    <div className="flex flex-col gap-8">
      <Molecule.PageIntro
        eyebrow="Explore"
        title="Find a community."
        description="Search public communities and join the ones that interest you."
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="community-search" className="text-[13px] font-semibold">
          Search communities
        </label>
        <Atom.Input
          id="community-search"
          size="large"
          allowClear
          autoFocus
          prefix={<Search size={16} className="text-muted" />}
          placeholder="Search by community name…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl font-bold">
            {query.trim() ? "Results" : "Public communities"}
          </h3>
          {results && results.length > 0 && (
            <span className="text-xs text-muted">
              {results.length} {results.length === 1 ? "community" : "communities"}
              
            </span>
          )}
        </div>
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
          <p className="py-8 text-sm text-muted">
            {query.trim()
              ? "No communities match your search."
              : "No one has made a public community yet."}
          </p>
        ) : (
          <ul className="flex flex-col">
            {results.map((community) => (
              <li
                key={community.id}
                className="flex items-center gap-4 border-b border-divider py-4"
              >
                <span
                  aria-hidden
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rail-item font-display text-[22px] leading-none font-bold"
                >
                  <Atom.CommunityIcon
                    name={community.name}
                    src={community.iconUrl}
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{community.name}</span>
                  <span className="text-xs text-muted">
                    {community.memberCount.toLocaleString()}{" "}
                    {community.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
                {community.joined ? (
                  <Atom.ButtonLink
                    href={`/communities/${community.id}`}
                    variant="secondary"
                    size="small"
                  >
                    Open
                  </Atom.ButtonLink>
                ) : (
                  <Atom.Button
                    size="small"
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
      </section>
      <p className="text-xs text-muted">
        Can’t find what you’re looking for? Create a new community.
      </p>
    </div>
  );
}
