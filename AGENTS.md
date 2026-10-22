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

Decide whether a new user needs to know about the feature. If so:

- Add a tour stop for anything with a visible entry point (a button, link, or panel). Add `data-tour` to that element, and keep the description to one or two plain sentences about what it does.
- Add a checklist item for a first action worth nudging (for example, "Send feedback"). Add a matching boolean to the onboarding response on the server, computed from existing data, and to the `OnboardingStep` type in `src/lib/api.ts`.
- Update a stop's description when a feature it describes changes, and remove stops or items for features that are removed.

### Landing Page

Logged-out visitors see the landing page (`src/components/organisms/landing-hero.tsx`, shown by `src/app/page.tsx`). Its `features` array is the list of what Orbis offers, and the hero's intro paragraph sums up the product.

Decide whether the feature is something a visitor would sign up for. If so:

- Add an entry to `features` with a lucide icon, a short title, and one sentence on what it lets you do, written for someone who hasn't signed up yet.
- Update the intro paragraph if the feature changes what Orbis is, not just what it can do.
- Update or remove entries when the features they describe change or are removed.
