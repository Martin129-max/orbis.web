import { TextLink } from "@/components/atoms/text-link";

export function MainNav() {
  return (
    <nav className="flex gap-4">
      <TextLink href="/login">Log in</TextLink>
      <TextLink href="/signup">Sign up</TextLink>
      <TextLink href="/profile">Profile</TextLink>
    </nav>
  );
}
