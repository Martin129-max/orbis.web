import type { Invite } from "@/lib/api";
import { timeAgo } from "@/lib/time";

export const inviteMaxAges = [
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
  { value: 21600, label: "6 hours" },
  { value: 43200, label: "12 hours" },
  { value: 86400, label: "1 day" },
  { value: 604800, label: "7 days" },
  { value: 0, label: "Never" },
];

export const inviteMaxUses = [
  { value: 0, label: "No limit" },
  ...[1, 5, 10, 25, 50, 100].map((value) => ({
    value,
    label: `${value} ${value === 1 ? "use" : "uses"}`,
  })),
];

export function inviteUrl(code: string) {
  return `${window.location.origin}/invite/${code}`;
}

export function inviteExpiry(invite: Pick<Invite, "expiresAt">) {
  return invite.expiresAt ? `Expires ${timeAgo(invite.expiresAt)}` : "Never expires";
}

export function inviteUses(invite: Pick<Invite, "uses" | "maxUses">) {
  return invite.maxUses
    ? `${invite.uses} / ${invite.maxUses} uses`
    : `${invite.uses} ${invite.uses === 1 ? "use" : "uses"}`;
}
