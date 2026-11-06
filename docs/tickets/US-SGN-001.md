# US-SGN-001 — Agency sign-up, login and workspace

**Version:** 1.3 (6 Nov 2026; screens and copy from the Claude Design page "US-SGN-001 Agency sign-up, login and workspace (v1.3) · READY FOR DEV"; decisions D41–D46)

**Platform:** Agency web app · **Depends on:** — · **Design:** Claude Design canvas "Signo UI/UX project", 20 screens

## User Story
As a person running or working at an agency, I want to create an account and an agency workspace, so that my team's clients and content are kept in one private place.

## Business Rules
1. Sign-up creates a user, a new agency, and an `agency_members` row with role `owner`, in one transaction.
2. Email must be verified before the user can create clients or deliverables. Unverified users see the verification screen after login. The verification link is valid for 24 hours; an expired link shows MSG-001-08 with "Resend email" (D44).
3. A user belongs to one agency in the MVP. A user who already belongs to an agency cannot create a second one.
4. Password: minimum 8 characters, at least one letter and one number.
5. Login supports email + password and email magic link.
6. Password reset sends a link valid for 60 minutes.
7. After 5 failed login attempts in 15 minutes for the same email, login is blocked for 15 minutes. The block covers password login and login links; password reset stays available and clears the block (D43).
8. The agency's default language is chosen at sign-up (Arabic or English); the Language toggle starts on the page's language. Each member can switch their own UI language at any time; the choice is saved to their profile and applies on every device.
9. The agency timezone defaults from the sign-up country: Egypt → Africa/Cairo, Saudi Arabia → Asia/Riyadh, UAE → Asia/Dubai, other → Africa/Cairo.
10. Logout ends the session on the current device only.
11. Create the `platform_admins` table (CLAUDE.md rule 6, no UI) and the `activity` table (PRD §5, append-only) in this ticket, so later tickets can write events from day one. The events and how they display are defined in US-SGN-009.
12. Field errors show under the field with a red border, all at once when several fields fail: MSG-001-10 (empty), MSG-001-11 (invalid email), MSG-001-12 (name length), MSG-001-03 (password) (D41).
13. "Resend email" has a 60-second cooldown and at most 5 emails an hour per account. A new link replaces the old one. After a resend, MSG-001-13 shows and the button counts down with MSG-001-14; at the limit, MSG-001-15 shows and the button stays disabled (D42).
14. Expired login and reset links show MSG-001-08 with "Request a new link" (D44).
15. Screen titles and button labels are the ones on the Claude Design page (D45).
16. After login, members land on a temporary clients page: logo, agency name, language switch and Log out, with MSG-001-16 in the centre. US-SGN-003 replaces it (D46).
17. All Arabic copy is simple Modern Standard Arabic, not dialect (canvas D27).

## Acceptance Criteria
**AC1 — Successful sign-up**
Given I am on the sign-up page
When I enter my full name, email, password, agency name, country and language, and submit
Then my account, the agency and my owner membership are created
And I receive a verification email in my chosen language
And I see the "Check your email" screen

**AC2 — Email already registered**
Given an account exists with the email I enter
When I submit the sign-up form
Then I see message MSG-001-02
And no new account or agency is created

**AC3 — Weak password**
Given I am on the sign-up page
When I enter a password that breaks BR4
Then I see message MSG-001-03 under the password field
And the form is not submitted

**AC4 — Unverified login**
Given I signed up but did not verify my email
When I log in
Then I see the verification screen with a "Resend email" action
And I cannot open the clients list

**AC5 — Login with password**
Given my email is verified
When I enter the right email and password
Then I land on the clients list of my agency

**AC6 — Wrong credentials and lockout**
Given my email is verified
When I enter a wrong password
Then I see MSG-001-04
And after the 5th wrong attempt within 15 minutes I see MSG-001-05 and cannot log in for 15 minutes

**AC7 — Magic link**
Given my email is verified
When I request a magic link and open it within 60 minutes
Then I am logged in and land on the clients list

**AC8 — Password reset**
Given I forgot my password
When I request a reset, open the link within 60 minutes and set a new valid password
Then I can log in with the new password
And the old password no longer works

**AC9 — Language switch**
Given I am logged in with the UI in Arabic
When I switch the language to English
Then every screen shows in English with left-to-right layout
And the choice is still applied after I log out and log in on another device

**AC10 — Data isolation**
Given two agencies A and B exist
When a member of A requests any data of B (through the app or the API)
Then no data of B is returned

