# 04 — Decisions Log

Every product decision, with its source. **Default** = chosen by Claude in the requirements session because the question was open; Mostafa should confirm or change these. Add new entries at the bottom of each section.

## Confirmed by Mostafa

| # | Decision | Date |
|---|---|---|
| D1 | Self-serve SaaS with monthly subscription, not a done-for-you service | 1 Nov 2026 |
| D2 | First market: marketing / social media agencies; Mostafa has direct access to several | 1 Nov 2026 |
| D3 | UI in Arabic and English; agency picks its language, client sees theirs | 1 Nov 2026 |
| D4 | MVP previews Instagram only | 1 Nov 2026 |
| D5 | MVP supports images only (single and carousel); video later | 1 Nov 2026 |
| D6 | Target Egypt and the Gulf together | 1 Nov 2026 |
| D7 | Build with Claude Code (not Lovable); requirements worked out separately, then implemented | 1–3 Nov 2026 |
| D8 | Data model uses "deliverable", not "post", to allow other industries later | 1 Nov 2026 |
| D9 | No AI in the MVP; AI pre-check and voice notes come in phase 2 | 1 Nov 2026 |
| D10 | Platform owner manages the platform from an admin dashboard; MVP part covers plans, prices and agency plan assignment (US-SGN-011), metrics and suspension come later | 3 Nov 2026 |
| D11 | Product name: **Signo / سيجنو** | 3 Nov 2026 |
| D12 | Pricing: fixed tiers by active clients (Free 2, Starter 5, Growth 15, Agency 40); team members and reviewers unlimited on paid plans; Free has 2 members | 3 Nov 2026 |
| D13 | Prices cut ~30% from first draft: Gulf $13 / $34 / $69 monthly; Egypt EGP 349 / 899 / 2,099 monthly; yearly = 10× monthly | 3 Nov 2026 |
| D14 | Prices and limits are editable data in the admin dashboard, never hard-coded | 3 Nov 2026 |
| D15 | Payment gateway decision deferred; plans assigned by hand until then | 3 Nov 2026 |
| D16 | Keep full history: plan price history, agency plan history visible to owners, change history (old → new) for clients, team roles and agency settings | 4 Nov 2026 |
| D17 | Manual payments record in the admin dashboard (US-SGN-012); the future gateway writes to the same table | 4 Nov 2026 |
| D18 | Backend is Supabase (Auth, Storage with signed URLs, RLS tied to auth, Realtime, pg_cron scheduled jobs). Do not use Neon, Firebase, Appwrite or PocketBase | 4 Nov 2026 |
| D19 | Hosting on Vercel; email through Resend; code in a private GitHub repository | 4 Nov 2026 |
| D20 | Keep the code portable: no Vercel-only features that would block a later move to Cloudflare, unless Mostafa agrees first | 4 Nov 2026 |
| D21 | Free plans only while building and testing (Supabase Free, Vercel Hobby, Resend Free, GitHub Free); no upgrade requests during development | 4 Nov 2026 |
| D22 | Upgrade path: Supabase Pro ($25/month) and the domain before the pilot with real agencies; Vercel Pro ($20/month) before the first paying agency; Resend stays Free (3,000/month, 100/day) until close to the daily limit | 4 Nov 2026 |
| D23 | Ticket 001: a `login_attempts` table records failed logins for the 5-attempts-in-15-minutes lockout (US-SGN-001 BR7). Server only, no browser access | 4 Nov 2026 |
| D24 | `full_name` and `ui_language` live on `agency_members` (no separate profiles table), since a user belongs to one agency | 4 Nov 2026 |
| D25 | A database trigger creates the agency and owner membership at sign-up. It must never create an agency for someone joining through an invite (US-SGN-002): invited users are created by the server with an invite marker that only the server can set, and they join the inviting agency instead | 4 Nov 2026 |
| D26 | Ticket 001 uses Supabase's built-in email sender while testing; Resend comes with the domain (D22). Emails must still arrive in the user's chosen language (US-SGN-001 AC1) | 4 Nov 2026 |
| D27 | Sign-up countries outside Egypt ("Other", Saudi Arabia, UAE) use the `gulf` (USD) market; Egypt uses `egypt` (EGP) | 4 Nov 2026 |
| D28 | `activity` has an `actor_label` text column next to `actor_id` (PRD §5): reviewers have no user id, and removed members' names must still show (US-SGN-002 BR7) | 4 Nov 2026 |
| D29 | Auth emails (verification, magic link, password reset) choose Arabic or English from the language saved on the account; each template holds both texts, the subject line shows both. Switching the UI language also updates this saved language | 4 Nov 2026 |
| D30 | Signo follows the OmniRent feature pipeline (`PIPELINE.md`): screens come only from the Claude Design canvas "Signo UI/UX project"; every change is reviewed on a staging preview with its own database; approved designs are archived in Figma "Signo Feature Designs"; production needs the other partner's approval on GitHub and a backed-up, hand-started database update | 4 Nov 2026 |
| D31 | Replaces D18: the database moves from Supabase to Neon (project `signo`, Frankfurt), with branch `main` for production and `staging` for previews. Login moves to Neon Auth, images to Neon Object Storage, scheduled jobs to Neon Function Triggers (pg_cron doesn't run while a Free database sleeps). Ticket 001 is rebuilt on Neon (D35). Approved by Mostafa | 4 Nov 2026 |
| D32 | Changes D22 and D26: auth emails go through Resend from the start of the Neon rebuild, so they arrive in the user's language (D29). This needs the domain bought and verified now rather than at the pilot | 4 Nov 2026 |
| D33 | Migrations are plain SQL files in `db/migrations` (RLS in the same file), applied by `scripts/migrate.mjs` and tracked in `schema_migrations`. Staging updates on merge or by hand; production only by the manual workflow from `main` | 4 Nov 2026 |
| D34 | The Neon project lives in Ossama's Neon organization, with Mostafa invited. The GitHub repository and Vercel project stay Mostafa's (changed by D36) | 4 Nov 2026 |
| D35 | No screen without a Claude Design page (Ossama). Ticket 001's screens and login code, built from the prototype before the canvas existed, are removed; ticket 001 is rebuilt on Neon from its Claude Design pages. Nothing is copied from Supabase: `signo-dev` stays untouched as a reference only | 4 Nov 2026 |
| D36 | Changes D34: every account is Ossama's. The code moves to a new private repository `Osamashaban/signo` and a new Vercel project `signo` in team `osamas-team1`, next to the Neon project. Mostafa is invited to the repository only to give the second approval. Mostafa's repository and Vercel project are kept untouched and unused (Ossama) | 4 Nov 2026 |
| D38 | Fresh start (Ossama, 4 Nov 2026): nothing moves from Mostafa's accounts. `Osamashaban/signo` starts with a new history: requirements docs, the pipeline and an app with no screens. Version numbers restart at 0.001. Mostafa's old repository, Vercel project and the Supabase project are no longer part of Signo | 4 Nov 2026 |
| D37 | Only Claude Design pages marked "Ready for development", with no open questions, are brought into the pipeline. Drafts and half-finished pages are never built, not even partly (Ossama) | 4 Nov 2026 |
| D39 | Changes D36 and the pipeline's second approval: Ossama alone approves releases to production. Mostafa gets view access to the production and staging sites only, and does not approve pull requests (Ossama, chosen on the V0 release) | 4 Nov 2026 |
| D40 | US-SGN-001 login runs on Neon Auth (D31), but Signo sends every auth email itself through Resend in the member's language: login and reset links come from Neon Auth's `send.magic_link` webhook; the email verification link is Signo's own (Neon's lasts only 15 minutes), so it can last 24 hours as designed (Ossama chose "24 hours, as designed", 6 Nov 2026) | 6 Nov 2026 |
| D41 | Field errors show under the field with a red border, all at once: MSG-001-10 required, MSG-001-11 invalid email, MSG-001-12 name length (canvas D18) | 5 Nov 2026 |
| D42 | "Resend email": 60-second cooldown, at most 5 an hour, a new link replaces the old one; MSG-001-13/14/15 (canvas D19) | 5 Nov 2026 |
| D43 | The 15-minute lockout blocks password log-in and login links, not password reset; a reset clears it (canvas D20) | 5 Nov 2026 |
| D44 | The verification link lasts 24 hours; an expired link shows MSG-001-08 with "Resend email". Expired login and reset links show the same message with "Request a new link" (canvas D21) | 5 Nov 2026 |
| D45 | Screen titles and button labels for ticket 001 are the ones on the Claude Design page; Arabic copy is simple Modern Standard Arabic (canvas D22, D27) | 5 Nov 2026 |
| D46 | After log-in, members land on a temporary clients page (logo, agency name, language switch, Log out, MSG-001-16) until US-SGN-003 replaces it (canvas D23) | 5 Nov 2026 |

