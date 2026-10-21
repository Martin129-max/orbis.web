"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { useAuthStore } from "@/stores/auth-store";

type Mode = "login" | "signup";

const content = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to get back to your communities.",
    submit: "Log in",
    switchText: "New to Orbis?",
    switchLabel: "Create an account",
    switchHref: "/register",
  },
  signup: {
    title: "Create your account",
    subtitle: "Join communities and share what's happening.",
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
  const { title, subtitle, submit, switchText, switchLabel, switchHref } =
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
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-10">
      <Atom.Brand />
      <Atom.Button
        type="button"
        variant="secondary"
        onClick={() => router.push("/")}
      >
       ← Back to homepage
      </Atom.Button>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <Atom.Heading>{title}</Atom.Heading>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <Molecule.FormField
          label="Email"
          name="email"
          type="email"
          size="large"
          required
          autoComplete="email"
        />
        <Molecule.FormField
          label="Password"
          name="password"
          type="password"
          size="large"
          required
          minLength={mode === "signup" ? 6 : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
        <Atom.Button type="submit" size="large" block loading={pending}>
          {submit}
        </Atom.Button>
        <p className="text-center text-sm text-muted">
          {switchText}{" "}
          <Atom.TextLink href={switchHref}>{switchLabel}</Atom.TextLink>
        </p>
      </form>
    </div>
  );
}
