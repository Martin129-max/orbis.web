import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ChangelogDay } from "./changelog";

const DAY_FILE = /^\d{4}-\d{2}-\d{2}\.json$/;

export function getChangelog(): ChangelogDay[] {
  const directory = path.join(process.cwd(), "changelog");
  let files: string[];
  try {
    files = readdirSync(directory).filter((file) => DAY_FILE.test(file));
  } catch {
    return [];
  }

  return files
    .sort()
    .reverse()
    .map((file) => JSON.parse(readFileSync(path.join(directory, file), "utf8")) as ChangelogDay)
    .filter((day) => Array.isArray(day.entries) && day.entries.length > 0);
}
