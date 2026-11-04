# US-SGN-011 — Admin dashboard: plans, prices and agency plans

**Platform:** Admin area (`/admin`, platform admins only) + agency settings · **Depends on:** US-SGN-002, US-SGN-006

## User Story
As the platform owner, I want to control plans, prices and which plan each agency is on from my own dashboard, so that I can change pricing and give agencies plans without touching code, before a payment gateway exists.

## Business Rules

### Access
1. `/admin` and every admin action are available only to users in `platform_admins`, checked on the server on every request. Anyone else gets a 404 (the area's existence is not revealed).
2. The admin area uses the same login as the agency app. An admin can be a platform admin without belonging to any agency.
3. Every admin change (plan, price, agency assignment) writes a row to `admin_audit` (admin, action, before, after, time). The audit list is visible in the admin area.

### Plans
4. A plan has: code (fixed, e.g. `free`, `starter`, `growth`, `agency`), name in English and Arabic, client limit, member limit (empty = unlimited), "can hide Signo footer" flag, visible flag, sort order.
5. Seed data: the four plans and prices in `01-business-case.md` §7.
6. The admin can edit names, limits, flags and order, add a new plan, and hide a plan. A plan with agencies on it cannot be deleted, only hidden. Hidden plans can't be newly assigned; agencies already on them stay.
7. The `free` plan always exists and cannot be hidden.

### Prices
8. Each plan has prices per **market** and **billing period**: `egypt` in EGP and `gulf` in USD; `monthly` and `yearly`. Prices are stored as whole amounts in the currency's minor unit (piastres / cents) to avoid rounding errors.
9. A new agency's market comes from its sign-up country: Egypt → `egypt`; everything else → `gulf`. The admin can change an agency's market.
10. Changing a plan's price applies to agencies assigned to that plan **after** the change. Agencies already on the plan keep the price they were assigned (grandfathering). This also covers the early-adopter price lock.
11. Prices are never overwritten. Saving a new price closes the current price row (`valid_to` = now) and adds a new row (`valid_from` = now). Each plan has a price history view listing every price by market and period with its from/to dates and the admin who set it.
12. The admin can set a **custom price** for one agency (overrides the plan price) and a free-text note (e.g. "Founding agency, 2 months free, paid by InstaPay").

### Agency plans (manual, until a payment gateway exists)
13. Every agency has exactly one current plan. New agencies start on `free`. Agencies created before this ticket are moved to `free` by the migration.
14. Agencies list in the admin area: agency name, country, market, current plan, billing period, price they pay, active clients this month / limit, members / limit, plan start date, plan end date (optional), created date. Searchable by name; filter by plan and market.
15. The admin can assign a plan, billing period, start date and optional end date. When the end date passes, the agency moves back to `free` automatically (checked daily) and the owners get an email.
16. The admin never sees agency content from this screen: no clients' names, captions or images. Only counts.

### Limits in the agency app
17. **Active client** = a client with at least one deliverable sent (first send or re-send) in the current calendar month, in the agency timezone. Archived clients count only if they were active earlier that month.
18. Client limit: when the agency is at its limit, sending to a client that is not yet active this month is blocked with MSG-011-05. Sending to already-active clients, editing, and creating drafts keep working.
19. Member limit: inviting is blocked with MSG-011-06 when members + pending invites reach the limit. Existing members are never removed by a downgrade.
20. Downgrade over the limit (e.g. Growth → Starter with 9 active clients): nothing is removed; rule 18 applies from the next send to a new client.
21. Agency owners see a "Plan" section in agency settings: current plan name, billing period, active clients this month / limit, members / limit, and the message MSG-011-07 explaining how to upgrade. Members don't see prices. If the plan allows hiding the footer, owners also get a toggle "Show 'Sent with Signo' on review pages" (default on).
22. Owners also see their plan history: every plan they were on, billing period, price, start and end dates, newest first. Admin notes are never shown to the agency.

## Acceptance Criteria
**AC1 — Admin only**
Given I am logged in but not a platform admin
When I open `/admin` or call any admin endpoint
Then I get a 404 and nothing is changed

**AC2 — Change a price**
Given Growth costs $34/month in the Gulf and agency A is on Growth
When I change it to $39 and save
Then agencies assigned to Growth after the change pay $39
And agency A still shows $34
And the audit list shows the change with before and after values

**AC3 — Edit limits**
Given Starter allows 5 clients
When I change it to 6 and save
Then agencies on Starter can have 6 active clients from that moment

**AC4 — Assign a plan by hand**
Given agency B is on Free
When I assign Growth, yearly, starting today, ending in 12 months, with the note "Paid by bank transfer"
Then agency B's owners see Growth in their plan section
And agency B can have up to 15 active clients

**AC5 — Plan end date**
Given agency B's plan ends yesterday
When the daily check runs
Then agency B is on Free and its owners received MSG-011-08 by email

**AC6 — Client limit**
Given an agency on Free already sent to 2 different clients this month
When a member sends deliverables to a third client
Then the send is blocked with MSG-011-05
And sending more to the first two clients still works

**AC7 — Member limit**
Given an agency on Free has 2 members
When the owner invites a third
Then the invite is blocked with MSG-011-06

**AC8 — Custom price**
Given agency C is a founding agency
When I set a custom price of $0 for 2 months, then $34
Then the agencies list shows the custom price and my note

**AC9 — No content in admin**
Given I open any agency in the admin area
When the page loads
Then I see counts and plan data only, and no client names, captions or images

**AC10 — Seed data**
Given a fresh database
When migrations run
Then the four plans exist with the names, limits and prices in business case §7

**AC11 — Price history**
Given Growth (Gulf, monthly) was $34 and I changed it to $39 on 1 Dec and to $36 on 1 Feb
When I open Growth's price history
Then I see three rows: $34 until 1 Dec, $39 from 1 Dec to 1 Feb, $36 from 1 Feb, each with the admin who set it

**AC12 — Agency plan history**
Given agency B moved from Free to Starter, then to Growth
When an owner of agency B opens the plan section
Then they see all three plans with dates and prices, newest first, and no admin notes

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Plan name (EN / AR) | Text | Yes | 2–30 chars each | Name shown to agencies | الاسم اللي بيظهر للوكالات |
| Client limit | Number | Yes | ≥ 1 | Maximum active clients per month | أقصى عدد عملاء نشطين في الشهر |
| Member limit | Number | No | ≥ 1; empty = unlimited | Maximum agency team members | أقصى عدد أعضاء في فريق الوكالة |
| Can hide footer | Toggle | Yes | Default off | Lets the agency hide "Sent with Signo" on review pages | بيسمح للوكالة تخفي "Sent with Signo" من صفحة المراجعة |
| Visible | Toggle | Yes | Free is always visible | Whether the plan can be assigned to new agencies | هل الخطة متاحة للوكالات الجديدة |
| Price | Money | Yes | Per market × period; ≥ 0 | Price in EGP (Egypt) or USD (Gulf) | السعر بالجنيه (مصر) أو بالدولار (الخليج) |
| Market | Dropdown | Yes | Egypt / Gulf | Which price list the agency uses | قائمة الأسعار اللي الوكالة بتتعامل بيها |
| Billing period | Dropdown | Yes | Monthly / Yearly | How often the agency pays | الوكالة بتدفع كل قد إيه |
| Plan start / end date | Date | Start yes, end no | End ≥ start | When the plan applies; after the end date the agency returns to Free | مدة الخطة؛ بعد تاريخ النهاية الوكالة بترجع للخطة المجانية |
| Custom price | Money | No | ≥ 0 | Overrides the plan price for this agency only | سعر خاص للوكالة دي بس |
| Admin note | Text | No | Max 500 chars | Internal note, never shown to the agency | ملاحظة داخلية، مش بتظهر للوكالة |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-011-01 | Plan saved | Plan saved. | الخطة اتحفظت. |
| MSG-011-02 | Price change confirm | New price applies to agencies assigned after now. Agencies already on this plan keep their current price. | السعر الجديد هيتطبق على الوكالات اللي هتتحط على الخطة من دلوقتي. الوكالات الحالية هتفضل على سعرها. |
| MSG-011-03 | Plan in use | This plan has agencies on it, so it can be hidden but not deleted. | الخطة دي عليها وكالات، فتقدر تخفيها بس متقدرش تمسحها. |
| MSG-011-04 | Agency plan updated | {agency} is now on {plan}. | {agency} بقت على خطة {plan}. |
| MSG-011-05 | Client limit reached | Your {plan} plan includes {limit} active clients a month, and you've reached it. Contact us to upgrade and send to more clients. | خطة {plan} فيها {limit} عملاء نشطين في الشهر، ووصلت للحد ده. كلمنا علشان ترقّي الخطة وتبعت لعملاء أكتر. |
| MSG-011-06 | Member limit reached | Your {plan} plan includes {limit} team members. Contact us to upgrade. | خطة {plan} فيها {limit} أعضاء في الفريق. كلمنا علشان ترقّي الخطة. |
| MSG-011-07 | Plan section help | To change your plan, contact us on WhatsApp at {support_phone}. | علشان تغيّر خطتك، كلمنا على واتساب {support_phone}. |
| MSG-011-08 | Plan ended email | Your {plan} plan ended on {date}, and {agency} is now on the Free plan. Your data is safe. Contact us to renew. | خطة {plan} انتهت يوم {date}، و{agency} بقت على الخطة المجانية. بياناتك محفوظة. كلمنا علشان تجدد. |

## Out of scope
Online payments and a payment gateway, invoices, a public pricing page, coupons and promo codes, platform metrics and suspending agencies (admin dashboard part 2 in the roadmap).

## Open Questions
1. Support WhatsApp number for MSG-011-07 (set as an environment setting until decided).
