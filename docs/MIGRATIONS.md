# Database Migrations

Migrations live in `supabase/migrations/` and are numbered sequentially (`001_`, `002_`, …).

## Applying migrations

### Local (Supabase CLI)

```bash
supabase db push            # apply all pending migrations to local dev DB
supabase db reset           # reset local DB and replay all migrations from scratch
```

### Production (Supabase Dashboard or MCP)

1. Open the Supabase Dashboard → **SQL Editor**.
2. Paste the migration file contents and run.
3. Or use the Supabase MCP tool `apply_migration`.

## Writing a new migration

1. Create `supabase/migrations/NNN_<description>.sql` (increment `NNN`).
2. Make the script **idempotent**: use `IF NOT EXISTS`, `DO $$ … $$`, or `CREATE OR REPLACE`.
3. Never drop columns or tables in the same migration that adds new ones — split into separate migrations.
4. Every table that stores multi-tenant data must have `org_id` and a corresponding RLS policy.
5. Test locally with `supabase db reset` before merging.

## RLS conventions

- Every table has RLS enabled.
- Standard row-level policies filter by `auth.uid()` via the `profiles` table join or directly.
- The `allowed_emails` table has a restrictive `no_direct_access` policy — access is only via the service client.
- The service client (bypasses RLS) must only be used for legitimate admin operations inside server actions.
