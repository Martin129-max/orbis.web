"use client";

import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import { EMAIL_UNCONFIRMED_EVENT, resendConfirmation } from "@/lib/api";
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

const ALERT_MS = 6000;

export function EmailConfirmBanner() {
  const profile = useAuthStore((state) => state.profile);
  const [alerted, setAlerted] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const alert = () => {
      setAlerted(true);
      clearTimeout(timer);
      timer = setTimeout(() => setAlerted(false), ALERT_MS);
    };
    window.addEventListener(EMAIL_UNCONFIRMED_EVENT, alert);
    return () => {
      window.removeEventListener(EMAIL_UNCONFIRMED_EVENT, alert);
      clearTimeout(timer);
    };
  }, []);

  if (!profile || profile.emailVerifiedAt !== null) return null;

  return (
    <section
      aria-label="Confirm your email"
      className={`flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-warning/40 px-4 py-2 text-[13px] transition-colors ${
        alerted ? "bg-warning/30" : "bg-warning/15"
      }`}
    >
      <MailCheck size={16} aria-hidden className="shrink-0 text-warning" />
      <p role="status" className="min-w-0 text-center">
        {alerted ? (
          <strong>Confirm your email first to do that.</strong>
        ) : (
          <>
            <strong>Confirm your email to start posting.</strong>{" "}
            <span className="hidden text-muted sm:inline">
              Until then, Orbis is read-only. Look for the link we sent to{" "}
              <span className="text-foreground">{profile.email}</span>.
            </span>
          </>
        )}
      </p>
      <ResendConfirmation />
    </section>
  );
}
