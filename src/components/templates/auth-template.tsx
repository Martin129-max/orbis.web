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
    <div className="mx-auto grid min-h-dvh w-full max-w-[1600px] flex-1 lg:grid-cols-2">
      <main className="flex items-center justify-center px-5 py-8 sm:px-12 sm:py-12 lg:px-16">
        {children}
      </main>
      <aside className="hidden p-5 pl-0 lg:block">
        <div className="sticky top-5 flex h-[calc(100dvh-2.5rem)] min-h-[560px] flex-col overflow-hidden rounded-[2rem] border border-divider bg-accent-soft">
          <div className="relative min-h-0 flex-1">
            <Image
              src={illustration}
              alt="Friends gathered around a table full of manga, sketchbooks, and ramen"
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col gap-4 border-t border-accent/15 p-8 xl:p-10">
            <p className="text-xs font-semibold tracking-[0.15em] text-accent uppercase">
              A home for your fandoms
            </p>
            <h2 className="font-display text-5xl leading-[0.95] font-bold tracking-tight xl:text-6xl">
              Your fandom.
              <br />
              <span className="text-accent">Your people.</span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              A place for the stories you love and the people who love them too.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
