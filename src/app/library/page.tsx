import * as Organism from "@organism";
import * as Template from "@template";

export default function LibraryPage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Organism.LibraryView />
      </main>
    </Template.AppTemplate>
  );
}
