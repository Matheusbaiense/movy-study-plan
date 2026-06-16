-- supabase/migrations/015_hr_unique_employee_profile.sql
-- ============================================================================
-- 015 — Add unique constraint on employee_profiles(org_id, profile_id)
--       Required for upsert ON CONFLICT to work correctly.
--       Also relaxes INSERT RLS so employees can create their own profile
--       (admin creates profiles for employees via org settings; this allows
--        self-service for admin/super_admin users whose profile is missing).
-- ============================================================================

-- Unique constraint so upsert ON CONFLICT (org_id, profile_id) resolves
alter table public.employee_profiles
  drop constraint if exists employee_profiles_org_profile_unique;

alter table public.employee_profiles
  add constraint employee_profiles_org_profile_unique
  unique (org_id, profile_id);

-- Allow a user to insert their own employee_profile (self-service for admins)
drop policy if exists "employee_profiles: self insert" on public.employee_profiles;
create policy "employee_profiles: self insert"
  on public.employee_profiles for insert
  with check (
    org_id = current_org_id()
    and is_active_user()
    and profile_id = auth.uid()
    and current_user_role() in ('admin', 'super_admin')
  );
