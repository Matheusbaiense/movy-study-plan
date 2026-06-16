# SPLIT 4 — fatia C: templates + histórico de versões (migration 012)

> Spec aprovada pelo dono (2026-06-15). Migration aplicada via Supabase MCP após OK explícito.
> Convenções herdadas da migration 011 (org_id, trio de RLS, helpers, `*_in_cents`, idempotente).

## Objetivo

(1) **Templates de proposta** — esqueletos reutilizáveis (individual/casal/família, por tipo de visto)
dos quais o consultor parte. (2) **Histórico de versões** — snapshots imutáveis do plano para restaurar
um estado anterior.

## Regras-mãe aplicadas

White-label/woofed-shaped: toda tabela com `org_id` (default Movy) + RLS por org + índice em `org_id`;
unicidade **por org**; `metadata` jsonb (R6); `external_id` por org (R7); dinheiro só via `computed`
(centavos, P9). `proposal_versions` é **imutável** (P8 auditoria/histórico de primeira classe).

## Schema — `supabase/migrations/012_proposal_templates_versions.sql`

### `proposal_templates`
`id uuid pk · org_id uuid not null default Movy → organizations · name text not null · applicant_type
text (nullable = qualquer) · description text · data jsonb not null default '{}' (StudyPlanData parcial)
· is_active boolean default true · metadata jsonb · external_id text · created_by/updated_by → profiles ·
deleted_at · created_at · updated_at`
- Índices: `org_idx`, `org_created_idx`, único `(org_id, lower(name)) where deleted_at is null`,
  único `(org_id, external_id) where external_id not null`.
- `set_updated_at` trigger. RLS trio: read (active + org + não-deletado p/ não-editor),
  insert/update editors, delete admin.

### `proposal_versions` (imutável)
`id uuid pk · org_id uuid not null default Movy → organizations · study_plan_id uuid not null →
study_plans on delete cascade · version_number int not null · label text · reason text not null default
'manual' check in ('manual','status_change','restore') · status text · data jsonb not null · computed
jsonb · created_by → profiles · created_at`
- `version_number` sequencial por plano via trigger `set_proposal_version_number` (BEFORE INSERT:
  `coalesce(max(version_number),0)+1` por `study_plan_id`).
- Índices: `org_idx`, `(study_plan_id, version_number desc)`, único `(study_plan_id, version_number)`.
- RLS: read (active + org), insert editors, delete admin. **Sem policy de update** (histórico imutável).
- Sem `set_updated_at` (não há `updated_at`).

Idempotente (`create table if not exists`, `drop policy if exists`). Aplicada no projeto canônico
`xpthmguzcbmndyyexfbt` via MCP após OK; depois `types/supabase.ts` regenerado.

## Tipos / helpers puros — `lib/study-plans/templates.ts`
- `ProposalTemplate` / `ProposalVersion` TS types (espelham as tabelas).
- `templateToPlanData(template, base)` — funde `template.data` sobre um plano base preservando
  identidade/contato (não sobrescreve `student`/`contactRef` se já houver). Puro, imutável.
- `planToTemplateData(plan)` — extrai o subconjunto reutilizável (courses/extraCosts/applicantType/
  preferências), **sem** PII do aluno (student/email/phone zerados). Puro.
- Testes (`tests/templates.test.mjs`, APPEND-safe novo arquivo): merge preserva contato; export zera PII;
  imutabilidade.

## Actions — `app/[locale]/(protected)/study-plans/actions.ts`
- `listTemplates()`, `saveAsTemplate(planId, name, applicantType?)`, `applyTemplateToPlan(planId, templateId)`.
- `createProposalForContact(...)` ganha `templateId?` opcional (Passo-0 parte de template).
- `saveProposalVersion(planId, label?, reason?)`, `listProposalVersions(planId)`,
  `restoreProposalVersion(planId, versionId)` (grava versão `reason='restore'` do estado atual antes de
  sobrescrever `study_plans.data`).
- `changeStudyPlanStatus(...)` insere versão `reason='status_change'` no mesmo fluxo.
- `'use server'`: só exports async; sem `(supabase as any)`.

## UI
- `components/study-plans/TemplatePicker.tsx` — lista templates (por applicant_type), usado no
  `NewProposalModal` (Passo-0) e no editor ("Aplicar template").
- `components/study-plans/VersionHistory.tsx` — painel no passo **Revisão**: lista versões
  (número, label/reason, data, autor) + botão **Restaurar**.
- Editor: botões **Salvar versão · Salvar como template · Aplicar template** (na sticky bar ou no
  passo Revisão — decidir na C3, preferir Revisão p/ não inflar a sticky).

## Decomposição (commits próprios; gates: type-check · node --test · build)
- **C1:** migration 012 (mostrar → aplicar via MCP após OK → regen types) + `templates.ts` + testes.
- **C2:** server actions (templates + versões).
- **C3:** UI (TemplatePicker + VersionHistory + wiring editor + Passo-0).

## Fora de escopo
Branding por org no template (SPLIT 8); diff visual entre versões; autosave→versão; aceite/assinatura
do aluno; templates globais cross-org (sempre por org).
