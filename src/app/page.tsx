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
              tagline="Your little corner of the internet"
              actions={<Organism.SidePanelToggle label="Friends" />}
            >
              <Atom.Heading>Home</Atom.Heading>
            </Template.PageHeader>
            <div className="flex min-h-0 flex-1">
              <Template.PageColumn>
                <Organism.HomeFeed />
              </Template.PageColumn>
              <Organism.SidePanel label="Friends">
                <Organism.FriendsPanel />
              </Organism.SidePanel>
            </div>
          </main>
        </Template.AppTemplate>
      }
    >
      <div className="flex flex-1 flex-col font-sans">
        <Organism.SiteHeader />
        <main className="flex-1">
          <Organism.LandingHero />
        </main>
        <footer className="mx-auto w-full max-w-[1280px] px-4 pb-8 sm:px-8">
          <div className="flex flex-wrap justify-between gap-2 border-t border-divider pt-6 text-xs text-muted">
            <p>© {new Date().getFullYear()} Orbis · A home for your worlds.</p>
            <p>Community guidelines / Privacy / Terms</p>
          </div>
        </footer>
      </div>
    </Organism.GuestGate>
  );
}
