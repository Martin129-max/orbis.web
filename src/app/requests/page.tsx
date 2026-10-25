import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function RequestsPage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader>
          <Atom.Heading>Friend requests</Atom.Heading>
        </Template.PageHeader>
        <Organism.FriendRequests />
      </main>
    </Template.AppTemplate>
  );
}
