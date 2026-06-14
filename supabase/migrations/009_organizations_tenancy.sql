-- SPLIT 0 — Fundação de dados & tenancy-ready.
-- Adiciona `organizations` (multi-org-ready) + `org_id` em todas as tabelas de negócio,
-- com RLS por org. O app continua single-tenant ("Movy") na prática, mas a fundação já
-- permite virar multi-agência/white-label sem reescrever RLS nem migrar dado.
--
-- DRAFTED — aplicar no projeto CANÔNICO `xpthmguzcbmndyyexfbt` (ver `.env.local`) via SQL editor do
-- dashboard, OU via um Supabase MCP/login conectado àquela conta. ATENÇÃO: o MCP da sessão de
-- 2026-06-15 NÃO tinha acesso a esse projeto (só listava outra conta cujo único projeto ACTIVE,
-- `movy-education`/`hvtywvtleoaeooffecrc`, tem schema mínimo INCOMPATÍVEL — NÃO aplicar aqui).
-- Pré-requisito: confirmar que 001 (core) e 008 (presets) já foram aplicadas. Depois, idealmente
-- regenerar `types/supabase.ts`. Idempotente e seguro para rodar no projeto vivo correto.
--
-- Correções de robustez (revisão architecture-critic 2026-06-15):
--  * `current_org_id()` SECURITY DEFINER (owner ignora RLS => sem recursão), lê do JWT
--    app_metadata.org_id com fallback à query em profiles.
--  * `org_id` adicionado na ordem segura: nullable -> backfill Movy -> default -> NOT NULL.
--  * Org "Movy" semeada com UUID FIXO/determinístico.
--  * Índices em `org_id` (RLS injeta org_id=current_org_id() em toda query).
--  * Policies de study_plans deixadas extensíveis (o SPLIT 2 estende soft-delete/hard-delete).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) Tabela organizations (espelha woofed `accounts`) + seed Movy (UUID fixo)
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency_code text not null default 'AUD',
  settings jsonb not null default '{}'::jsonb,
  ai_usage jsonb not null default '{"limit": 0, "tokens": 0}'::jsonb,  -- shape woofed accounts.ai_usage
  branding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists organizations_updated_at on public.organizations;
create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- Org "Movy" com UUID determinístico (referenciado nos defaults/backfills abaixo).
insert into public.organizations (id, name, currency_code)
values ('11111111-1111-4111-8111-111111111111', 'Movy', 'AUD')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) Helper RLS current_org_id() — anti-recursão
--    JWT app_metadata.org_id (preferido) -> fallback profiles (SECURITY DEFINER => sem RLS).
-- ---------------------------------------------------------------------------
create or replace function public.current_org_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  begin
    v_org := nullif(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'org_id', ''
    )::uuid;
  exception when others then
    v_org := null;
  end;

  if v_org is not null then
    return v_org;
  end if;

  -- Fallback: SECURITY DEFINER roda como owner e ignora RLS -> não recursiona em profiles.
  select org_id into v_org from public.profiles where id = auth.uid();
  return v_org;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3) org_id nas tabelas de negócio (nullable -> backfill -> default -> NOT NULL)
-- ---------------------------------------------------------------------------
do $$
declare
  movy constant uuid := '11111111-1111-4111-8111-111111111111';
  t text;
  -- Tabelas core descritas pelas migrations 001/008 do repo (RLS reescrita na §5).
  core_tables text[] := array['profiles', 'allowed_emails', 'audit_logs', 'study_plans'];
  -- Tabelas de negócio adicionais presentes no banco vivo (wiki/departments/campaigns/etc.).
  -- Recebem a COLUNA org_id + índice agora (fundação tenancy). O org-scoping de RLS dessas
  -- tabelas é DEFERIDO aos splits donos de cada uma — não reescrevemos policies que não
  -- auditamos aqui. Guardadas por to_regclass para serem seguras em qualquer ambiente.
  optional_tables text[] := array['course_presets', 'departments', 'contents', 'campaigns', 'checklist_progress', 'allowed_domains'];
begin
  foreach t in array core_tables loop
    execute format('alter table public.%I add column if not exists org_id uuid references public.organizations(id)', t);
    execute format('update public.%I set org_id = %L where org_id is null', t, movy);
    execute format('alter table public.%I alter column org_id set default %L', t, movy);
    execute format('alter table public.%I alter column org_id set not null', t);
    execute format('create index if not exists %I on public.%I(org_id)', t || '_org_id_idx', t);
  end loop;

  foreach t in array optional_tables loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I add column if not exists org_id uuid references public.organizations(id)', t);
      execute format('update public.%I set org_id = %L where org_id is null', t, movy);
      execute format('alter table public.%I alter column org_id set default %L', t, movy);
      execute format('alter table public.%I alter column org_id set not null', t);
      execute format('create index if not exists %I on public.%I(org_id)', t || '_org_id_idx', t);
    end if;
  end loop;
