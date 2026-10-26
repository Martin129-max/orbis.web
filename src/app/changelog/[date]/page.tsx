import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as Organism from "@organism";
import * as Template from "@template";
import { formatChangelogDate } from "@/lib/changelog";
import { getChangelog } from "@/lib/changelog-files";

type Props = { params: Promise<{ date: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getChangelog().map(({ date }) => ({ date }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Changelog for ${formatChangelogDate(date)}`,
    description: "New features, improvements, and fixes in Orbis.",
  };
}

export default async function ChangelogDayPage({ params }: Props) {
  const { date } = await params;
  const days = getChangelog();
  if (!days.some((day) => day.date === date)) notFound();

  return (
    <Template.AppTemplate>
      <Organism.ChangelogView days={days} date={date} />
    </Template.AppTemplate>
  );
}
