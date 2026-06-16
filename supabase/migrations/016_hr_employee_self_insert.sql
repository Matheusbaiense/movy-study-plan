-- supabase/migrations/016_hr_employee_self_insert.sql
-- ============================================================================
-- 016 — Allow any org member to create their own employee_profile
--       Everyone in the system is an employee; no admin approval needed.
-- ============================================================================

drop policy if exists "employee_profiles: self insert" on public.employee_profiles;
create policy "employee_profiles: self insert"
  on public.employee_profiles for insert
  with check (
    org_id    = current_org_id()
    and is_active_user()
    and profile_id = auth.uid()
  );
