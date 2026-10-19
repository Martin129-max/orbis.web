"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as Atom from "@atom";
import * as Organism from "@organism";
import * as Template from "@template";
import { useAuthStore } from "@/stores/auth-store";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchProfile().then((result) => {
      if (!result) router.replace("/login");
    });
  }, [fetchProfile, router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <Template.AppTemplate>
      <Template.CenteredTemplate>
        {profile ? (
          <Organism.ProfileCard profile={profile} onLogout={handleLogout} />
        ) : (
          <Atom.Loader />
        )}
      </Template.CenteredTemplate>
    </Template.AppTemplate>
  );
}
