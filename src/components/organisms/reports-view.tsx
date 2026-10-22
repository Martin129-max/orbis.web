"use client";

import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { useAuthStore } from "@/stores/auth-store";
import { MyReports } from "./my-reports";
import { ReportBoard } from "./report-board";

export function ReportsView() {
  const profile = useAuthStore((state) => state.profile);

  if (!profile) return <Atom.Loader />;

  if (profile.isAdmin) {
    return (
      <>
        <Molecule.PageIntro
          eyebrow="Site admin"
          title="Reports."
          description="Drag a report between columns to track what you’re fixing. The person who sent it is notified when it moves."
        />
        <ReportBoard />
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[672px] flex-col gap-8">
      <Molecule.PageIntro
        eyebrow="Feedback"
        title="My reports."
        description="Everything you’ve reported, with its ticket number and status. You’ll get a notification when a report moves."
      />
      <MyReports />
    </div>
  );
}
