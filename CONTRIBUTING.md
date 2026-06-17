# Contributing

## Prerequisites

- Node 24.x (see `.nvmrc`) — use `nvm use` or `fnm use`
- A Supabase project with the schema from `supabase/migrations/`
- `.env.local` populated from `.env.example`

## Local setup

This project uses **Yarn (classic v1)** — same as woofed-crm, for forward
compatibility. Do not use npm/pnpm (no `package-lock.json`/`pnpm-lock.yaml`).

```bash
yarn install
cp .env.example .env.local   # fill in the values
yarn dev
```

## Development workflow

1. **Branch** off `develop` for features, off `main` for hotfixes.
2. **Write tests first** — see `tests/` for the `node:test` pattern.
3. **Run checks** before pushing:
   ```bash
   yarn test          # unit tests
   yarn type-check
   yarn lint
   ```
4. **Migrations** — add a new numbered SQL file under `supabase/migrations/`. See `docs/MIGRATIONS.md`.
5. **Open a PR** against `develop`. CI must be green.

## Conventions

- Money is always stored and computed in integer cents (`*_in_cents` columns).
- Server actions live in `app/[locale]/(protected)/<module>/actions.ts` and call `getActorSession()` from `lib/actions/auth.ts`.
- Supabase RLS is authoritative; the service client (`createServiceClient`) must only be used for legitimate admin operations.
- All user-facing strings are in the `messages/` locale files — no hardcoded UI text.
- No `console.log` in production code; use the structured logger or Sentry.
