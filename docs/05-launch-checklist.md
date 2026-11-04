# 05 — Launch Checklist

Things outside the code. "Pilot" items must be done before real agencies use it with real clients; "Paid" items before charging money.

## Accounts and setup
- [ ] Pilot — GitHub repository (private)
- [ ] Pilot — Supabase project in a region close to users (e.g. Frankfurt `eu-central-1` or another EU region); note the plan's backup policy
- [ ] Pilot — Vercel project linked to the repo
- [ ] Pilot — Resend account with a verified sending domain (SPF, DKIM)
- [ ] Pilot — Domain name bought and connected (app + review links)
- [ ] Pilot — PostHog (or similar) for the analytics events in the PRD
- [ ] Pilot — Error tracking (e.g. Sentry free plan)

## Legal and trust
- [ ] Pilot — Terms of use (agency is responsible for its content; platform does not access content except for support)
- [ ] Pilot — Privacy policy covering agencies, members and reviewers (what is stored: names, emails, phone numbers, images)
- [ ] Paid — Data processing terms for agencies (they upload their clients' data)
- [ ] Paid — Legal review against Saudi Arabia's Personal Data Protection Law (PDPL) and Egypt's Personal Data Protection Law, especially data hosting location and cross-border transfer
- [ ] Paid — Check the employment contract for side-project or non-compete clauses
- [ ] Paid — Domain and trademark check for the final product name

## Payments (decision deferred)
- [ ] Choose a payment gateway that accepts an Egypt-based seller, charges in EGP and USD, and pays out to an account Mostafa can open
- [ ] Until then: collect payment by hand (bank transfer, InstaPay, etc.) and assign plans from the admin dashboard (US-SGN-011)
- [ ] Refund and cancellation policy
- [ ] Invoices or receipts for agencies that need them

## Support and operations
- [ ] Pilot — Support channel (a WhatsApp Business number and an email address)
- [ ] Pilot — Short onboarding guide in Arabic and English (how to add a client, send a plan)
- [ ] Pilot — A one-page "how to review" note agencies can forward to their clients
- [ ] Pilot — Weekly feedback call slot with each pilot agency
- [ ] Paid — Storage cost monitoring (images now, video later)

## Pilot measurement
- [ ] Dashboard of the success metrics in `01-business-case.md` §9
- [ ] Interview script for week 4: what saved time, what was confusing, would you pay, how much