end $$;

-- Índice composto para a lista de propostas (RLS por org + ordenação por data).
create index if not exists study_plans_org_updated_idx
  on public.study_plans(org_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- 4) handle_new_user(): novos profiles entram na org do allowed_emails (ou Movy)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed public.allowed_emails%rowtype;
  movy constant uuid := '11111111-1111-4111-8111-111111111111';
begin
  select * into allowed
  from public.allowed_emails
  where lower(email) = lower(new.email)
  limit 1;

  insert into public.profiles (id, email, full_name, avatar_url, role, is_active, org_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(allowed.role, 'reader'::public.app_role),
    allowed.email is not null,
    coalesce(allowed.org_id, movy)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5) RLS por org — recria policies existentes incluindo org_id = current_org_id()
-- ---------------------------------------------------------------------------

-- profiles: ler o próprio, ou admin dentro da MESMA org.
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select using (
    id = auth.uid()
    or (public.current_user_role() in ('admin', 'super_admin') and org_id = public.current_org_id())
  );

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
  for update using (
    public.current_user_role() in ('admin', 'super_admin') and org_id = public.current_org_id()
  );

-- audit_logs: admin lê auditoria da própria org. Insert continua via service-role (with check false).
drop policy if exists "audit logs admin read" on public.audit_logs;
create policy "audit logs admin read" on public.audit_logs
  for select using (
    public.current_user_role() in ('admin', 'super_admin') and org_id = public.current_org_id()
  );

-- study_plans: tudo escopado por org. (Extensível pelo SPLIT 2: soft-delete/hard-delete.)
drop policy if exists "active users read study plans" on public.study_plans;
create policy "active users read study plans" on public.study_plans
  for select using (public.is_active_user() and org_id = public.current_org_id());

drop policy if exists "editors insert study plans" on public.study_plans;
create policy "editors insert study plans" on public.study_plans
  for insert with check (
    public.current_user_role() in ('editor', 'admin', 'super_admin')
    and org_id = public.current_org_id()
  );

drop policy if exists "editors update study plans" on public.study_plans;
create policy "editors update study plans" on public.study_plans
  for update using (
    public.current_user_role() in ('editor', 'admin', 'super_admin')
    and org_id = public.current_org_id()
  )
  with check (
    public.current_user_role() in ('editor', 'admin', 'super_admin')
    and org_id = public.current_org_id()
  );

drop policy if exists "admins delete study plans" on public.study_plans;
create policy "admins delete study plans" on public.study_plans
  for delete using (
    public.current_user_role() in ('admin', 'super_admin') and org_id = public.current_org_id()
  );

-- course_presets (se existir): leitura/manage escopadas por org.
do $$
begin
  if to_regclass('public.course_presets') is not null then
    drop policy if exists "active users read presets" on public.course_presets;
    create policy "active users read presets" on public.course_presets
      for select using (public.is_active_user() and org_id = public.current_org_id());

    drop policy if exists "admins manage presets" on public.course_presets;
    create policy "admins manage presets" on public.course_presets
      for all using (
        public.current_user_role() in ('admin', 'super_admin') and org_id = public.current_org_id()
      )
      with check (
        public.current_user_role() in ('admin', 'super_admin') and org_id = public.current_org_id()
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 6) RLS da própria tabela organizations (estava exposta sem RLS — advisor ERROR).
--    Membros leem a própria org; admins atualizam. Criar/excluir só via service-role.
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;

drop policy if exists "members read own org" on public.organizations;
create policy "members read own org" on public.organizations
  for select using (id = public.current_org_id());

drop policy if exists "admins update own org" on public.organizations;
create policy "admins update own org" on public.organizations
  for update using (
    id = public.current_org_id() and public.current_user_role() in ('admin', 'super_admin')
  )
  with check (
    id = public.current_org_id() and public.current_user_role() in ('admin', 'super_admin')
  );

-- ---------------------------------------------------------------------------
-- 7) Trancar EXECUTE de current_org_id() ao mesmo padrão dos outros helpers RLS
--    (advisor WARN: SECURITY DEFINER não deve ser chamável por anon via RPC).
-- ---------------------------------------------------------------------------
revoke execute on function public.current_org_id() from public, anon;
grant execute on function public.current_org_id() to authenticated;
