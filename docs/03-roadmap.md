# 03 — Roadmap

Principle: **start narrow, design wide.** Win social media agencies first. The data model already treats everything as a "deliverable", so other industries later mean new deliverable types, not a new product.

## Phase 1 — MVP (month 1)
Tickets US-SGN-001 to 010. Instagram image posts, WhatsApp review link, approval record, Arabic and English. Pilot with 2–3 agencies, free.

## Phase 2 — Marketing depth (months 2–3)
| Feature | Why | Effort |
|---|---|---|
| Online payments through a payment gateway (provider not chosen yet) connected to the plans in US-SGN-011 | Agencies pay by card instead of manual plan assignment | Medium |
| Admin dashboard, part 2: platform metrics (sign-ups, active agencies, plans sent, approvals), suspend/activate agencies, extend trials | Mostafa manages the platform without the Supabase dashboard (part 1, plans and pricing, is US-SGN-011 in the MVP) | Medium |
| Video, Reels and Stories (with size limits) | Most agency content is video | Medium; storage cost rises |
| Facebook, TikTok and LinkedIn previews | Agencies post to more than Instagram | Medium |
| **AI pre-check before sending**: spelling (AR/EN), image text vs caption conflicts, odd prices or dates | Fewer revision rounds; clear differentiator | Low–Medium |
| **Voice-note feedback**: reviewer records a voice note; transcribed and turned into a task list | Matches how clients here give feedback | Medium; test dialect accuracy first |
| Automatic WhatsApp reminders (WhatsApp Business API) | Clients forget | Medium; per-message cost |
| Brand kit per client (logo, colors, fonts, writing rules) | Makes AI checks accurate | Low |
| Free stand-alone "post checker" tool | Acquisition channel to the same audience | Low |

## Phase 3 — Account manager layer (months 3–5)
| Feature | Why |
|---|---|
| Revision-round limits per client, with alerts when exceeded | Evidence against scope creep; basis for charging extra rounds |
| Approval-time stats per client | Spot slow clients early |
| Client health view (late, many revisions, at risk) | Retention |
| Multiple approvers per client, in order | Marketing manager first, then owner |
| Monthly delivery report for the client | What was delivered, approved when, how many rounds |
| AI caption helper (dialect rewrite, AR↔EN translation, hashtags) | Convenience; not a differentiator |

## Phase 4 — Other industries (month 6+)
New deliverable types and templates: design studios (logos, PDFs), video production (time-coded comments), software agencies (UI screens, milestones), interior design (3D renders, finishes), printers (final proofs), PR and events (press releases, event plans). Positioning shifts from "social media approvals" to "client sign-off platform".

## Not planned
Auto-publishing to social networks (crowded market, API approval burden). A native mobile app (the review link works in the phone browser).
