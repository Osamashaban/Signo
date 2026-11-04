# US-SGN-008 — Revision cycle and versions

**Platform:** Agency web app (+ effect on review page) · **Depends on:** US-SGN-007 · **Prototype:** editing a post with client feedback

## User Story
As an agency member, I want to fix a post the client commented on and send it back, so that the client approves the corrected version and we keep a record of every version.

## Business Rules
1. A sent deliverable (`pending`, `approved`, `changes_requested`) can be edited: caption, images, publish date, publish time. Internal note edits do not create a version.
2. Saving a change to a sent deliverable creates a new immutable version (`version_no + 1`) and sets the status to `pending`. The new version gets `sent_at` immediately; no separate send step is needed.
3. Editing an `approved` deliverable shows a confirmation that the approval will be reset (decisions log A9).
4. Saving without any change to caption, images, date or time does not create a version.
5. When editing a `changes_requested` deliverable, the editor shows the reviewer's latest comment, name and time.
6. Version history is visible to members: version number, who saved it, when, its caption and images, and the decision on it (if any) with reviewer name and comment.
7. The review page always shows the latest version. Reviewers do not see older versions.
8. Publish date of a sent deliverable can be changed to any date from today onward; it then moves to that month in both views.
9. Saving a new version writes an activity entry `deliverable_resent` with the version number.

## Acceptance Criteria
**AC1 — Fix a post with changes requested**
Given a post has "Needs changes" with the client's comment
When I open it
Then I see the comment, the reviewer's name and time
And when I change the caption and save, the post becomes "Awaiting approval" as version 2

**AC2 — Client sees the new version**
Given I saved version 2
When the client opens the review page
Then they see version 2 with Approve and Request changes available

**AC3 — Editing an approved post**
Given a post is Approved
When I change an image and save
Then I first see MSG-008-02
And after I confirm, it becomes version 2 and "Awaiting approval"
And if I cancel, nothing changes

**AC4 — No real change**
Given a post is sent
When I open it and save without changing caption, images, date or time
Then no new version is created and the status stays the same

**AC5 — Version history**
Given a post has 3 versions
When I open its history
Then I see all 3 with who saved them, when, and the client decision on each

**AC6 — Moving month**
Given a November post is pending
When I change its date to 3 December and save
Then it moves to December on the agency plan and on the review page

## Field Descriptions
No new fields.

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-008-01 | Resent | Saved as version {n} and sent back for approval. | اتحفظت كنسخة {n} واتبعتت تاني للموافقة. |
| MSG-008-02 | Approved edit confirm | This post is already approved. Saving changes will send it back to the client for approval. | البوست ده متوافق عليه بالفعل. لو حفظت التعديل، هيرجع للعميل يوافق عليه تاني. |
| MSG-008-03 | Client feedback label | {name} asked for changes · {time} | {name} طلب تعديل · {time} |
| MSG-008-04 | No changes | No changes to save. | مفيش تعديلات تتحفظ. |

## Out of scope
Comparing two versions side by side, restoring an old version, showing old versions to reviewers.

## Open Questions
None.
