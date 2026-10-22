"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Organism from "@organism";
import * as Template from "@template";
import { getInvitePreview, type InvitePreview } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";

type Loaded = { code: string; invite: InvitePreview | null; failed?: boolean };

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const token = useSyncExternalStore(
    useAuthStore.subscribe,
    () => useAuthStore.getState().token,
    () => null,
  );
  const acceptInvite = useCommunityStore((state) => state.acceptInvite);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInvitePreview(code)
      .then((invite) => setLoaded({ code, invite }))
      .catch(() => setLoaded({ code, invite: null, failed: true }));
  }, [code]);

  async function join() {
    setError(null);
    setJoining(true);
    try {
      const community = await acceptInvite(code);
      router.replace(`/communities/${community.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setJoining(false);
    }
  }

  const current = loaded?.code === code ? loaded : null;

  return (
    <Template.AuthTemplate
      illustration={
        mode === "signup" && !token
          ? "/images/signup-illustration.jpg"
          : "/images/login-illustration.jpg"
      }
    >
      {!current ? (
        <div className="flex flex-1 items-center justify-center">
          <Atom.Loader />
        </div>
      ) : current.failed ? (
        <div className="flex flex-1 items-center justify-center">
          <Molecule.ConnectionError onRetry={() => window.location.reload()} />
        </div>
      ) : current.invite && !token ? (
        <Organism.AuthForm
          key={mode}
          mode={mode}
          intro={<Molecule.InviteSummary invite={current.invite} />}
          onAuthenticated={join}
          onSwitch={() => setMode(mode === "login" ? "signup" : "login")}
        />
      ) : (
        <div className="flex w-full max-w-[400px] flex-col gap-10 sm:gap-16">
          <Link
            href="/"
            className="focus-ring inline-flex w-fit items-center gap-2 rounded-sm text-[13px] transition-colors hover:text-accent"
          >
            <ArrowLeft size={16} />
            Back to homepage
          </Link>
          <div className="flex flex-col gap-6">
            <Atom.Brand className="text-5xl" />
            {current.invite ? (
              <>
                <Molecule.InviteSummary invite={current.invite} />
                {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
                <Atom.Button
                  size="large"
                  loading={joining}
                  onClick={join}
                  className="w-fit"
                >
                  Join {current.invite.community.name}
                </Atom.Button>
              </>
            ) : (
              <>
                <h1 className="font-display text-5xl leading-[1.04] font-bold">
                  Invite invalid.
                </h1>
                <p className="text-sm text-muted">
                  This invite may have expired, reached its limit, or been
                  revoked. Ask whoever sent it for a new one.
                </p>
                <Atom.ButtonLink href="/" size="large" className="w-fit">
                  Go to Orbis
                </Atom.ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </Template.AuthTemplate>
  );
}
