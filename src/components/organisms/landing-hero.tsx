import * as Atom from "@atom";

const points = [
  {
    title: "Communities",
    text: "Every community gets its own members and its own space.",
  },
  {
    title: "Feeds, not chat",
    text: "Posts stay where people can find them, instead of scrolling away.",
  },
  {
    title: "One account",
    text: "Join as many communities as you like and switch from the sidebar.",
  },
];

export function LandingHero() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 py-16 sm:px-6 sm:py-24">
      <section className="flex max-w-2xl flex-col gap-6">
        <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Your communities, in one feed.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Orbis is a home for groups of people. Create a community, bring
          people in, and share posts everyone can follow.
        </p>
        <div className="flex flex-wrap gap-3">
          <Atom.ButtonLink href="/register" size="large">
            Create an account
          </Atom.ButtonLink>
          <Atom.ButtonLink href="/login" size="large" variant="secondary">
            Log in
          </Atom.ButtonLink>
        </div>
      </section>
      <ul className="grid gap-8 border-t border-black/10 pt-10 sm:grid-cols-3 dark:border-white/10">
        {points.map((point) => (
          <li key={point.title} className="flex flex-col gap-1">
            <h2 className="font-semibold">{point.title}</h2>
            <p className="text-sm text-muted">{point.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
