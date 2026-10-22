"use client";

import { ChevronDown, ExternalLink, Globe, Lock, SearchX, Star, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { getMediaProfile, type LibraryEntry, type MediaProfile as Profile } from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { statusLabel } from "@/lib/library";
import { useAuthStore } from "@/stores/auth-store";
import { mediaTypes } from "./activity-card";
import { AddToLibraryButton, EntryMenu } from "./library-controls";
import { MediaCover, StatusBadge } from "./library-view";

const detailLabels: Record<string, string> = {
  format: "Format",
  episodes: "Episodes",
  duration: "Duration",
  season: "Season",
  studios: "Studios",
  airedFrom: "Aired from",
  airedTo: "Aired to",
  chapters: "Chapters",
  volumes: "Volumes",
  authors: "Authors",
  publishedFrom: "Published from",
  publishedTo: "Published to",
  platforms: "Platforms",
  developers: "Developers",
  publishers: "Publishers",
  releaseDate: "Release date",
};

function formatDetail(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  if (typeof value === "string") {
    if (/^[A-Z0-9]{1,4}$/.test(value)) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll("_", " ");
  }
  return String(value);
}

const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");

const providers: Record<string, string> = {
  anilist: "AniList",
  igdb: "IGDB",
  myanimelist: "MyAnimeList",
  jikan: "MyAnimeList",
};

function Synopsis({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 600;

  return (
    <div className="flex flex-col gap-2">
      <p
        className={`text-sm leading-relaxed whitespace-pre-line ${
          long && !expanded ? "line-clamp-6" : ""
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="focus-ring flex w-fit cursor-pointer items-center gap-1 rounded-sm text-xs font-semibold text-accent hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown size={14} className={expanded ? "rotate-180" : ""} />
        </button>
      )}
    </div>
  );
}

type Loaded = { key: string; profile: Profile | null; error?: string };

export function MediaProfile({ type, sourceId }: { type: string; sourceId: string }) {
  const key = `${type}/${sourceId}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getMediaProfile(token, type, sourceId)
      .then((profile) => setLoaded({ key, profile }))
      .catch((e: Error) => setLoaded({ key, profile: null, error: e.message }));
  }, [key, type, sourceId]);

  const current = loaded?.key === key ? loaded : null;
  if (!current) return <Atom.Loader />;

  if (!current.profile) {
    return (
      <Molecule.FeedState
        role={current.error ? "alert" : undefined}
        eyebrow={current.error ? "Connection error" : "Not found"}
        icon={<SearchX size={24} strokeWidth={1.5} />}
        title={current.error ? "This title couldn’t be loaded." : "We couldn’t find this title."}
        description={current.error ?? "It may have been removed from the source."}
      />
    );
  }

  const profile = current.profile;
  const setEntry = (entry: LibraryEntry | null) =>
    setLoaded({ key, profile: { ...profile, entry } });
  const kind = mediaTypes[profile.type];
  const details = Object.entries(profile.details)
    .filter(([name]) => detailLabels[name])
    .map(([name, value]) => [detailLabels[name], formatDetail(value)] as const)
    .filter((pair): pair is readonly [string, string] => pair[1] !== null);

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-lg border border-divider bg-surface">
        <div className="relative h-32 bg-gradient-to-br from-accent-soft to-rail-item sm:h-44">
          {(profile.bannerImage ?? profile.coverImage) && (
            <Image
              src={(profile.bannerImage ?? profile.coverImage)!}
              alt=""
              fill
              unoptimized
              priority
              className={`object-cover ${profile.bannerImage ? "" : "scale-110 opacity-70 blur-2xl"}`}
            />
          )}
        </div>
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
          <MediaCover
            src={profile.coverImage}
            className="-mt-16 w-28 border-4 border-surface shadow-md sm:w-32"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1 rounded-full bg-rail-item px-2 py-0.5 font-semibold text-foreground">
                {kind.icon}
                {kind.label}
              </span>
              {profile.year && <span>{profile.year}</span>}
              {profile.releaseStatus && <span>· {titleCase(profile.releaseStatus)}</span>}
              {profile.score !== null && (
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star size={12} className="fill-current text-accent" />
                  {profile.score.toFixed(1)}
                </span>
              )}
            </div>
            <h2 className="font-display text-3xl leading-[1.04] font-bold sm:text-4xl">
              {profile.title}
            </h2>
            {profile.altTitles.length > 0 && (
              <p className="line-clamp-1 text-xs text-muted">
                {profile.altTitles.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {profile.entry ? (
              <>
                <span className="flex items-center gap-1.5">
                  <StatusBadge status={profile.entry.status} type={profile.type} />
                  {profile.entry.isPublic ? (
                    <Globe size={14} className="text-muted" aria-label="Public" />
                  ) : (
                    <Lock size={14} className="text-muted" aria-label="Private" />
                  )}
                </span>
                <EntryMenu
                  entry={profile.entry}
                  onChange={setEntry}
                  onRemove={() => setEntry(null)}
                  trigger={
                    <span>
                      <Atom.Button size="small" variant="secondary">
                        Edit
                      </Atom.Button>
                    </span>
                  }
                />
              </>
            ) : (
              <AddToLibraryButton media={profile} onAdded={setEntry} size="middle" />
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
        <section className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5">
          <h3 className="font-display text-xl font-bold">About</h3>
          {profile.synopsis ? (
            <Synopsis text={profile.synopsis} />
          ) : (
            <p className="text-sm text-muted">No synopsis yet.</p>
          )}
          {profile.genres.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {profile.genres.map((genre) => (
                <li key={genre} className="rounded-full bg-rail-item px-2.5 py-1 text-xs font-semibold">
                  {genre}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="flex flex-col gap-3 rounded-lg border border-divider bg-surface p-5">
          <h3 className="font-display text-xl font-bold">Details</h3>
          <dl className="flex flex-col gap-2.5">
            {details.map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-[11px] font-bold text-muted uppercase">{label}</dt>
                <dd className="text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          {profile.source && (
            <a
              href={profile.source.url}
              target="_blank"
              rel="noreferrer"
              className="focus-ring mt-1 flex w-fit items-center gap-1 rounded-sm text-xs font-semibold text-accent hover:underline"
            >
              View on {providers[profile.source.provider] ?? titleCase(profile.source.provider)}
              <ExternalLink size={12} />
            </a>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-divider bg-surface p-5">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold">
          <Users size={18} className="text-muted" />
          In your communities
        </h3>
        {profile.members.length === 0 ? (
          <p className="text-sm text-muted">
            No one in your communities has added this publicly yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {profile.members.map(({ user, status }) => (
              <li
                key={user.id}
                className="flex items-center gap-3 rounded-lg bg-background p-3"
              >
                <Molecule.AuthorAvatar author={user} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Molecule.UserLink
                    username={user.username}
                    className="w-fit truncate text-sm font-semibold"
                  >
                    {displayName(user)}
                  </Molecule.UserLink>
                  <span className="text-xs text-muted">
                    {statusLabel(status, profile.type)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