**AC11 — Field errors**
Given I am on the sign-up page
When I submit with empty fields, an invalid email or a name shorter than 2 characters
Then each failing field shows its message (MSG-001-10, MSG-001-11, MSG-001-12) under it, all at once

**AC12 — Resend limits**
Given I am on "Check your email"
When I press "Resend email"
Then I see MSG-001-13 and the button counts down MSG-001-14 for 60 seconds
And after 5 emails in an hour I see MSG-001-15 and the button stays disabled

**AC13 — Expired links**
Given a verification link older than 24 hours, or a login or reset link older than 60 minutes
When I open it
Then I see MSG-001-08 with a way to get a new link

**AC14 — Workspace ready**
Given I logged in with a verified email
When I land in the app
Then I see my agency name, the language switch, Log out and MSG-001-16

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Full name | Text | Yes | 2–80 chars | Your name as teammates and notifications will show it | الاسم الذي سيظهر لزملائك وفي الإشعارات |
| Email | Email | Yes | Valid email, unique | Used to log in and receive notifications | يُستخدم لتسجيل الدخول واستلام الإشعارات |
| Password | Password | Yes | BR4 | At least 8 characters with a letter and a number | 8 أحرف على الأقل، تتضمن حرفًا ورقمًا |
| Agency name | Text | Yes | 2–80 chars | The name your team and clients will see | الاسم الذي سيراه فريقك وعملاؤك |
| Country | Dropdown | Yes | Egypt, Saudi Arabia, UAE, Other | Sets the timezone and price list | تحدد المنطقة الزمنية وقائمة الأسعار |
| Language | Toggle | Yes | Arabic / English | Default language for the agency and your account | اللغة الافتراضية للوكالة ولحسابك |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-001-01 | Sign-up submitted | We sent a verification link to {email}. Open it to activate your account. | أرسلنا رابط التفعيل إلى {email}. افتحه لتفعيل حسابك. |
| MSG-001-02 | Email exists | An account with this email already exists. Log in instead. | يوجد حساب مسجّل بهذا البريد الإلكتروني. سجّل الدخول بدلًا من ذلك. |
| MSG-001-03 | Weak password | Use at least 8 characters, including a letter and a number. | استخدم 8 أحرف على الأقل، تتضمن حرفًا ورقمًا. |
| MSG-001-04 | Wrong credentials | The email or password is incorrect. | البريد الإلكتروني أو كلمة المرور غير صحيحة. |
| MSG-001-05 | Lockout | Too many attempts. Try again in 15 minutes or reset your password. | محاولات كثيرة. حاول مجددًا بعد 15 دقيقة أو أعد تعيين كلمة المرور. |
| MSG-001-06 | Magic link sent | Check your email for a login link. It works for 60 minutes. | تحقق من بريدك الإلكتروني، أرسلنا رابط دخول صالحًا لمدة 60 دقيقة. |
| MSG-001-07 | Reset link sent | If this email has an account, we sent a reset link. | إذا كان هذا البريد مسجّلًا لدينا، فقد أرسلنا رابط إعادة تعيين كلمة المرور. |
| MSG-001-08 | Expired link | This link has expired. Request a new one. | انتهت صلاحية هذا الرابط. اطلب رابطًا جديدًا. |
| MSG-001-09 | Password changed | Your password was changed. Log in with the new one. | تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة. |
| MSG-001-10 | Required field empty | This field is required. | هذا الحقل مطلوب. |
| MSG-001-11 | Invalid email | Enter a valid email, e.g. name@agency.com | أدخل بريدًا إلكترونيًا صحيحًا، مثل name@agency.com |
| MSG-001-12 | Name length | Use 2 to 80 characters. | استخدم من 2 إلى 80 حرفًا. |
| MSG-001-13 | Verification email resent | We sent a new link to {email}. | أرسلنا رابطًا جديدًا إلى {email}. |
| MSG-001-14 | Resend cooldown | Resend in {seconds}s | إعادة الإرسال بعد {seconds} ثانية |
| MSG-001-15 | Resend limit reached | You've asked for too many emails. Try again in an hour. | طلبت عددًا كبيرًا من الرسائل. حاول مجددًا بعد ساعة. |
| MSG-001-16 | Temporary clients page | Your workspace is ready. | مساحة العمل جاهزة. |

## Out of scope
Social login (Google), two-factor authentication, multiple agencies per user, account deletion UI.

## Not drawn on the canvas
The verification, login-link and reset emails have no design page. They are built as plain emails in the member's language using the same copy, until a design exists.

## Open Questions
None.
