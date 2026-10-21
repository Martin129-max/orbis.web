"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { useAuthStore } from "@/stores/auth-store";

type Mode = "login" | "signup";

const content = {
  login: {
    title: "Welcome home.",
    submit: "Log in",
    switchText: "New to Orbis?",
    switchLabel: "Create an account",
    switchHref: "/register",
    footnote: null,
  },
  signup: {
    title: "Find your people.",
    submit: "Create account",
    switchText: "Already have a home here?",
    switchLabel: "Log in",
    switchHref: "/login",
    footnote: (
      <>
        By signing up, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/guidelines" className="underline hover:text-foreground">
          Community guidelines
        </Link>
        .
      </>
    ),
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { title, submit, switchText, switchLabel, switchHref, footnote } =
    content[mode];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setPending(true);

    try {
      const password = String(form.get("password"));
      if (mode === "login") {
        await login({ identifier: String(form.get("identifier")).trim(), password });
      } else {
        await signup({
          email: String(form.get("email")),
          username: String(form.get("username")),
          password,
        });
      }
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-10 sm:gap-16">
      <Link
        href="/"
        className="focus-ring inline-flex w-fit items-center gap-2 rounded-sm text-[13px] transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} />
        Back to homepage
      </Link>
      <div className="flex flex-col gap-6">
        <Atom.Brand className="text-5xl" />
        <h1 className="font-display text-5xl leading-[1.04] font-bold">
          {title}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === "login" ? (
            <Molecule.FormField
              label="Email or username"
              name="identifier"
              size="large"
              required
              autoCapitalize="none"
              autoComplete="username"
            />
          ) : (
            <>
              <Molecule.FormField
                label="Email"
                name="email"
                type="email"
                size="large"
                required
                autoComplete="email"
              />
              <Molecule.FormField
                label="Username"
                name="username"
                size="large"
                required
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_]+"
                title="3–20 characters: letters, numbers, or underscores"
                extra="Use 3–20 letters, numbers, or underscores. No spaces or symbols."
                autoCapitalize="none"
                autoComplete="username"
              />
            </>
          )}
          <Molecule.FormField
            label="Password"
            name="password"
            type="password"
            size="large"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            extra={
              mode === "signup"
                ? "At least 6 characters."
                : undefined
            }
          />
          {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
          <Atom.Button
            type="submit"
            size="large"
            loading={pending}
            className="w-fit"
          >
            {submit}
          </Atom.Button>
        </form>
        <hr className="border-divider" />
        <p className="text-[13px] text-muted">
          {switchText}{" "}
          <Link
            href={switchHref}
            className="focus-ring rounded-sm text-accent hover:underline"
          >
            {switchLabel}
          </Link>
        </p>
        {footnote && <p className="text-[11px] text-muted">{footnote}</p>}
      </div>
    </div>
  );
}
