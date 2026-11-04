# US-SGN-003 — Client management

**Platform:** Agency web app · **Depends on:** US-SGN-001 · **Prototype:** "Clients" screen and "New client" form

## User Story
As an agency member, I want to add and manage the brands I work for, so that I can prepare and send each brand's content separately.

## Business Rules
1. Any member can add, edit or archive a client.
2. Client name must be unique within the agency among active (non-archived) clients, case-insensitive.
3. WhatsApp number is stored as digits only with country code (E.164 without "+"), 8–15 digits. The form accepts spaces, dashes and a leading "+" or "00" and normalizes them.
4. Instagram handle is stored without "@", lowercase, matching Instagram's allowed characters (letters, digits, "." and "_"), max 30 characters.
5. Review language decides the language the review page opens in and the prefilled WhatsApp message (US-SGN-006). Default: the agency's default language.
6. Logo is optional: JPG, PNG or WebP, ≤ 2 MB, shown as a circle. Without a logo, show initials on the brand color.
7. Archiving hides the client from the clients list. Data is kept. Archived clients appear under an "Archived" filter and can be restored. (What happens to the client's review link is defined in US-SGN-006.)
8. The clients list is sorted by most recent activity first, with a search by name.
9. Write activity event `client_created` (US-SGN-009).
10. Every saved edit writes `client_updated` with the changed fields and their old and new values (logo changes record "logo changed" only). Archive and restore write `client_archived` and `client_restored`.

## Acceptance Criteria
**AC1 — Add a client**
Given I am a member
When I fill the required fields and save
Then the client appears at the top of the clients list
And its plan page opens with an empty state inviting me to add the first deliverable

**AC2 — Validation**
Given I am on the new client form
When I leave the name empty, use a duplicate name, or enter an invalid WhatsApp number
Then I see the matching message (MSG-003-02, -03, -04) next to the field
And the client is not saved
And the values I entered stay in the form

**AC3 — Number normalization**
Given I enter "+20 100-123-4567"
When I save
Then the stored number is "201001234567"

**AC4 — Edit a client**
Given a client exists
When I change any field and save
Then the change shows everywhere the client appears, including the review page

**AC5 — Archive and restore**
Given a client is active
When I archive the client and confirm
Then the client leaves the active list and appears under "Archived"
And when I restore it, it returns to the active list with its deliverables

**AC6 — Search**
Given I have 20 clients
When I type part of a client's name
Then the list filters as I type (≤ 300 ms after I stop typing)

**AC7 — Edit history**
Given a client's WhatsApp number is 201001234567
When a member changes it to 201112223334 and saves
Then the client's activity shows who changed the WhatsApp number, from what to what, and when

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Client name | Text | Yes | 2–80 chars; BR2 | Brand name as it appears to your team and on the review page | اسم البراند زي ما هيظهر لفريقك وفي صفحة المراجعة |
| Instagram handle | Text | Yes | BR4 | Shown at the top of each post preview | بيظهر فوق كل بوست في المعاينة |
| WhatsApp number | Phone | Yes | BR3 | The number that receives the review link | الرقم اللي هيوصله لينك المراجعة |
| Review language | Toggle | Yes | Arabic / English; BR5 | Language the client sees on the review page | اللغة اللي العميل هيشوف بيها صفحة المراجعة |
| Brand color | Color picker | Yes | 8 presets + custom hex; default first preset | Used for the avatar and placeholders | بيُستخدم في الصورة الرمزية والخلفيات |
| Logo | Image | No | BR6 | Shown as the profile picture in previews | بيظهر كصورة البروفايل في المعاينة |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-003-01 | Client saved | Client added. | اتضاف العميل. |
| MSG-003-02 | Missing name | Enter the client name. | اكتب اسم العميل. |
| MSG-003-03 | Duplicate name | You already have a client with this name. | عندك عميل بنفس الاسم ده. |
| MSG-003-04 | Invalid number | Enter a WhatsApp number with country code, e.g. 201001234567. | اكتب رقم واتساب بكود الدولة، مثلاً 201001234567. |
| MSG-003-05 | Invalid handle | Use letters, numbers, dots and underscores only (max 30). | استخدم حروف وأرقام ونقط و _ بس (30 حرف بالكتير). |
| MSG-003-06 | Archive confirm | Archive {client}? Their review link will stop working. You can restore the client later. | أرشفة {client}؟ لينك المراجعة بتاعه هيوقف. تقدر ترجّع العميل بعدين. |
| MSG-003-07 | Logo too large | The logo must be JPG, PNG or WebP and under 2 MB. | اللوجو لازم يكون JPG أو PNG أو WebP وأقل من 2 ميجا. |

## Out of scope
Client contacts list, multiple WhatsApp numbers, client-level permissions, importing clients.

## Open Questions
None.
