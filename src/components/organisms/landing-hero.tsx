import { ArrowDown, ArrowUp, MessageCircle } from "lucide-react";
import Image from "next/image";
import * as Atom from "@atom";

const points = [
  {
    eyebrow: "01 / Find your club",
    title: "Independent little worlds.",
    text: "Join anime clubs, manga crews, and very specific obsessions. Each community has its own people and personality.",
  },
  {
    eyebrow: "02 / Share the moment",
    title: "A feed with familiar faces.",
    text: "Share art, discoveries, and the small things that make a fandom feel alive. No shouting into the void.",
  },
  {
    eyebrow: "03 / Keep the discussion",
    title: "Good threads don’t disappear.",
    text: "Build theories, trade recommendations, and return to conversations long after the episode ends.",
  },
];

function SampleThread() {
  return (
    <div
      aria-hidden
      className="flex gap-4 border-b border-divider py-6 select-none"
    >
      <div className="flex w-10 shrink-0 flex-col items-center gap-1 self-start rounded-lg bg-background py-2 text-muted">
        <ArrowUp size={16} />
        <span className="text-xs font-bold text-foreground">128</span>
        <ArrowDown size={16} />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rail-item font-display text-[9.6px]">
            S
          </span>
          Seasonal Anime Club
        </p>
        <p className="text-xs text-muted">gojo · 28m ago</p>
        <p className="text-xl font-bold">
          Which opening are you absolutely not skipping this season?
        </p>
        <p className="text-sm text-muted">
          My vote is the Dandadan OP. The way the visuals sync with the bass
          line is ridiculous. Drop your picks — bonus points for a link to the
          official version.
        </p>
        <p className="flex items-center gap-2 text-xs text-muted">
          <MessageCircle size={14} />
          42 comments
        </p>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-4 py-12 sm:px-8 sm:py-16">
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-bold text-accent uppercase">
            Less scrolling past. More belonging.
          </p>
          <h1 className="font-display text-5xl leading-[1.04] font-bold sm:text-7xl lg:text-[88px]">
            Your fandom.
            <br />
            Your people.
            <br />
            Your little world.
          </h1>
          <p className="max-w-xl text-[17px]">
            For the theories too long for a group chat. The fan art worth
            keeping. The people who never skip the opening.
          </p>
          <p className="max-w-xl text-sm text-muted">
            Orbis brings independent communities, a lively feed, and lasting
            forum discussions together. One account. All your worlds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Atom.ButtonLink href="/register" size="large">
              Create your account
            </Atom.ButtonLink>
            <Atom.ButtonLink href="/login" size="large" variant="secondary">
              Log in
            </Atom.ButtonLink>
          </div>
          <p className="text-xs text-muted">
            Free to join. Built for the things you love.
          </p>
        </div>
        <div className="relative aspect-[640/592] w-full overflow-hidden rounded-xl">
          <Image
            src="/images/clubhouse-cover.jpg"
            alt="Anime fans drawing, reading manga, and sharing ramen around a clubhouse table"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-accent-foreground"
            >
              S
            </span>
            <div className="flex flex-col">
              <span className="text-sm">Seasonal Anime Club</span>
              <span className="text-xs text-muted">
                A thousand rabbit holes.
              </span>
            </div>
          </div>
        </div>
      </section>

      <ul className="grid gap-10 border-t border-divider pt-10 sm:grid-cols-3 sm:gap-8">
        {points.map((point) => (
          <li key={point.title} className="flex flex-col gap-3">
            <p className="text-xs font-bold text-accent uppercase">
              {point.eyebrow}
            </p>
            <h2 className="font-display text-2xl font-bold">{point.title}</h2>
            <p className="text-[13px] text-muted">{point.text}</p>
          </li>
        ))}
      </ul>

      <section className="grid items-start gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-4xl leading-[1.04] font-bold">
            The conversation’s already started.
          </h2>
          <p className="text-[13px] text-muted">
            Come for the anime. Stay for your people.
          </p>
          <Atom.ButtonLink href="/register" className="w-fit">
            Find your people
          </Atom.ButtonLink>
        </div>
        <SampleThread />
      </section>
    </div>
  );
}
