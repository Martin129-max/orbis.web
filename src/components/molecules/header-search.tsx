"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Atom from "@atom";

export function HeaderSearch({
  label,
  placeholder,
  renderResults,
}: {
  label: string;
  placeholder: string;
  renderResults: (search: string) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: PointerEvent) {
      const target = event.target as Element;
      if (container.current?.contains(target)) return;
      if (target.closest(".ant-modal-root, .ant-message")) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [open]);

  const expanded = open && search.length >= 2;

  return (
    <div
      ref={container}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <Atom.Input
        aria-label={label}
        aria-expanded={expanded}
        className={expanded ? "relative z-[51]" : undefined}
        allowClear
        prefix={<Search size={16} className="text-muted" />}
        placeholder={placeholder}
        autoCapitalize="none"
        autoComplete="off"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
      />
      {expanded && (
        <div className="absolute -inset-x-2 -top-2 z-50 flex max-h-[min(75vh,600px)] flex-col rounded-xl border border-divider bg-surface pt-[52px] shadow-lg">
          <div className="min-h-0 overflow-y-auto border-t border-divider p-3">
            {renderResults(search)}
          </div>
        </div>
      )}
    </div>
  );
}
