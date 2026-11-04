# Versions

Every merge to `main` gets a version number and a timestamp, newest first.

Numbers start at `0.001` and go up by one thousandth each time. The number
carries no meaning beyond order: a bigger jump does not signal a bigger change.

Each entry records the commit it was merged as, so the exact code behind any
version can be found later. Timestamps are UTC. Descriptions are in product
language, for people who do not read code.

---

## 0.001 — (filled in at merge)

Fresh start on Ossama's accounts (D38). The project has the same pipeline as
OmniRent: screens come only from the Claude Design canvas, every change is
checked on staging with its own database, and the live app needs the other
partner's approval and a backed-up, hand-started database update. There are
no screens yet. A status address (`/api/health`) shows which environment you
are on and whether it reaches its database.

Commit: _recorded after merge_
