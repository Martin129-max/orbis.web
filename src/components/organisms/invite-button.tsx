"use client";

import { Modal, Select, Tooltip } from "antd";
import { Check, Copy, Infinity as Unlimited, Timer, Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  createInvite,
  getInvites,
  revokeInvite,
  type Community,
  type Invite,
} from "@/lib/api";
import { displayName } from "@/lib/display-name";
import {
  inviteActive,
  inviteCountdown,
  inviteMaxAges,
  inviteMaxUses,
  inviteUrl,
  inviteUses,
} from "@/lib/invites";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_MAX_AGE = 604800;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);

  return now;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Tooltip title={copied ? "Copied" : "Copy link"}>
      <button
        type="button"
        aria-label={`Copy invite ${code}`}
        onClick={() =>
          navigator.clipboard
            .writeText(inviteUrl(code))
            .then(() => setCopied(true))
            .catch(() => null)
        }
        className="icon-button cursor-pointer"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </Tooltip>
  );
}

function InviteList({
  invites,
  now,
  onRevoke,
}: {
  invites: Invite[];
  now: number;
  onRevoke: (code: string) => void;
}) {
  const [revoking, setRevoking] = useState<string | null>(null);

  return (
    <ul className="flex flex-col divide-y divide-divider">
      {invites.map((invite) => (
        <li key={invite.code} className="flex items-center gap-3 py-2.5">
          <Atom.Avatar
            size="sm"
            label={displayName(invite.creator)}
            src={invite.creator.avatarUrl}
            seed={invite.creator.id}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-mono text-[13px] font-semibold">{invite.code}</span>
            <span className="truncate text-xs text-muted">{displayName(invite.creator)}</span>
          </div>
          <span
            title="Uses"
            className="flex shrink-0 items-center gap-1 text-xs text-muted tabular-nums"
          >
            <Users size={13} aria-hidden />
            {invite.maxUses ? `${invite.uses}/${invite.maxUses}` : invite.uses}
          </span>
          <span
            title="Expires in"
            className="flex w-[72px] shrink-0 items-center gap-1 text-xs text-muted tabular-nums"
          >
            {invite.expiresAt ? <Timer size={13} aria-hidden /> : <Unlimited size={13} aria-hidden />}
            {inviteCountdown(invite.expiresAt, now)}
          </span>
          <div className="flex shrink-0 items-center">
            <CopyButton code={invite.code} />
            <Tooltip title="Revoke invite">
              <button
                type="button"
                aria-label={`Revoke invite ${invite.code}`}
                disabled={revoking === invite.code}
                onClick={async () => {
                  setRevoking(invite.code);
                  try {
                    await onRevoke(invite.code);
                  } finally {
                    setRevoking(null);
                  }
                }}
                className="icon-button cursor-pointer hover:text-danger disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </Tooltip>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function InviteButton({ community }: { community: Community }) {
  const myId = useAuthStore((state) => state.profile?.userId);
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[] | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [maxAge, setMaxAge] = useState(DEFAULT_MAX_AGE);
  const [maxUses, setMaxUses] = useState(0);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = useNow(open);

  const active = invites?.filter((invite) => !invite.permanent && inviteActive(invite, now)) ?? null;
  const invite = active?.find((item) => item.code === current) ?? null;

  async function generate() {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setError(null);
    setCopied(false);
    setPending(true);
    try {
      const created = await createInvite(token, community.id, {
        maxAge: maxAge || null,
        maxUses: maxUses || null,
      });
      setInvites((list) => [created, ...(list ?? [])]);
      setCurrent(created.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  async function handleOpen() {
    setOpen(true);
    const { token } = useAuthStore.getState();
    if (!token) return;

    setPending(true);
    try {
      const list = await getInvites(token, community.id);
      setInvites(list);
      const mine = list.find(
        (item) => !item.permanent && item.creator.id === myId && inviteActive(item, Date.now()),
      );
      if (mine) setCurrent(mine.code);
      else await generate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  async function handleRevoke(code: string) {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setError(null);
    try {
      await revokeInvite(token, community.id, code);
      setInvites((list) => list?.filter((item) => item.code !== code) ?? null);
      if (code === current) setCurrent(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function handleCopy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(inviteUrl(invite.code));
      setCopied(true);
    } catch {
      setError("Couldn’t copy the link. Select it and copy it instead.");
    }
  }

  return (
    <>
      <Atom.Button
        data-tour="invite"
        icon={<UserPlus size={16} />}
        onClick={handleOpen}
        className="flex-1"
      >
        Invite
      </Atom.Button>
      <Modal
        open={open}
        title={null}
        onCancel={() => setOpen(false)}
        footer={null}
        width={560}
        styles={{ container: { padding: 24 } }}
      >
        <div className="flex flex-col gap-6">
          <Molecule.ModalHeader
            eyebrow="Invite"
            title={`Invite friends to ${community.name}.`}
            description="Send this link to anyone you want to join. They’ll be asked to log in or sign up first if they don’t have an account."
          />
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Atom.Input
                aria-label="Invite link"
                size="large"
                readOnly
                value={invite ? inviteUrl(invite.code) : ""}
                placeholder={pending ? "Creating a link…" : "Generate a link below"}
                onFocus={(event) => event.currentTarget.select()}
              />
              <Atom.Button
                size="large"
                disabled={!invite || pending}
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy"}
              </Atom.Button>
            </div>
            {invite && (
              <p className="text-xs text-muted">
                {invite.expiresAt
                  ? `Expires in ${inviteCountdown(invite.expiresAt, now)}`
                  : "Never expires"}{" "}
                · {inviteUses(invite)}
              </p>
            )}
          </div>
          {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
          <div className="flex flex-col gap-4 border-t border-divider pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold">Expire after</span>
                <Select<number>
                  value={maxAge}
                  onChange={setMaxAge}
                  options={inviteMaxAges}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold">
                  Max number of uses
                </span>
                <Select<number>
                  value={maxUses}
                  onChange={setMaxUses}
                  options={inviteMaxUses}
                />
              </label>
            </div>
            <Atom.Button
              variant="secondary"
              loading={pending}
              onClick={() => generate()}
              className="w-fit"
            >
              Generate a new link
            </Atom.Button>
          </div>
          {active && active.length > 0 && (
            <section className="flex flex-col gap-2 border-t border-divider pt-6">
              <h3 className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold">Active invites</span>
                <span className="text-xs text-muted">{active.length}</span>
              </h3>
              <div className="max-h-64 overflow-y-auto">
                <InviteList invites={active} now={now} onRevoke={handleRevoke} />
              </div>
            </section>
          )}
        </div>
      </Modal>
    </>
  );
}
