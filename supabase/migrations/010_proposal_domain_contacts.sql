-- ============================================================================
-- 010 — Domínio da proposta + seam de contatos CRM-ready (SPLIT 2)
-- ============================================================================
-- Evolui o modelo de proposta sem quebrar o editor atual (SPLIT 4 ainda lê
-- data.student/email/phone do jsonb). Estabelece o seam CRM:
--   * `contacts` (woofed-compatível): email/telefone únicos por org,
--     custom_attributes jsonb, metadata jsonb (R6), external_id (R7).
--   * `study_plans` ganha contact_id (FK→contacts), deal_id reservado,
--     currency_code, expires_at, accepted_at, deleted_at, metadata jsonb (R6),
--     external_id (R7) e idempotency_key determinístico (R8, coluna gerada).
--   * Enum `study_plan_status` estendido (P5/P7/P8/P10).
--   * `proposal_events` (timeline append-only) com org_id + RLS.
--   * Policies: leitura soft-delete aware (deletados só p/ editores+),
--     hard-delete admin-only (policy de delete já existente do 009).
--   * Data migration NÃO destrutiva: extrai data.student/email/phone para
--     contacts e popula study_plans.contact_id. O jsonb permanece como cópia
--     de trabalho até o SPLIT 4 religar o editor aos contatos.
--
-- Convenções herdadas do 009: org_id NOT NULL default Movy
-- ('11111111-1111-4111-8111-111111111111'), RLS via current_org_id() /
-- is_active_user() / current_user_role(), índice em org_id e FKs.
-- Idempotente onde viável (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) contacts (CRM-ready, woofed-compatível)
-- ----------------------------------------------------------------------------
create table if not exists public.contacts (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null default '11111111-1111-4111-8111-111111111111'
                      references public.organizations(id) on delete restrict,
  full_name         text not null default '',
  email             text,
  phone             text,
  custom_attributes jsonb not null default '{}'::jsonb,
  metadata          jsonb not null default '{}'::jsonb,   -- R6: extensibilidade futura
  external_id       text,                                  -- R7: mapeamento p/ sistemas externos
  created_by        uuid references public.profiles(id) on delete set null,
  updated_by        uuid references public.profiles(id) on delete set null,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists contacts_org_idx on public.contacts(org_id);
create index if not exists contacts_org_created_idx on public.contacts(org_id, created_at desc);

-- Unicidade por org (R4): ignora vazios/nulos via índice parcial.
create unique index if not exists contacts_org_email_uniq
  on public.contacts(org_id, lower(email))
  where email is not null and email <> '';
create unique index if not exists contacts_org_phone_uniq
  on public.contacts(org_id, phone)
  where phone is not null and phone <> '';
create unique index if not exists contacts_org_external_id_uniq
  on public.contacts(org_id, external_id)
  where external_id is not null;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;

drop policy if exists "active users read contacts" on public.contacts;
create policy "active users read contacts" on public.contacts
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
    and (deleted_at is null or public.current_user_role() in ('editor', 'admin', 'super_admin'))
  );

drop policy if exists "editors insert contacts" on public.contacts;
create policy "editors insert contacts" on public.contacts
  for insert with check (
    public.current_user_role() in ('editor', 'admin', 'super_admin')
    and org_id = public.current_org_id()
  );

drop policy if exists "editors update contacts" on public.contacts;
create policy "editors update contacts" on public.contacts
  for update using (
    public.current_user_role() in ('editor', 'admin', 'super_admin')
    and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor', 'admin', 'super_admin')
    and org_id = public.current_org_id()
  );

drop policy if exists "admins delete contacts" on public.contacts;
create policy "admins delete contacts" on public.contacts
  for delete using (
    public.current_user_role() in ('admin', 'super_admin') and org_id = public.current_org_id()
  );

-- ----------------------------------------------------------------------------
-- 2) study_plans — colunas do domínio da proposta
-- ----------------------------------------------------------------------------
alter table public.study_plans
  add column if not exists contact_id    uuid references public.contacts(id) on delete set null,
  add column if not exists deal_id       uuid,                                   -- reservado (SPLIT 6+); sem FK ainda
  add column if not exists currency_code text not null default 'AUD',
  add column if not exists expires_at    timestamptz,
  add column if not exists accepted_at   timestamptz,
  add column if not exists deleted_at    timestamptz,
  add column if not exists metadata      jsonb not null default '{}'::jsonb,     -- R6
  add column if not exists external_id   text;                                   -- R7

-- R8: chave de idempotência determinística e estável (derivável de id),
-- âncora para virar item faturável no v3 sem migração destrutiva.
alter table public.study_plans
  add column if not exists idempotency_key text
    generated always as ('study_plan:' || id::text) stored;

create index if not exists study_plans_contact_id_idx on public.study_plans(contact_id);
create index if not exists study_plans_org_active_idx
  on public.study_plans(org_id, updated_at desc) where deleted_at is null;
