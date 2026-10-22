import { Crown, Gem, ShieldCheck, Sparkles } from "lucide-react";
import { Pill, type PillTone } from "./pill";

const roles = {
  owner: { label: "Owner", icon: <Crown size={10} />, tone: "warning" },
  admin: { label: "Admin", icon: <ShieldCheck size={10} />, tone: "info" },
  "site-admin": { label: "Site Admin", icon: <Sparkles size={10} />, tone: "special" },
  "head-admin": { label: "Head Admin", icon: <Gem size={10} />, tone: "accent" },
  member: { label: "Member", icon: null, tone: "neutral" },
} as const satisfies Record<string, { label: string; icon: React.ReactNode; tone: PillTone }>;

export type Role = keyof typeof roles;

export function RoleBadge({ role }: { role: Role }) {
  const { label, icon, tone } = roles[role];

  return (
    <Pill tone={tone} size="xs" icon={icon}>
      {label}
    </Pill>
  );
}
