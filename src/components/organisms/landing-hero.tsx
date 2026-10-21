import {
  ArrowUp,
  Compass,
  MessagesSquare,
  Newspaper,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import { SiteStats } from "./site-stats";

const features: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <UsersRound size={20} />,
    title: "Communities",
    text: "Create your own space for any fandom. Make it public, or keep it private for invited members.",
  },
  {
    icon: <Compass size={20} />,
    title: "Explore",
    text: "Search public communities and join the ones you like with one click.",
  },
  {
    icon: <Newspaper size={20} />,
    title: "Home feed",
    text: "Posts and threads from every community you’re in, together in one place.",
  },
  {
    icon: <MessagesSquare size={20} />,
    title: "Forum",
    text: "Start threads, vote on the best ones, and reply in nested comments that stay put.",
  },
  {
    icon: <Users size={20} />,
    title: "Friends",
    text: "Add friends by username and see who’s online. Appear offline whenever you want.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Your rules",
    text: "Owners and admins manage settings and members. Pick a light or dark theme.",
  },
];

export function LandingHero() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-4 py-12 sm:px-8 sm:py-16">
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-5xl leading-[1.04] font-bold sm:text-7xl">
            Your fandom.
            <br />
            Your people.
          </h1>
          <p className="max-w-lg text-[17px] text-muted">
            Orbis is a home for fan communities, with a feed for quick updates
            and a forum for the discussions worth keeping.
          </p>
          <div className="flex flex-wrap gap-3">
            <Atom.ButtonLink href="/register" size="large">
              Create your account
            </Atom.ButtonLink>
            <Atom.ButtonLink href="/login" size="large" variant="secondary">
              Log in
            </Atom.ButtonLink>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px] px-6 pt-6 pb-10 sm:px-10">
          <div
            aria-hidden
            className="absolute top-0 right-0 aspect-square w-3/4 rounded-full bg-accent"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-2xl border-[6px] border-surface bg-surface shadow-[0_24px_48px_-28px_rgb(0_0_0/0.5)]">
            <Image
              src="/images/landing-illustration.jpg"
              alt="Anime fans drawing, reading manga, and sharing ramen around a clubhouse table"
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div
            aria-hidden
            className="absolute top-1/4 left-0 flex items-center gap-2 rounded-full border border-divider bg-surface py-2 pr-4 pl-2 text-xs shadow-[0_8px_20px_-12px_rgb(0_0_0/0.45)]"
          >
            <span className="flex -space-x-2">
              {["L", "S", "N"].map((letter) => (
                <span
                  key={letter}
                  className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-rail-item font-display text-sm font-bold"
                >
                  {letter}
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-online" />
                </span>
              ))}
            </span>
            3 friends online
          </div>
          <div
            aria-hidden
            className="absolute right-0 bottom-0 flex w-64 gap-3 rounded-lg border border-divider bg-surface p-3 shadow-[0_12px_28px_-16px_rgb(0_0_0/0.5)] sm:w-72"
          >
            <span className="flex flex-col items-center gap-0.5 text-accent">
              <ArrowUp size={14} />
              <span className="text-xs font-bold">128</span>
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] text-muted">
                Seasonal Anime Club · Forum
              </span>
              <span className="text-[13px] leading-snug font-bold">
                Which opening are you not skipping this season?
              </span>
            </span>
          </div>
        </div>
      </section>

      <SiteStats />

      <section className="flex flex-col gap-8 border-t border-divider pt-10">
        <h2 className="font-display text-3xl font-bold">
          Everything in one place
        </h2>
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title} className="flex flex-col gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent"
              >
                {feature.icon}
              </span>
              <h3 className="text-base font-bold">{feature.title}</h3>
              <p className="text-[13px] text-muted">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
