# 06 — Design Brief (for Claude Design)

## Product feel
A calm, trustworthy work tool. The agency side is dense and scannable (status at a glance). The review side is a phone-first feed that feels like scrolling Instagram, with two clear buttons under each post. The "approval stamp" is the product's one visual idea: a check inside a circle, used for the logo and approved states.

## Direction
- Palette: deep teal as the accent (trust, approval), warm-neutral surfaces with a slight green tint, semantic status colors kept separate from the accent: amber = awaiting approval, green = approved, terracotta = needs changes, grey = draft.
- Type: one Arabic-first family that also has good Latin glyphs (e.g. IBM Plex Sans Arabic for UI, Readex Pro for headings). Arabic must look native, not like a translated layout.
- Every screen designed in both RTL (Arabic) and LTR (English).
- Light and dark themes.
- Reference: `prototype/signo-prototype.html` shows the current structure and content. Improve visual quality; keep the flows.

## Screens
### Agency (logged in)
1. Sign up / log in / reset password
2. Clients list with status counts per client, and "New client"
3. New / edit client form
4. Client plan: month switcher, status summary, deliverables grid, side panel (editor, send panel, or activity)
5. New / edit deliverable: images (drag to reorder), caption with counter, publish date and optional time
6. Send for approval panel: review link, Copy, Send on WhatsApp, Revoke and regenerate
7. Version history of a deliverable
8. Notifications dropdown
9. Team: members list, invite, roles (owner only)
10. Agency settings: name, default language, timezone

### Reviewer (no login, phone first)
11. Enter your name
12. Month review feed: header with client logo and month, progress bar, Instagram post cards with Approve / Request changes, "Approve all remaining"
13. Request changes: comment box
14. All done state
15. Link revoked / invalid link state

## States to design
Empty (no clients, no deliverables), loading, error, offline on the review page, upload in progress, image failed to upload.
