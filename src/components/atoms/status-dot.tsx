import type { PresenceStatus } from "@/lib/api";
import { presenceDot } from "@/lib/presence";

export function StatusDot({
  status,
  cutout = "bg-surface",
}: {
  status: PresenceStatus;
  cutout?: string;
}) {
  return (
    <span
      className={`flex h-full w-full items-center justify-center rounded-full ${presenceDot[status]} ${
        status === "idle"
          ? "[mask-image:radial-gradient(circle_at_22%_22%,transparent_40%,#000_41%)]"
          : ""
      }`}
    >
      {status === "busy" && <span className={`h-[22%] w-[60%] rounded-full ${cutout}`} />}
    </span>
  );
}
