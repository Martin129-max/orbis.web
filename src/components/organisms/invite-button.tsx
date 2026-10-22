"use client";

import { Modal, Select } from "antd";
import { Check, Copy, UserPlus } from "lucide-react";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { createInvite, type Community, type Invite } from "@/lib/api";
import {
  inviteExpiry,
  inviteMaxAges,
  inviteMaxUses,
  inviteUrl,
  inviteUses,
} from "@/lib/invites";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_MAX_AGE = 604800;

export function InviteButton({ community }: { community: Community }) {
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [maxAge, setMaxAge] = useState(DEFAULT_MAX_AGE);
  const [maxUses, setMaxUses] = useState(0);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setError(null);
    setCopied(false);
    setPending(true);
    try {
      setInvite(
        await createInvite(token, community.id, {
          maxAge: maxAge || null,
          maxUses: maxUses || null,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    if (!invite) generate();
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
        block
        icon={<UserPlus size={16} />}
        onClick={handleOpen}
        className="shrink-0"
      >
        Invite people
      </Atom.Button>
      <Modal
        open={open}
        title={null}
        onCancel={() => setOpen(false)}
        footer={null}
        width={520}
        styles={{ container: { padding: 24 } }}
      >
        <div className="flex flex-col gap-6">
          <Molecule.ModalHeader
            eyebrow="Invite people"
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
                placeholder={pending ? "Creating a link…" : ""}
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
                {inviteExpiry(invite)} · {inviteUses(invite)}
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
        </div>
      </Modal>
    </>
  );
}
