import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold text-accent uppercase">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-[1.04] font-bold sm:text-5xl">
        {title}
      </h2>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
