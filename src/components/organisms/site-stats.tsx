"use client";

import { useEffect, useState } from "react";
import { getStats, type Stats } from "@/lib/api";

const DURATION = 1200;

const labels: { key: keyof Stats; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "communities", label: "Communities" },
  { key: "posts", label: "Posts" },
  { key: "threads", label: "Forum threads" },
  { key: "comments", label: "Comments" },
];

function CountUp({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setCurrent(value));
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      setCurrent(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{current.toLocaleString()}</>;
}

export function SiteStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => null);
  }, []);

  return (
    <section
      aria-label="Orbis in numbers"
      className="flex flex-col gap-8 border-t border-divider pt-10"
    >
      <h2 className="font-display text-3xl font-bold">Orbis in numbers</h2>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {labels.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <dt className="text-xs text-muted uppercase">{label}</dt>
            <dd className="font-display text-5xl leading-none font-bold tabular-nums">
              <CountUp value={stats?.[key] ?? 0} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
