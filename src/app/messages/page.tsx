import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function MessagesPage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader>
          <Atom.Heading>Messages</Atom.Heading>
        </Template.PageHeader>
        <div className="flex min-h-0 flex-1">
          <Organism.MessagesView />
          <Organism.SidePanel label="Friends">
            <Organism.FriendsPanel />
          </Organism.SidePanel>
        </div>
      </main>
    </Template.AppTemplate>
  );
}
