import * as Atom from "@atom";

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 pr-36 pl-6">
      <Atom.Brand />
      <nav className="flex items-center gap-4 text-sm">
        <Atom.TextLink href="/login">Log in</Atom.TextLink>
        <Atom.ButtonLink href="/register" className="hidden sm:inline-flex">
          Sign up
        </Atom.ButtonLink>
      </nav>
    </header>
  );
}
