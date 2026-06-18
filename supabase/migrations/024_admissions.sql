-- 024_admissions.sql — Admissions sector: per-school enrolment instructions.
--
-- Anchored to the existing portfolio `institutions` (one admissions record per
-- school). Document checklists and contacts live as typed JSONB arrays on the
-- main row; portal credentials live in a SEPARATE table so the secret stays out
-- of the bulk list/detail projections and gets its own access boundary.
--
-- RLS mirrors `institutions` (migration 011): read = any active org user;
-- write = editor+; delete = admin+. Credentials read/write = editor+ (the
-- admissions team uses the `editor` role and needs portal access daily); the
-- password is only returned by the dedicated reveal action, which audits.
--
-- Idempotent: safe to re-run.

-- ============================================================================
-- 1) school_admissions
-- ============================================================================
create table if not exists public.school_admissions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null default '11111111-1111-4111-8111-111111111111'
                    references public.organizations(id) on delete restrict,
  institution_id  uuid not null references public.institutions(id) on delete cascade,
  enrolment_type  text,                                  -- e.g. "Direct entry (no package)"
  portal_url      text,
  streams         text[] not null default '{}',          -- subset of {english,vet,he}
  documents       jsonb  not null default '[]'::jsonb,    -- [{label, tags:[], note?}]
  contacts        jsonb  not null default '[]'::jsonb,    -- [{name?, role?, email?, phone?}]
  notes           text,
  metadata        jsonb  not null default '{}'::jsonb,
  created_by      uuid references public.profiles(id) on delete set null,
  updated_by      uuid references public.profiles(id) on delete set null,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists school_admissions_org_idx
  on public.school_admissions(org_id);
create index if not exists school_admissions_institution_idx
  on public.school_admissions(org_id, institution_id);
create unique index if not exists school_admissions_org_institution_uniq
  on public.school_admissions(org_id, institution_id) where deleted_at is null;

drop trigger if exists school_admissions_set_updated_at on public.school_admissions;
create trigger school_admissions_set_updated_at before update on public.school_admissions
  for each row execute function public.set_updated_at();

alter table public.school_admissions enable row level security;

drop policy if exists "active users read admissions" on public.school_admissions;
create policy "active users read admissions" on public.school_admissions
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
    and (deleted_at is null or public.current_user_role() in ('editor','admin','super_admin'))
  );
drop policy if exists "editors insert admissions" on public.school_admissions;
create policy "editors insert admissions" on public.school_admissions
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors update admissions" on public.school_admissions;
create policy "editors update admissions" on public.school_admissions
  for update using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete admissions" on public.school_admissions;
create policy "admins delete admissions" on public.school_admissions
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- ============================================================================
-- 2) school_admission_credentials  (separate access boundary)
-- ============================================================================
create table if not exists public.school_admission_credentials (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null default '11111111-1111-4111-8111-111111111111'
                    references public.organizations(id) on delete restrict,
  admission_id    uuid not null references public.school_admissions(id) on delete cascade,
  login           text,
  password        text,
  label           text,
  created_by      uuid references public.profiles(id) on delete set null,
  updated_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists school_admission_credentials_admission_uniq
  on public.school_admission_credentials(admission_id);
create index if not exists school_admission_credentials_org_idx
  on public.school_admission_credentials(org_id);

drop trigger if exists school_admission_credentials_set_updated_at on public.school_admission_credentials;
create trigger school_admission_credentials_set_updated_at before update on public.school_admission_credentials
  for each row execute function public.set_updated_at();

alter table public.school_admission_credentials enable row level security;

-- editor+ may read/insert/update (so the admissions team can reveal the portal
-- password); admin+ may delete. The password is never selected by list/detail
-- queries — only by `revealPortalPasswordAction`, which writes an audit row.
drop policy if exists "editors read admission credentials" on public.school_admission_credentials;
create policy "editors read admission credentials" on public.school_admission_credentials
  for select using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors insert admission credentials" on public.school_admission_credentials;
create policy "editors insert admission credentials" on public.school_admission_credentials
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors update admission credentials" on public.school_admission_credentials;
create policy "editors update admission credentials" on public.school_admission_credentials
  for update using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete admission credentials" on public.school_admission_credentials;
create policy "admins delete admission credentials" on public.school_admission_credentials
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );
