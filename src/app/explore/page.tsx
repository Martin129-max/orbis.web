import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function ExplorePage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader>
          <Atom.Heading>Explore</Atom.Heading>
        </Template.PageHeader>
        <Template.PageColumn>
          <Organism.CommunitySearch />
        </Template.PageColumn>
      </main>
    </Template.AppTemplate>
  );
}
