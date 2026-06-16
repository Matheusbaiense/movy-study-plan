-- Wrap auth.uid() in (SELECT auth.uid()) so PostgreSQL evaluates it once per
-- query as an InitPlan rather than once per row. current_org_id() is already
-- STABLE so no change needed for those calls.

-- checklist_progress ---------------------------------------------------------
DROP POLICY IF EXISTS "users read own checklist progress" ON public.checklist_progress;
DROP POLICY IF EXISTS "users upsert own checklist progress" ON public.checklist_progress;
DROP POLICY IF EXISTS "users update own checklist progress" ON public.checklist_progress;

CREATE POLICY "users read own checklist progress"
  ON public.checklist_progress FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users upsert own checklist progress"
  ON public.checklist_progress FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users update own checklist progress"
  ON public.checklist_progress FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- audit_logs -----------------------------------------------------------------
DROP POLICY IF EXISTS "active users insert own audit logs" ON public.audit_logs;

CREATE POLICY "active users insert own audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    public.is_active_user()
    AND actor_id = (SELECT auth.uid())
  );

-- profiles -------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles read own or admin" ON public.profiles;

CREATE POLICY "profiles read own or admin" ON public.profiles
  FOR SELECT USING (
    id = (SELECT auth.uid())
    OR (public.current_user_role() IN ('admin', 'super_admin') AND org_id = public.current_org_id())
  );
