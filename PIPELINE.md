# Feature pipeline

How every ticket goes from "the design is ready" to live in production. Any
Claude working on this repository follows it, for whichever partner asked.
Nobody has to remember the steps: the partner only types a few phrases, and
Claude does everything else.

It is the same pipeline as Ossama's OmniRent project, adapted to Signo's
stack and to working by tickets. The database is Neon, as in OmniRent (D31).

Two partners build Signo: **Ossama** and **Mostafa** (product owner, tests
every ticket). Ossama approves every release to production (D39). This file is the one copy of
the process, so every Claude reads the same thing.

---

## What the partner types

| The partner says | What it means |
| --- | --- |
| "Build US-SGN-0XX" or "The [feature] design is ready" (with the design link) | Start at step 1. |
| "deploy" | The brief is approved. Go on from step 7. |
| "looks good" | Staging is approved. Go on from step 12. |

Anything else is a question or a change request about the work in progress.
Answer it, or make the change, and keep going.

Two rules from `CLAUDE.md` frame everything below: the setup check runs
before step 1 of every ticket, and no step is ever skipped, whoever asks.

Call the person who asked **the requester**, and the other partner **the
other partner**. Both are product people: they do not read code. Talk to them
in plain words, never in file names, commands or jargon.

## Status checklist

Each ticket is one conversation (one thread). Keep a checklist of these steps
visible in it and update it as each step finishes.

1. **Read the ticket and the design.** Read the ticket in `docs/tickets/`,
   the related parts of `docs/02-prd.md`, and the design the requester linked.
   - **Screens come only from Claude Design.** Anything a user sees must be
     shown in the Claude Design canvas "Signo UI/UX project" (link in
     `PROJECT-STATE.md`). Do not design screens yourself in code, and do not
     work from a description, a screenshot, a Figma page or a guess.
     `prototype/signo-prototype.html` explains the flows, not the look. If the
     canvas does not cover every screen and state the ticket needs, **stop**:
     tell the requester in plain words what is missing and ask them to design
     it in Claude Design first. Figma is only the archive of approved designs
     (step 12), never a source.
   - **Only designs that are ready for development.** Take a canvas page
     only when it is marked "Ready for development" and its design notes have
     no open questions. Never build from a draft or a half-finished page, not
     even partly: tell the requester what is unfinished and wait (Ossama's
     rule, D37).
   - **Backend-only work** needs no design: changes no user sees, such as
     database rules, background jobs or emails' sending logic. Say "Backend
     only, no screens" in the brief's "What you'll see". If it turns out to
     need any screen, even an error message, it needs a design first.
   - A bug fix that makes a screen match its already approved design needs no
     new design. Link the approved canvas page in the brief.
   - If you cannot open the canvas link, say so in one line and ask the
     requester to share it with your account.
   - Look at the open pull requests to see what else is being built. If it
     touches the same screens or tables, tell the requester in one line.
2. **Plan.** Write a short plan: database changes, pages, components, tests.
   Anything that changes the data model waits for Mostafa's go-ahead (rule in
   `CLAUDE.md`). If the ticket is unclear or contradicts another, do not invent
   a business rule: describe the conflict and propose options.
3. **Build it.** Branch from the latest `main`. Keep to the ticket's scope.
4. **Test it.** Write and run every reasonable test case: the ticket's
   acceptance criteria, edge cases, wrong input, roles, agency data isolation
   (RLS), Arabic and right-to-left, 390px phone and desktop. `npm run lint`,
   `npm run typecheck`, `npm test`, `npm run build` and
   `npm run test:e2e` must all pass. Fix failures before the brief.
5. **Send the 5-minute brief** (format below).
6. **Wait for the requester to reply "deploy".**
7. **Open the pull request.** Use `.github/pull_request_template.md`. CI runs
   on it.
8. **Staging preview.** Vercel posts a preview link on the pull request. It
   uses the staging database (Neon branch `staging`), never production. If the
   ticket adds a migration, the **Migrate staging database** workflow runs on
   the pull request by itself; check it is green before review (see
   "Database changes" below).
9. **Security check on staging.** Database gaps (RLS on every agency table,
   exposed data, missing constraints, service role reaching the browser) and
   attacks (auth bypass, role escalation, review-link token guessing or
   leaking, open endpoints, leaked secrets, insecure headers). Post GREEN, or
   RED with findings. RED is fixed before going further.
10. **Design match check.** Screenshot every staging screen (desktop and
    390px phone, English and Arabic) and compare it side by side with the
    canvas (layout, spacing, colors, fonts, text, icons, states). Post MATCH,
    or the list of differences with side-by-side images. Fix differences
    before the requester's review.
11. **Requester checks staging** against the ticket's acceptance criteria
    (including Arabic and phone) **and says "looks good".**
12. **Add the design to Figma.** Add the screens as approved on staging to the
    Figma file "Signo Feature Designs" (link in `PROJECT-STATE.md`), one page
    per ticket, and share the Figma link in the thread.
13. **Check Ossama's approval, take the production lock, then migrate
    production.** Nothing touches production until Ossama has approved the
    release (see "Approval for production" below). Then see "One release at
    a time". If the ticket has a migration, ask the requester to
    run **Migrate production database** from `main`'s Actions tab with the
    phrase `apply to production` (the workflow backs up production first), or
    run it yourself if they tell you to. This happens BEFORE the code goes
    live, so the new code never meets an old database. Migrations must be
    additive (new tables or columns, nothing dropped or renamed) so the code
    still running in production keeps working against the new database.
