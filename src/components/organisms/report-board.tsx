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
import { App, Input, Modal, Tooltip } from "antd";
import {
  Bug,
  CircleCheck,
  CircleDashed,
  CloudOff,
  EyeOff,
  Inbox,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  getReports,
  setReportHidden,
  updateReportStatus,
  type Report,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { getReporterStatusLabel } from "@/lib/report-status";
import { ticketNumber } from "@/lib/ticket";
import { timeAgo } from "@/lib/time";
import { useAuthStore } from "@/stores/auth-store";

export const categoryStyle: Record<
  ReportCategory,
  { label: string; icon: ReactNode; tone: Atom.PillTone }
> = {
  bug: { label: "Bug", icon: <Bug size={12} />, tone: "danger" },
  idea: { label: "Idea", icon: <Lightbulb size={12} />, tone: "warning" },
  other: { label: "Other", icon: <MessageCircle size={12} />, tone: "neutral" },
};

export const columns: { status: ReportStatus; title: string; icon: ReactNode }[] = [
  { status: "todo", title: "To do", icon: <CircleDashed size={16} /> },
  { status: "in_progress", title: "In progress", icon: <LoaderCircle size={16} /> },
  { status: "done", title: "Done", icon: <CircleCheck size={16} /> },
];

function ReportCard({
  report,
  dragging = false,
  action,
}: {
  report: Report;
  dragging?: boolean;
  action?: ReactNode;
}) {
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
        <Atom.Pill tone={category.tone} icon={category.icon}>
          {category.label}
        </Atom.Pill>
        <span className="ml-auto text-[11px] text-muted">
          {timeAgo(report.createdAt)}
        </span>
        {action}
      </div>
      <p className="line-clamp-5 text-sm whitespace-pre-wrap">{report.message}</p>
      {report.resolutionNote && (
        <p className="line-clamp-3 rounded-md bg-rail px-2.5 py-2 text-xs whitespace-pre-wrap text-muted">
          <span className="font-semibold text-foreground">Reply: </span>
          {report.resolutionNote}
        </p>
      )}
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

function DraggableReport({ report, onHide }: { report: Report; onHide: (report: Report) => void }) {
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
      <ReportCard
        report={report}
        action={
          <Tooltip title="Hide report">
            <button
              type="button"
              aria-label={`Hide report ${ticketNumber(report.id)}`}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onClick={() => onHide(report)}
              className="icon-button -my-1 -mr-1.5 cursor-pointer p-1"
            >
              <EyeOff size={14} />
            </button>
          </Tooltip>
        }
      />
    </li>
  );
}

function Column({
  status,
  title,
  icon,
  reports,
  onHide,
}: {
  status: ReportStatus;
  title: string;
  icon: ReactNode;
  reports: Report[];
  onHide: (report: Report) => void;
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
          <DraggableReport key={report.id} report={report} onHide={onHide} />
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

function DoneModal({
  report,
  onCancel,
  onConfirm,
}: {
  report: Report | null;
  onCancel: () => void;
  onConfirm: (note?: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<"send" | "skip" | null>(null);

  async function confirm(withNote: boolean) {
    setPending(withNote ? "send" : "skip");
    try {
      await onConfirm(withNote ? note.trim() : undefined);
      setNote("");
    } finally {
      setPending(null);
    }
  }

  const name = report ? displayName(report.author) : "";

  return (
    <Modal
      open={report !== null}
      title={null}
      footer={null}
      width={480}
      destroyOnHidden
      onCancel={() => {
        setNote("");
        onCancel();
      }}
      styles={{ container: { padding: 24 } }}
    >
      {report && (
        <div className="flex flex-col gap-6">
          <Molecule.ModalHeader
            eyebrow={`Report ${ticketNumber(report.id)}`}
            title={`Mark as ${getReporterStatusLabel("done", report.category).toLowerCase()}.`}
            description={`${name} will be notified. Add a message if you want to tell them what changed.`}
          />
          <Input.TextArea
            aria-label={`Message to ${name}`}
            placeholder={`Write a message to ${name}…`}
            maxLength={1000}
            autoSize={{ minRows: 3, maxRows: 8 }}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            autoFocus
          />
          <div className="flex flex-wrap justify-end gap-2 border-t border-divider pt-6">
            <Atom.Button
              variant="secondary"
              disabled={pending !== null}
              onClick={() => {
                setNote("");
                onCancel();
              }}
            >
              Cancel
            </Atom.Button>
            <Atom.Button
              variant="secondary"
              loading={pending === "skip"}
              disabled={pending === "send"}
              onClick={() => confirm(false)}
            >
              Skip message
            </Atom.Button>
            <Atom.Button
              loading={pending === "send"}
              disabled={!note.trim() || pending === "skip"}
              onClick={() => confirm(true)}
            >
              Send
            </Atom.Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function ReportBoard() {
  const { message, modal } = App.useApp();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [finishing, setFinishing] = useState<Report | null>(null);
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

  async function move(report: Report, status: ReportStatus, note?: string) {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setReports((current) =>
      current?.map((item) =>
        item.id === report.id ? { ...item, status, resolutionNote: note || null } : item,
      ) ?? null,
    );
    try {
      const updated = await updateReportStatus(token, report.id, status, note);
      setReports((current) => current?.map((item) => (item.id === report.id ? updated : item)) ?? null);
    } catch (e) {
      setReports((current) => current?.map((item) => (item.id === report.id ? report : item)) ?? null);
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const report = reports?.find(({ id }) => id === active.id);
    const status = over?.id as ReportStatus | undefined;
    if (!report || !status || report.status === status) return;

    if (status === "done") setFinishing(report);
    else move(report, status);
  }

  function handleHide(report: Report) {
    modal.confirm({
      title: `Hide report ${ticketNumber(report.id)}?`,
      content: `It moves to the Hidden tab. ${displayName(report.author)} won’t be notified and will still see it in their reports.`,
      okText: "Hide",
      cancelText: "Cancel",
      onOk: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return;
        try {
          await setReportHidden(token, report.id, true);
          setReports((current) => current?.filter(({ id }) => id !== report.id) ?? null);
          message.success(`Report ${ticketNumber(report.id)} hidden.`);
        } catch (e) {
          message.error(e instanceof Error ? e.message : "Something went wrong.");
        }
      },
    });
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
            onHide={handleHide}
          />
        ))}
      </div>
      <DragOverlay>{active && <ReportCard report={active} dragging />}</DragOverlay>
      <DoneModal
        report={finishing}
        onCancel={() => setFinishing(null)}
        onConfirm={async (note) => {
          const report = finishing;
          setFinishing(null);
          if (report) await move(report, "done", note);
        }}
      />
    </DndContext>
  );
}

export function HiddenReports() {
  const { message, modal } = App.useApp();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    getReports(token, true)
      .then(setReports)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function restore(report: Report) {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setRestoring(report.id);
    try {
      await setReportHidden(token, report.id, false);
      setReports((current) => current?.filter(({ id }) => id !== report.id) ?? null);
      message.success(`Report ${ticketNumber(report.id)} moved back to To do.`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRestoring(null);
    }
  }

  if (error) {
    return (
      <Molecule.FeedState
        role="alert"
        eyebrow="Hidden reports"
        icon={<CloudOff size={24} strokeWidth={1.5} />}
        title="Hidden reports couldn’t be loaded."
        description={error}
      />
    );
  }

  if (!reports) return <Molecule.FeedSkeleton label="Loading hidden reports…" />;

  if (reports.length === 0) {
    return (
      <Molecule.FeedState
        eyebrow="Hidden reports"
        icon={<EyeOff size={24} strokeWidth={1.5} />}
        title="Nothing hidden."
        description="Reports you hide from the board show up here."
      />
    );
  }

  return (
    <ul className="mx-auto grid w-full max-w-[880px] grid-cols-1 gap-3 md:grid-cols-2">
      {reports.map((report) => (
        <li key={report.id} className="flex flex-col gap-2">
          <ReportCard report={report} />
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-[11px] text-muted">
              Hidden {report.hiddenAt ? timeAgo(report.hiddenAt) : ""}
            </span>
            <Atom.Button
              size="small"
              variant="secondary"
              icon={<RotateCcw size={14} />}
              loading={restoring === report.id}
              onClick={() =>
                modal.confirm({
                  title: `Move report ${ticketNumber(report.id)} back to To do?`,
                  content: `It goes back on the board in To do${
                    report.resolutionNote ? " and its reply is cleared" : ""
                  }. ${displayName(report.author)} won’t be notified.`,
                  okText: "Move back",
                  cancelText: "Cancel",
                  onOk: () => restore(report),
                })
              }
            >
              Move back to To do
            </Atom.Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
