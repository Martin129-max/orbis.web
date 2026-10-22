"use client";

import { useParams } from "next/navigation";
import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();

  return (
    <Template.AppTemplate>
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader
          actions={<Organism.SidePanelToggle label="Friends" />}
        >
          <Atom.Heading className="min-w-0 truncate">@{username}</Atom.Heading>
        </Template.PageHeader>
        <div className="flex min-h-0 flex-1">
          <Template.PageColumn>
            <Organism.PublicProfile key={username} username={username} />
          </Template.PageColumn>
          <Organism.SidePanel label="Friends">
            <Organism.FriendsPanel />
          </Organism.SidePanel>
        </div>
      </main>
    </Template.AppTemplate>
  );
}
