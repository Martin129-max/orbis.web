import type { ReactNode } from "react";

export function ModalHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 pr-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted uppercase">{eyebrow}</p>
        <h2 className="font-display text-[28px] leading-[1.04] font-bold sm:text-[32px]">
          {title}
        </h2>
      </div>
      {description && <p className="text-[13px] text-muted">{description}</p>}
    </header>
  );
}
