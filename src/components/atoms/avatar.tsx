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

const sizes = {
  md: "h-9 w-9 text-sm",
  lg: "h-16 w-16 text-2xl",
};

export function Avatar({
  label,
  seed = label,
  size = "md",
}: {
  label: string;
  seed?: string | number;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${colorFor(seed)}`}
    >
      {Array.from(label)[0]?.toUpperCase()}
    </span>
  );
}
