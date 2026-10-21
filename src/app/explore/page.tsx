import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function ExplorePage() {
  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-black/10 px-6 dark:border-white/10">
          <Atom.Heading>Explore</Atom.Heading>
        </header>
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-6 py-6">
            <Organism.CommunitySearch />
          </div>
        </div>
      </main>
    </Template.AppTemplate>
  );
}
