"use client";

import { useParams } from "next/navigation";
import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function MediaPage() {
  const { type, sourceId } = useParams<{ type: string; sourceId: string }>();

  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader
          actions={<Organism.SidePanelToggle label="Friends" />}
        >
          <Atom.Heading>Library</Atom.Heading>
        </Template.PageHeader>
        <div className="flex min-h-0 flex-1">
          <Template.PageColumn>
            <Organism.MediaProfile key={`${type}/${sourceId}`} type={type} sourceId={sourceId} />
          </Template.PageColumn>
          <Organism.SidePanel label="Friends">
            <Organism.FriendsPanel />
          </Organism.SidePanel>
        </div>
      </main>
    </Template.AppTemplate>
  );
}
