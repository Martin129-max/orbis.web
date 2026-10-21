import Image from "next/image";

const tones = ["bg-accent-soft", "bg-rail-item"];

const sizes = {
  xs: "h-5 w-5 text-[11px]",
  sm: "h-8 w-8 text-[17.6px]",
  md: "h-9 w-9 text-[19.8px]",
  rail: "h-8 w-8 text-[17.6px] sm:h-10 sm:w-10 sm:text-[22px]",
  lg: "h-[88px] w-[88px] text-[44px]",
};

function toneFor(seed: string | number) {
  const hash = Array.from(String(seed)).reduce(
    (total, char) => (total * 31 + char.codePointAt(0)!) >>> 0,
    7,
  );
  return tones[hash % tones.length];
}

export function Avatar({
  label,
  src,
  seed = label,
  size = "md",
  presence,
}: {
  label: string;
  src?: string | null;
  seed?: string | number;
  size?: keyof typeof sizes;
  presence?: "online" | "offline";
}) {
  return (
    <span
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center rounded-full border border-divider font-display leading-none font-bold text-foreground ${sizes[size]} ${toneFor(seed)}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          className="rounded-full object-cover"
        />
      ) : (
        Array.from(label)[0]?.toUpperCase()
      )}
      {presence && (
        <span
          className={`absolute -right-px -bottom-px h-3 w-3 rounded-full border-2 border-surface ${
            presence === "online" ? "bg-online" : "bg-offline"
          }`}
        />
      )}
    </span>
  );
}
