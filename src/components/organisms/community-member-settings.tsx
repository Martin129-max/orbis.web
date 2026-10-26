"use client";

import { App, Switch } from "antd";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  getMembers,
  setNickname,
  setShowLibraryUpdates,
  type Community,
  type Member,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const NICKNAME_MAX = 32;

function NicknameForm({
  communityId,
  me,
  onSaved,
}: {
  communityId: number;
  me: Member;
  onSaved?: () => void;
}) {
  const [saved, setSaved] = useState(me.nickname ?? "");
  const [nickname, setDraft] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const name = me.name ?? me.username;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { token } = useAuthStore.getState();
    if (!token) return;

    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const updated = await setNickname(token, communityId, nickname.trim() || null);
      setSaved(updated.nickname ?? "");
      setDraft(updated.nickname ?? "");
      setMessage(updated.nickname ? "Nickname saved." : "Nickname removed.");
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Molecule.FormField
        label="Nickname"
        name="nickname"
        size="large"
        maxLength={NICKNAME_MAX}
        showCount
        allowClear
        autoComplete="off"
        placeholder={name}
        extra={`Leave it empty to show up as ${name}.`}
        value={nickname}
        onChange={(event) => {
          setDraft(event.target.value);
          setMessage(null);
        }}
      />
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      <div className="flex items-center gap-3">
        <Atom.Button type="submit" loading={pending} disabled={nickname.trim() === saved}>
          Save changes
        </Atom.Button>
        {message && <span className="text-xs text-muted">{message}</span>}
      </div>
    </form>
  );
}

function NicknameSettings({
  community,
  onSaved,
}: {
  community: Community;
  onSaved?: () => void;
}) {
  const myId = useAuthStore((state) => state.profile?.userId);
  const [members, setMembers] = useState<Member[] | null>(null);
  const me = members?.find((member) => member.userId === myId);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    getMembers(token, community.id).then(setMembers);
  }, [community.id]);

  return (
    <Molecule.SettingsSection
      title="Nickname"
      description="How your name shows up to everyone in this community. It doesn’t change your name anywhere else."
    >
      {!members || myId === undefined ? (
        <div className="flex py-6">
          <Atom.Loader />
        </div>
      ) : !me ? (
        <Atom.ErrorMessage>Your membership couldn’t be loaded.</Atom.ErrorMessage>
      ) : (
        <NicknameForm communityId={community.id} me={me} onSaved={onSaved} />
      )}
    </Molecule.SettingsSection>
  );
}

function LibraryUpdatesSettings({ community }: { community: Community }) {
  const { message } = App.useApp();
  const [show, setShow] = useState(community.showLibraryUpdates ?? true);
  const [pending, setPending] = useState(false);

  async function handleChange(next: boolean) {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setShow(next);
    setPending(true);
    try {
      const saved = await setShowLibraryUpdates(token, community.id, next);
      setShow(saved.showLibraryUpdates);
    } catch (e) {
      setShow(!next);
      message.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Molecule.SettingsSection
      title="Library updates"
      description={`Choose whether ${community.name} sees what you watch, read, and play.`}
    >
      <div className="flex flex-col gap-1">
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold">Show my library updates here</span>
          <Switch
            aria-label={`Show my library updates in ${community.name}`}
            checked={show}
            loading={pending}
            onChange={handleChange}
          />
        </label>
        <p className="text-xs text-muted">
          When this is off, this community won’t show your updates in its feed or bring them
          into its members’ home feeds. Your profile still shows them.
        </p>
      </div>
    </Molecule.SettingsSection>
  );
}

export function CommunityMemberSettings({
  community,
  onSaved,
}: {
  community: Community;
  onSaved?: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Molecule.PageIntro
        eyebrow={`${community.name} / You`}
        title="Your settings"
        description="Settings that only apply to you, in this community."
      />
      <NicknameSettings community={community} onSaved={onSaved} />
      <LibraryUpdatesSettings community={community} />
    </div>
  );
}
