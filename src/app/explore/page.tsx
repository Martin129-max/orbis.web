import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function ExplorePage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader
          center={<Organism.ExploreSearch />}
          actions={<Organism.SidePanelToggle label="Friends" />}
        >
          <Atom.Heading>Explore</Atom.Heading>
        </Template.PageHeader>
        <div className="flex min-h-0 flex-1">
          <Template.PageColumn>
            <Organism.CommunitySearch />
          </Template.PageColumn>
          <Organism.SidePanel label="Friends">
            <Organism.FriendsPanel />
          </Organism.SidePanel>
        </div>
      </main>
    </Template.AppTemplate>
  );
}
