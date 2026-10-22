"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { App } from "antd";
import {
  Bug,
  CircleCheck,
  CircleDashed,
  CloudOff,
  Inbox,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  getReports,
  updateReportStatus,
  type Report,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { ticketNumber } from "@/lib/ticket";
import { timeAgo } from "@/lib/time";
import { useAuthStore } from "@/stores/auth-store";

export const categoryStyle: Record<
  ReportCategory,
  { label: string; icon: ReactNode; className: string }
> = {
  bug: { label: "Bug", icon: <Bug size={12} />, className: "bg-accent-soft text-danger" },
  idea: { label: "Idea", icon: <Lightbulb size={12} />, className: "bg-rail-item text-foreground" },
  other: { label: "Other", icon: <MessageCircle size={12} />, className: "bg-rail-item text-muted" },
};

export const columns: { status: ReportStatus; title: string; icon: ReactNode }[] = [
  { status: "todo", title: "To do", icon: <CircleDashed size={16} /> },
  { status: "in_progress", title: "In progress", icon: <LoaderCircle size={16} /> },
  { status: "done", title: "Done", icon: <CircleCheck size={16} /> },
];

function ReportCard({ report, dragging = false }: { report: Report; dragging?: boolean }) {
  const category = categoryStyle[report.category];

  return (
    <article
      className={`flex flex-col gap-3 rounded-lg border border-divider bg-surface p-4 ${
        dragging ? "rotate-1 shadow-[0_16px_32px_-16px_rgb(0_0_0/0.45)]" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] font-semibold text-muted">
          {ticketNumber(report.id)}
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${category.className}`}
        >
          {category.icon}
          {category.label}
        </span>
        <span className="ml-auto text-[11px] text-muted">
          {timeAgo(report.createdAt)}
        </span>
      </div>
      <p className="line-clamp-5 text-sm whitespace-pre-wrap">{report.message}</p>
      <div className="flex items-center gap-2">
        <Atom.Avatar
          size="xs"
          label={displayName(report.author)}
          src={report.author.avatarUrl}
          seed={report.author.id}
        />
        <span className="min-w-0 flex-1 truncate text-xs text-muted">
          {displayName(report.author)}
        </span>
        {report.pageUrl && (
          <Link
            href={report.pageUrl}
            prefetch={false}
            onPointerDown={(event) => event.stopPropagation()}
            className="focus-ring shrink-0 rounded-sm text-[11px] text-muted hover:text-accent"
          >
            {report.pageUrl}
          </Link>
        )}
      </div>
    </article>
  );
}

function DraggableReport({ report }: { report: Report }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: report.id,
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-roledescription="Report card"
      className={`focus-ring cursor-grab touch-none rounded-lg active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <ReportCard report={report} />
    </li>
  );
}

function Column({
  status,
  title,
  icon,
  reports,
}: {
  status: ReportStatus;
  title: string;
  icon: ReactNode;
  reports: Report[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      aria-label={title}
      className={`flex min-h-0 w-72 shrink-0 flex-col gap-3 rounded-xl border p-3 transition-colors sm:w-auto sm:flex-1 ${
        isOver ? "border-accent bg-accent-soft" : "border-divider bg-rail"
      }`}
    >
      <h2 className="flex items-center gap-2 px-1 text-sm font-semibold">
        {icon}
        {title}
        <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">
          {reports.length}
        </span>
      </h2>
      <ul ref={setNodeRef} className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto">
        {reports.map((report) => (
          <DraggableReport key={report.id} report={report} />
        ))}
        {reports.length === 0 && (
          <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-divider p-6 text-center text-xs text-muted">
            Drop a report here
          </li>
        )}
      </ul>
    </section>
  );
}

export function ReportBoard() {
  const { message } = App.useApp();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getReports(token)
      .then(setReports)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const { token } = useAuthStore.getState();
    const report = reports?.find(({ id }) => id === active.id);
    const status = over?.id as ReportStatus | undefined;
    if (!token || !report || !status || report.status === status) return;

    const previous = reports!;
    setReports(previous.map((item) => (item.id === report.id ? { ...item, status } : item)));
    try {
      await updateReportStatus(token, report.id, status);
    } catch (e) {
      setReports(previous);
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  if (error) {
    return (
      <Molecule.FeedState
        role="alert"
        eyebrow="Reports"
        icon={<CloudOff size={24} strokeWidth={1.5} />}
        title="Reports couldn’t be loaded."
        description={error}
      />
    );
  }

  if (!reports) return <Molecule.FeedSkeleton label="Loading reports…" />;

  if (reports.length === 0) {
    return (
      <Molecule.FeedState
        eyebrow="Reports"
        icon={<Inbox size={24} strokeWidth={1.5} />}
        title="No reports yet."
        description="Feedback people send from the button in the corner will show up here."
      />
    );
  }

  const active = reports.find(({ id }) => id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveId(Number(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
        {columns.map((column) => (
          <Column
            key={column.status}
            {...column}
            reports={reports.filter(({ status }) => status === column.status)}
          />
        ))}
      </div>
      <DragOverlay>{active && <ReportCard report={active} dragging />}</DragOverlay>
    </DndContext>
  );
}
