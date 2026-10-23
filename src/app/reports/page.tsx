import { Suspense } from "react";
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
        <Suspense>
          <Organism.ReportsView />
        </Suspense>
      </main>
    </Template.AppTemplate>
  );
}
