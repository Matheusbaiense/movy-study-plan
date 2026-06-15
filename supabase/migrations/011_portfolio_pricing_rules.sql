-- ============================================================================
-- 011 — Portfólio normalizado + motor de regras (SPLIT 6A, parte 2/2)
-- ============================================================================
-- ✅ APLICADA em 2026-06-15 no projeto canônico `xpthmguzcbmndyyexfbt` via Supabase MCP
-- (após aprovação do dono). Tipos regenerados (`types/supabase.ts`). Idempotente
-- (IF NOT EXISTS / DROP POLICY IF EXISTS) e seguro para re-rodar. Inclui `markets`
-- (país+mercado) e `current_course_price()` — ver decisão de nacionalidade abaixo.
--
-- P0 WHITE-LABEL FIRST: TODA tabela carrega org_id (default Movy) + RLS por org +
-- índice em org_id; unicidade SEMPRE por org (nunca global). P9: todo dinheiro é
-- `*_in_cents bigint` + currency_code (nunca float). R6: metadata jsonb. R7:
-- external_id (único por org). Convenções herdadas do 009/010: helpers
-- current_org_id()/is_active_user()/current_user_role()/set_updated_at(); org Movy
-- '11111111-1111-4111-8111-111111111111'.
--
-- Modelo: institutions → campuses → courses → course_price_versions; pricing_rules
-- (camada configurável da agência consumida por lib/calc/rules.ts). NOTA DE DESENHO:
-- `promotions` foi UNIFICADA dentro de `pricing_rules` — uma promoção é uma regra com
-- effect.kind='promo_rate_override' + janela valid_from/valid_until. Uma só mecânica
-- (DRY), espelhando o tipo TS `PricingRule` já testado (SPLIT 6A parte 1).
--
-- `course_presets` (008) vira DEPRECATED: o seed abaixo o decompõe no portfólio. A
-- tabela é mantida (não dropada) por segurança de rollback; pare de escrever nela.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- helper: aplica o trio de policies padrão (read/insert/update editors, delete admin)
-- Escrito inline por tabela (Postgres não tem macro de policy). Mantém o shape do 010.
-- ----------------------------------------------------------------------------

-- ============================================================================
-- 1) institutions
-- ============================================================================
create table if not exists public.institutions (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null default '11111111-1111-4111-8111-111111111111'
                       references public.organizations(id) on delete restrict,
  name               text not null,
  country            text not null default 'Australia',
  city               text,
  website            text,
  logo_url           text,
  partnership_status text not null default 'active',   -- active|prospect|paused|ended
  commission_default numeric,                          -- % de comissão (não é dinheiro)
  notes              text,
  prices_valid_until date,
  completeness       int not null default 0,           -- 0–100 (indicador de cadastro)
  source             text not null default 'manual',   -- manual|preset|ai
  metadata           jsonb not null default '{}'::jsonb,  -- R6
  external_id        text,                                -- R7
  created_by         uuid references public.profiles(id) on delete set null,
  updated_by         uuid references public.profiles(id) on delete set null,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists institutions_org_idx on public.institutions(org_id);
create index if not exists institutions_org_created_idx on public.institutions(org_id, created_at desc);
create unique index if not exists institutions_org_name_uniq
  on public.institutions(org_id, lower(name)) where deleted_at is null;
create unique index if not exists institutions_org_external_id_uniq
  on public.institutions(org_id, external_id) where external_id is not null;

drop trigger if exists institutions_set_updated_at on public.institutions;
create trigger institutions_set_updated_at before update on public.institutions
  for each row execute function public.set_updated_at();

alter table public.institutions enable row level security;

drop policy if exists "active users read institutions" on public.institutions;
create policy "active users read institutions" on public.institutions
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
    and (deleted_at is null or public.current_user_role() in ('editor','admin','super_admin'))
  );
drop policy if exists "editors insert institutions" on public.institutions;
create policy "editors insert institutions" on public.institutions
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors update institutions" on public.institutions;
create policy "editors update institutions" on public.institutions
  for update using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete institutions" on public.institutions;
create policy "admins delete institutions" on public.institutions
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- ============================================================================
-- 2) campuses
-- ============================================================================
create table if not exists public.campuses (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null default '11111111-1111-4111-8111-111111111111'
                    references public.organizations(id) on delete restrict,
  institution_id  uuid not null references public.institutions(id) on delete cascade,
  name            text not null default 'Campus principal',
  city            text,
  address         text,
  metadata        jsonb not null default '{}'::jsonb,   -- R6
  external_id     text,                                  -- R7
  created_by      uuid references public.profiles(id) on delete set null,
  updated_by      uuid references public.profiles(id) on delete set null,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists campuses_org_idx on public.campuses(org_id);
create index if not exists campuses_institution_idx on public.campuses(institution_id);
create unique index if not exists campuses_org_external_id_uniq
  on public.campuses(org_id, external_id) where external_id is not null;

drop trigger if exists campuses_set_updated_at on public.campuses;
create trigger campuses_set_updated_at before update on public.campuses
  for each row execute function public.set_updated_at();

alter table public.campuses enable row level security;

drop policy if exists "active users read campuses" on public.campuses;
create policy "active users read campuses" on public.campuses
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
    and (deleted_at is null or public.current_user_role() in ('editor','admin','super_admin'))
  );