create unique index if not exists study_plans_org_external_id_uniq
  on public.study_plans(org_id, external_id)
  where external_id is not null;

-- ----------------------------------------------------------------------------
-- 3) study_plan_status — enum estendido (P5/P7/P8/P10)
--    Aditivo e idempotente; não usa os novos valores nesta mesma migração.
-- ----------------------------------------------------------------------------
alter type public.study_plan_status add value if not exists 'ready_review';      -- revisão interna
alter type public.study_plan_status add value if not exists 'approved_internal';  -- aprovado p/ envio
alter type public.study_plan_status add value if not exists 'viewed';             -- visualizada pelo contato
alter type public.study_plan_status add value if not exists 'negotiating';        -- em negociação
alter type public.study_plan_status add value if not exists 'rejected';           -- recusada
alter type public.study_plan_status add value if not exists 'expired';            -- expirada

-- ----------------------------------------------------------------------------
-- 4) proposal_events — timeline append-only (woofed-shape)
-- ----------------------------------------------------------------------------
create table if not exists public.proposal_events (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null default '11111111-1111-4111-8111-111111111111'
                  references public.organizations(id) on delete restrict,
  study_plan_id uuid not null references public.study_plans(id) on delete cascade,
  contact_id    uuid references public.contacts(id) on delete set null,
  actor_id      uuid references public.profiles(id) on delete set null,
  kind          text not null,            -- created|updated|duplicated|status_change|archived|deleted|restored|contact_linked|note|email|task
  title         text,
  scheduled_at  timestamptz,
  done_at       timestamptz,
  from_me       boolean not null default true,
  metadata      jsonb not null default '{}'::jsonb,   -- R6
  created_at    timestamptz not null default now()
);

create index if not exists proposal_events_org_idx on public.proposal_events(org_id);
create index if not exists proposal_events_plan_idx on public.proposal_events(study_plan_id, created_at desc);
create index if not exists proposal_events_org_created_idx on public.proposal_events(org_id, created_at desc);

alter table public.proposal_events enable row level security;

drop policy if exists "active users read proposal events" on public.proposal_events;
create policy "active users read proposal events" on public.proposal_events
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
  );

drop policy if exists "editors insert proposal events" on public.proposal_events;
create policy "editors insert proposal events" on public.proposal_events
  for insert with check (
    public.current_user_role() in ('editor', 'admin', 'super_admin')
    and org_id = public.current_org_id()
  );

-- ----------------------------------------------------------------------------
-- 5) study_plans — leitura soft-delete aware (ESTENDE o shape do 009)
--    Não-deletados visíveis a todos os membros ativos da org; deletados
--    (lixeira) apenas a editores+ (que também podem restaurar). Hard-delete
--    permanece admin-only via policy "admins delete study plans" (009).
-- ----------------------------------------------------------------------------
drop policy if exists "active users read study plans" on public.study_plans;
create policy "active users read study plans" on public.study_plans
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
    and (deleted_at is null or public.current_user_role() in ('editor', 'admin', 'super_admin'))
  );

-- ----------------------------------------------------------------------------
-- 6) Data migration NÃO destrutiva: data.student/email/phone -> contacts
--    Idempotente: só processa planos sem contact_id. Re-rodar é no-op.
--    Dedup por email (lower) e depois por telefone dentro da org; senão cria
--    um contato novo por plano. O jsonb permanece intacto (cópia de trabalho).
-- ----------------------------------------------------------------------------
do $$
declare
  r          record;
  v_contact  uuid;
  v_name     text;
  v_email    text;
  v_phone    text;
begin
  for r in
    select id, org_id, student_name, data, created_by, updated_by
    from public.study_plans
    where contact_id is null
  loop
    v_name  := coalesce(nullif(btrim(r.data->>'student'), ''), nullif(btrim(r.student_name), ''), 'Sem nome');
    v_email := nullif(lower(btrim(r.data->>'email')), '');
    v_phone := nullif(btrim(r.data->>'phone'), '');

    v_contact := null;

    if v_email is not null then
      select id into v_contact
      from public.contacts
      where org_id = r.org_id and lower(email) = v_email and deleted_at is null
      limit 1;
    end if;

    if v_contact is null and v_phone is not null then
      select id into v_contact
      from public.contacts
      where org_id = r.org_id and phone = v_phone and deleted_at is null
      limit 1;
    end if;

    if v_contact is null then
      insert into public.contacts (org_id, full_name, email, phone, metadata, created_by, updated_by)
      values (
        r.org_id, v_name, v_email, v_phone,
        jsonb_build_object('migrated_from', 'study_plans.data', 'source_study_plan_id', r.id),
        r.created_by, r.updated_by
      )
      returning id into v_contact;
    end if;

    update public.study_plans set contact_id = v_contact where id = r.id;
  end loop;
end $$;
