"use client";

import { Popconfirm, Switch } from "antd";
import { Trash2 } from "lucide-react";
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
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-black/10 bg-surface p-6 dark:border-white/10">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
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
          <span className="flex flex-col">
            <span className="text-sm font-medium">Public community</span>
            <span className="text-xs text-muted">
              Anyone can find it in Explore and join.
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
        <div className="flex items-center justify-end gap-3">
          {message && <span className="text-sm text-muted">{message}</span>}
          <Atom.Button type="submit" loading={pending} disabled={!changed}>
            Save changes
          </Atom.Button>
        </div>
      </form>
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
      description={
        isOwner
          ? "Admins can change these settings. Only you can delete the community or change who is an admin."
          : "Admins can change these settings. Only the owner can change who is an admin."
      }
    >
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      {!members ? (
        <div className="flex py-6">
          <Atom.Loader />
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {members.map((member) => {
            const label = member.nickname ?? displayName(member);
            return (
              <li
                key={member.userId}
                className="flex items-center gap-3 rounded-md py-1.5"
              >
                <Atom.Avatar label={label} seed={member.userId} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{label}</span>
                  {member.isOwner && (
                    <span className="text-xs text-accent">Owner</span>
                  )}
                </div>
                {!member.isOwner && (
                  <label className="flex items-center gap-2 text-sm text-muted">
                    Admin
                    <Switch
                      size="small"
                      checked={member.isAdmin}
                      disabled={!isOwner}
                      loading={updating === member.userId}
                      onChange={(checked) => handleToggle(member, checked)}
                    />
                  </label>
                )}
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

  async function handleDelete() {
    setError(null);
    try {
      await deleteCommunity(community.id);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <Section
      title="Delete community"
      description="Deletes the community with all of its posts and memberships for everyone. This can't be undone."
    >
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      <div className="flex justify-end">
        <Popconfirm
          title={`Delete ${community.name}?`}
          description="All posts and memberships will be lost."
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={handleDelete}
        >
          <Atom.Button danger variant="secondary" icon={<Trash2 size={16} />}>
            Delete community
          </Atom.Button>
        </Popconfirm>
      </div>
    </Section>
  );
}

export function CommunitySettings({ community }: { community: Community }) {
  return (
    <div className="flex flex-col gap-6">
      <GeneralSettings community={community} />
      <AdminSettings community={community} />
      {community.role === "owner" && <DangerZone community={community} />}
    </div>
  );
}
