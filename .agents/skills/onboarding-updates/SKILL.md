---
name: onboarding-updates
description: Keep the Orbis onboarding tours and "Get started" checklist in step with the app. Use when adding, changing, or removing a user-facing feature. Skip it for small tweaks and admin-only tools.
---

# Onboarding Updates

New users get a guided tour and a "Get started" checklist on the homepage, plus a short tour the first time they open certain pages. All of it is defined in `src/components/organisms/onboarding.tsx`.

## How It Works

- `tourStops`: the homepage tour, which introduces the app as a whole: the rail, the composer, search, notifications, the account menu, and the feedback buttons. Each stop points at an element marked with `data-tour="<name>"`. Stops whose element isn't on screen (for example, the side panel on mobile) are skipped automatically.
- `pageTours`: a short tour per page (a community, a profile, the library, a title page, Explore, the reports board for admins), shown with `<PageTour name="…" />`. Each one appears once per account, the first time someone opens the page after the homepage tour. Its completion is saved in `completedTours` on the user (returned by `GET /users/me/onboarding`, updated with `PATCH`).
- `checklistItems`: each item is checked off from real data returned by `GET /users/me/onboarding` (see `server/src/users/users.service.ts`).

## Workflow

1. Decide whether a new user needs to know about the feature. If not, stop here.
2. If it has a visible entry point (a button, link, or panel), add a tour stop in the tour for the page where it appears: features of the app as a whole in `tourStops`, page features in that page's `pageTours` entry. Add `data-tour` to the element.
3. If it has a first action worth nudging (for example, "Send feedback"), add a checklist item. Add a matching boolean to the onboarding response on the server, computed from existing data, and to the `OnboardingStep` type in `src/lib/api.ts`.
4. When a feature changes, update the stops and items that describe it. When it's removed, remove them.
5. To give a new page a tour, add an entry to `pageTours`, render `PageTour` on the page, and add the name to `PAGE_TOURS` in `server/prisma/seed.ts` so seeded accounts start with it completed.

## Rules

- Keep each page tour to two to five stops, covering only what isn't obvious from the page itself.
- Keep each description to one or two plain sentences about what the thing does.
