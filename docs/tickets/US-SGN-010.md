# US-SGN-010 — Agency notifications

**Platform:** Agency web app + email · **Depends on:** US-SGN-007 · **Prototype:** bell in the top bar

## User Story
As an agency member, I want to be told when a client approves or asks for changes, so that I can act without checking every client all day.

## Business Rules
1. Notifications are created for reviewer actions only: `deliverable_approved`, `changes_requested`, `approve_all`. Member actions do not notify.
2. Every active member of the agency gets an in-app notification for each of these events (decisions log A10).
3. The bell shows the unread count (shows "9+" above 9). Opening the list shows the latest 20, newest first; each opens the related deliverable and marks itself read. "Mark all as read" is available.
4. Email: every active member gets one email per reviewer action. "Approve all" sends one email covering all posts in that action.
5. Emails use the member's UI language, the agency name as sender name, and include the client name, the action, the first caption line, the reviewer's comment (for changes), and a button to open the deliverable (login required).
6. Emails are sent within 2 minutes of the action. Failed sends retry up to 3 times.
7. Each email has a link to turn off email notifications for that member. In-app notifications stay on. The setting is also available in the member's profile.
8. Removed members get no notifications.

## Acceptance Criteria
**AC1 — In-app notification**
Given I am a member and a client approves a post
When I look at the bell within 30 seconds
Then the unread count has increased by 1
And opening the notification takes me to that post and marks it read

**AC2 — Email for changes requested**
Given my UI language is Arabic
When a client asks for changes on a post
Then within 2 minutes I receive an Arabic email with the client name, the post's first line, the reviewer's comment and an "Open post" button

**AC3 — Approve all sends one email**
Given a reviewer approves 6 posts with "Approve all remaining"
When the emails are sent
Then I receive one email that says 6 posts were approved

**AC4 — Turn off email**
Given I turned off email notifications
When a client acts on a post
Then I get the in-app notification but no email

**AC5 — Mark all read**
Given I have 12 unread notifications
When I press "Mark all as read"
Then the bell shows no count

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Email notifications | Toggle | Yes | Default on | Get an email when a client approves or asks for changes | يوصلك إيميل لما عميل يوافق أو يطلب تعديل |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-010-01 | Email subject: approved | {client} approved "{post}" | {client} وافق على «{post}» |
| MSG-010-02 | Email subject: changes | {client} asked for changes on "{post}" | {client} طلب تعديل على «{post}» |
| MSG-010-03 | Email subject: approve all | {client} approved {n} posts | {client} وافق على {n} بوست |
| MSG-010-04 | Email body: changes | {reviewer} from {client} wrote: "{comment}" | {reviewer} من {client} كتب: «{comment}» |
| MSG-010-05 | Email button | Open post | افتح البوست |
| MSG-010-06 | Email footer | You get these emails because you're on the {agency} team. Turn off email notifications. | الإيميلات دي بتوصلك لأنك في فريق {agency}. إيقاف تنبيهات الإيميل. |
| MSG-010-07 | Bell empty | You're all caught up. | مفيش تنبيهات جديدة. |
| MSG-010-08 | Mark all read | Mark all as read | تعليم الكل كمقروء |

## Out of scope
WhatsApp or push notifications, per-client notification settings, daily digest emails, reminders to clients.

## Open Questions
None.
