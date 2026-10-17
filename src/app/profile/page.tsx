"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileCard } from "@/components/organisms/profile-card";
import { CenteredTemplate } from "@/components/templates/centered-template";
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
    <CenteredTemplate>
      {profile ? (
        <ProfileCard profile={profile} onLogout={handleLogout} />
      ) : (
        <p>Loading...</p>
      )}
    </CenteredTemplate>
  );
}
