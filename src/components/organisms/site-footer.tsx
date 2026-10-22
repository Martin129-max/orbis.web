import Link from "next/link";

const links = [
  { href: "/guidelines", label: "Community guidelines" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1280px] px-4 pb-8 sm:px-8">
      <div className="flex flex-wrap justify-between gap-2 border-t border-divider pt-6 text-xs text-muted">
        <p>
          © {new Date().getFullYear()} Orbis · By{" "}
          <span className="font-semibold text-foreground">Polsar Studio</span>
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded-sm hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
