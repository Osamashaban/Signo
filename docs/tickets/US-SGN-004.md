# US-SGN-004 — Create and edit deliverables (draft)

**Platform:** Agency web app · **Depends on:** US-SGN-003 · **Prototype:** client plan page, "New post" panel

## User Story
As an agency member, I want to add a client's Instagram posts for the month with images, caption and publish date, so that the plan is ready to send for approval.

## Business Rules
1. The client plan page shows deliverables of one month at a time. Month switcher: previous / next month; opens on the current month in the agency timezone.
2. A deliverable of type `instagram_post` has: 1–10 images, a caption, a publish date, and an optional publish time.
3. One image = single post; 2–10 images = carousel. Images can be reordered and removed before saving.
4. Accepted images: JPG, PNG, WebP, ≤ 10 MB each. Images are resized in the browser to max 2048 px on the long edge before upload (PRD §7). Original files are not kept.
5. Caption: required, max 2,200 characters, max 30 hashtags. A live counter shows characters and hashtags used.
6. Publish date must be today or later in the agency timezone when the deliverable is created. Editing a draft to a past date is blocked.
7. New deliverables are saved with status `draft` and version 1. While a deliverable is a draft, saving edits it in place (no new version).
8. Editing a deliverable that has already been sent is handled by US-SGN-008. In this ticket, only drafts are editable.
9. Deliverables in the grid are sorted by publish date, then publish time, then creation time.
10. Archive removes a deliverable from the plan (any status). Archived deliverables are hidden from the agency grid and the review page.
11. A live preview (US-SGN-005) is shown next to the form while creating or editing. Until US-SGN-005 is built, show the images and caption plainly.
12. Write activity events `deliverable_created` and `deliverable_archived` (US-SGN-009).

## Acceptance Criteria
**AC1 — Create a single-image post**
Given I am on a client's plan page
When I add one image, a caption and a publish date and save
Then the deliverable appears in the grid on its date with status "Draft"

**AC2 — Create a carousel**
Given I am creating a deliverable
When I add 4 images and drag the third to the first position
Then the preview and the saved deliverable use the new order
And the grid card shows "1/4"

**AC3 — Image limits**
Given I am adding images
When I add an 11th image, a file over 10 MB, or a file that is not JPG/PNG/WebP
Then that file is rejected with MSG-004-02 or MSG-004-03
And the other images stay

**AC4 — Upload speed and progress**
Given I add 5 images of about 5 MB each on a normal broadband connection
When the upload runs
Then each image shows its own progress
And all five finish in under 20 seconds

**AC5 — Caption limits**
Given I am typing a caption
When I pass 2,200 characters or 30 hashtags
Then the counter turns to the error state, MSG-004-04 shows, and Save is disabled

**AC6 — Required fields**
Given I try to save without images, caption or date
When I press Save
Then the missing fields show MSG-004-05, -06 or -07
And nothing I entered is lost

**AC7 — Edit a draft**
Given a deliverable is a draft
When I change its caption and save
Then the change is saved on version 1 and the status stays "Draft"

**AC8 — Month switching**
Given a client has deliverables in November and December
When I switch to December
Then only December deliverables show, sorted by BR9

**AC9 — Archive**
Given a deliverable exists
When I archive it and confirm
Then it disappears from the plan and from the review page

**AC10 — Empty month**
Given a client has no deliverables in the selected month
When I open that month
Then I see an empty state with an "Add post" action

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Images | File upload, multiple | Yes | BR3, BR4 | 1 image for a post, 2–10 for a carousel. Drag to reorder. | صورة واحدة لبوست عادي، ومن 2 لـ 10 لكاروسيل. اسحب علشان ترتب. |
| Caption | Text area | Yes | BR5 | The text that will be published with the post | النص اللي هيتنشر مع البوست |
| Publish date | Date | Yes | BR6 | The day the post is planned to go live | اليوم المخطط ينزل فيه البوست |
| Publish time | Time | No | Agency timezone | Optional time of day | وقت النشر (اختياري) |
| Internal note | Text | No | Max 500 chars; never shown to the client | A note for your team only | ملاحظة لفريقك بس، العميل مش بيشوفها |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-004-01 | Saved | Post saved as draft. | البوست اتحفظ كمسودة. |
| MSG-004-02 | Too many images | A post can have up to 10 images. | البوست يقدر يكون فيه 10 صور بالكتير. |
| MSG-004-03 | Bad file | {file} can't be used. Use JPG, PNG or WebP under 10 MB. | مينفعش نستخدم {file}. استخدم JPG أو PNG أو WebP أقل من 10 ميجا. |
| MSG-004-04 | Caption limit | Instagram allows up to 2,200 characters and 30 hashtags. | انستجرام بيسمح بـ 2,200 حرف و30 هاشتاج بالكتير. |
| MSG-004-05 | No images | Add at least one image. | ضيف صورة واحدة على الأقل. |
| MSG-004-06 | No caption | Write the caption. | اكتب الكابشن. |
| MSG-004-07 | No/past date | Pick a publish date from today onward. | اختار تاريخ نشر من النهارده ورايح. |
| MSG-004-08 | Upload failed | {file} didn't upload. Check your connection and try again. | {file} مترفعش. اتأكد من النت وجرّب تاني. |
| MSG-004-09 | Archive confirm | Archive this post? It will be removed from the plan and the client's review page. | أرشفة البوست ده؟ هيتشال من الخطة ومن صفحة مراجعة العميل. |

## Out of scope
Video, Reels, Stories, other platforms, bulk upload of a whole month, duplicating a post, AI caption help.

## Open Questions
None.
