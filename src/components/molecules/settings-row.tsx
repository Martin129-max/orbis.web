import type { ReactNode } from "react";

export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold">{label}</span>
        {children}
      </label>
      {description && <p className="text-xs text-muted">{description}</p>}
    </div>
  );
}
