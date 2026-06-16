-- supabase/migrations/013_hr_module.sql
-- ============================================================================
-- 013 — HR & Time Management (Agency Hub › Operations)
-- ============================================================================

-- 1) employee_profiles — extends profiles (no parallel auth)
create table if not exists public.employee_profiles (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null default '11111111-1111-4111-8111-111111111111'
                          references public.organizations(id) on delete restrict,
  profile_id            uuid references public.profiles(id) on delete set null,
  abn                   text,
  bank_name             text,
  bsb                   text,
  account_number        text,
  account_name          text,
  hourly_rate_in_cents  bigint not null default 0,
  currency_code         text not null default 'AUD',
  metadata              jsonb not null default '{}'::jsonb,
  external_id           text,
  deleted_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists employee_profiles_org_idx on public.employee_profiles(org_id);
create index if not exists employee_profiles_profile_idx on public.employee_profiles(profile_id);

alter table public.employee_profiles enable row level security;

drop policy if exists "employee_profiles: org members read" on public.employee_profiles;
create policy "employee_profiles: org members read"
  on public.employee_profiles for select
  using (org_id = current_org_id() and is_active_user() and deleted_at is null);

drop policy if exists "employee_profiles: admins write" on public.employee_profiles;
create policy "employee_profiles: admins write"
  on public.employee_profiles for insert
  with check (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'super_admin'));

drop policy if exists "employee_profiles: admins update" on public.employee_profiles;
create policy "employee_profiles: admins update"
  on public.employee_profiles for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'super_admin'));

-- 2) hr_rate_rules — day_type multipliers per org
create table if not exists public.hr_rate_rules (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null default '11111111-1111-4111-8111-111111111111'
                   references public.organizations(id) on delete restrict,
  name           text not null,
  day_type       text not null check (day_type in ('weekday','saturday','sunday','public_holiday')),
  multiplier     numeric(6,4) not null default 1.0,
  applies_from   date not null,
  applies_until  date,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists hr_rate_rules_org_idx on public.hr_rate_rules(org_id);

alter table public.hr_rate_rules enable row level security;

drop policy if exists "hr_rate_rules: org members read" on public.hr_rate_rules;
create policy "hr_rate_rules: org members read"
  on public.hr_rate_rules for select
  using (org_id = current_org_id() and is_active_user());

drop policy if exists "hr_rate_rules: admins write" on public.hr_rate_rules;
create policy "hr_rate_rules: admins write"
  on public.hr_rate_rules for insert
  with check (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'super_admin'));

drop policy if exists "hr_rate_rules: admins update" on public.hr_rate_rules;
create policy "hr_rate_rules: admins update"
  on public.hr_rate_rules for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'super_admin'));

-- 3) hr_invoices — snapshot at issue time
create table if not exists public.hr_invoices (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null default '11111111-1111-4111-8111-111111111111'
                    references public.organizations(id) on delete restrict,
  employee_id     uuid not null references public.employee_profiles(id) on delete restrict,
  invoice_number  text not null,
  period_start    date not null,
  period_end      date not null,
  total_cents     bigint not null default 0,
  currency_code   text not null default 'AUD',
  status          text not null default 'draft' check (status in ('draft','issued','paid')),
  issued_at       timestamptz,
  paid_at         timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  external_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists hr_invoices_org_idx on public.hr_invoices(org_id);
create index if not exists hr_invoices_employee_idx on public.hr_invoices(employee_id);
create unique index if not exists hr_invoices_number_org_uniq on public.hr_invoices(org_id, invoice_number);

alter table public.hr_invoices enable row level security;

drop policy if exists "hr_invoices: org members read" on public.hr_invoices;
create policy "hr_invoices: org members read"
  on public.hr_invoices for select
  using (org_id = current_org_id() and is_active_user());

drop policy if exists "hr_invoices: admins write" on public.hr_invoices;
create policy "hr_invoices: admins write"
  on public.hr_invoices for insert
  with check (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'super_admin'));

drop policy if exists "hr_invoices: admins update" on public.hr_invoices;
create policy "hr_invoices: admins update"
  on public.hr_invoices for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'super_admin'));

-- 4) time_entries — clock in/out records
create table if not exists public.time_entries (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null default '11111111-1111-4111-8111-111111111111'
                 references public.organizations(id) on delete restrict,
  employee_id  uuid not null references public.employee_profiles(id) on delete restrict,
  clock_in     timestamptz not null,
  clock_out    timestamptz,
  description  text,
  day_type     text not null default 'weekday' check (day_type in ('weekday','saturday','sunday','public_holiday')),
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_by  uuid references public.profiles(id) on delete set null,
  invoice_id   uuid references public.hr_invoices(id) on delete set null,
  metadata     jsonb not null default '{}'::jsonb,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists time_entries_org_idx on public.time_entries(org_id);
create index if not exists time_entries_employee_idx on public.time_entries(employee_id);
create index if not exists time_entries_clock_in_idx on public.time_entries(clock_in desc);

alter table public.time_entries enable row level security;

drop policy if exists "time_entries: read own or admin" on public.time_entries;
create policy "time_entries: read own or admin"
  on public.time_entries for select
  using (
    org_id = current_org_id()
    and is_active_user()
    and deleted_at is null
    and (
      employee_id in (select id from public.employee_profiles where profile_id = auth.uid())
      or current_user_role() in ('admin', 'super_admin')
    )
  );

drop policy if exists "time_entries: employees insert own" on public.time_entries;
create policy "time_entries: employees insert own"
  on public.time_entries for insert
  with check (
    org_id = current_org_id()
    and is_active_user()
    and employee_id in (select id from public.employee_profiles where profile_id = auth.uid() and org_id = current_org_id())
  );

drop policy if exists "time_entries: admins update" on public.time_entries;
create policy "time_entries: admins update"
  on public.time_entries for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'super_admin'));

drop policy if exists "time_entries: employees update own pending" on public.time_entries;
create policy "time_entries: employees update own pending"
  on public.time_entries for update
  using (
    org_id = current_org_id()
    and is_active_user()
    and status = 'pending'
    and employee_id in (select id from public.employee_profiles where profile_id = auth.uid())
  );
