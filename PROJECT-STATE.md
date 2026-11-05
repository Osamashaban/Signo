# Project state

What has actually been set up, what was decided and why, and what is still
open. Conversations do not survive: a Claude starting a new session reads this
repository and nothing else. Anything agreed in a chat and not written here (or
in `docs/04-decisions-log.md`) is lost.

Keep it current. Correct it when reality changes rather than appending to it.

Last updated: 2026-11-05.

---

## Where things live

| Thing | Where |
| --- | --- |
| Repository | `Osamashaban/signo` (private; Ossama owns it and approves releases, D39) |
| Hosting | Vercel project `signo`, team `osamas-team1` (Ossama's) |
| Live site | Filled in after the first deployment (production, serves `main`) |
| Staging | Fixed link that always shows the `staging` git branch (filled in after the first deployment); each pull request also gets its own preview link. All of them read the Neon `staging` database |
| Database | Neon project `signo` (`super-math-60253213`), Frankfurt, Postgres 18, in Ossama's Neon organization |
| Production database | Neon branch `main` |
| Preview / development database | Neon branch `staging` |
| Health check | `/api/health` on any deployment |
| Designs (the only source for screens) | Claude Design canvas "Signo UI/UX project", https://claude.ai/artifact/TCiqssDXHNZBz7c35B5eRF |
| Approved designs archive | Figma "Signo Feature Designs", https://www.figma.com/design/Fq9rBwsQQb7l5onf2UTmX3 (in Ossama's Figma team; share it with Mostafa) |
| Flow reference (not the look) | `prototype/signo-prototype.html` |

Frankfurt was chosen because it is the closest region to Cairo and the Gulf.

## How environments are separated

| Variable (Vercel) | Production | Preview |
| --- | --- | --- |
| `DATABASE_URL` (pooled) | Neon `main` | Neon `staging` |
| `DATABASE_URL_UNPOOLED` (direct) | Neon `main` | Neon `staging` |

That split is what stops a preview writing to real agencies' data. GitHub
Actions secrets: `STAGING_DATABASE_URL_UNPOOLED` (used by **Migrate staging
database**) and `PRODUCTION_DATABASE_URL_UNPOOLED` (used only by **Migrate
production database**). Set up by `SETUP.md`. Local development reads
`.env.local` and points at `staging`.

## Working agreement

Changes reach `main` through a pull request, following `PIPELINE.md`
(adopted 2026-11-04, decisions D30 and D31). The requester approves in chat ("deploy",
"looks good"). Ossama approves every release to production (D39); Mostafa can
view the production and staging sites but does not approve releases.

## Status

| Work | State |
| --- | --- |
| Fresh start (D38) | The repository started empty on 2026-11-04. Nothing was copied from earlier repositories or hosting |
| Pipeline, Neon, health check, migrations | Live (0.001) |
| US-SGN-001 onwards | Each waits for its Claude Design pages marked "Ready for development" (D35, D37) |

## Open

- `SETUP.md` steps 2 and 3 (two GitHub secrets, inviting Mostafa) are done
  by Ossama; Claude can't set GitHub secrets.
- Preview links are behind Vercel's login, and a Hobby team has one member,
  so Mostafa can't open them yet. Decide how he tests staging before his
  first ticket review.
- Auth emails in Arabic and English need Resend with a verified domain (D32).
  The domain isn't bought yet.
- GitHub Free does not enforce branch protection on private repositories.
  Production is still gated: Vercel's automatic domain assignment for
  production is off (5 Nov 2026, D40), so a merge to `main` builds
  production but it only goes live when promoted after Ossama's approval.
  Production migrations run only by hand (`Migrate production database`).
- Production database backups: Neon Free keeps 6 hours of point-in-time
  history (on) and allows no scheduled snapshots. Each production
  migration also saves a full copy first (kept 30 days). Upgrade to Neon
  Launch before the pilot for up to 7 days and daily snapshots (R2).
- Mostafa's admin access (D40): Neon invite and GitHub collaborator are
  Ossama's steps (`SETUP.md` step 3); Vercel needs Pro to add a member.
- The Neon organization also has an admin `samerismaeil98@gmail.com`
  (seen 5 Nov 2026). Ossama to confirm whether that is intended.
