"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import { loginUrl } from "@/lib/login";

export function LoginLink({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  return (
    <Atom.Button href={loginUrl(search ? `${pathname}?${search}` : pathname)}>
      {children}
    </Atom.Button>
  );
}
