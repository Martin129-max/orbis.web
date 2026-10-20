"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import * as Organism from "@organism";
import * as Template from "@template";
import { useAuthStore } from "@/stores/auth-store";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((result) => {
        if (!result) router.replace("/login");
      })
      .catch(() => setFailed(true));
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
        ) : failed ? (
          <Molecule.ConnectionError onRetry={() => window.location.reload()} />
        ) : (
          <Atom.Loader />
        )}
      </Template.CenteredTemplate>
    </Template.AppTemplate>
  );
}
