"use client";

import { useParams } from "next/navigation";
import * as Organism from "@organism";
import * as Template from "@template";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();

  return (
    <Template.AppTemplate>
      <Organism.UserProfile key={username} username={username} />
    </Template.AppTemplate>
  );
}
