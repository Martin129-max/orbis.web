import type { Metadata } from "next";
import * as Organism from "@organism";
import * as Template from "@template";
import { getChangelog } from "@/lib/changelog-files";

export const metadata: Metadata = {
  title: "Changelog",
  description: "New features, improvements, and fixes in Orbis, day by day.",
};

export default function ChangelogPage() {
  return (
    <Template.AppTemplate>
      <Organism.ChangelogView days={getChangelog()} />
    </Template.AppTemplate>
  );
}
