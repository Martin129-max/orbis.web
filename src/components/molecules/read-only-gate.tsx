"use client";

import { Tooltip } from "antd";
import { cloneElement, type ReactElement } from "react";
import { useReadOnly } from "@/lib/read-only";

export function ReadOnlyGate({
  action,
  children,
}: {
  action: string;
  children: ReactElement<{ disabled?: boolean }>;
}) {
  const readOnly = useReadOnly();
  if (!readOnly) return children;

  return (
    <Tooltip title={`Confirm your email first to ${action}.`}>
      {cloneElement(children, { disabled: true })}
    </Tooltip>
  );
}
