# Versions

Every merge to `main` gets a version number and a timestamp, newest first.

Numbers start at `0.001` and go up by one thousandth each time. The number
carries no meaning beyond order: a bigger jump does not signal a bigger change.

Each entry records the commit it was merged as, so the exact code behind any
version can be found later. Timestamps are UTC. Descriptions are in product
language, for people who do not read code.

---

## 0.002 — 2026-11-04

V0, the first screen: a "Coming soon" page from the Claude Design canvas, in
Arabic (the default, right to left) and English, on phones and computers,
with a button to switch language. Every page now also carries security
settings that stop other sites from showing it inside their own pages. From
this release on, Ossama alone approves releases to production (D39).

Commit: `35a663d`

## 0.001 — 2026-11-04 19:55 UTC

Fresh start on Ossama's accounts (D38). The project has the same pipeline as
OmniRent: screens come only from the Claude Design canvas, every change is
checked on staging with its own database, and the live app needs the other
partner's approval and a backed-up, hand-started database update. There are
no screens yet. A status address (`/api/health`) shows which environment you
are on and whether it reaches its database.

Commit: `6331e1a` (pushed directly as the repository's first commit)
