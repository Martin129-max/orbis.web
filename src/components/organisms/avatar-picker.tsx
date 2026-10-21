"use client";

import * as Molecule from "@molecule";
import { removeAvatar, uploadAvatar, type Profile } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

async function save(request: (token: string) => Promise<Profile>) {
  const { token } = useAuthStore.getState();
  if (!token) throw new Error("Please log in again.");
  useAuthStore.setState({ profile: await request(token) });
}

export function AvatarPicker() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <Molecule.ImagePicker
      noun="picture"
      hasImage={Boolean(profile?.avatarUrl)}
      disabled={!profile}
      onUpload={(file) => save((token) => uploadAvatar(token, file))}
      onRemove={() => save(removeAvatar)}
    />
  );
}
