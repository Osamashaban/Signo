# 01 — Business Case

Status: Draft v1 · Owner: Mostafa · Last updated: 3 Nov 2026

## 1. Problem

Social media agencies in Egypt and the Gulf get client approval on content through WhatsApp chats and Google Drive folders. A typical month for one client looks like this:

- The agency sends 12–20 post images as separate WhatsApp messages, with captions pasted underneath.
- The client replies days later with feedback mixed into the chat ("change the word in the third one"), often as voice notes.
- Nobody is sure which version was approved. Posts go live without sign-off, or approved posts get forgotten.
- When a client disputes a post ("I never approved this"), the agency has no clean record.
- Account managers spend hours each week chasing approvals and re-sending files.

The cost to the agency: wasted account-manager time, publishing delays, avoidable revision rounds, and client churn caused by friction rather than by the quality of the work.

## 2. Solution

A content-approval portal built for how this market works:

1. The agency uploads the month's plan for a client: images, caption, publish date.
2. The client gets a link on WhatsApp. It opens on the phone, with no account and no login, and shows each post the way it will look on Instagram.
3. The client taps **Approve** or **Request changes** with a comment, post by post, or approves everything at once.
4. The agency sees status per post, edits what needs changes, and re-sends. Every decision is logged with name and time.

## 3. Target customers

**Primary (MVP):** Small and mid-size social media and marketing agencies, 3–30 staff, managing 5–40 client brands, in Egypt, Saudi Arabia and the UAE.

**Users inside the agency:** account managers, social media managers, and designers who upload or fix content.

**Secondary users (non-paying):** the agency's clients (brand owners, marketing managers) who review content.

**Later:** freelance social media managers; then other businesses that need client sign-off (design studios, video production, interior design, printing). See `03-roadmap.md`.

## 4. Why now, and why this market

- WhatsApp is the main business channel in the region. Clients will not log into another tool, but they will open a link someone sends them on WhatsApp.
- The approval tools that exist are built for English-speaking markets, priced in USD for Western agencies, and assume the client logs in or reads email.
- Arabic content needs right-to-left previews that render captions correctly. Global tools handle this poorly or not at all.

## 5. Competitors

| Tool | What it does | Starting price (as found, Oct–Nov 2026) | Gap for our market |
|---|---|---|---|
| Planable | Approval-first collaboration, calendar, scheduling | ~$33/month | Clients log in; English-first; USD pricing |
| Loomly | Calendar, approvals, scheduling | $49/month yearly, $65 monthly, 3 users | Expensive for Egyptian agencies; user caps |
| Kontentino, Sendible, SocialPilot, Pallyy | Scheduling suites with approval features | Per-workspace pricing reported at $39–59/workspace/month for some tools | Approval is one feature among many; per-client cost adds up fast |
| WhatsApp + Google Drive | Free, what everyone uses today | Free | No status, no record, no previews, feedback lost in chat |

The real competitor is the free habit (WhatsApp + Drive), not another SaaS. The product has to be faster than the habit on day one.

Sources: Capterra and GetApp listings for Planable; Postiv comparison of Planable, Loomly and Kontentino (pricing checked 19 Oct 2026); PostPlanify comparison of Planable alternatives (Apr 2026). Re-check prices before using them in sales material.

## 6. Positioning

> The fastest way to get your clients to approve content: one WhatsApp link, Arabic or English, no login.

Differentiators, in order of importance:
1. **WhatsApp-native review.** The link opens on the phone with no account.
2. **Arabic first.** RTL previews, Arabic UI, Arabic and English for both agency and client.
3. **Priced for the region.** Local-currency pricing for Egypt, fair USD pricing for the Gulf.
4. **Approval record.** Who approved which version, and when. Useful when a client disputes a post.
5. Later: AI pre-check before sending, and voice-note feedback (see roadmap).

## 7. Business model and pricing hypothesis

Monthly or yearly subscription per agency, in **fixed tiers by number of active clients**. A client is active in a month when at least one deliverable was sent to it that month; archived and idle clients don't count. Agency team members and client-side reviewers are unlimited on paid plans, so agencies never pay for headcount.

