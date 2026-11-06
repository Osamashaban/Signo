# Project state

What has actually been set up, what was decided and why, and what is still
open. Conversations do not survive: a Claude starting a new session reads this
repository and nothing else. Anything agreed in a chat and not written here (or
in `docs/04-decisions-log.md`) is lost.

Keep it current. Correct it when reality changes rather than appending to it.

Last updated: 2026-11-04.

---

## Where things live

| Thing | Where |
| --- | --- |
| Repository | `Osamashaban/signo` (private; Ossama owns it and approves releases, D39) |
| Hosting | Vercel project `signo`, team `osamas-team1` (Ossama's) |
| Live site | https://signo-five.vercel.app (also https://signo-osamas-team1.vercel.app; production, serves `main`, public) |
| Staging | https://signo-git-staging-osamas-team1.vercel.app (always shows the `staging` git branch; public since 2026-11-04 so Mostafa can test without a Vercel seat); each pull request also gets its own preview link. All of them read the Neon `staging` database |
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
- GitHub Free does not enforce branch protection on private repositories,
  so the "nothing reaches production without Ossama's approval" rule is kept
  by the pipeline, not by GitHub.
