"use client";

import { EyeOff, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Atom from "@atom";
import { useAuthStore } from "@/stores/auth-store";
import { MyReports } from "./my-reports";
import { HiddenReports, ReportBoard } from "./report-board";

const tabs = [
  { value: "board", label: "Board", icon: <KanbanSquare size={16} /> },
  { value: "hidden", label: "Hidden", icon: <EyeOff size={16} /> },
] as const;

type Tab = (typeof tabs)[number]["value"];

const content = "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-6 pb-24 sm:px-8 sm:pt-8";

export function ReportsView() {
  const profile = useAuthStore((state) => state.profile);
  const requested = useSearchParams().get("tab");
  const tab: Tab = tabs.find(({ value }) => value === requested)?.value ?? "board";

  if (!profile) {
    return (
      <div className={content}>
        <Atom.Loader />
      </div>
    );
  }

  if (profile.isAdmin) {
    return (
      <>
        <nav
          aria-label="Report sections"
          className="flex shrink-0 items-end gap-6 border-b border-divider px-4 sm:px-8"
        >
          {tabs.map(({ value, label, icon }) => (
            <Link
              key={value}
              href={value === "board" ? "/reports" : `/reports?tab=${value}`}
              aria-current={tab === value ? "page" : undefined}
              className={`focus-ring -mb-px flex shrink-0 items-center gap-2 rounded-t-sm border-b-2 px-1 py-3 text-sm transition-colors ${
                tab === value
                  ? "border-accent text-accent"
                  : "border-transparent font-semibold text-foreground hover:text-accent"
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
        <div className={content}>{tab === "hidden" ? <HiddenReports /> : <ReportBoard />}</div>
      </>
    );
  }

  return (
    <div className={content}>
      <div className="mx-auto flex w-full max-w-[672px] flex-col gap-8 lg:max-w-[760px] xl:max-w-[880px] 2xl:max-w-[1040px]">
        <MyReports />
      </div>
    </div>
  );
}
