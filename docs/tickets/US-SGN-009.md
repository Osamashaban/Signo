# US-SGN-009 — Status overview and activity log

**Platform:** Agency web app · **Depends on:** US-SGN-007 · **Prototype:** clients list counts, plan status bar, activity panel

## User Story
As an account manager, I want to see at a glance where every client's content stands and what happened recently, so that I know who to follow up with.

## Business Rules
1. Clients list: each client card shows counts for the current month by status (Approved, Awaiting approval, Needs changes, Draft), hiding zero counts. A client with any "Needs changes" shows that count first.
2. Client plan page: a status summary for the selected month with all four counts, including zeros.
3. Pending age: a deliverable `pending` for more than 48 hours since its last `sent_at` shows "Waiting {n} days" on its card.
4. Activity log per client: newest first, 30 entries per page with "Load more". Agency-wide activity on the clients list: latest 10 across all clients.
5. Activity events and their text:
   - `client_created`, `deliverable_created`, `plan_sent` (count), `deliverable_resent` (version), `deliverable_approved` (reviewer), `changes_requested` (reviewer), `approve_all` (reviewer, count), `deliverable_archived`, `link_created`, `link_revoked`, `member_joined`, `member_removed`, `client_updated` (changed fields, old and new values), `client_archived`, `client_restored`, `member_role_changed` (old and new role), `agency_settings_updated` (changed fields, old and new values).
   - Entries that carry old and new values show a "Details" control that expands them, e.g. "WhatsApp number: 201001234567 → 201112223334". Team and agency-settings events appear in the agency-wide activity only, not in a client's activity.
6. "Approve all" writes one `approve_all` activity entry (plus one decision per deliverable), not one entry per post.
7. Each event is written by the ticket that owns the action (002, 003, 004, 006, 007, 008). This ticket owns how events are counted and shown; if an earlier ticket missed writing an event, add it here.
8. Each entry shows actor name, action, the deliverable's first caption line (max 40 characters) when relevant, and time in the viewer's language and the agency timezone.
9. Tapping an entry about a deliverable opens that deliverable.
10. Counts and activity reflect new reviewer actions within 30 seconds without a manual refresh.

## Acceptance Criteria
**AC1 — Clients list counts**
Given a client has 3 approved, 2 awaiting approval and 1 needing changes this month
When I open the clients list
Then its card shows "1 Needs changes", "3 Approved", "2 Awaiting approval" and no Draft count

**AC2 — Plan summary**
Given I open a client's plan for November
When the page loads
Then the summary shows all four status counts for November, including zeros

**AC3 — Waiting badge**
Given a post was sent 3 days ago and is still pending
When I view the plan
Then its card shows "Waiting 3 days"

**AC4 — Activity entry for a decision**
Given a reviewer named Sara requested changes on a post
When I open the client's activity
Then I see "Sara asked for changes on '{caption start}'" with the time
And tapping it opens that post

**AC5 — Approve all is one entry**
Given a reviewer approved 5 posts with "Approve all remaining"
When I open the activity
Then I see one entry "Sara approved 5 posts"

**AC6 — Live update**
Given I have the plan page open
When the client approves a post
Then the post status and the counts update within 30 seconds without reloading

**AC7 — Pagination**
Given a client has 75 activity entries
When I scroll to the end and press "Load more" twice
Then all 75 are shown, newest first, with no duplicates

**AC8 — Change details**
Given a member changed a client's WhatsApp number and review language in one save
When I open the client's activity
Then I see one entry "{member} updated the client's WhatsApp number and review language"
And "Details" shows both fields with old and new values

## Field Descriptions
No new fields.

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-009-01 | plan_sent | {actor} sent {n} posts for approval | {actor} بعت {n} بوست للموافقة |
| MSG-009-02 | deliverable_resent | {actor} updated "{post}" (version {v}) and sent it back | {actor} عدّل «{post}» (نسخة {v}) وبعته تاني |
| MSG-009-03 | deliverable_approved | {actor} approved "{post}" | {actor} وافق على «{post}» |
| MSG-009-04 | changes_requested | {actor} asked for changes on "{post}" | {actor} طلب تعديل على «{post}» |
| MSG-009-05 | approve_all | {actor} approved {n} posts | {actor} وافق على {n} بوست |
| MSG-009-06 | deliverable_created | {actor} added "{post}" | {actor} ضاف «{post}» |
| MSG-009-07 | deliverable_archived | {actor} archived "{post}" | {actor} أرشف «{post}» |
| MSG-009-08 | client_created | {actor} added the client | {actor} ضاف العميل |
| MSG-009-09 | link_created | {actor} created a new review link | {actor} عمل لينك مراجعة جديد |
| MSG-009-10 | link_revoked | {actor} revoked the review link | {actor} لغى لينك المراجعة |
| MSG-009-11 | member_joined | {actor} joined the team | {actor} انضم للفريق |
| MSG-009-12 | member_removed | {actor} removed {member} from the team | {actor} شال {member} من الفريق |
| MSG-009-13 | Waiting badge | Waiting {n} days | مستني من {n} أيام |
| MSG-009-14 | Empty activity | No activity yet. | مفيش نشاط لسه. |
| MSG-009-15 | client_updated | {actor} updated the client's {fields} | {actor} عدّل {fields} بتاعة العميل |
| MSG-009-16 | client_archived | {actor} archived the client | {actor} أرشف العميل |
| MSG-009-17 | client_restored | {actor} restored the client | {actor} رجّع العميل من الأرشيف |
| MSG-009-18 | member_role_changed | {actor} changed {member}'s role from {old} to {new} | {actor} غيّر دور {member} من {old} لـ {new} |
| MSG-009-19 | agency_settings_updated | {actor} updated the agency's {fields} | {actor} عدّل {fields} بتاعة الوكالة |
| MSG-009-20 | Details toggle | Details | التفاصيل |
| MSG-009-21 | Change line | {field}: {old} → {new} | {field}: {old} ← {new} |

## Out of scope
Charts, approval-time statistics, client health scores, exporting the activity log (all phase 3).

## Open Questions
None.
