"use client";

import { CloudOff, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { getMyReports, type Report } from "@/lib/api";
import { ticketNumber } from "@/lib/ticket";
import { timeAgo } from "@/lib/time";
import { useAuthStore } from "@/stores/auth-store";
import { categoryStyle, columns } from "./report-board";

const statusTone = {
  todo: "neutral",
  in_progress: "info",
  done: "success",
} as const;

export function MyReports() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getMyReports(token)
      .then(setReports)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <Molecule.FeedState
        role="alert"
        eyebrow="Reports"
        icon={<CloudOff size={24} strokeWidth={1.5} />}
        title="Your reports couldn’t be loaded."
        description={error}
      />
    );
  }

  if (!reports) return <Molecule.FeedSkeleton label="Loading your reports…" />;

  if (reports.length === 0) {
    return (
      <Molecule.FeedState
        eyebrow="Reports"
        icon={<Inbox size={24} strokeWidth={1.5} />}
        title="No reports yet."
        description="Use the feedback button in the corner to report a bug or share an idea. You’ll get a ticket number to track it here."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => {
        const category = categoryStyle[report.category];
        const status = columns.find(({ status }) => status === report.status)!;
        return (
          <li
            key={report.id}
            className="flex flex-col gap-3 rounded-lg border border-divider bg-surface p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold">
                {ticketNumber(report.id)}
              </span>
              <Atom.Pill tone={category.tone} icon={category.icon}>
                {category.label}
              </Atom.Pill>
              <span className="text-xs text-muted">
                · {timeAgo(report.createdAt)}
              </span>
              <Atom.Pill
                tone={statusTone[report.status]}
                size="md"
                icon={status.icon}
                className="ml-auto"
              >
                {status.title}
              </Atom.Pill>
            </div>
            <p className="text-sm whitespace-pre-wrap">{report.message}</p>
          </li>
        );
      })}
    </ul>
  );
}