| | Free | Starter | Growth | Agency |
|---|---|---|---|---|
| Active clients | 2 | up to 5 | up to 15 | up to 40 |
| Agency members | 2 | unlimited | unlimited | unlimited |
| Reviewers | unlimited | unlimited | unlimited | unlimited |
| Gulf, monthly (USD) | $0 | $13 | $34 | $69 |
| Gulf, yearly (USD, 2 months free) | $0 | $130 | $340 | $690 |
| Egypt, monthly (EGP) | 0 | 349 | 899 | 2,099 |
| Egypt, yearly (EGP, 2 months free) | 0 | 3,490 | 8,990 | 20,990 |
| Cost per client (Gulf, monthly) | — | ~$2.6 | ~$2.3 | ~$1.7 |
| "Sent with Signo" footer | shown | shown | shown | can be hidden |

How the prices were set (3 Nov 2026):
- Competitors cost an agency about $8–15 per client per month in full social suites (SocialPilot Premium, Pallyy Agency, Kontentino), and $33–59 per client in Planable, the closest approval-first tool.
- Signo only does approvals (no scheduling, publishing or analytics), so it must be clearly cheaper. A first draft at $19 / $49 / $99 was cut by about 30% at Mostafa's request, as a new brand with no reviews competing against a free habit (WhatsApp + Drive).
- Egypt prices are set for local agency budgets, not by converting USD. Egypt is the market for early users and feedback; the Gulf is where most revenue is expected.
- Over-limit rule: an agency at its client limit cannot send to a new client until it upgrades. Existing clients keep working.
- Early-adopter offer (default, to confirm): the first 20 paying agencies keep their price for life (no future increases) and get their first 2 months free. A 50% lifetime discount was dropped because the base prices are already low.

All prices are stored as data and edited by the platform admin from the admin dashboard (US-SGN-011), so they can change without code. They are hypotheses to test in the pilot. The payment gateway is not chosen yet; until it is, the platform admin assigns plans to agencies by hand.

## 8. Go-to-market

1. **Pilot (weeks 1–6 after MVP):** 2–3 agencies Mostafa already knows use it free on real clients. In exchange: weekly feedback, permission to quote them, and real numbers.
2. **Measure in the pilot:** time from send to full approval, number of revision rounds, and how many clients open the link without help.
3. **Launch:** LinkedIn posts with pilot results, Arabic social-media-manager groups on Facebook and WhatsApp, and direct outreach to agencies.
4. **Free post-check tool (phase 2):** an AI tool that checks one post for spelling mistakes and caption/image mismatches. It brings the same audience in and points them to Signo.
5. **Referral:** every review page shows "Sent with Signo", and every client of an agency is a possible future agency lead.

## 9. Success metrics

| Metric | Pilot target |
|---|---|
| Review links opened by clients without agency help | ≥ 80% |
| Median time from send to all posts decided | < 48 hours |
| Pilot agencies still using it after 4 weeks | ≥ 2 of 3 |
| Pilot agencies willing to pay at the hypothesis price | ≥ 1 |

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Agencies stay on WhatsApp + Drive because it's free | No adoption | Make sending faster than WhatsApp; free plan; prove time saved in the pilot |
| Clients ignore the link | Product looks useless | Phone-first review page that loads fast; reminders in phase 2 |
| Low willingness to pay in Egypt | Low revenue | Price per active client in EGP; focus paid acquisition on the Gulf |
| Global tools add Arabic and WhatsApp | Differentiator weakens | Move fast on regional details: voice notes, dialect AI, local pricing |
| Payments from Egypt are hard to set up | Can't charge | Payment gateway decision is deferred; plans are assigned by hand from the admin dashboard until then (see launch checklist) |
| Data protection rules (Saudi PDPL, Egypt's data protection law) | Legal exposure with Gulf agencies | Privacy policy, data processing terms, and a legal review before charging |
| Side-project time limits | Slow progress | Strict MVP scope; one ticket at a time |
