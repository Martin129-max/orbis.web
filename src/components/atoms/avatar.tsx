const colors = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-pink-600",
  "bg-rose-600",
  "bg-orange-700",
  "bg-amber-700",
  "bg-emerald-700",
  "bg-teal-700",
  "bg-cyan-700",
  "bg-indigo-600",
  "bg-fuchsia-700",
  "bg-sky-700",
];

function colorFor(seed: string | number) {
  const hash = Array.from(String(seed)).reduce(
    (total, char) => (total * 31 + char.codePointAt(0)!) >>> 0,
    7,
  );
  return colors[hash % colors.length];
}

export function Avatar({
  label,
  seed = label,
}: {
  label: string;
  seed?: string | number;
}) {
  return (
    <span
      aria-hidden
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${colorFor(seed)}`}
    >
      {Array.from(label)[0]?.toUpperCase()}
    </span>
  );
}
