"use client";

import { App } from "antd";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";
import { setSiteAdmin } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AdminToggle({
  username,
  isAdmin,
  onChange,
}: {
  username: string;
  isAdmin: boolean;
  onChange: (isAdmin: boolean) => void;
}) {
  const { message } = App.useApp();
  const [pending, setPending] = useState(false);
  const label = isAdmin ? "Remove admin" : "Make admin";

  async function toggle() {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setPending(true);
    try {
      onChange(await setSiteAdmin(token, username, !isAdmin));
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
      danger={isAdmin}
      loading={pending}
      icon={isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
      onClick={toggle}
      className="shrink-0"
    >
      {label}
    </Atom.Button>
  );
}
