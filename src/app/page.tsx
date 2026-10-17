import Link from "next/link";
import { Suspense } from "react";
import { api } from "@/lib/api";

async function ServerStatus() {
  const status = await api("/")
    .then((res) => res.text())
    .catch(() => "Server unreachable");
  return <p>{status}</p>;
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 font-sans">
      <h1 className="text-3xl font-semibold">Orbis</h1>
      <Suspense fallback={<p>Connecting to server...</p>}>
        <ServerStatus />
      </Suspense>
      <nav className="flex gap-4 underline">
        <Link href="/login">Log in</Link>
        <Link href="/signup">Sign up</Link>
        <Link href="/profile">Profile</Link>
      </nav>
    </main>
  );
}
