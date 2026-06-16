# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- `lib/actions/auth.ts` — shared `getActorSession()` / `svc()` helpers; eliminates boilerplate across all server-action files
- `app/api/health/route.ts` — liveness endpoint (`GET /api/health`)
- `public/robots.txt` — blocks crawlers from API and protected routes
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — Sentry error monitoring (disabled in dev)
- `lib/supabase/json.ts` — `toJson()` helper to avoid noisy double-cast pattern
- Zod input validation on all server actions (portfolio, hr, study-plans)
- `supabase/migrations/019_allowed_emails_rls_deny.sql` — restrictive RLS policy on `allowed_emails`
- `CHANGELOG.md`, `CONTRIBUTING.md`, `docs/MIGRATIONS.md`, `docs/DEPLOYMENT.md`
- `.nvmrc` pinned to Node 24.11.0

### Changed
- Content-Security-Policy promoted from `Report-Only` to enforcing (`next.config.mjs`)
- `next.config.mjs` — Supabase origin derived from `NEXT_PUBLIC_SUPABASE_URL` env var (no hardcoded project ID)
- `next.config.mjs` — wrapped with `withSentryConfig`
- `StudyPlanEditor` wizard step persisted to URL search param (`?step=`)
- `StudyPlanEditor` timeline ticks memoized with `useMemo`
- `InstitutionDetail` — `router.refresh()` called after mutations so list reflects changes without full reload
- Presets page — deprecation banner pointing editors to `/portfolio`
- Tests renamed from `*.test.mjs` → `*.test.mts`; `"test"` npm script added

### Fixed
- Table header `key={index}` anti-pattern in `HrDashboard` replaced with stable keys
