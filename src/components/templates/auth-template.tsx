import Image from "next/image";
import type { ReactNode } from "react";

export function AuthTemplate({
  illustration,
  children,
}: {
  illustration: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <main className="flex flex-col p-6 sm:p-16">{children}</main>
      <aside className="hidden flex-col gap-8 bg-rail p-12 lg:flex">
        <div className="relative h-[600px] w-full overflow-hidden rounded-xl">
          <Image
            src={illustration}
            alt="Friends gathered around a table full of manga, sketchbooks, and ramen"
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover"
            priority
          />
        </div>
        <p className="font-display text-5xl leading-[1.04] font-bold">
          The best part of a fandom?
          <br />
          Finding your people.
        </p>
        <p className="text-muted">
          Seasonal Anime Club · Hidden Leaf Village
          <br />
          Straw Hat Pirates · Jujutsu High
        </p>
        <p className="text-xs font-bold text-accent uppercase">
          Many little worlds. One Orbis.
        </p>
      </aside>
    </div>
  );
}