drop policy if exists "editors insert campuses" on public.campuses;
create policy "editors insert campuses" on public.campuses
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors update campuses" on public.campuses;
create policy "editors update campuses" on public.campuses
  for update using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete campuses" on public.campuses;
create policy "admins delete campuses" on public.campuses
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- ============================================================================
-- 3) courses
-- ============================================================================
create table if not exists public.courses (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null default '11111111-1111-4111-8111-111111111111'
                    references public.organizations(id) on delete restrict,
  institution_id  uuid not null references public.institutions(id) on delete cascade,
  campus_id       uuid references public.campuses(id) on delete set null,
  type            text not null check (type in ('elicos','vet','he')),
  name            text not null,
  cricos          text,
  english_level   text,
  timetable       text not null default '',
  default_intake  text,
  currency_code   text not null default 'AUD',
  confidence      int not null default 100,             -- 0–100 (qualidade do cadastro)
  source          text not null default 'manual' check (source in ('manual','ai')),
  is_active       boolean not null default true,
  metadata        jsonb not null default '{}'::jsonb,    -- R6
  external_id     text,                                   -- R7
  created_by      uuid references public.profiles(id) on delete set null,
  updated_by      uuid references public.profiles(id) on delete set null,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists courses_org_idx on public.courses(org_id);
create index if not exists courses_institution_idx on public.courses(institution_id);
create index if not exists courses_org_type_idx on public.courses(org_id, type) where deleted_at is null;
create unique index if not exists courses_org_external_id_uniq
  on public.courses(org_id, external_id) where external_id is not null;

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

alter table public.courses enable row level security;

drop policy if exists "active users read courses" on public.courses;
create policy "active users read courses" on public.courses
  for select using (
    public.is_active_user() and org_id = public.current_org_id()
    and (deleted_at is null or public.current_user_role() in ('editor','admin','super_admin'))
  );
drop policy if exists "editors insert courses" on public.courses;
create policy "editors insert courses" on public.courses
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors update courses" on public.courses;
create policy "editors update courses" on public.courses
  for update using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete courses" on public.courses;
create policy "admins delete courses" on public.courses
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- ============================================================================
-- 3.5) markets — agrupamento de nacionalidades por mercado (por org, P0)
--    Cada agência define seus mercados (ex.: "América do Sul" = [BR,CO,AR,...]).
--    Um price_version pode mirar um país (nationality) OU um mercado (market_id).
--    Resolução: país-específico > mercado > padrão (ver current_course_price).
-- ============================================================================
create table if not exists public.markets (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null default '11111111-1111-4111-8111-111111111111'
                   references public.organizations(id) on delete restrict,
  name           text not null,
  code           text,                                  -- slug curto opcional (ex.: 'south_america')
  country_codes  text[] not null default '{}',          -- ISO-3166 alpha-2 maiúsculo
  metadata       jsonb not null default '{}'::jsonb,     -- R6
  created_by     uuid references public.profiles(id) on delete set null,
  updated_by     uuid references public.profiles(id) on delete set null,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists markets_org_idx on public.markets(org_id);
create unique index if not exists markets_org_name_uniq
  on public.markets(org_id, lower(name)) where deleted_at is null;

drop trigger if exists markets_set_updated_at on public.markets;
create trigger markets_set_updated_at before update on public.markets
  for each row execute function public.set_updated_at();

alter table public.markets enable row level security;

drop policy if exists "active users read markets" on public.markets;
create policy "active users read markets" on public.markets
  for select using (public.is_active_user() and org_id = public.current_org_id());
drop policy if exists "admins manage markets" on public.markets;
create policy "admins manage markets" on public.markets
  for all using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- ============================================================================
-- 4) course_price_versions — histórico de preço (P9: tudo em *_in_cents)
-- ============================================================================
create table if not exists public.course_price_versions (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null default '11111111-1111-4111-8111-111111111111'
                           references public.organizations(id) on delete restrict,
  course_id              uuid not null references public.courses(id) on delete cascade,
  -- Preço por NACIONALIDADE/MERCADO. Um price_version mira: um país (nationality),
  -- um mercado (market_id), ou nenhum (padrão/todas). Resolução = mais específico
  -- vence: país > mercado > padrão; depois valid_from recente (ver current_course_price).
  nationality            text,   -- ISO-3166 alpha-2 maiúsculo (ex.: 'BR','CN','CO')
  market_id              uuid references public.markets(id) on delete set null,
  valid_from             date not null default current_date,
  valid_until            date,
  tuition_in_cents       bigint not null default 0,    -- VET/HE
  rate_per_week_in_cents bigint not null default 0,    -- ELICOS
  enrolment_fee_in_cents bigint not null default 0,
  material_fee_in_cents  bigint not null default 0,
  scholarship_in_cents   bigint not null default 0,
  has_material           boolean not null default false,
  deposit_weeks          int not null default 0,
  payment_parts          int not null default 4,
  payment_frequency      text not null default '',
  currency_code          text not null default 'AUD',
  source_document_id     uuid,                          -- FK p/ documents (SPLIT 7); sem ref ainda
  metadata               jsonb not null default '{}'::jsonb,  -- R6
  created_by             uuid references public.profiles(id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists cpv_org_idx on public.course_price_versions(org_id);
create index if not exists cpv_course_valid_idx on public.course_price_versions(course_id, valid_from desc);
-- Resolução por nacionalidade/mercado.
create index if not exists cpv_course_nat_idx
  on public.course_price_versions(course_id, nationality, valid_from desc);
create index if not exists cpv_course_market_idx
  on public.course_price_versions(course_id, market_id, valid_from desc);

drop trigger if exists cpv_set_updated_at on public.course_price_versions;
create trigger cpv_set_updated_at before update on public.course_price_versions
  for each row execute function public.set_updated_at();

alter table public.course_price_versions enable row level security;

drop policy if exists "active users read price versions" on public.course_price_versions;
create policy "active users read price versions" on public.course_price_versions
  for select using (public.is_active_user() and org_id = public.current_org_id());
drop policy if exists "editors insert price versions" on public.course_price_versions;
create policy "editors insert price versions" on public.course_price_versions
  for insert with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "editors update price versions" on public.course_price_versions;
create policy "editors update price versions" on public.course_price_versions
  for update using (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('editor','admin','super_admin') and org_id = public.current_org_id()
  );
drop policy if exists "admins delete price versions" on public.course_price_versions;
create policy "admins delete price versions" on public.course_price_versions
  for delete using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- Resolução canônica de preço por NACIONALIDADE/MERCADO (1 só lugar, reusado pelo
-- provider CourseSource). SECURITY INVOKER (default) → respeita RLS do usuário/org.
-- Especificidade: país (nationality = p_nationality) > mercado (market contém o país)
-- > padrão (nationality e market_id NULL); depois valid_from mais recente, dentro da
-- janela. Linhas de OUTRO país/mercado não casam o WHERE e são ignoradas.
create or replace function public.current_course_price(
  p_course      uuid,
  p_nationality text default null,
  p_on          date default current_date
) returns public.course_price_versions
language sql stable
set search_path = public
as $$
  select cpv.*
  from public.course_price_versions cpv
  left join public.markets m on m.id = cpv.market_id and m.deleted_at is null
  where cpv.course_id = p_course
    and cpv.valid_from <= p_on
    and (cpv.valid_until is null or cpv.valid_until >= p_on)
    and (
      (cpv.nationality is null and cpv.market_id is null)                    -- padrão
      or cpv.nationality = p_nationality                                     -- país
      or (cpv.market_id is not null and p_nationality = any(m.country_codes))-- mercado
    )
  order by
    case
      when cpv.nationality = p_nationality then 3
      when cpv.market_id is not null and p_nationality = any(m.country_codes) then 2
      else 1
    end desc,
    cpv.valid_from desc
  limit 1
$$;

-- ============================================================================
-- 5) pricing_rules — camada configurável da agência (subsume promoções)
--    Consumida por lib/calc/rules.ts (`applyRules`). `conditions` ↔ campo `when`
--    do tipo TS `PricingRule` ('when' é palavra reservada no SQL). Começa VAZIA
--    (ruleSet vazio = no-op): nenhuma regra ativa por padrão. Fee da agência fica
--    disponível mas inativo (decisão do dono). RLS de gestão = admin (config sensível).
-- ============================================================================
create table if not exists public.pricing_rules (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null default '11111111-1111-4111-8111-111111111111'
                 references public.organizations(id) on delete restrict,
  scope        text not null check (scope in ('org','institution','campus','course','type')),
  scope_id     uuid,                                  -- institution/campus/course id quando aplicável
  conditions   jsonb not null default '{}'::jsonb,    -- ↔ PricingRule.when (courseType/min-maxWeeks/applicantMode/intakeMonth/nationality)
  effect       jsonb not null,                        -- ↔ PricingRule.effect (kind + params)
  priority     int not null default 0,                -- menor aplica primeiro
  is_active    boolean not null default true,
  valid_from   date,                                  -- janela de promoção (opcional)
  valid_until  date,
  label        text,
  metadata     jsonb not null default '{}'::jsonb,    -- R6
  created_by   uuid references public.profiles(id) on delete set null,
  updated_by   uuid references public.profiles(id) on delete set null,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists pricing_rules_org_idx on public.pricing_rules(org_id);
create index if not exists pricing_rules_scope_idx on public.pricing_rules(org_id, scope, scope_id);
create index if not exists pricing_rules_active_idx on public.pricing_rules(org_id, is_active) where deleted_at is null;

drop trigger if exists pricing_rules_set_updated_at on public.pricing_rules;
create trigger pricing_rules_set_updated_at before update on public.pricing_rules
  for each row execute function public.set_updated_at();

alter table public.pricing_rules enable row level security;

drop policy if exists "active users read pricing rules" on public.pricing_rules;
create policy "active users read pricing rules" on public.pricing_rules
  for select using (public.is_active_user() and org_id = public.current_org_id());
drop policy if exists "admins manage pricing rules" on public.pricing_rules;
create policy "admins manage pricing rules" on public.pricing_rules
  for all using (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  ) with check (
    public.current_user_role() in ('admin','super_admin') and org_id = public.current_org_id()
  );

-- ============================================================================
-- 6) DEPRECATE course_presets (não dropar — rollback). Parar de escrever nela.
-- ============================================================================
comment on table public.course_presets is
  'DEPRECATED (SPLIT 6A / migration 011): substituída por institutions→campuses→courses→course_price_versions. Mantida só para rollback; não escrever mais aqui.';

-- ============================================================================
-- 7) SEED: decompõe course_presets (LIVE) no portfólio normalizado.
--    Idempotente: só roda se `courses` estiver vazia. Dinheiro → centavos.
-- ============================================================================
do $$
declare
  r       record;
  v_org   uuid := '11111111-1111-4111-8111-111111111111';
  v_inst  uuid;
  v_campus uuid;
  v_course uuid;