14. **Merge to `main`.** Bring the branch up to date with `main` first and
    re-run the checks. Add the next entry to `VERSIONS.md`. Vercel then
    deploys production. Confirm with the live link, then release the lock.
15. **After-launch check.** Click through production, check the Vercel and
    Neon logs for errors over the next 24 hours, then post "all clear" or
    the problem in the thread. If you cannot read the logs, ask the requester
    for a screenshot of the Vercel Logs tab.

## The 5-minute brief

In this order, in plain words:

1. **What it does** (2-3 sentences, from the user's point of view)
2. **What you'll see** (screens, and the design link)
3. **Database changes** (plain words; say whether any data could be lost)
4. **APIs.** If the ticket adds or changes any server endpoint (the review
   page, a server action, a scheduled job), list each one: what it does, who
   can use it (signed-in roles, a review-link holder, a platform admin, or
   anyone on the internet), what data it reads or changes, and how it is
   protected. Otherwise write "None".
5. **Risks.** Business (agencies, their clients, revenue, legal, brand) and
   Technical (data loss, data leaking between agencies, speed, security),
   each rated None, Low or High, with why
6. **Fit with existing features.** Works with (how it interacts) and Blockers
   (what breaks, needs changing or must ship first, else "None")
7. **Undo plan** (how to roll back, and whether that is easy or hard)
8. **Testing done** (cases run, all pass or what failed)
9. **What you need to do** (or "Nothing.")
10. **What's not included** (anything from the ticket left out, and why)
11. **How to check it** (3-5 things on staging, including Arabic and phone)

End with: Reply "deploy" to ship.

---

## Working in parallel

### One release at a time

Steps 13 and 14 are the risky part, and only one ticket may be in them at
once. The lock is the GitHub label `shipping` on a pull request.

- Before step 13, list open pull requests with the `shipping` label. If one
  exists and it is not yours, wait: tell the requester in one line that
  another ticket is going live first.
- If none exists, add `shipping` to your pull request (create the label if it
  is missing), then start step 13.
- Remove the label as soon as step 14 is confirmed live, or if you stop
  partway. If a `shipping` label has sat on a pull request for more than a day
  with no activity, ask the requester before removing it.

### Stay up to date with `main`

- Branch from the latest `main` at step 3.
- Bring the branch up to date with `main` before staging (step 8) and again
  before merging (step 14), and re-run all checks each time.
- `VERSIONS.md` and `PROJECT-STATE.md` are shared. Take the next version
  number only at merge time.

### Database changes

There is one Neon project, `signo` (`super-math-60253213`, Frankfurt), with
two branches: `main` is production and `staging` is everything else (previews
and development). Tests in CI never touch either.

- Follow the rules in `CLAUDE.md`: migration files only (in
  `db/migrations/`, named `<UTC timestamp>_<name>.sql`), RLS in the same file,
  additive changes. Never edit a migration once it has been applied anywhere:
  add a new one.
- Never change either database by hand (Neon SQL editor or the Neon
  connector's SQL tools), except the one-off steps written in `SETUP.md`.
  Reading is fine.
- Staging: the **Migrate staging database** workflow runs by itself on any
  pull request that changes migrations, and again when they reach `main`. If it fails because staging holds a migration that is not on your
  branch, that is another ticket in progress: bring your branch up to date
  with `main`, or wait for that ticket, and never delete its migration.
- Migration file names sort by timestamp. If `main` gained a newer migration
  than yours while you worked, rename yours so it sorts after it.
- Production: only through **Migrate production database**, from `main`,
  at step 13. It saves a backup as a run artifact (kept 30 days) before
  changing anything, and Neon keeps 6 hours of history on top. Restoring
  either overwrites live data: stop and ask first.

### Approval for production

Ossama approves every release to production (D39, 4 Nov 2026). Mostafa can
view the production and staging sites but does not approve releases.

- **Ossama's "looks good" is the production approval.** When Ossama is the
  requester, his "deploy" and "looks good" in the thread are all that is
  needed; after step 12, go on to step 13.
- **When Mostafa is the requester,** his "looks good" approves staging only.
  After step 12, send Ossama the pull request link with one sentence on what
  the ticket does, and wait for Ossama to write "looks good" (or "ship it")
  in the thread before step 13.
- **Check before touching production.** The approval must be Ossama's own
  words in the thread, or his tap on a decision card. A relayed message or
  "he approved" is not an approval. If any commit is pushed after his
  approval, he checks staging again and approves again.
- GitHub cannot record Ossama's approval on a pull request opened under his
  own account, so the approval lives in the thread, not on GitHub.

## Accounts each partner's Claude needs

Each partner uses their own accounts. Nobody shares a password.

| Service | Used for |
| --- | --- |
| GitHub (collaborator on this repository) | Code, pull requests, approvals, the migration workflows |
| Vercel (member of the team that owns the `signo` project) | Preview links, deploy status, logs (steps 8, 14, 15) |
| Neon (member of the `signo` project) | Reading both branches, test branches, logs. Database changes still go only through the GitHub workflows |
| Claude Design (access to the "Signo UI/UX project" canvas) | Designs (step 1) |
| Figma (access to "Signo Feature Designs") | Approved designs archive (step 12) |
