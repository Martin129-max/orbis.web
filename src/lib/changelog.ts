export type ChangelogType = "new" | "improved" | "fixed";

export type ChangelogEntry = {
  type: ChangelogType;
  title: string;
  description: string;
  platforms?: ("web" | "mobile")[];
};

export type ChangelogDay = {
  date: string;
  versions?: string[];
  entries: ChangelogEntry[];
};

const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function dayOf(date: string) {
  return new Date(`${date}T12:00:00`);
}

export function formatChangelogDate(date: string, style: "long" | "short" = "long") {
  return (style === "long" ? longDate : shortDate).format(dayOf(date));
}

export function versionLabel(versions?: string[]) {
  if (!versions?.length) return null;
  return versions.length === 1 ? versions[0] : `${versions[0]} – ${versions[versions.length - 1]}`;
}

export function changelogPath(date: string, latest: boolean) {
  return latest ? "/changelog" : `/changelog/${date}`;
}

export function changeCount(count: number) {
  return `${count} ${count === 1 ? "change" : "changes"}`;
}
