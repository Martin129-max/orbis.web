import { Tooltip } from "antd";
import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";

export function SettingsLink({
  href,
  label,
  icon = <Settings size={20} />,
}: {
  href: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <Tooltip title={label}>
      <Link href={href} aria-label={label} className="icon-button">
        {icon}
      </Link>
    </Tooltip>
  );
}
