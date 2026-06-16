-- supabase/migrations/017_hr_employee_self_insert_team_roles.sql
-- ============================================================================
-- 017 — Restrict employee_profiles self-insert to internal team roles only.
--       app_role enum: reader, editor, admin, super_admin.
--       Future client role must NOT be included here.
-- ============================================================================

drop policy if exists "employee_profiles: self insert" on public.employee_profiles;
create policy "employee_profiles: self insert"
  on public.employee_profiles for insert
  with check (
    org_id     = current_org_id()
    and is_active_user()
    and profile_id = auth.uid()
    and current_user_role() in ('reader', 'editor', 'admin', 'super_admin')
  );
