-- Movy Internal Hub core schema + Study Plans.
-- Idempotent migration designed to run safely on the repurposed legacy project.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('reader', 'editor', 'admin', 'super_admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'study_plan_status') then
    create type public.study_plan_status as enum ('draft', 'sent', 'accepted', 'archived');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.allowed_emails (
  email text primary key,
  role public.app_role not null default 'editor',
  created_at timestamptz not null default now()
);

alter table public.allowed_emails add column if not exists role public.app_role not null default 'editor';
alter table public.allowed_emails add column if not exists created_at timestamptz not null default now();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'reader',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists role public.app_role not null default 'reader';
alter table public.profiles add column if not exists is_active boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed public.allowed_emails%rowtype;
begin
  select * into allowed
  from public.allowed_emails
  where lower(email) = lower(new.email)
  limit 1;

  insert into public.profiles (id, email, full_name, avatar_url, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(allowed.role, 'reader'::public.app_role),
    allowed.email is not null
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Nova cotação',
  student_name text not null default '',
  applicant_type text not null default 'Individual',
  status public.study_plan_status not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_plans_updated_at_idx on public.study_plans(updated_at desc);
create index if not exists study_plans_student_name_idx on public.study_plans using gin (to_tsvector('simple', student_name));

drop trigger if exists study_plans_updated_at on public.study_plans;
create trigger study_plans_updated_at
  before update on public.study_plans
  for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_active = true);
$$;

alter table public.allowed_emails enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.study_plans enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles read own or admin') then
    create policy "profiles read own or admin" on public.profiles
      for select using (id = auth.uid() or public.current_user_role() in ('admin', 'super_admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles admin update') then
    create policy "profiles admin update" on public.profiles
      for update using (public.current_user_role() in ('admin', 'super_admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'audit logs admin read') then
    create policy "audit logs admin read" on public.audit_logs
      for select using (public.current_user_role() in ('admin', 'super_admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'audit logs service insert') then
    create policy "audit logs service insert" on public.audit_logs
      for insert with check (false);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'study_plans' and policyname = 'active users read study plans') then
    create policy "active users read study plans" on public.study_plans
      for select using (public.is_active_user());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'study_plans' and policyname = 'editors insert study plans') then
    create policy "editors insert study plans" on public.study_plans
      for insert with check (public.current_user_role() in ('editor', 'admin', 'super_admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'study_plans' and policyname = 'editors update study plans') then
    create policy "editors update study plans" on public.study_plans
      for update using (public.current_user_role() in ('editor', 'admin', 'super_admin'))
      with check (public.current_user_role() in ('editor', 'admin', 'super_admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'study_plans' and policyname = 'admins delete study plans') then
    create policy "admins delete study plans" on public.study_plans
      for delete using (public.current_user_role() in ('admin', 'super_admin'));
  end if;
end $$;
