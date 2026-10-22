import { Tooltip } from "antd";
import { Settings } from "lucide-react";
import Link from "next/link";

export function SettingsLink({ href, label }: { href: string; label: string }) {
  return (
    <Tooltip title={label}>
      <Link href={href} aria-label={label} className="icon-button">
        <Settings size={20} />
      </Link>
    </Tooltip>
  );
}
