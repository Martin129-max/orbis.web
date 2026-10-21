export function initials(name: string) {
  return (Array.from(name.trim())[0] ?? "").toUpperCase();
}
