import type { ReactNode } from "react";
import { DocumentTemplate } from "./document-template";

export function LegalTemplate({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <DocumentTemplate title={title} description={`Last updated ${updated}`}>
      <article className="legal flex flex-col gap-4 rounded-lg border border-divider bg-surface p-5 sm:p-8">
        {children}
      </article>
    </DocumentTemplate>
  );
}
