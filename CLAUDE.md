# CLAUDE.md — Signo

This file is the standing context for every Claude Code session on this project. Read it fully before doing any work.

## What we are building

**Signo** (Arabic: سيجنو, from "sign" / sign-off) is a self-serve SaaS for marketing agencies in Egypt and the Gulf. An agency uploads a client's monthly social content plan, sends the client a no-login review link over WhatsApp, and the client approves each post or requests changes. The agency gets one place that shows what is approved, what is waiting, and a record of who approved what and when.

- Product owner: Mostafa (business analyst; not a developer). He tests every ticket against its acceptance criteria.
- **Every ticket follows `PIPELINE.md`**, step by step, and no step is skipped whoever asks. `PROJECT-STATE.md` says what is set up and where; `SETUP.md` is the one-time setup.
- Requirements live in `docs/`. Tickets live in `docs/tickets/`. The clickable prototype is `prototype/signo-prototype.html` (open it in a browser; it is the reference for flows and screen content).
- MVP scope: Instagram image posts and carousels only. No video, no other platforms, no auto-publishing, no AI, no online payments. Plans and prices exist as data and are managed by the platform admin (US-SGN-011); the payment gateway is not chosen yet.

## Glossary (use these names in code, database and UI copy)

| Term | Meaning |
|---|---|
| Agency | A paying workspace. All data belongs to exactly one agency. |
| Member | A person who logs in and works inside an agency. Roles: `owner`, `member`. |
| Client | A brand the agency produces content for. Clients never log in. |
| Deliverable | Anything the client must approve. MVP has one type: `instagram_post`. **Never name tables or components "post"**; future types (video, design file, document) will reuse the same model. |
| Version | A saved state of a deliverable (caption + images + publish date). A new version is created every time a sent deliverable is edited. |
| Review link | A secret URL per client that opens the review page without login. |
| Reviewer | The client-side person using a review link. Identified by the name they type. |
| Decision | A reviewer's `approved` or `changes_requested` action on one version, with optional comment. |
| Activity | An append-only log entry describing something that happened. |
| Plan | A subscription tier (Free, Starter, Growth, Agency) with limits and prices per market. Stored in the database, never hard-coded. |
| Market | Pricing region of an agency: `egypt` (EGP) or `gulf` (USD). Set from the sign-up country. |

## Deliverable status machine

```
draft ──send──▶ pending ──approve──▶ approved
                   │                    │
                   └─request changes─▶ changes_requested
any sent status ──agency edits & saves──▶ pending (new version)
```
- `draft`: only the agency sees it.
- `pending`, `approved`, `changes_requested`: visible on the review page.
- A decision always refers to a specific version. Decisions on old versions stay in history.

## Tech stack

- **Next.js** (App Router) + **TypeScript** (strict) + **Tailwind CSS**
- **Neon** (D31, replaces Supabase): Postgres with branches `main` (production) and `staging`, Neon Auth (email + password, magic link), Object Storage (images), Row Level Security, Function Triggers for schedules. Supabase is no longer used; `signo-dev` is kept untouched only as a reference (D35)
- **Vercel** for hosting
- **next-intl** for i18n (Arabic + English), full RTL support
- **Resend** for transactional email
- Testing: **Vitest** for logic, **Playwright** for the main flows

If you want to deviate from this stack, stop and explain why before changing anything.

Portability (D20): don't use Vercel-only features (for example Vercel KV, Vercel Blob, Edge Config, Vercel Cron or `@vercel/*` runtime packages) unless Mostafa agrees first. Scheduled jobs run as Neon Function Triggers (D31). The app must be movable to Cloudflare later.

## Non-negotiable rules

### Security and data isolation
1. Every table that holds agency data has an `agency_id` column and RLS enabled. A member can only read or write rows of agencies they belong to. Write the RLS policy in the same migration that creates the table.
2. The review page does **not** use browser access to tables (no Data API from the review page). It calls server-side route handlers that validate the review-link token, then read/write through the server's direct database connection, scoped to that one client.
3. Review-link tokens: at least 128 bits of randomness, URL-safe. Stored as a SHA-256 hash (for lookup) plus an AES-256-GCM encrypted copy (so members can see the link again); the encryption key is a server-only environment variable. Revoking a link makes it stop working immediately.
4. Never expose the service role key or a database connection string to the browser. Never log tokens or connection strings.
5. Storage: images live in a private bucket, path `agency_id/client_id/deliverable_id/version_no/`. Serve them through signed URLs (expiry ≤ 1 hour).
6. Platform admin: a `platform_admins` table (user_id) marks Mostafa as platform owner. The admin area lives under `/admin`, is reachable only by platform admins (checked on the server for every request), and in the MVP manages plans, prices and agency plan assignment (US-SGN-011). Platform admins do not read agency content unless supporting a request.
6a. Plan limits and prices are always read from the `plans` and `plan_prices` tables. Never hard-code a price, a limit or a plan name in code or UI copy.

