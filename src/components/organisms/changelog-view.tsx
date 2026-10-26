"use client";

import { Bug, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Template from "@template";
import {
  changeCount,
  changelogPath,
  formatChangelogDate,
  versionLabel,
  type ChangelogDay,
  type ChangelogType,
} from "@/lib/changelog";
import { SearchScope } from "./site-search";

const SEARCH_LIMIT = 8;

const groups: { type: ChangelogType; label: string; icon: typeof Sparkles; tone: Atom.PillTone }[] = [
  { type: "new", label: "New", icon: Sparkles, tone: "special" },
  { type: "improved", label: "Improved", icon: TrendingUp, tone: "info" },
  { type: "fixed", label: "Fixed", icon: Bug, tone: "success" },
];

function ChangelogSearchScope({ days }: { days: ChangelogDay[] }) {
  return (
    <SearchScope
      section={{
        label: "Changelog",
        render: (query) => {
          const needle = query.toLowerCase();
          const matches = days
            .flatMap((day, index) =>
              day.entries
                .filter((entry) =>
                  `${entry.title} ${entry.description}`.toLowerCase().includes(needle),
                )
                .map((entry) => ({ day, latest: index === 0, entry })),
            )
            .slice(0, SEARCH_LIMIT);

          if (matches.length === 0) {
            return (
              <p className="py-4 text-center text-sm text-muted">
                Nothing in the changelog matches “{query}”.
              </p>
            );
          }

          return (
            <ul>
              {matches.map(({ day, latest, entry }) => (
                <li key={`${day.date}-${entry.title}`}>
                  <Link
                    href={changelogPath(day.date, latest)}
                    className="focus-ring flex flex-col rounded-md px-2 py-2 text-foreground transition-colors hover:bg-rail-item/60 hover:text-foreground"
                  >
                    <span className="truncate text-sm font-semibold">{entry.title}</span>
                    <span className="truncate text-xs text-muted">
                      {formatChangelogDate(day.date, "short")} · {entry.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          );
        },
      }}
    />
  );
}

function DayArticle({ day, latest }: { day: ChangelogDay; latest: boolean }) {
  const versions = versionLabel(day.versions);

  return (
    <article className="flex flex-col gap-6 rounded-lg border border-divider bg-surface p-5 sm:p-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold text-accent uppercase">
          {latest ? "Latest update" : "Update"}
        </p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          {formatChangelogDate(day.date)}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {versions && <Atom.Pill>{versions}</Atom.Pill>}
          <span>{changeCount(day.entries.length)}</span>
        </div>
      </header>
      {groups.map(({ type, label, icon: Icon, tone }) => {
        const entries = day.entries.filter((entry) => entry.type === type);
        if (entries.length === 0) return null;
        return (
          <section key={type} className="flex flex-col gap-3">
            <h3>
              <Atom.Pill tone={tone} size="md" icon={<Icon size={14} />}>
                {label}
              </Atom.Pill>
            </h3>
            <ul className="flex flex-col gap-4">
              {entries.map((entry) => (
                <li key={entry.title} className="flex flex-col gap-1 border-l-2 border-divider pl-4">
                  <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                    {entry.title}
                    {entry.platforms && !entry.platforms.includes("web") && (
                      <Atom.Pill size="xs">Mobile app</Atom.Pill>
                    )}
                  </span>
                  <span className="text-sm text-muted">{entry.description}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}

function AllUpdates({ days, current }: { days: ChangelogDay[]; current: string | null }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-bold">All updates</h2>
      <ul className="flex flex-col divide-y divide-divider overflow-hidden rounded-lg border border-divider bg-surface">
        {days.map((day, index) => {
          const selected = day.date === current;
          const versions = versionLabel(day.versions);
          return (
            <li key={day.date}>
              <Link
                href={changelogPath(day.date, index === 0)}
                aria-current={selected ? "page" : undefined}
                className={`focus-ring flex items-center gap-3 px-4 py-3 text-foreground transition-colors hover:bg-rail-item/60 hover:text-foreground ${
                  selected ? "bg-rail-item/60" : ""
                }`}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {formatChangelogDate(day.date, "short")}
                    {index === 0 && <Atom.Pill tone="accent" size="xs">Latest</Atom.Pill>}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {day.entries
                      .slice(0, 2)
                      .map((entry) => entry.title)
                      .join(" · ")}
                  </span>
                </span>
                <span className="hidden shrink-0 text-xs text-muted sm:block">
                  {versions ? `${versions} · ` : ""}
                  {changeCount(day.entries.length)}
                </span>
                <ChevronRight size={16} aria-hidden className="shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ChangelogView({ days, date }: { days: ChangelogDay[]; date?: string }) {
  const index = date ? days.findIndex((day) => day.date === date) : 0;
  const current = days[index] ?? null;
  const newer = index > 0 ? days[index - 1] : null;
  const older = index >= 0 && index < days.length - 1 ? days[index + 1] : null;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <ChangelogSearchScope days={days} />
      <Template.PageHeader>
        <Atom.Heading>Changelog</Atom.Heading>
      </Template.PageHeader>
      <Template.PageColumn>
        <div className="flex flex-col gap-8">
          <Molecule.PageIntro
            eyebrow="Changelog"
            title="What’s new in Orbis"
            description="New features, improvements, and fixes, day by day."
          />
          {current ? (
            <>
              <DayArticle day={current} latest={index === 0} />
              {(newer || older) && (
                <nav aria-label="Other updates" className="flex items-center justify-between gap-3">
                  {newer ? (
                    <Atom.ButtonLink
                      href={changelogPath(newer.date, index - 1 === 0)}
                      variant="secondary"
                      size="small"
                      icon={<ChevronLeft size={14} />}
                    >
                      Newer
                    </Atom.ButtonLink>
                  ) : (
                    <span />
                  )}
                  {older && (
                    <Atom.ButtonLink
                      href={changelogPath(older.date, false)}
                      variant="secondary"
                      size="small"
                      icon={<ChevronRight size={14} />}
                      iconPlacement="end"
                    >
                      Older
                    </Atom.ButtonLink>
                  )}
                </nav>
              )}
              <AllUpdates days={days} current={current.date} />
            </>
          ) : (
            <Molecule.FeedState
              icon={<Sparkles size={32} strokeWidth={1.5} />}
              title="No updates yet."
              description="New features, improvements, and fixes will show up here."
            />
          )}
        </div>
      </Template.PageColumn>
    </main>
  );
}
