export function loginUrl(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

export function currentPath() {
  return window.location.pathname + window.location.search;
}

export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : null;
}
