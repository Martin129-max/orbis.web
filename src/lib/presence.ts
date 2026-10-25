import type { PresenceStatus } from "./api";

export const presenceDot: Record<PresenceStatus, string> = {
  online: "bg-online",
  idle: "bg-warning",
  busy: "bg-danger",
  streaming: "bg-[#9146FF]",
  offline: "bg-offline",
};

export const presenceLabel: Record<PresenceStatus, string> = {
  online: "Online",
  idle: "Idle",
  busy: "Busy",
  streaming: "Live on Twitch",
  offline: "Offline",
};
