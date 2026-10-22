import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function ReportsPage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader>
          <Atom.Heading>Reports</Atom.Heading>
        </Template.PageHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-6 pb-24 sm:px-8 sm:pt-8">
          <Organism.ReportsView />
        </div>
      </main>
    </Template.AppTemplate>
  );
}
