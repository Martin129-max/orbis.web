"use client";

import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { removeAvatar, uploadAvatar, type Profile } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

async function save(request: (token: string) => Promise<Profile>) {
  const { token } = useAuthStore.getState();
  if (!token) throw new Error("Please log in again.");
  useAuthStore.setState({ profile: await request(token) });
}

export function AvatarPicker({ profile }: { profile: Profile }) {
  return (
    <Molecule.ImageMenu
      noun="picture"
      hasImage={Boolean(profile.avatarUrl)}
      onUpload={(file) => save((token) => uploadAvatar(token, file))}
      onRemove={() => save(removeAvatar)}
    >
      {(busy) => (
        <button
          type="button"
          aria-label="Change profile picture"
          className="focus-ring group relative shrink-0 cursor-pointer rounded-full"
        >
          <Atom.Avatar
            size="lg"
            label={profile.username}
            src={profile.avatarUrl}
            seed={profile.userId}
          />
          <Atom.EditOverlay busy={busy} />
        </button>
      )}
    </Molecule.ImageMenu>
  );
}
