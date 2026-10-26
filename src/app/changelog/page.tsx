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
    <Template.DocumentTemplate
      title="What’s new in Orbis"
      description="New features, improvements, and fixes, day by day."
    >
      <Organism.ChangelogView days={getChangelog()} />
    </Template.DocumentTemplate>
  );
}