### Internationalization
7. No hard-coded UI strings. Every string goes in `messages/en.json` and `messages/ar.json`. Ticket "System Messages" tables give both languages; use them verbatim.
8. Use CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`) so layouts flip correctly in RTL. Test every screen in both directions.
9. User-entered text (captions, comments, names) renders with `dir="auto"`. Handles, phone numbers and URLs render LTR.
10. Dates show in the viewer's language (`ar-EG` / `en-GB`). Store `publish_date` as a date; store timestamps as `timestamptz` (UTC).

### Data
11. Activity log is append-only. Never update or delete activity rows.
12. Deliverable versions are immutable once created. Edits create a new version.
13. Soft-delete clients and deliverables (`archived_at`). No hard deletes from the UI.
14. History is never overwritten: prices close their old row and add a new one; agency plan changes add a row; payments are voided, never edited or deleted; edits to clients, team roles and agency settings write old and new values to the activity log.

## Before any ticket: the setup check

Confirm by doing, not asking: one small read-only call to each. If any fails, stop, tell the person in plain words what's missing and how to fix it, and wait.

| Check | How |
| --- | --- |
| GitHub | Read this repository and list its open pull requests |
| Neon | Describe the project `signo` (`super-math-60253213`) and list its branches |
| Vercel | Read the latest deployment of the project `signo` in team `osamas-team1` |
| Claude Design | Open the canvas "Signo UI/UX project" (link in `PROJECT-STATE.md`) |
| Figma | Open "Signo Feature Designs" (`Fq9rBwsQQb7l5onf2UTmX3`) |

## How to work on a ticket

`PIPELINE.md` is the full process; these are the parts specific to tickets.

1. Read the ticket in `docs/tickets/` and the related sections of `docs/02-prd.md`.
2. Write a short plan: migrations, routes, components, tests. Wait for Mostafa's go-ahead on anything that touches the data model.
3. Implement. Keep each ticket to its own scope; tickets are written to not overlap.
4. Write tests for the acceptance criteria (Playwright for flows, Vitest for rules such as status transitions and validation).
5. Report back: what was built, how to test it by hand (step by step, non-technical), and anything that does not match the ticket.
6. If a ticket is unclear or contradicts another, **do not invent a business rule**. Stop, describe the conflict, and propose options. Mostafa resolves it and updates `docs/04-decisions-log.md`.

## Definition of done

- All acceptance criteria pass, in Arabic and English, at 390px phone width and desktop.
- RLS verified: a member of agency A cannot read agency B's data (include a test).
- No console errors. No untranslated strings.
- `docs/04-decisions-log.md` updated if anything was decided during the work.

## Commands

- `npm run dev` — local dev server (needs `.env.local`, copy from `.env.example`)
- `npm run lint` / `npm run typecheck`
- `npm run test` — unit tests (Vitest, `tests/unit`)
- `npm run test:e2e` — Playwright flows (`tests/e2e`), desktop and phone; run `npm run build` first
- `npm run db:migrate` — apply `db/migrations` to the database in `DATABASE_URL_UNPOOLED` (`-- --dry-run` lists only); normally done by the **Migrate staging database** workflow, and for production only by **Migrate production database** (see `PIPELINE.md`)

## Project layout

- `src/app/[locale]/` — every page lives under the locale segment (`ar` default, `en`)
- `src/i18n/` — next-intl routing and request config; `src/proxy.ts` picks the locale (Next.js 16 renamed middleware to proxy)
- `messages/en.json`, `messages/ar.json` — all UI strings; a unit test fails if their keys differ
- `src/lib/env.server.ts` — server-only environment variable names; see `.env.example`
- `db/migrations/` — SQL migrations, one per change, RLS in the same file, applied by `scripts/migrate.mjs`
- `src/app/api/health/` — the pipeline's status address
- The app has no screens yet (D35): every screen arrives from the Claude Design canvas through `PIPELINE.md`
- This is Next.js 16 with Cache Components on. Read `node_modules/next/dist/docs/` before using an API you are unsure of (see `AGENTS.md`).