## Technical decisions (requirements session)

| # | Decision | Why |
|---|---|---|
| T1 | Review-link token stored as SHA-256 hash (lookup) + AES-256-GCM encrypted copy (display to members) | Members must see the link again; database leak alone doesn't expose working links |
| T2 | `activity` and `platform_admins` tables created in US-SGN-001 | Every later ticket can write events from day one |
| T3 | Review page reads and writes through server routes with the service role, never anon table access | Keeps drafts and other clients' data unreachable from the public page |
| T4 | URLs start with the language (`/ar/...`, `/en/...`). A first visit picks Arabic or English from the browser language, falling back to Arabic | Shareable links keep their language; Arabic-first market |
| T5 | Database migrations are applied by a GitHub Action (`Database migrations`) when files in `supabase/migrations` reach `main`, using repository secrets | Portable (no Vercel-only feature, D20); nobody runs commands by hand |
| T6 | Next.js 16 with Cache Components on (the framework default) | Faster pages; follow `AGENTS.md` when unsure about an API |

## Defaults chosen — please confirm

| # | Question | Default | Why |
|---|---|---|---|
| A1 (superseded by D11) | Product name | **Signo / سيجنو**, kept in one config constant so it's easy to change | Chosen by Mostafa 3 Nov 2026. Same name is used by unrelated small products (a Spanish GDPR tool; "signoSign" e-signature by signotec). Check domain and trademark in Egypt, KSA and UAE before launch |
| A2 | How is the reviewer identified? | Types their name on first visit; stored on that device; every decision records the name, a random device id and the time | Gives a usable approval record without forcing a login |
| A3 | Does the review link expire? | No expiry. The agency can revoke it and generate a new one at any time. | Expiring links break WhatsApp history and confuse clients; revoke covers the security need |
| A4 | Agency roles | Two roles: owner and member. Owner manages the team; everything else is open to both. | Enough for small agencies; finer roles later |
| A5 | One link per client or per month? | One link per client. The review page shows a month switcher, defaulting to the earliest month that still has pending items. | Client keeps one link in WhatsApp; agency doesn't manage many links |
| A6 | What does "Send for approval" send? | All drafts of that client in the currently selected month | Matches how agencies work (monthly plans) |
| A7 | Can a reviewer change a decision? | No. Decisions are final per version; the agency edits and re-sends to reopen | Keeps the record clean |
| A8 | Is the comment required for "Request changes"? | Yes, at least 3 characters | Feedback without text is useless to the designer |
| A9 | Editing an approved deliverable | Allowed, with a confirmation that approval will be reset; creates a new version, status pending | Real life: the client approves, then the agency fixes a typo |
| A10 | Email notifications | Every member gets in-app notifications; email goes to every member, one email per reviewer action, "Approve all" sends one email | Simple; add per-member settings later |
| A11 | Plans during pilot | Pilot agencies are assigned Growth by hand at a custom price of 0 | Uses US-SGN-011; no special pilot code |
| A16 | Early-adopter offer | First 20 paying agencies: price locked for life + first 2 months free (replaces the earlier 50% lifetime idea) | Base prices are already low |
| A17 | Active client definition | A client with at least one deliverable sent in the current calendar month | Agencies aren't charged for idle clients |
| A12 | Caption limits | Max 2,200 characters and max 30 hashtags (Instagram's limits) with a live counter | Prevent posts Instagram would reject |
| A13 | Carousel aspect ratio | Preview uses the first image's ratio, clamped between 4:5 and 1.91:1; other images are cropped to it | Matches how Instagram shows carousels |
| A14 | Publish time | Date required; time optional; shown in the agency's timezone (default Africa/Cairo, can be Asia/Riyadh, Asia/Dubai) | Many agencies plan by day |
| A15 | Reviewer page footer | Shows "Sent with Signo" with a link | Free acquisition channel |

## Open

| # | Question | Notes |
|---|---|---|
| O1 | Are the cut prices right? | Validate in the pilot; change them in the admin dashboard without code |
| O2 | Which payment gateway to use | Deferred by Mostafa (D15) |
| O5 | Support WhatsApp number shown to agencies | Needed for US-SGN-011 messages |
| O6 | Do agencies need receipts or tax invoices? | Affects payment gateway choice (US-SGN-012 open question) |
| O3 | Does Mostafa's employment contract restrict side projects? | Check before launch |
| O4 | Domain name and trademark check for the final name | Before launch |

## Reminders

| # | When | What to do |
|---|---|---|
| R1 (ends once Supabase is retired, D31) | Before 2 Feb 2027 | The Supabase access token `signo-github` (created 4 Nov 2026, 90-day expiry, scoped to `signo-dev`) expires around 2 Feb 2027. Create a new token in Supabase (Account preferences → Access Tokens) and replace the GitHub secret `SUPABASE_ACCESS_TOKEN` before then, or database updates from GitHub stop working. |
| R2 | Before the pilot | Upgrade Neon to Launch if 6 hours of history or the Free limits are too tight, and buy the domain (D22, D32; the domain is needed sooner, for auth emails). Verify the domain in Resend so emails reach people other than the account owner. |
| R3 | Before the first paying agency | Upgrade Vercel to Pro (D22). |
| R4 | When emails near 100 a day | Upgrade Resend from Free (D22). Decision A10 sends one email per reviewer action to every member, so the pilot can reach this. |
