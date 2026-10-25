"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLayoutStore } from "@/stores/layout-store";

export function PageSearch({ children }: { children: ReactNode }) {
  const slot = useLayoutStore((state) => state.searchSlot);
  const registerPageSearch = useLayoutStore((state) => state.registerPageSearch);

  useEffect(() => registerPageSearch(), [registerPageSearch]);

  return slot ? createPortal(children, slot) : null;
}
