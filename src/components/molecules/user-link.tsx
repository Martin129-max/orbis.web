"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function UserLink({
  username,
  className = "",
  children,
}: {
  username: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={`/users/${username}`}
      onClick={(event) => event.stopPropagation()}
      className={`focus-ring rounded-sm hover:underline ${className}`}
    >
      {children}
    </Link>
  );
}
