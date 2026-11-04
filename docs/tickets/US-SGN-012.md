# US-SGN-012 — Manual payments record

**Platform:** Admin area (`/admin`) + agency settings · **Depends on:** US-SGN-011

## User Story
As the platform owner, I want to record every payment an agency makes by transfer or wallet, so that I know who paid, for what period, and how much came in each month, before a payment gateway exists.

## Business Rules
1. Only platform admins can record or void payments.
2. A payment has: agency, amount, currency (EGP or USD), paid-on date, method, reference (optional), plan and billing period it pays for, period covered (from / to), and an internal note (optional). Amounts are stored in minor units (piastres / cents).
3. Methods: bank transfer, InstaPay, mobile wallet, cash, card (manual), other. Each payment gets a sequential reference number shown to the admin and the agency (e.g. `SGN-2026-0007`).
4. The currency defaults to the agency's market (EGP for Egypt, USD for the Gulf) and can be changed.
5. The amount defaults to the price the agency pays for the chosen plan and period (custom price if set, US-SGN-011). The admin can change it, e.g. for a partial or discounted payment.
6. "Apply to plan" (on by default): saving the payment also assigns that plan and billing period to the agency with the covered period as start and end dates, through the same assignment logic as US-SGN-011.
7. Payments are never edited or deleted. A wrong payment is **voided** with a required reason. Voided payments stay visible to the admin, are marked as voided, and are excluded from totals. Voiding does not change the agency's plan; the admin changes the plan separately if needed.
8. Recording and voiding write to `admin_audit`.
9. Admin agency page: that agency's payments, newest first, with totals per currency.
10. Admin payments page: all payments with filters (month, market, method, agency, include voided) and, for the selected month, totals collected per currency. EGP and USD are never added together or converted.
11. Admin overview cards: collected this month and last month per currency, and number of agencies with a paid plan today.
12. CSV export of the filtered payments list: reference, agency, paid-on date, amount, currency, method, reference text, plan, period, status, void reason.
13. Agency owners see their payment history in agency settings: reference number, paid-on date, amount, currency, method, plan and period covered. Voided payments and internal notes are not shown. Members don't see payments.
14. When a payment gateway is added later, its payments are written to the same table with method `gateway`, so history stays in one place.

## Acceptance Criteria
**AC1 — Record a payment**
Given agency B is on Free in the Egypt market
When I record a payment of EGP 899 by InstaPay on 4 Nov for Growth, monthly, covering 4 Nov to 3 Dec, with "Apply to plan" on
Then the payment appears in agency B's payments with reference SGN-2026-xxxx
And agency B is on Growth until 3 Dec
And the audit list shows the payment

**AC2 — Defaults**
Given agency C is in the Gulf market with a custom Growth price of $25
When I start recording a payment and pick Growth, monthly
Then the currency is USD and the amount is $25

**AC3 — Record without changing the plan**
Given agency D already has Growth until 31 Dec
When I record a payment with "Apply to plan" off
Then the payment is saved and agency D's plan does not change

**AC4 — Validation**
Given I am recording a payment
When the amount is empty or zero, the paid-on date is missing, or the period "to" is before "from"
Then I see MSG-012-02, -03 or -04 and nothing is saved

**AC5 — Void**
Given a payment of $34 was recorded by mistake
When I void it with the reason "Duplicate entry"
Then it shows as voided with the reason, my name and the time
And it no longer counts in any total
And the agency owner no longer sees it

**AC6 — Monthly totals**
Given November has payments of EGP 899, EGP 349 and $34, plus one voided $34
When I filter the payments page to November
Then the totals show EGP 1,248 and $34

**AC7 — Owner view**
Given agency B has two payments and one voided payment
When an owner of agency B opens payment history
Then they see the two payments with reference, date, amount, method and period, and no notes
And a member of agency B does not see the payment history

**AC8 — Export**
Given I filtered payments to November
When I export to CSV
Then the file contains exactly the filtered rows with the columns in BR12, readable in Excel with Arabic agency names intact

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Agency | Search select | Yes | Active agencies | Agency that paid | الوكالة اللي دفعت |
| Amount | Money | Yes | > 0; BR5 default | Amount received | المبلغ اللي اتحصّل |
| Currency | Dropdown | Yes | EGP / USD; BR4 default | Currency of the payment | عملة الدفع |
| Paid on | Date | Yes | Not in the future | Date the money was received | تاريخ استلام الفلوس |
| Method | Dropdown | Yes | BR3 list | How the agency paid | طريقة الدفع |
| Reference | Text | No | Max 100 chars | Transfer or wallet reference number | الرقم المرجعي للتحويل أو المحفظة |
| Plan and period | Dropdowns | Yes | Visible plans; monthly / yearly | What the payment is for | الدفعة دي مقابل أنهي خطة ومدة |
| Covers from / to | Dates | Yes | To ≥ from; default from = paid on, to = +1 month or +1 year − 1 day | Subscription period this payment pays for | فترة الاشتراك اللي الدفعة بتغطيها |
| Apply to plan | Toggle | Yes | Default on | Also put the agency on this plan for this period | كمان حط الوكالة على الخطة دي للفترة دي |
| Internal note | Text | No | Max 500 chars; never shown to the agency | Note for your records | ملاحظة لسجلاتك |
| Void reason | Text | Yes (when voiding) | 3–200 chars | Why this payment is cancelled | سبب إلغاء الدفعة |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-012-01 | Payment saved | Payment {ref} recorded for {agency}. | الدفعة {ref} اتسجلت لـ {agency}. |
| MSG-012-02 | Invalid amount | Enter an amount greater than zero. | اكتب مبلغ أكبر من صفر. |
| MSG-012-03 | Missing date | Enter the date the payment was received. | اكتب تاريخ استلام الدفعة. |
| MSG-012-04 | Bad period | The period end must be on or after its start. | نهاية الفترة لازم تكون في نفس يوم البداية أو بعده. |
| MSG-012-05 | Void confirm | Void payment {ref}? It will stay in the records but won't count in totals. This doesn't change the agency's plan. | إلغاء الدفعة {ref}؟ هتفضل في السجل بس مش هتتحسب في الإجماليات. ده مش هيغيّر خطة الوكالة. |
| MSG-012-06 | Voided label | Voided by {admin} on {date}: {reason} | اتلغت بواسطة {admin} يوم {date}: {reason} |
| MSG-012-07 | Owner empty state | No payments yet. | مفيش مدفوعات لسه. |
| MSG-012-08 | Plan applied | {agency} is now on {plan} until {date}. | {agency} بقت على خطة {plan} لحد {date}. |

## Out of scope
Payment gateway, invoices and tax invoices, receipts by email, refunds (record a void plus a note), currency conversion, automatic payment reminders.

## Open Questions
1. Do agencies need a downloadable receipt or invoice for their records? Some Gulf companies need a tax invoice; this affects the gateway choice later.
