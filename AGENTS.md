<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Onboarding Tour and Checklist

New users get a guided tour and a "Get started" checklist on the homepage. Both are defined in `src/components/organisms/onboarding.tsx`:

- `tourStops`: each stop points at an element marked with a `data-tour="<name>"` attribute. Stops whose element isn't on screen (for example, the side panel on mobile) are skipped automatically.
- `checklistItems`: each item is checked off from real data returned by `GET /users/me/onboarding` (see `server/src/users/users.service.ts`).

Whenever you add a user-facing feature, decide whether a new user needs to know about it. If so, update the onboarding in the same change:

- Add a tour stop for anything with a visible entry point (a button, link, or panel). Add `data-tour` to that element, and keep the description to one or two plain sentences about what it does.
- Add a checklist item for a first action worth nudging (for example, "Send feedback"). Add a matching boolean to the onboarding response on the server, computed from existing data, and to the `OnboardingStep` type in `src/lib/api.ts`.
- Update a stop's description when a feature it describes changes, and remove stops or items for features that are removed.

Skip it for small tweaks and admin-only tools.

