"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import * as Atom from "@atom";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";

export function GuestGate({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!useAuthStore.getState().token) {
      delete document.documentElement.dataset.auth;
      return;
    }

    useCommunityStore
      .getState()
      .homePath()
      .then((path) => router.replace(path));
  }, [router]);

  return (
    <>
      <div className="contents authenticated:hidden">{children}</div>
      <div className="hidden flex-1 authenticated:flex">
        <Atom.Loader />
      </div>
    </>
  );
}
