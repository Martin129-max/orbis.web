"use client";

import { App } from "antd";
import { BadgeCheck, BadgeX } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";

export function VerifyToggle({
  verified,
  onToggle,
}: {
  verified: boolean;
  onToggle: (verified: boolean) => Promise<void>;
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
      className="shrink-0"
    >
      {verified ? "Unverify" : "Verify"}
    </Atom.Button>
  );
}
