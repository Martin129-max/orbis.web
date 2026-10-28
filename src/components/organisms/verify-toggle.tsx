"use client";

import { App } from "antd";
import { BadgeCheck, BadgeX } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";

export function VerifyToggle({
  verified,
  onToggle,
  compact = false,
}: {
  verified: boolean;
  onToggle: (verified: boolean) => Promise<void>;
  compact?: boolean;
}) {
  const { message } = App.useApp();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      await onToggle(!verified);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Atom.Button
      size="small"
      variant="secondary"
      danger={verified}
      loading={pending}
      icon={verified ? <BadgeX size={14} /> : <BadgeCheck size={14} />}
      onClick={toggle}
      aria-label={compact ? (verified ? "Unverify" : "Verify") : undefined}
      className="shrink-0"
    >
      <span className={compact ? "max-sm:hidden" : undefined}>
        {verified ? "Unverify" : "Verify"}
      </span>
    </Atom.Button>
  );
}
