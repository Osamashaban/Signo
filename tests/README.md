# Tests

| Command | What it checks | Needs |
|---|---|---|
| `npm test` | Translations, routing, the migration plan rules, the pipeline's safety rules, sign-up and log-in rules, webhook signatures | Nothing |
| `npm test` with `TEST_DATABASE_URL` set | Also data isolation (RLS): a member of agency A cannot read agency B | A throwaway Postgres with the migrations applied |
| `npm run test:e2e` | Browser checks (desktop and phone), including every US-SGN-001 acceptance criterion in Arabic and English | `npm run build` first, and a local Postgres with the migrations applied (`E2E_DATABASE_URL`, default `postgres:postgres@localhost:5432/signo`) |

CI also runs the migration runner (`npm run db:migrate`) twice against a throwaway
Postgres 18, to prove it applies migrations and that a second run changes nothing.
Tests never touch the Neon `main` or `staging` branches.

The browser checks never call the real Neon Auth or Resend: `tests/e2e/support/mock-services.mjs`
stands in for both (same HTTP shapes, signed webhooks) and keeps every "sent" email in memory.
