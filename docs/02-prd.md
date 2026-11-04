# 02 — Product Requirements (MVP)

Status: Draft v1 · Owner: Mostafa · Last updated: 3 Nov 2026
Related: `01-business-case.md`, `04-decisions-log.md`, tickets in `tickets/`

## 1. Goal

Let an agency get a client's approval on a month of Instagram image posts through one WhatsApp link, with a clear status for every post and a record of every decision.

## 2. Users and permissions

| User | Logs in? | Can do |
|---|---|---|
| Agency **owner** | Yes | Everything a member can, plus: rename the agency, invite and remove members, change roles |
| Agency **member** | Yes | Manage clients, create and edit deliverables, send for approval, manage review links, see dashboard and activity |
| **Reviewer** (client side) | No, uses a review link | See sent deliverables for that client, approve, request changes with a comment |
| **Platform admin** (Mostafa) | Yes | Admin dashboard at `/admin`: plans, prices, assigning plans to agencies (US-SGN-011). Sees counts, never agency content. |

## 3. Scope

### In the MVP
1. Agency sign-up, login, password reset, one workspace per sign-up (US-SGN-001)
2. Invite members, owner/member roles (US-SGN-002)
3. Add, edit and archive clients (US-SGN-003)
4. Create and edit Instagram deliverables: 1–10 images, caption, publish date (US-SGN-004)
5. Instagram-style preview for single images and carousels (US-SGN-005)
6. Send for approval; one review link per client; copy, WhatsApp share, revoke and regenerate (US-SGN-006)
7. Review page: reviewer name, approve, request changes with comment, approve all (US-SGN-007)
8. Revision cycle: edits create versions and send the deliverable back for approval (US-SGN-008)
9. Client dashboard with status counts and activity log (US-SGN-009)
10. Agency notifications: in-app bell and email (US-SGN-010)
11. Admin dashboard: plans, prices per market with price history, manual plan assignment, plan limits, agency plan history (US-SGN-011)
12. Manual payments record: payments, voids, monthly totals, CSV export, owner payment history (US-SGN-012)

### Not in the MVP
Video, Reels, Stories; platforms other than Instagram; scheduling or auto-publishing; AI features; WhatsApp Business API messages and automatic reminders; online payments (gateway not chosen); multiple approvers per client; revision limits; admin dashboard part 2 (metrics, suspend agencies); mobile apps. See `03-roadmap.md`.

## 4. Main flows

### 4.1 Agency prepares and sends a plan
1. Member opens a client → sees the client's deliverables for the selected month.
2. Adds deliverables (images, caption, publish date). Each is saved as `draft`.
3. Taps **Send for approval** → all drafts of that client become `pending`. A panel shows the review link with **Copy** and **Send on WhatsApp**.
4. **Send on WhatsApp** opens `https://wa.me/<client phone>?text=<prefilled message with link>` in WhatsApp. The member sends it from their own WhatsApp.

### 4.2 Client reviews
1. Reviewer opens the link on their phone. First visit asks for their name (stored on that device).
2. Sees the month's sent deliverables as Instagram posts, with a progress bar ("6 of 10 approved").
3. For each `pending` deliverable: **Approve**, or **Request changes** + comment (required).
4. **Approve all remaining** approves every pending deliverable in the month in one tap.

### 4.3 Revision
1. Agency sees `changes_requested` with the reviewer's comment.
2. Member edits (caption, images, date) and saves → new version, status back to `pending`.
3. Reviewer sees the latest version on the same link. Agency sees the full version history.

## 5. Data model (logical)

