"use client";

import { Tooltip } from "antd";
import { BadgeCheck } from "lucide-react";

const sizes = {
  text: "h-[0.9em] w-[0.9em]",
  heading: "h-[0.65em] w-[0.65em]",
} as const;

export function VerifiedBadge({
  size = "text",
  className = "",
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Tooltip title="Verified">
      <BadgeCheck
        role="img"
        aria-label="Verified"
        className={`shrink-0 fill-info text-info-foreground ${sizes[size]} ${className}`}
      />
    </Tooltip>
  );
}
