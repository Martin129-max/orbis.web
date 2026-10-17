import * as Atom from "@atom";

export function MainNav() {
  return (
    <nav className="flex gap-4">
      <Atom.TextLink href="/login">Log in</Atom.TextLink>
      <Atom.TextLink href="/signup">Sign up</Atom.TextLink>
      <Atom.TextLink href="/profile">Profile</Atom.TextLink>
    </nav>
  );
}
