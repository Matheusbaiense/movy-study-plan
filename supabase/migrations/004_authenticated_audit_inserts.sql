-- Allow active authenticated users to write their own audit events.
-- Reads remain admin-only via the existing select policy.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'active users insert own audit logs'
  ) then
    create policy "active users insert own audit logs" on public.audit_logs
      for insert
      with check (
        public.is_active_user()
        and actor_id = auth.uid()
      );
  end if;
end $$;
