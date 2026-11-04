# Signo

Content-approval app for marketing agencies in Egypt and the Gulf.

## What's inside

| File | What it is |
|---|---|
| `CLAUDE.md` | Standing context for Claude Code: product, glossary, stack, rules. Claude Code reads it automatically. |
| `docs/01-business-case.md` | Problem, market, competitors, positioning, pricing hypothesis, go-to-market, risks. |
| `docs/02-prd.md` | MVP product requirements: users, scope, flows, data model, non-functional requirements. |
| `docs/03-roadmap.md` | Phases after the MVP: marketing depth, AI, account-manager features, other industries. |
| `docs/04-decisions-log.md` | Every decision taken so far, defaults chosen for open questions, and what is still open. |
| `docs/05-launch-checklist.md` | Things outside the code that must be done before charging money (legal, payments, support). |
| `docs/06-design-brief.md` | Brief for Claude Design: visual direction and the list of screens. |
| `docs/tickets/` | 12 MVP tickets, in build order. |
| `prototype/signo-prototype.html` | Clickable prototype with sample data. Open in any browser. |

## How to start

Read `CLAUDE.md`, then `PROJECT-STATE.md` (what exists and where), `PIPELINE.md`
(how every ticket is built and shipped) and `SETUP.md` (one-time setup).

## Build order

| # | Ticket | Depends on |
|---|---|---|
| 001 | Agency sign-up, login and workspace | — |
| 002 | Team members and roles | 001 |
| 003 | Client management | 001 |
| 004 | Create and edit deliverables | 003 |
| 005 | Instagram preview | 004 |
| 006 | Send for approval and review link | 004 |
| 007 | Client review page | 005, 006 |
| 008 | Revision cycle and versions | 007 |
| 009 | Client dashboard and activity log | 007 |
| 010 | Agency notifications | 007 |
| 011 | Admin dashboard: plans, prices and agency plans | 002, 006 |
| 012 | Manual payments record | 011 |

Rough effort with Claude Code and full-time attention: 3–5 weeks including testing.

## Where requirements change

Business and requirement decisions are worked out in the other Claude account, then the changed doc or ticket is copied here. If Claude Code finds a gap while building, write it down in `docs/04-decisions-log.md` under "Open" and resolve it before continuing.
