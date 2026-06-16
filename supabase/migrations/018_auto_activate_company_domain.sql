-- supabase/migrations/018_auto_activate_company_domain.sql
-- ============================================================================
-- 018 — Auto-activate users with the company email domain (@movyeducation.com).
--       Previously all users entered with is_active = false and required manual
--       admin activation. Now:
--         - @movyeducation.com.au → is_active = true immediately on first login
--         - Gmail / external in allowed_emails → is_active = true (admin whitelist)
--         - Gmail / external not in allowed_emails → is_active = false (future clients)
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed        public.allowed_emails%rowtype;
  movy  constant uuid := '11111111-1111-4111-8111-111111111111';
  is_company     boolean;
begin
  select * into allowed
  from public.allowed_emails
  where lower(email) = lower(new.email)
  limit 1;

  -- Company domain: auto-activate without requiring an allowed_emails entry.
  -- Use LIKE instead of regex for maximum Postgres compatibility.
  is_company := lower(new.email) like '%@movyeducation.com.au';

  insert into public.profiles (id, email, full_name, avatar_url, role, is_active, org_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(allowed.role, 'reader'::public.app_role),
    allowed.email is not null or is_company,
    coalesce(allowed.org_id, movy)
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;
