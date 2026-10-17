"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, signup } from "@/lib/api";

type Mode = "login" | "signup";

const content = {
  login: {
    title: "Log in",
    submit: "Log in",
    switchText: "No account yet?",
    switchLabel: "Sign up",
    switchHref: "/signup",
    action: login,
  },
  signup: {
    title: "Sign up",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLabel: "Log in",
    switchHref: "/login",
    action: signup,
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { title, submit, switchText, switchLabel, switchHref, action } =
    content[mode];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setPending(true);

    try {
      await action({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      router.push("/profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-black/10 p-6 dark:border-white/15"
      >
        <h1 className="text-2xl font-semibold">{title}</h1>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="rounded border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-foreground px-3 py-2 text-background disabled:opacity-50"
        >
          {pending ? "Please wait..." : submit}
        </button>
        <p className="text-sm">
          {switchText}{" "}
          <Link href={switchHref} className="underline">
            {switchLabel}
          </Link>
        </p>
      </form>
    </main>
  );
}
