# US-SGN-001 — Agency sign-up, login and workspace

**Platform:** Agency web app · **Depends on:** — · **Prototype:** not shown (standard auth screens)

## User Story
As a person running or working at an agency, I want to create an account and an agency workspace, so that my team's clients and content are kept in one private place.

## Business Rules
1. Sign-up creates a user, a new agency, and an `agency_members` row with role `owner`, in one transaction.
2. Email must be verified before the user can create clients or deliverables. Unverified users see the verification screen after login.
3. A user belongs to one agency in the MVP. A user who already belongs to an agency cannot create a second one.
4. Password: minimum 8 characters, at least one letter and one number.
5. Login supports email + password and email magic link.
6. Password reset sends a link valid for 60 minutes.
7. After 5 failed login attempts in 15 minutes for the same email, login is blocked for 15 minutes.
8. The agency's default language is chosen at sign-up (Arabic or English). Each member can switch their own UI language at any time; the choice is saved to their profile and applies on every device.
9. The agency timezone defaults from the sign-up country: Egypt → Africa/Cairo, Saudi Arabia → Asia/Riyadh, UAE → Asia/Dubai, other → Africa/Cairo.
10. Logout ends the session on the current device only.
11. Create the `platform_admins` table (CLAUDE.md rule 6, no UI) and the `activity` table (PRD §5, append-only) in this ticket, so later tickets can write events from day one. The events and how they display are defined in US-SGN-009.

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

## Field Descriptions
| Field | Type | Required | Rules | Description (EN) | الوصف (AR) |
|---|---|---|---|---|---|
| Full name | Text | Yes | 2–80 chars | Your name as teammates and notifications will show it | اسمك زي ما هيظهر لزمايلك وفي التنبيهات |
| Email | Email | Yes | Valid email, unique | Used to log in and receive notifications | بيُستخدم لتسجيل الدخول واستلام التنبيهات |
| Password | Password | Yes | BR4 | At least 8 characters with a letter and a number | 8 حروف على الأقل، فيها حرف ورقم |
| Agency name | Text | Yes | 2–80 chars | The name your team and clients will see | الاسم اللي فريقك وعملاءك هيشوفوه |
| Country | Dropdown | Yes | Egypt, Saudi Arabia, UAE, Other | Sets the default timezone | بيحدد المنطقة الزمنية الافتراضية |
| Language | Toggle | Yes | Arabic / English | Default language for the agency and your account | اللغة الافتراضية للوكالة ولحسابك |

## System Messages
| Code | Trigger | English | Arabic |
|---|---|---|---|
| MSG-001-01 | Sign-up submitted | We sent a verification link to {email}. Open it to activate your account. | بعتنالك لينك تفعيل على {email}. افتحه علشان تفعّل حسابك. |
| MSG-001-02 | Email exists | An account with this email already exists. Log in instead. | فيه حساب بالإيميل ده بالفعل. سجّل دخول بدل كده. |
| MSG-001-03 | Weak password | Use at least 8 characters, including a letter and a number. | استخدم 8 حروف على الأقل، فيهم حرف ورقم. |
| MSG-001-04 | Wrong credentials | The email or password is incorrect. | الإيميل أو الباسورد غلط. |
| MSG-001-05 | Lockout | Too many attempts. Try again in 15 minutes or reset your password. | محاولات كتير. جرّب تاني بعد 15 دقيقة أو غيّر الباسورد. |
| MSG-001-06 | Magic link sent | Check your email for a login link. It works for 60 minutes. | شوف إيميلك، بعتنالك لينك دخول شغال لمدة 60 دقيقة. |
| MSG-001-07 | Reset link sent | If this email has an account, we sent a reset link. | لو الإيميل ده عليه حساب، بعتنالك لينك لتغيير الباسورد. |
| MSG-001-08 | Expired link | This link has expired. Request a new one. | اللينك ده انتهى. اطلب لينك جديد. |
| MSG-001-09 | Password changed | Your password was changed. Log in with the new one. | الباسورد اتغير. سجّل دخول بالجديد. |

## Out of scope
Social login (Google), two-factor authentication, multiple agencies per user, account deletion UI.

## Open Questions
None.
