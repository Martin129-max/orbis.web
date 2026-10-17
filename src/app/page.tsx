import { Suspense } from "react";
import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function Home() {
  return (
    <Template.CenteredTemplate>
      <Atom.Heading>Orbis</Atom.Heading>
      <Suspense fallback={<p>Connecting to server...</p>}>
        <Organism.ServerStatus />
      </Suspense>
      <Organism.MainNav />
    </Template.CenteredTemplate>
  );
}
