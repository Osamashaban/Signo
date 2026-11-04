# Tests

| Command | What it checks | Needs |
|---|---|---|
| `npm test` | Translations, routing, the migration plan rules and the pipeline's safety rules | Nothing |
| `npm run test:e2e` | Browser checks (desktop and phone) | `npm run build` first |

CI also runs the migration runner (`npm run db:migrate`) twice against a throwaway
Postgres 18, to prove it applies migrations and that a second run changes nothing.
Tests never touch the Neon `main` or `staging` branches.
