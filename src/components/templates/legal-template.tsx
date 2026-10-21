import type { ReactNode } from "react";
import * as Organism from "@organism";

export function LegalTemplate({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Organism.SiteHeader />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-12 sm:px-8 sm:py-16">
        <article className="legal flex flex-col gap-4">
          <header className="flex flex-col gap-2 pb-4">
            <h1 className="font-display text-5xl leading-[1.04] font-bold">
              {title}
            </h1>
            <p className="text-xs text-muted">Last updated {updated}</p>
          </header>
          {children}
        </article>
      </main>
      <Organism.SiteFooter />
    </div>
  );
}