All tables except the platform tables (`platform_admins`, `plans`, `plan_prices`, `admin_audit`) carry `agency_id`; RLS on all. Platform tables are readable by members only where needed (their own plan's name and limits) and writable only by platform admins.

| Table | Key columns |
|---|---|
| `agencies` | id, name, country, market (`egypt`/`gulf`), default_language (`ar`/`en`), timezone, created_at |
| `agency_plans` | agency_id, plan_code, billing_period, price_minor, currency, is_custom_price, starts_on, ends_on, admin_note, assigned_by, assigned_at (history kept; one current row) |
| `agency_members` | agency_id, user_id, role (`owner`/`member`), ui_language, email_notifications (bool), invited_by, joined_at, removed_at |
| `agency_invites` | agency_id, email, role, token_hash, expires_at, accepted_at |
| `clients` | agency_id, id, name, instagram_handle, whatsapp_phone (E.164 digits), brand_color, review_language (`ar`/`en`), logo_path, archived_at |
| `review_links` | agency_id, client_id, token_hash, token_encrypted, created_by, created_at, revoked_at |
| `deliverables` | agency_id, client_id, id, type (`instagram_post`), status, current_version_no, publish_date, publish_time, internal_note, first_sent_at, archived_at |
| `deliverable_versions` | agency_id, deliverable_id, version_no, caption, publish_date, publish_time, created_by, created_at, sent_at |
| `deliverable_assets` | agency_id, deliverable_id, version_no, position (1–10), storage_path, width, height |
| `decisions` | agency_id, deliverable_id, version_no, decision (`approved`/`changes_requested`), comment, reviewer_name, reviewer_device_id, created_at |
| `activity` | agency_id, client_id, deliverable_id (nullable), actor_type (`member`/`reviewer`/`system`), actor_label, event_type, payload (jsonb), created_at |
| `notifications` | agency_id, member_user_id, activity_id, read_at |
| `platform_admins` | user_id |
| `plans` | code, name_en, name_ar, client_limit, member_limit, can_hide_footer, visible, sort_order (platform table, no agency_id) |
| `plan_prices` | plan_code, market, billing_period, price_minor, currency, valid_from, valid_to, set_by (platform table; rows never updated except closing `valid_to`) |
| `payments` | agency_id, reference_no, amount_minor, currency, paid_on, method, external_reference, plan_code, billing_period, covers_from, covers_to, internal_note, recorded_by, voided_at, voided_by, void_reason (written only by platform admins; owners read their own non-voided rows) |
| `admin_audit` | admin_user_id, action, target, before (jsonb), after (jsonb), created_at (platform table) |

Notes:
- A draft deliverable has version 1 that is edited in place. From the first send onward, versions are immutable.
- `deliverables.publish_date` mirrors the current version's date for fast month filtering.
- "Month" is derived from `publish_date`. There is no separate plan entity in the MVP.

## 6. Status rules

| From | Action | To | Who |
|---|---|---|---|
| draft | Send for approval | pending | Member |
| pending | Approve | approved | Reviewer |
| pending | Request changes | changes_requested | Reviewer |
| pending / approved / changes_requested | Edit and save | pending (new version) | Member |
| any | Archive | (hidden, status kept) | Member |

A reviewer can only act on `pending` deliverables. Decisions are final for that version; to change their mind, the agency edits and re-sends.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Review page speed | Largest contentful paint < 2.5 s on a mid-range Android phone over 4G; first 3 images load eagerly, the rest lazily |
| Image handling | JPG, PNG, WebP; ≤ 10 MB each before processing; resized in the browser to max 2048 px on the long edge, JPEG/WebP quality 0.85, before upload |
| Languages | Every screen in Arabic (RTL) and English (LTR) |
| Devices | Agency app works from 390 px width up; review page is designed phone-first |
| Security | See CLAUDE.md rules 1–6 |
| Availability | Vercel + Supabase managed defaults; daily database backups (Supabase plan dependent, see launch checklist) |
| Privacy | Store only what the flows need: reviewer name and a random device id, no IP addresses |
| Accessibility | Keyboard reachable controls, visible focus, contrast ≥ 4.5:1 for text |

## 8. Analytics events (for the pilot)

Track with PostHog (or similar): `agency_signed_up`, `client_created`, `deliverable_created`, `plan_sent`, `review_link_opened`, `deliverable_approved`, `changes_requested`, `deliverable_resent`, `approve_all_used`. These feed the pilot success metrics in the business case.
