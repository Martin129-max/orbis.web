"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";
import { confirmEmail } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const MISSING_TOKEN = "This link is incomplete. Open the link from the email again.";

function Confirm() {
  const params = useSearchParams();
  const token = params.get("token");
  const signedIn = useAuthStore((state) => state.token !== null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;

    confirmEmail(token)
      .then(async () => {
        setConfirmed(true);
        if (useAuthStore.getState().token) await useAuthStore.getState().fetchProfile();
      })
      .catch((cause: Error) => setError(cause.message));
  }, [token]);

  const failure = token ? error : MISSING_TOKEN;

  if (failure) {
    return (
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Atom.Heading>Couldn’t confirm your email</Atom.Heading>
        <Atom.ErrorMessage>{failure}</Atom.ErrorMessage>
        {signedIn ? (
          <Organism.ResendConfirmation />
        ) : (
          <Link href="/login" className="focus-ring rounded-sm text-sm text-accent hover:underline">
            Log in to send a new link
          </Link>
        )}
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Atom.Heading>Your email is confirmed</Atom.Heading>
        <p className="text-sm text-muted">Thanks for confirming. You’re all set.</p>
        <Link
          href={signedIn ? "/" : "/login"}
          className="focus-ring rounded-sm text-sm text-accent hover:underline"
        >
          {signedIn ? "Go to Orbis" : "Log in"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Atom.Loader />
      <p className="text-sm text-muted">Confirming your email…</p>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Template.AppTemplate>
      <Template.CenteredTemplate>
        <Suspense>
          <Confirm />
        </Suspense>
      </Template.CenteredTemplate>
    </Template.AppTemplate>
  );
}
