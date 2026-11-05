# Pipeline setup

One-time steps that switch on the feature pipeline (`PIPELINE.md`).
Everything runs on Ossama's accounts (D36): the GitHub repository
`Osamashaban/signo`, the Vercel project `signo` in team `osamas-team1`, and
the Neon project `signo`. Production reads the Neon branch `main`; every
preview link reads the branch `staging`, so a preview can never touch real
agencies' data.

Already done by Claude:

- The Neon project `signo` (`super-math-60253213`, Frankfurt, Postgres 18)
  with branches `main` and `staging`, and the staging database set up.
- The first version of the app and the pipeline, pushed to the repository.
- The Vercel project `signo` (Frankfurt), linked to the repository.

No engineering background is needed. Budget about 10 minutes.

> Connection strings are passwords. They go only into the Neon and GitHub
> settings screens below. Never paste them into a chat, an email, a code file
> or a pull request.

| Step | Who |
| --- | --- |
| 1. Create the empty repository (done) | Ossama |
| 2. Give GitHub and Vercel the connection strings | Ossama |
| 3. Invite Mostafa and share the design files | Ossama |

---

## Step 1 — Create the repository

1. Open [github.com/new](https://github.com/new). Name: **signo**. Choose
   **Private**. Leave everything else empty, then **Create repository**.
2. Open
   [Claude's GitHub access](https://github.com/apps/claude/installations/select_target),
   pick your account and make sure **signo** is included.

## Step 2 — Give GitHub the direct strings (for database updates)

In [console.neon.tech](https://console.neon.tech), open the project **signo**
and click **Connect** at the top of the dashboard:

1. Pick **Branch: staging**, **Database: signo**, switch **Connection pooling
   OFF**, and copy the string: that is **Staging direct**.
2. Pick **Branch: main**, keep pooling **OFF**, and copy again: **Production
   direct**.

Then GitHub → repository **signo** → **Settings** → **Secrets and variables**
→ **Actions** → **New repository secret**. Add two:

| Name | Value |
| --- | --- |
| `STAGING_DATABASE_URL_UNPOOLED` | Staging direct |
| `PRODUCTION_DATABASE_URL_UNPOOLED` | Production direct |

Then Vercel → project **signo** → **Settings** → **Environment Variables**.
Add these four, each marked **Sensitive** ("pooled" is the same string with
**Connection pooling ON**):

| Name | Value | Environment |
| --- | --- | --- |
| `DATABASE_URL` | Production pooled | Production |
| `DATABASE_URL_UNPOOLED` | Production direct | Production |
| `DATABASE_URL` | Staging pooled | Preview |
| `DATABASE_URL_UNPOOLED` | Staging direct | Preview |

The same name twice with different values is on purpose: that is what keeps
previews off production data. Local development reads `.env.local` (see
`.env.example`) and always points at `staging`.

## Step 3 — Give Mostafa admin access and share the design files

Mostafa gets admin rights everywhere so the business doesn't depend on one
account (D40). He still doesn't approve releases: Ossama does (D39).

1. **Neon:** [console.neon.tech](https://console.neon.tech) → your
   organization → **Settings** → **People** → **Invite** →
   `mostafa200984@gmail.com`, role **Admin**.
2. **GitHub:** repository **signo** → **Settings** → **Collaborators** →
   **Add people** → `MostafaMahmouddba`. A repository on a personal account
   can't have a second admin; for full admin rights, move it into a free
   GitHub organization with both of you as owners (Claude does the
   reconnecting afterwards).
3. **Vercel:** team **osamas-team1** → **Settings** → **Members** → invite
   `mostafa200984@gmail.com` as **Owner**. The free Hobby plan has one
   member only, so this needs Vercel Pro (about $20 a month per member).
4. Share the Claude Design canvas "Signo UI/UX project" with Mostafa.
5. Share the Figma file "Signo Feature Designs" with Mostafa:
   https://www.figma.com/design/Fq9rBwsQQb7l5onf2UTmX3

Then tell Claude "keys added". It runs the setup check in `CLAUDE.md` and
carries on with the pipeline.

## Later, on a paid GitHub plan (optional)

GitHub Free does not enforce these on private repositories:

- **Settings → Rules → Rulesets**: protect `main` (restrict deletions, block
  force pushes, require a pull request with 1 approval, require the `check`
  status).
- **Settings → Environments** → `production` with the other partner as
  **Required reviewer**, then add `environment: production` to
  `.github/workflows/migrate-production.yml`.

---

## Final check — prove the pipeline works

Each deployment has a status address, `/api/health`, which says which
environment it is and whether it reaches its database (it never shows
passwords or data).

1. **Staging is migrated first.** Actions → **Migrate staging database** runs
   green. The preview link's `/api/health` shows `"environment":"preview"`
   and `"database":"connected"`.
2. **Production is untouched until you say so.** Before step 3, the live
   site's `/api/health` (address in `PROJECT-STATE.md`) shows
   `"database":"not_migrated"`. That is the proof previews don't share
   production's database.
3. **Production changes only by hand.** Actions → **Migrate production
   database** → Run workflow from `main`. Typing anything other than
   `apply to production` fails straight away. With the exact phrase it backs
   up, then applies; the live `/api/health` then shows `"connected"`.
