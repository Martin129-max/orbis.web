import Image from "next/image";
import { initials } from "@/lib/initials";

export function CommunityIcon({
  name,
  src,
}: {
  name: string;
  src?: string | null;
}) {
  return src ? (
    <Image
      src={src}
      alt=""
      fill
      unoptimized
      className="rounded-full object-cover"
    />
  ) : (
    initials(name)
  );
}
