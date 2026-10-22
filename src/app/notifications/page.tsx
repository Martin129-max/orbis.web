import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function NotificationsPage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader
          center={<Organism.NotificationSearch />}
          actions={
            <>
              <Organism.MarkAllReadButton />
              <Organism.SidePanelToggle label="Friends" />
            </>
          }
        >
          <Atom.Heading>Notifications</Atom.Heading>
        </Template.PageHeader>
        <Organism.NotificationCenter />
      </main>
    </Template.AppTemplate>
  );
}
