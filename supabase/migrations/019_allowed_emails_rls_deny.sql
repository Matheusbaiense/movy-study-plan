-- M14: Make the allowed_emails access restriction explicit.
-- RLS is already enabled; this deny-all policy documents the intent clearly
-- so a future dev doesn't accidentally add a permissive policy.
-- All allowed_emails mutations go through the service-role key (bypasses RLS).

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'allowed_emails'
      and policyname = 'no_direct_access'
  ) then
    create policy "no_direct_access" on public.allowed_emails
      as restrictive
      for all
      using (false);
  end if;
end $$;
