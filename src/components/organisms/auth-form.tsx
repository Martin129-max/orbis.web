"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { useAuthStore } from "@/stores/auth-store";

type Mode = "login" | "signup";

const content = {
  login: {
    title: "Log in",
    submit: "Log in",
    switchText: "No account yet?",
    switchLabel: "Sign up",
    switchHref: "/signup",
  },
  signup: {
    title: "Sign up",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLabel: "Log in",
    switchHref: "/login",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const action = useAuthStore((state) => state[mode]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { title, submit, switchText, switchLabel, switchHref } = content[mode];

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
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-black/10 p-6 dark:border-white/15"
    >
      <Atom.Heading>{title}</Atom.Heading>
      <Molecule.FormField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
      />
      <Molecule.FormField
        label="Password"
        name="password"
        type="password"
        required
        minLength={6}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      <Atom.Button type="submit" disabled={pending}>
        {pending ? "Please wait..." : submit}
      </Atom.Button>
      <p className="text-sm">
        {switchText} <Atom.TextLink href={switchHref}>{switchLabel}</Atom.TextLink>
      </p>
    </form>
  );
}
