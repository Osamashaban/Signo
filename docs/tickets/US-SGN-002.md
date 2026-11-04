# US-SGN-002 — Team members, roles and agency settings

**Platform:** Agency web app · **Depends on:** US-SGN-001

## User Story
As an agency owner, I want to invite my team and control who manages the team, so that everyone works on clients in the same workspace.

## Business Rules
1. Only owners can invite, remove members, change roles, and edit agency settings (name, default language, timezone).
2. An invite is sent by email with a role (`owner` or `member`) and is valid for 7 days.
3. Inviting an email that is already a member of this agency is blocked. Inviting an email that belongs to another agency is blocked (one agency per user in the MVP).
4. An owner can resend or cancel a pending invite. Resending creates a new link and invalidates the old one.
5. Accepting an invite: an existing user logs in; a new user sets name and password. The invite email counts as verified.
6. An agency must always have at least one owner. The last owner cannot be removed or demoted.
7. A removed member loses access immediately, including open sessions. Their past actions stay in the activity log with their name.
8. Members (non-owners) can see the team list but cannot change it.
9. Write activity events `member_joined`, `member_removed`, `member_role_changed` (old and new role) and `agency_settings_updated` (changed fields, old and new values) (US-SGN-009).
10. Plan limits on the number of members are enforced by US-SGN-011.

## Acceptance Criteria
**AC1 — Invite a member**
Given I am an owner
When I enter an email, pick a role and send the invite
Then the person receives an invite email in the agency's default language
And the invite appears in the team list as "Invited" with its expiry date

**AC2 — Accept invite as a new user**
Given I received a valid invite and have no account
When I open the link and set my name and password
Then I join the agency with the invited role and land on the clients list

**AC3 — Expired or cancelled invite**
Given an invite expired or was cancelled
When the invited person opens the link
Then they see MSG-002-04

**AC4 — Duplicate or other-agency email**
Given the email is already in this agency or in another agency
When I send the invite
Then I see MSG-002-02 or MSG-002-03 and no invite is created

**AC5 — Change role**
Given I am an owner and there are at least two owners or the target is a member
When I change a member's role
Then the new role applies on their next request

**AC6 — Protect the last owner**
Given I am the only owner
When I try to remove myself or change my role to member
Then I see MSG-002-05 and nothing changes

**AC7 — Remove a member**
Given I am an owner
When I remove a member and confirm
Then they can no longer open any page of the agency
And their earlier activity entries still show their name

**AC8 — Members cannot manage the team**
Given I am a member
When I open the team page
Then I see the list of members without invite, remove or role controls
And direct API calls to those actions are rejected

**AC9 — Agency settings**
Given I am an owner
When I change the agency name, default language or timezone and save
Then the change applies to all members and new emails

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Invite email | Email | Yes | Valid email; BR3 | Email of the person you want to add | إيميل الشخص اللي عايز تضيفه |
| Role | Dropdown | Yes | Owner / Member; default Member | Owners also manage the team and agency settings | الـ Owner كمان بيدير الفريق وإعدادات الوكالة |
| Timezone | Dropdown | Yes | IANA list; top: Africa/Cairo, Asia/Riyadh, Asia/Dubai | Used for publish times and email timestamps | بتُستخدم لمواعيد النشر وأوقات الإيميلات |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-002-01 | Invite sent | Invite sent to {email}. It expires in 7 days. | اتبعتت دعوة لـ {email}. صالحة لمدة 7 أيام. |
| MSG-002-02 | Already a member | {email} is already on your team. | {email} موجود في فريقك بالفعل. |
| MSG-002-03 | In another agency | This email already belongs to another agency workspace. | الإيميل ده تابع لوكالة تانية بالفعل. |
| MSG-002-04 | Invalid invite | This invite is no longer valid. Ask the agency to send a new one. | الدعوة دي مبقتش صالحة. اطلب من الوكالة تبعت دعوة جديدة. |
| MSG-002-05 | Last owner | An agency needs at least one owner. Make someone else an owner first. | الوكالة لازم يكون فيها Owner واحد على الأقل. خلّي حد تاني Owner الأول. |
| MSG-002-06 | Member removed | {name} was removed from the team. | {name} اتشال من الفريق. |
| MSG-002-07 | Settings saved | Agency settings saved. | إعدادات الوكالة اتحفظت. |

## Out of scope
Custom roles, per-client access restrictions, transferring a member to another agency.

## Open Questions
None.
