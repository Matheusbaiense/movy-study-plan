# Deployment

The app is deployed to **Vercel**. The `main` branch is production; `develop` is the staging preview.

## Required environment variables

See `.env.example` for the full list. The following must be set in Vercel project settings:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (secret) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project settings → Client Keys |
| `WISE_API_KEY` | Wise Dashboard → Settings → API tokens |
| `WISE_PROFILE_ID` | Wise Dashboard → Settings → Business profile |

## Deploy process

1. Push to `main` — Vercel triggers a production deployment automatically.
2. The CI workflow (`.github/workflows/ci.yml`) runs type-check, lint, build, and unit tests on every push and PR.
3. Check the Vercel deployment logs if the build fails.

## Database

Apply any new migrations **before** deploying the app version that depends on them (schema-first deployment). Use the Supabase Dashboard SQL Editor or the MCP `apply_migration` tool.

## Rollback

- **App**: promote a previous Vercel deployment via the Vercel dashboard.
- **Database**: migrations are additive by convention — there are no automated down-migrations. Roll back by deploying the previous app version; schema stays as-is unless a manual SQL rollback is needed.

## Health check

`GET /api/health` returns `{"status":"ok","ts":"<ISO timestamp>"}` and can be used as a Vercel or uptime-monitor liveness probe.
