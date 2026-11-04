# US-SGN-007 — Client review page

**Platform:** Review page (public, no login, phone first) · **Depends on:** US-SGN-005, US-SGN-006 · **Prototype:** "Client view"

## User Story
As a client reviewing my agency's content, I want to open one link on my phone and approve or comment on each post, so that I can sign off the month quickly without creating an account.

## Business Rules
1. The page is reached only through a valid review link. Invalid, revoked or archived-client links show the "link not valid" page, which reveals nothing about the agency or client.
2. On first visit on a device, the reviewer enters their name (2–60 characters). The name and a random device id are stored on that device and reused on later visits. A "Not you?" action lets them change the name.
3. The page opens in the client's review language. The reviewer can switch between Arabic and English; the choice is remembered on that device.
4. The page shows deliverables with status `pending`, `approved` or `changes_requested` for one month at a time, sorted like the agency grid. Drafts and archived deliverables never appear.
5. Month switcher shows only months that have at least one visible deliverable. Default: the earliest month with a `pending` deliverable; otherwise the latest month.
6. Each deliverable shows its **latest version only**, using the shared preview (US-SGN-005), plus the publish date.
7. Header shows client name and logo, agency name, month, and progress: "{approved} of {total} approved".
8. On a `pending` deliverable the reviewer can **Approve** or **Request changes**. Request changes needs a comment of at least 3 characters (max 1,000).
9. "Approve all remaining" approves every `pending` deliverable in the selected month after a confirmation showing the count.
10. Each decision creates a `decisions` row (deliverable, version number, decision, comment, reviewer name, device id, time). Activity: one `deliverable_approved` or `changes_requested` entry per single action; one `approve_all` entry for "Approve all remaining" (US-SGN-009 BR6). Decisions are final for that version (decisions log A7).
11. `approved` deliverables show "Approved by {name} · {date}". `changes_requested` deliverables show the comment and "The agency is updating this post".
12. When every deliverable in the month is approved, show the "all done" state.
13. If two reviewers act on the same deliverable at nearly the same time, the first decision wins; the second sees MSG-007-07 and the page refreshes that card.
14. Actions are server-validated: the token must be valid and the deliverable must be `pending` and belong to that client.
15. Rate limit: 60 actions per minute per link.
16. Footer: "Sent with Signo" linking to the product site (decisions log A15), unless the agency's plan allows hiding it and an owner turned it off (US-SGN-011).

## Acceptance Criteria
**AC1 — First visit**
Given I open a valid review link on my phone for the first time
When the page loads
Then I am asked for my name before seeing any posts
And after I enter it, I see the month's posts

**AC2 — Speed**
Given a month with 15 posts
When I open the link on a mid-range Android phone over 4G
Then the first post is visible in under 2.5 seconds

**AC3 — Approve**
Given a post is awaiting approval
When I press Approve
Then it shows "Approved by {my name}" and the progress updates
And the agency sees the post as Approved

**AC4 — Request changes**
Given a post is awaiting approval
When I press Request changes, write a comment and send it
Then the post shows my comment and "The agency is updating this post"
And sending with an empty or 1–2 character comment shows MSG-007-03 and sends nothing

**AC5 — Approve all**
Given 4 posts are awaiting approval in this month
When I press "Approve all remaining" and confirm
Then all 4 are approved with my name

**AC6 — Return visit**
Given I reviewed some posts yesterday on this phone
When I open the link again
Then I am not asked for my name
And I see the current status of every post

**AC7 — Invalid link**
Given a link was revoked or never existed
When I open it
Then I see MSG-007-06 and nothing about the client or agency

**AC8 — Drafts hidden**
Given the agency has drafts that were not sent
When I open the review page
Then those drafts do not appear and are not returned by the page's API

**AC9 — Language**
Given the client's review language is English
When I switch to Arabic
Then the page shows in Arabic, right-to-left, and stays in Arabic on my next visit

**AC10 — Design compliance**
Given the approved designs for the review page
When it renders at 390 px in Arabic and English, light and dark
Then it matches the designs

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Your name | Text | Yes | 2–60 chars | Saved with each approval so the agency has a record | بيتسجل مع كل موافقة علشان الوكالة يبقى عندها سجل |
| Comment | Text area | Yes (for changes) | 3–1,000 chars | What should change in this post | إيه اللي محتاج يتغير في البوست ده |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-007-01 | Name screen | Before you start, enter your name. It's saved with each approval. | قبل ما تبدأ، اكتب اسمك. بيتسجل مع كل موافقة. |
| MSG-007-02 | Name missing | Enter your name to continue. | اكتب اسمك علشان تكمل. |
| MSG-007-03 | Comment missing | Write what needs to change (at least 3 characters). | اكتب إيه اللي محتاج يتغير (3 حروف على الأقل). |
| MSG-007-04 | Approve all confirm | Approve all {n} remaining posts? | موافقة على الـ {n} بوست الباقيين؟ |
| MSG-007-05 | All done | All posts for {month} are approved. Thank you! | كل بوستات {month} اتوافق عليها. شكراً! |
| MSG-007-06 | Invalid link | This link isn't valid anymore. Ask your agency for a new one. | اللينك ده مبقاش صالح. اطلب لينك جديد من الوكالة. |
| MSG-007-07 | Already decided | Someone already responded to this post. Here's the latest status. | حد رد على البوست ده بالفعل. ده آخر وضع ليه. |
| MSG-007-08 | Waiting on agency | The agency is updating this post. | الوكالة بتعدل البوست ده. |
| MSG-007-09 | Approved by | Approved by {name} · {date} | وافق عليه {name} · {date} |
| MSG-007-10 | Progress | {approved} of {total} approved | {approved} من {total} اتوافق عليهم |
| MSG-007-11 | Action failed | That didn't go through. Check your connection and try again. | العملية متمتش. اتأكد من النت وجرّب تاني. |
| MSG-007-12 | Not you | Not {name}? Change name | مش {name}؟ غيّر الاسم |

## Out of scope
Voice-note comments, comments on a specific carousel slide or image area, reviewer accounts, multiple approval steps, downloading images.

## Open Questions
None.
