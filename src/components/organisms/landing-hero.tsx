import { ArrowDown, ArrowRight, BookOpen, Gamepad2, Tv } from "lucide-react";
import Image from "next/image";
import * as Atom from "@atom";
import {
  LandingCallToAction,
  LandingCommunities,
  LandingExtras,
  LandingShowcase,
} from "./landing-showcase";
import { LandingReveal } from "./landing-reveal";
import { SiteStats } from "./site-stats";

export function LandingHero() {
  return (
    <div data-landing-page>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-20 overflow-x-clip px-5 pt-10 pb-20 sm:gap-28 sm:px-8 sm:pt-16 sm:pb-28 lg:gap-32 lg:pb-32">
        <section className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <div className="flex flex-col items-start gap-7 lg:py-10">
            <p className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              <span aria-hidden className="h-px w-8 bg-accent" />A home for your
              fandoms
            </p>
            <h1 className="font-display text-[clamp(4rem,8vw,7rem)] leading-[0.92] font-bold tracking-tight">
              Your fandom.
              <br />
              <span className="text-accent">Your people.</span>
            </h1>
            <p className="max-w-[440px] text-base leading-relaxed text-muted sm:text-lg">
              The shows you can’t stop watching. The games you keep coming back
              to. Find the people who get it, and make a little space of your
              own.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Atom.ButtonLink
                href="/register"
                size="large"
                icon={<ArrowRight size={17} />}
                iconPlacement="end"
              >
                Find your people
              </Atom.ButtonLink>
              <a
                href="#communities"
                className="focus-ring inline-flex items-center gap-2 rounded-sm py-3 text-sm font-semibold hover:text-accent"
              >
                Take a look around <ArrowDown size={15} aria-hidden />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-divider pt-5 text-xs font-medium text-muted">
              <span className="flex items-center gap-2">
                <Tv size={15} aria-hidden />
                Anime
              </span>
              <span className="flex items-center gap-2">
                <BookOpen size={15} aria-hidden />
                Manga
              </span>
              <span className="flex items-center gap-2">
                <Gamepad2 size={15} aria-hidden />
                Games
              </span>
              <span className="text-muted">And everything in between.</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px] pb-10 pl-3 sm:pl-6">
            <div
              aria-hidden
              className="absolute top-5 right-3 bottom-14 left-0 rounded-[2rem] border border-accent/40"
            />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-divider bg-surface p-2 sm:p-3">
              <div className="relative aspect-square overflow-hidden rounded-[1rem]">
                <Image
                  src="/images/landing-illustration.jpg"
                  alt="Anime fans drawing, reading manga, and sharing ramen around a clubhouse table"
                  fill
                  sizes="(min-width: 1024px) 540px, (min-width: 640px) 520px, 90vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-2 pt-3 pb-1 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase sm:text-xs">
                <span>A space to call your own</span>
                <span className="text-accent">Orbis / Fan communities</span>
              </div>
            </div>
          </div>
        </section>

        <SiteStats />
        <LandingReveal>
          <LandingCommunities />
        </LandingReveal>
        <LandingShowcase />
        <LandingReveal>
          <LandingExtras />
        </LandingReveal>
      </div>
      <LandingReveal>
        <LandingCallToAction />
      </LandingReveal>
    </div>
  );
}
