"use client";

import { Typography } from "antd";
import type { ReactNode } from "react";

export function Heading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography.Title level={1} className={`m-0 text-2xl ${className}`}>
      {children}
    </Typography.Title>
  );
}
