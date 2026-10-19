import * as Organism from "@organism";

export default function Home() {
  return (
    <Organism.GuestGate>
      <div className="flex flex-1 flex-col font-sans">
        <Organism.SiteHeader />
        <main className="flex-1">
          <Organism.LandingHero />
        </main>
        <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-zinc-500">
          © {new Date().getFullYear()} Orbis
        </footer>
      </div>
    </Organism.GuestGate>
  );
}
