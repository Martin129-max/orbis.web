import Link from "next/link";
import * as Atom from "@atom";

export function SiteHeader() {
  return (
    <header className="border-b border-divider">
      <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8">
        <Atom.Brand />
        <nav className="flex items-center gap-4 text-[13px]">
          <Link
            href="/login"
            className="focus-ring rounded-sm px-2 py-1 hover:text-accent"
          >
            Log in
          </Link>
          <Atom.ButtonLink href="/register">Sign up</Atom.ButtonLink>
        </nav>
      </div>
    </header>
  );
}
