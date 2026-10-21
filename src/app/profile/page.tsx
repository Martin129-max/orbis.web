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
      <main className="flex min-h-0 flex-1 flex-col">
        <Template.PageHeader
          actions={<Organism.SidePanelToggle label="Friends" />}
        >
          <Atom.Heading>Your profile</Atom.Heading>
        </Template.PageHeader>
        {profile ? (
          <div className="flex min-h-0 flex-1">
            <Template.PageColumn>
              <Organism.ProfileCard profile={profile} onLogout={handleLogout} />
            </Template.PageColumn>
            <Organism.SidePanel label="Friends">
              <Organism.FriendsPanel />
            </Organism.SidePanel>
          </div>
        ) : (
          <Template.CenteredTemplate>
            {failed ? (
              <Molecule.ConnectionError
                onRetry={() => window.location.reload()}
              />
            ) : (
              <Atom.Loader />
            )}
          </Template.CenteredTemplate>
        )}
      </main>
    </Template.AppTemplate>
  );
}
