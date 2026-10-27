<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Skills

Step-by-step instructions live in skills in `.agents/skills/`, linked as `.claude/skills/` for Claude Code. Any agent can also read them as plain files. Whenever one of these situations applies, follow its skill in the same change:

- **Adding, changing, or removing a user-facing feature** (skip small tweaks and admin-only tools):
  - `onboarding-updates` (`.agents/skills/onboarding-updates/SKILL.md`): add or update tour stops, checklist items, and tips of the week for anything people need to know about.
  - `landing-page-updates` (`.agents/skills/landing-page-updates/SKILL.md`): show it on the landing page if it's something a visitor would sign up for.
- **Adding or changing anything people could look for by name or text** (new content, a page with its own items, or new names or text on existing items) → `search-updates` (`.agents/skills/search-updates/SKILL.md`): keep the site search covering it, with the same privacy rules as where it's shown.
