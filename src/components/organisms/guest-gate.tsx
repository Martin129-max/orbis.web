"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import * as Atom from "@atom";
import { useAuthStore } from "@/stores/auth-store";

export function GuestGate({
  children,
  home,
}: {
  children: ReactNode;
  home?: ReactNode;
}) {
  const router = useRouter();
  const authenticated = useSyncExternalStore(
    useAuthStore.subscribe,
    () => Boolean(useAuthStore.getState().token),
    () => false,
  );
  const hasHome = home !== undefined;

  useEffect(() => {
    if (!useAuthStore.getState().token) {
      delete document.documentElement.dataset.auth;
      return;
    }

    if (!hasHome) router.replace("/");
  }, [router, hasHome]);

  return (
    <>
      <div className="contents authenticated:hidden">{children}</div>
      {authenticated && hasHome ? (
        home
      ) : (
        <div className="hidden flex-1 authenticated:flex">
          <Atom.Loader />
        </div>
      )}
    </>
  );
}