begin
  if exists (select 1 from public.courses) then
    return;  -- já semeado; no-op
  end if;

  for r in select * from public.course_presets where is_active order by sort_order loop
    -- instituição (find-or-create por nome, dentro da org)
    select id into v_inst from public.institutions
      where org_id = v_org and lower(name) = lower(r.provider) and deleted_at is null limit 1;
    if v_inst is null then
      insert into public.institutions (org_id, name, country, source, completeness)
      values (v_org, r.provider, 'Australia', 'preset', 40)
      returning id into v_inst;
    end if;

    -- campus principal (find-or-create)
    select id into v_campus from public.campuses
      where org_id = v_org and institution_id = v_inst and deleted_at is null limit 1;
    if v_campus is null then
      insert into public.campuses (org_id, institution_id, name)
      values (v_org, v_inst, 'Campus principal')
      returning id into v_campus;
    end if;

    -- curso
    insert into public.courses (org_id, institution_id, campus_id, type, name, timetable, currency_code, source)
    values (v_org, v_inst, v_campus, r.type, r.name, coalesce(r.timetable, ''), 'AUD', 'manual')
    returning id into v_course;

    -- vigência de preço (centavos)
    insert into public.course_price_versions (
      org_id, course_id, valid_from,
      tuition_in_cents, rate_per_week_in_cents, enrolment_fee_in_cents,
      material_fee_in_cents, scholarship_in_cents,
      has_material, deposit_weeks, payment_parts, payment_frequency, currency_code
    ) values (
      v_org, v_course, current_date,
      round(coalesce(r.tuition, 0) * 100)::bigint,
      round(coalesce(r.rate_per_week, 0) * 100)::bigint,
      round(coalesce(r.enrolment_fee, 0) * 100)::bigint,
      round(coalesce(r.material_fee, 0) * 100)::bigint,
      round(coalesce(r.scholarship, 0) * 100)::bigint,
      coalesce(r.has_material, false), coalesce(r.deposit_weeks, 0),
      coalesce(r.payment_parts, 4), coalesce(r.payment_frequency, ''), 'AUD'
    );
  end loop;
end $$;

-- pricing_rules: SEM seed (começa vazia = no-op). Regras reais entram via SPLIT 6B
-- ou import por IA (SPLIT 7). A "taxa automática" da proposta vem dos DADOS acima
-- (enrolment/material no price_version), não de regra.
