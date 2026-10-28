"use client";

import { MailCheck } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";
import { resendConfirmation } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function ResendConfirmation() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    const { token, fetchProfile } = useAuthStore.getState();
    if (!token) return;
    setState("sending");
    setError(null);
    try {
      const { confirmed } = await resendConfirmation(token);
      if (confirmed) await fetchProfile();
      setState("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setState("idle");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {state === "sent" ? (
        <p className="text-[13px] text-muted">
          Sent. Check your inbox, and your spam folder just in case.
        </p>
      ) : (
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending"}
          className="focus-ring w-fit cursor-pointer rounded-sm text-[13px] font-semibold text-accent hover:underline disabled:cursor-default disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send a new link"}
        </button>
      )}
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
    </div>
  );
}

export function EmailConfirmReminder({ email }: { email: string }) {
  return (
    <section
      aria-label="Confirm your email"
      className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning text-warning-foreground"
      >
        <MailCheck size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[11px] font-bold text-muted uppercase">Confirm your email</p>
        <p className="text-sm font-semibold">Check your inbox for a link from Orbis</p>
        <p className="text-[13px] text-muted">
          Open the link we email you to confirm{" "}
          <span className="font-semibold break-all text-foreground">{email}</span> is yours. If you
          don’t have one, or it has expired, send a new one.
        </p>
        <ResendConfirmation />
      </div>
    </section>
  );
}
