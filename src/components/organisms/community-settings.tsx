"use client";

import { Switch } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import {
  getMembers,
  setCommunityAdmin,
  type Community,
  type Member,
} from "@/lib/api";
import { displayName } from "@/lib/display-name";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";

function Section({
  title,
  aside,
  description,
  children,
}: {
  title: string;
  aside?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-divider pt-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl font-bold">{title}</h3>
          {aside && <span className="text-xs text-muted uppercase">{aside}</span>}
        </div>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function GeneralSettings({ community }: { community: Community }) {
  const updateCommunity = useCommunityStore((state) => state.updateCommunity);
  const [saved, setSaved] = useState(community);
  const [name, setName] = useState(community.name);
  const [isPublic, setIsPublic] = useState(community.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const changed = name.trim() !== saved.name || isPublic !== saved.isPublic;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    try {
      const updated = await updateCommunity(community.id, {
        name: name.trim(),
        isPublic,
      });
      setSaved(updated);
      setName(updated.name);
      setMessage("Settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Section title="General">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Molecule.FormField
          label="Community name"
          name="name"
          size="large"
          required
          maxLength={100}
          pattern=".*\S.*"
          title="Enter a name"
          autoComplete="off"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setMessage(null);
          }}
        />
        <label className="flex items-start justify-between gap-4">
          <span className="flex flex-col gap-1">
            <span className="text-[13px] font-semibold">Public community</span>
            <span className="text-xs text-muted">
              Anyone can find it in Explore and join. Turn this off to make the
              community private; only existing members can see its posts and
              threads.
            </span>
          </span>
          <Switch
            checked={isPublic}
            onChange={(checked) => {
              setIsPublic(checked);
              setMessage(null);
            }}
          />
        </label>
        {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
        <div className="flex items-center gap-3">
          <Atom.Button type="submit" loading={pending} disabled={!changed}>
            Save changes
          </Atom.Button>
          {message && <span className="text-xs text-muted">{message}</span>}
        </div>
      </form>
    </Section>
  );
}

function IconSettings({ community }: { community: Community }) {
  const setCommunityIcon = useCommunityStore((state) => state.setCommunityIcon);
  const [iconUrl, setIconUrl] = useState(community.iconUrl);

  async function save(file: File | null) {
    const updated = await setCommunityIcon(community.id, file);
    setIconUrl(updated.iconUrl);
  }

  return (
    <Section
      title="Icon"
      description="Shown in the sidebar, in Explore, and next to posts from this community."
    >
      <div className="flex items-center gap-6">
        <span
          aria-hidden
          className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full border border-divider bg-rail-item font-display text-[44px] leading-none font-bold"
        >
          <Atom.CommunityIcon name={community.name} src={iconUrl} />
        </span>
        <Molecule.ImagePicker
          noun="icon"
          hasImage={Boolean(iconUrl)}
          onUpload={save}
          onRemove={() => save(null)}
        />
      </div>
    </Section>
  );
}

function AdminSettings({ community }: { community: Community }) {
  const isOwner = community.role === "owner";
  const [members, setMembers] = useState<Member[] | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    getMembers(token, community.id).then(setMembers);
  }, [community.id]);

  async function handleToggle(member: Member, isAdmin: boolean) {
    const { token } = useAuthStore.getState();
    if (!token) return;

    setError(null);
    setUpdating(member.userId);
    try {
      setMembers(
        await setCommunityAdmin(token, community.id, member.userId, isAdmin),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <Section
      title="Admins"
      aside="Owner only"
      description={
        isOwner
          ? "Admins can manage community details. Only you, the owner, can add or remove admins and delete this community."
          : "Admins can manage community details. Only the owner can add or remove admins and delete this community."
      }
    >
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      {!members ? (
        <div className="flex py-6">
          <Atom.Loader />
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {members.map((member) => {
            const label = member.nickname ?? displayName(member);
            return (
              <li key={member.userId} className="flex items-center gap-3 py-1">
                <Atom.Avatar
                  size="sm"
                  label={label}
                  src={member.avatarUrl}
                  seed={member.userId}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold">
                    {label}
                    {(member.isOwner || member.isAdmin) &&
                      ` · ${member.isOwner ? "Owner" : "Admin"}`}
                  </span>
                  <span className="truncate text-xs text-muted">
                    @{member.username}
                  </span>
                </div>
                <Switch
                  aria-label={`${label} is an admin`}
                  checked={member.isOwner || member.isAdmin}
                  disabled={!isOwner || member.isOwner}
                  loading={updating === member.userId}
                  onChange={(checked) => handleToggle(member, checked)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

function DangerZone({ community }: { community: Community }) {
  const router = useRouter();
  const deleteCommunity = useCommunityStore((state) => state.deleteCommunity);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setError(null);
    setPending(true);
    try {
      await deleteCommunity(community.id);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(false);
    }
  }

  const members = community.memberCount ?? 0;

  return (
    <Section
      title="Delete community"
      description="This permanently removes all posts, threads, and memberships. This action can’t be undone."
    >
      <Atom.Button
        danger
        className="w-fit"
        aria-expanded={confirming}
        onClick={() => setConfirming(true)}
      >
        Delete community
      </Atom.Button>
      {confirming && (
        <div
          role="alertdialog"
          aria-labelledby="delete-community-title"
          className="flex flex-col gap-4 rounded-lg border border-danger bg-surface p-4 sm:p-6"
        >
          <h4 id="delete-community-title" className="text-xl font-bold">
            Delete {community.name}?
          </h4>
          <p className="text-xs text-muted">
            {members > 1
              ? `${members.toLocaleString()} members will lose access. `
              : ""}
            All discussions will be permanently deleted.
          </p>
          {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
          <div className="flex flex-wrap gap-2">
            <Atom.Button
              variant="secondary"
              autoFocus
              onClick={() => setConfirming(false)}
            >
              Keep community
            </Atom.Button>
            <Atom.Button danger loading={pending} onClick={handleDelete}>
              Yes, delete
            </Atom.Button>
          </div>
        </div>
      )}
    </Section>
  );
}

export function CommunitySettings({ community }: { community: Community }) {
  return (
    <div className="flex flex-col gap-8">
      <Molecule.PageIntro
        eyebrow={`${community.name} / ${community.role === "owner" ? "Owner" : "Admin"}`}
        title="Community settings"
        description="Manage this community’s details, admins, and visibility."
      />
      <GeneralSettings community={community} />
      <IconSettings community={community} />
      <AdminSettings community={community} />
      {community.role === "owner" && <DangerZone community={community} />}
    </div>
  );
}
