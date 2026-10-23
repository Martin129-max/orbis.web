<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Instructions

## When You Add a Feature

Whenever you add a user-facing feature, check the three places that introduce Orbis to people and update them in the same change. Skip all three for small tweaks and admin-only tools.

### Onboarding Tour and Checklist

New users get a guided tour and a "Get started" checklist on the homepage. Both are defined in `src/components/organisms/onboarding.tsx`:

- `tourStops`: each stop points at an element marked with a `data-tour="<name>"` attribute. Stops whose element isn't on screen (for example, the side panel on mobile) are skipped automatically.
- `checklistItems`: each item is checked off from real data returned by `GET /users/me/onboarding` (see `server/src/users/users.service.ts`).

The homepage tour introduces the app as a whole: the rail, the composer, notifications, the account menu, and the feedback buttons. Features that live on a specific page (a community, a profile, the library, a title page, Explore, the reports board for admins) belong in that page's own tour instead, shown the first time someone opens the page. Keep each page tour short, two to five stops, and only include what isn't obvious from the page itself.

Page tours don't exist yet. When you add the first one, build the shared support once rather than one-off code: a reusable tour component that takes a tour name and its stops, and per-tour completion saved on the server (for example, a list of completed tour names on the user, returned by `GET /users/me/onboarding` and updated with `PATCH`), so each tour shows once per account. Reuse it for every page tour after that.

Decide whether a new user needs to know about the feature. If so:

- Add a tour stop for anything with a visible entry point (a button, link, or panel), in the tour for the page where it appears. Add `data-tour` to that element, and keep the description to one or two plain sentences about what it does.
- Add a checklist item for a first action worth nudging (for example, "Send feedback"). Add a matching boolean to the onboarding response on the server, computed from existing data, and to the `OnboardingStep` type in `src/lib/api.ts`.
- Update a stop's description when a feature it describes changes, and remove stops or items for features that are removed.

### Landing Page

Logged-out visitors see the landing page, which should make them want to sign up at a glance. It's built in `src/components/organisms/landing-hero.tsx` (the hero) and `src/components/organisms/landing-showcase.tsx` (everything below it), and shown by `src/app/page.tsx`. Below the hero, in order:

- `LandingCommunities`: a scrolling strip of example communities.
- `LandingShowcase`: one `Showcase` section per major feature. Each has a short eyebrow, a punchy heading (for example "Track what you love."), one sentence, and a visual: a small mock of the real UI built from the app's own look and assets (the pixel avatars, community icons and covers in `public/images/`, and real media covers). Sections alternate sides with `flip`.
- `LandingExtras`: one compact row of smaller extras, each an icon and a few words.
- `SiteStats` and `LandingCallToAction`.

Decide whether the feature is something a visitor would sign up for. If so:

- **A major feature** gets its own `Showcase` section with a visual that shows the feature in use, not an icon and a paragraph. Keep the copy to a heading and one sentence, let the visual do the explaining, and keep sections alternating sides.
- **A smaller feature** gets an entry in `extras` instead.
- Update the hero's intro paragraph only if the feature changes what Orbis is, not just what it can do.
- Update or remove sections and extras when the features they show change or are removed.

Keep the page visual and easy to scan: no walls of text or long lists of features, mark the mock visuals `aria-hidden` so the heading and sentence carry the meaning, and check it at desktop and phone widths.
