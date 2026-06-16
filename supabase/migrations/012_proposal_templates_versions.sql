-- ============================================================================
-- 012 — Templates de proposta + histórico de versões (SPLIT 4, fatia C)
-- ============================================================================
-- ⏳ A APLICAR no projeto canônico `xpthmguzcbmndyyexfbt` via Supabase MCP após
-- aprovação do dono. Após aplicar: regenerar `types/supabase.ts`. Idempotente
-- (IF NOT EXISTS / DROP POLICY IF EXISTS), seguro para re-rodar.
--
-- P0 WHITE-LABEL FIRST: toda tabela carrega org_id (default Movy) + RLS por org +
-- índice em org_id; unicidade SEMPRE por org. R6: metadata jsonb. R7: external_id
-- (único por org). Dinheiro só viaja dentro de `computed`/`data` jsonb (já em
-- centavos, P9) — estas tabelas não têm colunas de dinheiro próprias.
-- Helpers herdados (009/010/011): current_org_id()/is_active_user()/
-- current_user_role()/set_updated_at(); org Movy '11111111-1111-4111-8111-111111111111'.
--
-- P8 AUDITORIA/HISTÓRICO: `proposal_versions` é IMUTÁVEL (insert + read + delete-admin;
-- sem policy de update, sem updated_at). Restaurar = ler a versão e reescrever
-- study_plans.data na action (gravando antes uma versão reason='restore').
-- ============================================================================

-- ============================================================================
-- 1) proposal_templates — esqueletos reutilizáveis de proposta
-- ============================================================================
create table if not exists public.proposal_templates (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null default '11111111-1111-4111-8111-111111111111'
                   references public.organizations(id) on delete restrict,
  name           text not null,
  applicant_type text,                                  -- nullable = qualquer perfil
  description    text,
  data           jsonb not null default '{}'::jsonb,    -- StudyPlanData parcial pré-preenchido (sem PII)
  is_active      boolean not null default true,
  metadata       jsonb not null default '{}'::jsonb,    -- R6
  external_id    text,                                  -- R7
  created_by     uuid references public.profiles(id) on delete set null,
  updated_by     uuid references public.profiles(id) on delete set null,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists proposal_templates_org_idx on public.proposal_templates(org_id);
create index if not exists proposal_templates_org_created_idx on public.proposal_templates(org_id, created_at desc);
create unique index if not exists proposal_templates_org_name_uniq
  on public.proposal_templates(org_id, lower(name)) where deleted_at is null;
create unique index if not exists proposal_templates_org_external_id_uniq
  on public.proposal_templates(org_id, external_id) where external_id is not null;

drop trigger if exists proposal_templates_set_updated_at on public.proposal_templates;
create trigger proposal_templates_set_updated_at before update on public.proposal_templates
  for each row execute function public.set_updated_at();

alter table public.proposal_templates enable row level security;

drop policy if exists "active users read proposal templates" on public.proposal_templates;
create policy "active users read proposal templates" on public.proposal_templates
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
    and (deleted_at is null or public.current_user_role() in ('editor','admin','super_admin'))
  );
drop policy if exists "editors insert proposal templates" on public.proposal_templates;
create policy "editors insert proposal templates" on public.proposal_templates
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors update proposal templates" on public.proposal_templates;
create policy "editors update proposal templates" on public.proposal_templates
  for update using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete proposal templates" on public.proposal_templates;
create policy "admins delete proposal templates" on public.proposal_templates
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- ============================================================================
-- 2) proposal_versions — histórico imutável de snapshots da proposta
-- ============================================================================
create table if not exists public.proposal_versions (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null default '11111111-1111-4111-8111-111111111111'
                   references public.organizations(id) on delete restrict,
  study_plan_id  uuid not null references public.study_plans(id) on delete cascade,
  version_number int not null,                          -- sequencial por plano (trigger abaixo)
  label          text,
  reason         text not null default 'manual'
                   check (reason in ('manual','status_change','restore')),
  status         text,                                  -- status do plano no momento do snapshot
  data           jsonb not null,                        -- snapshot congelado de study_plans.data
  computed       jsonb,                                 -- snapshot do engine (centavos), se houver
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);

create index if not exists proposal_versions_org_idx on public.proposal_versions(org_id);
create index if not exists proposal_versions_plan_idx
  on public.proposal_versions(study_plan_id, version_number desc);
create unique index if not exists proposal_versions_plan_number_uniq
  on public.proposal_versions(study_plan_id, version_number);

-- Numeração sequencial por plano, atômica (evita corrida no select-max da action).
create or replace function public.set_proposal_version_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.version_number is null or new.version_number = 0 then
    select coalesce(max(version_number), 0) + 1
      into new.version_number
      from public.proposal_versions
      where study_plan_id = new.study_plan_id;
  end if;
  return new;
end;
$$;

drop trigger if exists proposal_versions_set_number on public.proposal_versions;
create trigger proposal_versions_set_number before insert on public.proposal_versions
  for each row execute function public.set_proposal_version_number();

alter table public.proposal_versions enable row level security;

-- IMUTÁVEL: read + insert + delete(admin). SEM policy de update.
drop policy if exists "active users read proposal versions" on public.proposal_versions;
create policy "active users read proposal versions" on public.proposal_versions
  for select using (public.is_active_user() and org_id = public.current_org_id());
drop policy if exists "editors insert proposal versions" on public.proposal_versions;
create policy "editors insert proposal versions" on public.proposal_versions
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete proposal versions" on public.proposal_versions;
create policy "admins delete proposal versions" on public.proposal_versions
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );
