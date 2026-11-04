# US-SGN-005 — Instagram preview

**Platform:** Shared component (agency editor + review page) · **Depends on:** US-SGN-004 · **Prototype:** client view post cards

## User Story
As an agency member and as a reviewer, I want to see each post the way it will look on Instagram, so that approval is based on the real result, not on loose images.

## Business Rules
1. One shared preview component is used in the agency editor (live, while typing) and on the review page. No second implementation.
2. The preview shows: client avatar (logo or initials on brand color), Instagram handle, the image or carousel, Instagram's action icons (not interactive), and the caption under the handle.
3. Aspect ratio: the first image's ratio, clamped between 4:5 (portrait) and 1.91:1 (landscape). Images outside that range are center-cropped. All carousel images use the first image's ratio.
4. Carousels: swipe on touch devices, arrow buttons on desktop, dot indicator, and "n/total" counter. Swiping must hold 60 fps on a mid-range Android phone.
5. Caption shows the first 2 lines with a "more" control that expands the full text, as Instagram does. Line breaks are kept.
6. Caption direction follows its content (`dir="auto"`): an Arabic caption reads right-to-left even when the UI is in English, and the reverse. Mixed text keeps the handle left-to-right.
7. Hashtags and @mentions in the caption are styled like Instagram links (not clickable).
8. Images use signed URLs; the next carousel image preloads when the current one is shown.

## Acceptance Criteria
**AC1 — Single image**
Given a deliverable with one 1080×1350 image
When the preview renders
Then it shows a 4:5 image with the client handle above and the caption below

**AC2 — Ratio clamping**
Given the first image is 1080×1920 (9:16)
When the preview renders
Then it displays at 4:5 with the image center-cropped

**AC3 — Carousel**
Given a carousel of 5 images
When I swipe or press the next arrow
Then the next image slides in, the dot and counter update
And the image after it is already loaded

**AC4 — Arabic caption in an English UI**
Given the UI is in English and the caption is Arabic
When the preview renders
Then the caption is right-aligned and reads right-to-left
And the handle stays left-to-right

**AC5 — Long caption**
Given a caption of 12 lines
When the preview renders
Then the first 2 lines show with "more"
And tapping "more" shows the full caption with its line breaks

**AC6 — Live update in the editor**
Given I am editing a draft
When I type in the caption or reorder images
Then the preview updates within 200 ms

**AC7 — Design compliance**
Given the approved designs for the preview
When the component renders in Arabic, English, light and dark
Then it matches the designs

## Field Descriptions
No new fields.

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-005-01 | Caption collapsed | more | المزيد |
| MSG-005-02 | Image failed to load | This image couldn't load. | الصورة دي محمّلتش. |

## Out of scope
Feed grid preview (3×3 profile view), Stories preview, other platforms, likes and comments.

## Open Questions
None.
