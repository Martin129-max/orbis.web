import { Suspense } from "react";
import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function Home() {
  return (
    <Organism.GuestGate
      home={
        <Template.AppTemplate>
          <main className="flex min-h-0 flex-1 flex-col">
            <Template.PageHeader
              center={<Organism.PeopleSearch />}
              actions={<Organism.SidePanelToggle label="Friends" />}
            >
              <Atom.Heading>Home</Atom.Heading>
            </Template.PageHeader>
            <Suspense>
              <Organism.HomeView />
            </Suspense>
          </main>
        </Template.AppTemplate>
      }
    >
      <div className="flex flex-1 flex-col font-sans">
        <Organism.SiteHeader sticky />
        <main className="flex-1">
          <Organism.LandingHero />
        </main>
        <Organism.SiteFooter bordered={false} />
      </div>
    </Organism.GuestGate>
  );
}
