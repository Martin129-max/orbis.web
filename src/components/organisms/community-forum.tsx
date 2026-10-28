"use client";

import { Dropdown } from "antd";
import { CalendarRange, ChevronDown, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useCallback, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { getThreads, type ThreadRange, type ThreadSort } from "@/lib/api";
import { usePaged } from "@/lib/use-paged";
import { PostList } from "./post-list";

export const threadSorts = [
  { value: "hot", label: "Hot", icon: <Flame size={14} /> },
  { value: "new", label: "New", icon: <Sparkles size={14} /> },
  { value: "top", label: "Top", icon: <TrendingUp size={14} /> },
] satisfies { value: ThreadSort; label: string; icon: ReactNode }[];

const ranges: { key: ThreadRange; label: string }[] = [
  { key: "day", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

function RangePicker({
  range,
  onChange,
}: {
  range: ThreadRange;
  onChange: (range: ThreadRange) => void;
}) {
  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        selectable: true,
        selectedKeys: [range],
        items: ranges,
        onClick: ({ key }) => onChange(key as ThreadRange),
      }}
    >
      <Atom.Button
        size="small"
        variant="secondary"
        aria-label={`Threads from: ${ranges.find(({ key }) => key === range)?.label}`}
        icon={<CalendarRange size={14} />}
      >
        {ranges.find(({ key }) => key === range)?.label}
        <ChevronDown size={12} aria-hidden />
      </Atom.Button>
    </Dropdown>
  );
}

export function ForumThreads({
  communityId,
  sort,
  range,
  onRangeChange,
  trailing,
}: {
  communityId: number;
  sort: ThreadSort;
  range: ThreadRange;
  onRangeChange: (range: ThreadRange) => void;
  trailing: ReactNode;
}) {
  const feed = usePaged(
    useCallback(
      (token: string | null, cursor?: string) =>
        getThreads(token, communityId, sort, cursor, range),
      [communityId, sort, range],
    ),
    { guest: true, types: ["thread"] },
  );

  return (
    <PostList
      feed={feed}
      trailing={trailing}
      filterControl={<RangePicker range={range} onChange={onRangeChange} />}
      empty={{
        title: range === "all" ? "No threads yet." : "No threads in this time.",
        description:
          range === "all"
            ? "Turn on Thread when posting to start a discussion in this community."
            : "Try a longer time range, or start a thread yourself.",
      }}
      end={<Molecule.FeedEnd label="That’s every thread" />}
    />
  );
}
