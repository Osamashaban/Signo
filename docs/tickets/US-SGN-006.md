# US-SGN-006 — Send for approval and review link

**Platform:** Agency web app · **Depends on:** US-SGN-004 · **Prototype:** "Send for approval" panel

## User Story
As an agency member, I want to send the month's drafts to the client with one link I can share on WhatsApp, so that the client can review everything in one place.

## Business Rules
1. "Send for approval" acts on all `draft` deliverables of the client in the selected month. Each becomes `pending`; its current version gets `sent_at`; the deliverable gets `first_sent_at`.
2. Before sending, show a confirmation with the number of drafts that will be sent.
3. If the month has no drafts, the button still opens the share panel (to re-share the link) and the confirmation is skipped.
4. Each client has at most one active review link. It is created automatically on the first send, or when a member generates one.
5. Token rules: CLAUDE.md rule 3. The link must be visible to members again at any time in the share panel, so the token is stored twice: a SHA-256 hash for lookup, and an encrypted copy (AES-256-GCM, server-side key) for display to members. Only server code can decrypt it.
6. The share panel shows: the link, a Copy button, a "Send on WhatsApp" button, and the client's WhatsApp number.
7. "Send on WhatsApp" opens `https://wa.me/{whatsapp_phone}?text={message}` in a new tab. The message uses the client's review language (MSG-006-05).
8. "Revoke link" invalidates the current link immediately. "Generate new link" creates a new one and revokes the old one. Both require confirmation.
9. Sending writes one activity entry `plan_sent` with the count. Generating and revoking links write `link_created` and `link_revoked`.
10. Sending does not message the client by itself; the member shares the link. (Automatic WhatsApp messages are in phase 2.)
11. Archiving a client (US-SGN-003) revokes its active link. Restoring the client does not bring the old link back; a new one is created on the next send or by "Generate new link".
12. Plan limits on sending to new clients are enforced by US-SGN-011.

## Acceptance Criteria
**AC1 — Send drafts**
Given a client has 6 drafts in November
When I press "Send for approval" and confirm
Then all 6 become "Awaiting approval"
And the share panel opens with the review link
And the activity log shows "{member} sent 6 posts for approval"

**AC2 — Nothing to send**
Given a client has no drafts in the selected month but has an active link
When I press "Send for approval"
Then the share panel opens without a confirmation and no status changes

**AC3 — Copy link**
Given the share panel is open
When I press Copy
Then the link is copied and I see MSG-006-02
And if the browser blocks clipboard access, the link text is selected so I can copy it myself

**AC4 — WhatsApp**
Given the client's review language is Arabic
When I press "Send on WhatsApp"
Then WhatsApp opens a chat with the client's number and the Arabic message with the link already filled in

**AC5 — Revoke and regenerate**
Given a client has an active link
When I generate a new link and confirm
Then the old link shows the "link not valid" page
And the new link opens the review page

**AC6 — Archived client**
Given a client is archived
When anyone opens its old link
Then they see the "link not valid" page

## Field Descriptions
No new fields.

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-006-01 | Send confirm | Send {n} posts to {client} for approval? | إرسال {n} بوست لـ {client} للموافقة؟ |
| MSG-006-02 | Copied | Link copied. | اتنسخ اللينك. |
| MSG-006-03 | Revoke confirm | Revoke this link? The client won't be able to open it anymore. | إلغاء اللينك ده؟ العميل مش هيقدر يفتحه تاني. |
| MSG-006-04 | Regenerate confirm | Create a new link? The current link will stop working. | عمل لينك جديد؟ اللينك الحالي هيوقف. |
| MSG-006-05 | WhatsApp text | Hi {client} team, your {month} content plan from {agency} is ready for review: {link} | أهلاً فريق {client}، خطة محتوى {month} من {agency} جاهزة للمراجعة: {link} |
| MSG-006-06 | Sent toast | Sent {n} posts for approval. | اتبعت {n} بوست للموافقة. |

## Out of scope
WhatsApp Business API sending, automatic reminders, per-deliverable links, link expiry dates, password-protected links.

## Open Questions
None.
