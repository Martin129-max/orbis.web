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
        <Organism.SiteFooter />
      </div>
    </Organism.GuestGate>
  );
}
