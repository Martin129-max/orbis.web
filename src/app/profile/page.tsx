"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile, logout, type Profile } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then((result) => {
      if (result) setProfile(result);
      else router.replace("/login");
    });
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 font-sans">
      {profile ? (
        <>
          <h1 className="text-2xl font-semibold">{profile.email}</h1>
          <p className="text-sm text-zinc-500">User #{profile.userId}</p>
          <button
            onClick={handleLogout}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          >
            Log out
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}
