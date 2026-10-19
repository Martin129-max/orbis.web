"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function RedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().token) router.replace("/profile");
  }, [router]);

  return null;
}
