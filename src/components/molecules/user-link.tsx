"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import * as Atom from "@atom";

export function UserLink({
  username,
  verified = false,
  className = "",
  children,
}: {
  username: string;
  verified?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={`/users/${username}`}
      onClick={(event) => event.stopPropagation()}
      className={`focus-ring rounded-sm hover:underline ${
        verified ? "inline-flex max-w-full min-w-0 items-center gap-[0.2em]" : ""
      } ${className}`}
    >
      {verified ? (
        <>
          <span className="truncate">{children}</span>
          <Atom.VerifiedBadge />
        </>
      ) : (
        children
      )}
    </Link>
  );
}
