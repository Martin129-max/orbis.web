import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function Home() {
  return (
    <Organism.GuestGate
      home={
        <Template.AppTemplate>
          <main className="flex min-h-0 flex-1 flex-col">
            <header className="flex h-16 shrink-0 items-center border-b border-black/10 px-6 dark:border-white/10">
              <Atom.Heading>Home</Atom.Heading>
              <div className="ml-auto">
                <Organism.SidePanelToggle label="Friends" />
              </div>
            </header>
            <div className="flex min-h-0 flex-1">
              <div className="min-w-0 flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-2xl px-6 py-6">
                  <Organism.HomeFeed />
                </div>
              </div>
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
        <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-muted">
          © {new Date().getFullYear()} Orbis
        </footer>
      </div>
    </Organism.GuestGate>
  );
}
