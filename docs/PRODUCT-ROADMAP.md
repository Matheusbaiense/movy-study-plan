# Movy — Arquitetura Mestre & Roadmap (Portfólio · Propostas · Cálculo)

> Documento mestre do reposicionamento do produto. Leia ANTES de planejar ou
> codar qualquer feature das três frentes (Portfólio, Propostas, Cálculo).
> Decisões aqui têm precedência sobre planos antigos do `AI-HANDOVER.md`.
>
> **Status:** v1 — arquitetura aprovada, execução por splits ainda NÃO iniciada.
> **CRM e integrações externas (escolas/SEC/pagamento) estão FORA de escopo.**
> Última atualização: 2026-06-15

---

## 0. Como ler este documento

1. **Seção 1–4** = a arquitetura mestre (visão, princípios, modelo de domínio, contratos).
2. **Seção 5** = os **SPLITS**: unidades de trabalho organizadas **pela área de código
   que tocam** (não por feature), para que cada arquivo/tabela seja reescrito **uma vez,
   por inteiro e bem**, em vez de ser remendado em 5 features diferentes.
3. **Seção 6** = matriz feature → código (prova de que os splits cobrem tudo sem retrabalho).
4. **Seção 7** = ordem de execução e dependências.

Regra de ouro de execução: **um split por vez, completo, com type-check + teste verdes e
commit próprio antes do próximo.** Sem gambiarra: se um split exige tocar um arquivo, ele
deixa esse arquivo na forma final pretendida, não num meio-termo que o próximo split quebra.

---

## 1. Visão de produto

Movy deixa de ser "hub interno" e passa a ser o **melhor configurador e gerador de
propostas para agências de intercâmbio**: transformar PDFs/tabelas/regras confusas de
escolas em **propostas bonitas, precisas e rápidas**.

Três pilares (nesta prioridade):

1. **Montagem ultrarrápida de propostas** — usabilidade total do consultor.
2. **Gestão inteligente de portfólio** — instituição → campus → curso → preços, com import por IA.
3. **Cálculos automáticos, confiáveis e explicáveis.**

Métrica-norte: **tempo entre "pedido do aluno" e "proposta profissional pronta"** deve cair
para poucos minutos, sem erro de cobrança.

---

## 2. Princípios de arquitetura (inegociáveis)

- **P1 — Tenancy-ready, single-tenant-ativo.** Hoje roda só pra Movy, mas o schema e o RLS
  já carregam a fronteira de organização (`org_id`) desde o dia 1, com uma org "Movy" semeada
  e usada por padrão. Virar **white-label / SaaS multi-agência** depois é mudança de
  configuração (parar de usar o default + UI de troca de org), **nunca** uma reescrita de RLS
  ou migração de dados. Nenhuma tabela ou regra pode assumir "existe só uma agência".
- **P2 — Fonte única de cálculo.** As funções puras de `lib/study-plans/calculations.ts`
  são a autoridade. Rodam no cliente (preview instantâneo) e no servidor (validação ao
  salvar/publicar). Nunca duplicar regra de negócio em UI.
- **P3 — Snapshot, não recálculo vivo.** Proposta enviada/aceita guarda o **resultado
  calculado e o preço usado** (como já fazemos com câmbio). PDF nunca "muda sozinho" quando
  o preço da escola é atualizado.
- **P4 — Portfólio normalizado é a fonte; proposta consome.** Preço mora no portfólio com
  vigência; a proposta referencia + copia um snapshot. `course_presets` é aposentado.
- **P5 — IA nunca salva direto.** Todo dado vindo de PDF passa por OCR → LLM → validação
  determinística → **conferência humana** → publicação auditada. Modelo de IA é camada
  plugável (rápido vs preciso) com teto de custo/tokens.
- **P6 — Sem `as any`.** Após cada migration, regenerar `types/supabase.ts`. O código fala
  TypeScript estrito (regra do projeto). Os casts `(supabase as any)` atuais são dívida a quitar.
- **P7 — Soft-delete por padrão** em dados de negócio (propostas, cursos, instituições):
  `deleted_at`, lixeira, restauração; exclusão definitiva só admin.
- **P8 — Auditoria e histórico de primeira classe.** Toda mudança relevante gera evento
  (reusar `audit_logs` + timeline por proposta).
- **P9 — Dinheiro em centavos (inteiro) + moeda explícita.** Todo valor monetário é `bigint`
  em unidades menores (centavos) com `currency_code` associado — NUNCA `float`/`numeric` solto.
  Alinha com o woofed-crm (`*_in_cents` + gem money) e elimina erro de arredondamento. O engine
  de cálculo opera em centavos; a UI formata com `Intl`. (Migração dos campos atuais em §Split 1.)
- **P10 — CRM-ready por design (compatível com woofed-crm).** O modelo é escrito para
  **juntar-se ao woofed-crm e virar um único produto** depois. Convenções e nomes de domínio
  seguem o woofed: `contacts` (estudante/lead), `deals` (oportunidade), `products`/`deal_products`
  (catálogo + linhas snapshot), `pipelines`/`stages`, `events` (timeline/tarefas),
  `custom_attribute_definitions`. A Movy guarda o **seam**: proposta referencia `contact_id`
  (e, futuramente, `deal_id`), nunca só texto em jsonb. CRM em si fica fora de escopo agora,
  mas nada pode impedir a fusão depois. Ver §3.6.

---

## 3. Modelo de domínio (alvo)

Notação: `tabela (colunas-chave)`. Toda tabela de negócio tem `org_id`, `created_at`,
`updated_at`, e (quando aplicável) `created_by`, `updated_by`, `deleted_at`.

### 3.1 Tenancy & acesso (existe parcialmente)
```
organizations (id, name, currency_code, settings jsonb,                    [NOVO]
               ai_usage jsonb {limit, tokens}, branding jsonb, created_at) -- espelha woofed `accounts`
               -- slug/status: ADIAR (só servem p/ roteamento SaaS; org_id já basta p/ tenancy-ready)
profiles (id, email, full_name, role, is_active, org_id→organizations)    [+org_id]
allowed_emails (email, role, org_id)                                       [+org_id]
audit_logs (id, org_id, actor_id, action, entity_type, entity_id, meta)   [+org_id]
```
- **`ai_usage` (shape fixado):** `{ limit: number, tokens: number }` (espelha woofed `accounts.ai_usage`).
- **Dinheiro:** `bigint` em `*_in_cents` + `currency_code` explícito (woofed usa `integer`; usamos
  `bigint` por segurança de overflow — documentado).
- **Helper RLS `current_org_id()` (anti-recursão — crítico):** ler de `auth.jwt() → app_metadata.org_id`
  (gravado no login), com **fallback** à query `profiles`. `SECURITY DEFINER STABLE` + `search_path`
  fixo. **NÃO** fazer a policy de `profiles` chamar uma função que consulta `profiles` (recursão
  infinita de RLS). Toda policy de negócio inclui `org_id = current_org_id()`. Org "Movy" semeada
  com **UUID determinístico/fixo**; `org_id` default = Movy.

### 3.2 Portfólio (NOVO — substitui `course_presets`)
```
institutions (id, org_id, name, country, city, website, logo_url,
              partnership_status, commission_default, notes,
              prices_valid_until, completeness, source, deleted_at)
campuses     (id, org_id, institution_id, name, city, address)
courses      (id, org_id, institution_id, campus_id?, type[elicos|vet|he],
              name, cricos, english_level, timetable, default_intake,
              currency, confidence, source[manual|ai], is_active, deleted_at)
course_price_versions (id, org_id, course_id, valid_from, valid_until,
              tuition, rate_per_week, enrolment_fee, material_fee, has_material,
              deposit_weeks, payment_parts, payment_frequency, currency,
              source_document_id?, created_by)               -- histórico de preço
promotions   (id, org_id, scope[institution|campus|course], scope_id,
              kind[pct|fixed|rate_override], value, valid_from, valid_until,
              conditions jsonb)                               -- ex.: ≥24 sem
fees         (opção: tabela própria OU embutido em price_version)
```
Regra: a proposta referencia `course_id` + grava snapshot do `course_price_version` vigente.

### 3.3 Documentos & import IA (NOVO)
```
documents (id, org_id, institution_id?, storage_path, original_name, kind[price_list|promo|contract],
           status[uploaded|processing|extracted|review|approved|published|rejected|error],
           model_used, ocr_provider, tokens_used, cost_estimate, processing_ms,
           extracted jsonb, confidence jsonb, error_message, created_by)
```
Storage: Supabase Storage bucket `school-docs` (privado, RLS por org).

### 3.4 Propostas (evolui `study_plans`)
```
contacts (id, org_id, full_name, email, phone, custom_attributes jsonb,
          additional_attributes jsonb, deleted_at)            [NOVO — seam CRM woofed-shaped]
          -- unicidade POR ORG: unique(org_id, lower(email)) e unique(org_id, phone).
          -- NÃO copiar o índice GLOBAL do woofed (artefato single-account: vazaria contatos entre orgs).
study_plans (id, org_id, contact_id→contacts [NOVO], deal_id [reservado p/ CRM, nullable],
             title, applicant_type, status[enum estendido],
             data jsonb, computed jsonb [snapshot de totais em centavos],
             fx jsonb [câmbio travado], currency_code, expires_at, accepted_at,
             created_by, updated_by, deleted_at)
proposal_events (id, org_id, study_plan_id, actor_id,                     [NOVO timeline]
             kind [woofed-shaped: note|status_change|email|task|...],
             title, scheduled_at, done_at, from_me bool, status, metadata jsonb, created_at)
```
- `student_name` deixa de viver só no jsonb: vira `contacts` referenciado por `contact_id`
  (compatível com woofed `contacts`: `custom_attributes`, mas **unicidade por org**, não global).
  Isto é o **seam** que permite a fusão com o CRM sem reescrever a proposta.
- `proposal_events` adota o shape do woofed `events` (`kind`/`scheduled_at`/`done_at`/`from_me`/
  `status`/`title`) — assim a timeline da proposta vira tarefa/evento de CRM sem remigração.
- **Dois sistemas de evento (justificado):** `audit_logs` = auditoria de sistema (quem mudou o quê,
  imutável); `proposal_events` = timeline de negócio/CRM visível ao usuário. Propósitos distintos.

### 3.6 Seam de CRM (compatibilidade woofed-crm) — leitura obrigatória do P10

**O que é o woofed-crm:** CRM open-source em **Rails 7.1 + Postgres (pgvector) + Devise**,
GoodJob, Vite/Stimulus/Turbo/Inertia, Tailwind, motor-admin, gem `money` (`*_in_cents`),
**servidor MCP + OAuth (Doorkeeper)** para clientes de IA, integrações Chatwoot e Evolution API
(WhatsApp), assistente de IA + embeddings. **Hoje é single-account por instalação** (uma linha
`accounts`; não é multi-tenant nativo — virar SaaS exige adicionar escopo de account lá também).

**Mapa de domínio Movy ↔ woofed (alvo de compatibilidade):**

| Conceito | Movy (alvo) | woofed-crm | Nota |
|---|---|---|---|
| Tenant | `organizations` | `accounts` | mesmo conceito (currency_code, settings, ai_usage) |
| Usuário | `profiles` (Supabase Auth) | `users` (Devise) | **auth diverge** — ponto de decisão |
| Estudante/lead | `contacts` | `contacts` | email/phone únicos, custom_attributes |
| Oportunidade | `deals` (futuro) | `deals` | status open/won/lost, pipeline/stage, kanban |
| Funil | `pipelines`/`stages` (futuro) | `pipelines`/`stages` | position (drag-drop) |
| Catálogo | `courses`/`course_price_versions` | `products` | Movy é mais rico (ELICOS/VET/HE) |
| Linha snapshot | `study_plans.data.options[].courses[]` (snapshot) | `deal_products` | **mesmo padrão snapshot** — valida P3 |
| Timeline/tarefas | `proposal_events` | `events` | kind/scheduled_at/done_at/from_me/status |
| Campos custom | `custom_attribute_definitions` (futuro) | idem | jsonb + definição |
| IA/tokens | `organizations.ai_usage` + pgvector | `ai_usage`/`embedding_documments` | reusar padrão no Split 7 |

**Decisão de estratégia de integração (DECIDIDO — Caminho B, ver §10.1):** absorver o modelo
woofed no stack Supabase da Movy (1 stack, multi-tenant white-label), woofed como blueprint de
schema/UX. A fundação já fica CRM-ready: `contacts` extraído, dinheiro em centavos,
`organizations`≈`accounts`, nomes woofed-shaped, padrões de IA/token/pgvector alinhados.

**Blueprint AllyHub (futuro):** análise do concorrente Ally/AllyHub será feita como **usuário de
teste da plataforma** (pesquisa de UX), **não** a partir do código. Insumo para Splits 4/5/6
(UX de proposta, comparador, portfólio). Não acionável agora.
- **Múltiplas opções** na mesma proposta: `data.options[]` (recomendado/econômica/premium)
  dentro do `jsonb` — o editor já manipula arrays de `courses`.
- **Status estendido (enum aditivo, seguro):** `draft, ready_review, approved_internal,
  sent, viewed, negotiating, accepted, rejected, expired, archived`.
- `computed jsonb` = saída do engine no momento do salvar/publicar (P3).

### 3.5 Diagrama de dependência (texto)
```
organizations
  └─ profiles / allowed_emails / audit_logs
  └─ institutions ─ campuses ─ courses ─ course_price_versions
  │                                 └─ promotions
  └─ documents ─(alimenta)→ courses/price_versions
  └─ study_plans ─ proposal_events
                 └─(referencia + snapshot)→ courses/price_versions, fx, computed
```

### 3.7 Padrões de integração antecipados (convergência Lago × woofed) — NOVO

Cruzamento estrutural completo em `docs/LAGO-WOOFED-CONVERGENCE.md`. Três eixos convergem nos
três sistemas (Lago, woofed, Movy) e viram padrão **desde a v0** (custam barato agora, caro depois):

1. **Dinheiro** em unidade menor inteira + `currency_code` por valor (P9 / SPLIT 1).
2. **Tenant/cliente**: `org_id` ↔ `accounts` (woofed) ↔ `customers.external_id` (Lago) (SPLIT 0).
3. **Uso de IA**: `ai_usage {limit, tokens}` como sinal medível (SPLIT 0/7).

**Campos de integração reservados desde já (NOVO — não fechar a porta para CRM/billing futuros):**
- **`metadata jsonb`** em toda entidade de negócio (≈ `additional_attributes` do woofed).
- **`external_id` nullable** (único por org quando presente) nas entidades de borda
  (`contacts`, `study_plans`, futuros `documents`) — espelha `customers.external_id` (Lago) e
  `additional_attributes->>'chatwoot_id'` (woofed).
- **Chave de idempotência determinística** (estilo `transaction_id` do Lago, derivável de
  `id`+versão) nas operações que poderão emitir evento externo (uso de IA, mudança de proposta).

**Armadilha de vocabulário:** "events" = coisas diferentes. Lago `events` = metering (v3);
woofed `events` = timeline CRM; Movy `proposal_events` segue o woofed. `audit_logs` é auditoria
de sistema, à parte. Nunca conflar os três.

---

## 4. Contratos centrais (interfaces estáveis)

Para evitar retrabalho, estes contratos são definidos cedo e os splits dependem deles:

- **`ComputedTotals`** (saída do engine, gravada em `study_plans.computed`):
  `{ grandTotal, coursesTotal, extrasTotal, upfront, installmentBalance, depositsTotal,
     studyWeeks, holidayWeeks, visaWeeks, newVisa: VisaExpiryResult, perCourse[], brl?, fxAsOf? }`.
- **`computeProposal(data: StudyPlanData): ComputedTotals`** — função pura em `lib/calc/`,
  chamada no cliente (preview) e via server action (autoridade).
- **`PortfolioCourseRef`** (o que a proposta guarda ao escolher um curso do portfólio):
  `{ courseId, priceVersionId, snapshot: {...campos de preço...}, takenAt }`.
- **`CourseSource`** (seam editor↔portfólio — define-se no SPLIT 4, implementa-se no SPLIT 6):
  `interface CourseSource { search(q): Promise<CourseOption[]>; resolve(courseId): Promise<PortfolioCourseRef> }`.
  O **editor (SPLIT 4) coda contra esta interface** com um provider manual (entrada à mão); o
  **SPLIT 6 só pluga o provider de portfólio** — assim o portfólio **não reabre** `StudyPlanEditor.tsx`
  (preserva a regra "arquivo quente reescrito 1x").
- **`ExtractionResult`** (saída da IA antes da conferência):
  `{ institution, campus, courses[]: { fields, confidencePerField }, modelUsed, tokens, cost }`.

---

## 5. SPLITS (organizados por área de código)

> Cada split deixa sua área **na forma final**. Ordem em §7. Cada split = 1 branch + 1 commit
> (ou poucos), com type-check + `node --test` verdes e, quando toca dinheiro/datas/RLS, build.

> **Revisão arquitetural (architecture-critic, 2026-06-15):** plano validado como ~90% pronto;
> veredito "pode executar SPLIT 0". Correções integradas: unicidade de `contacts` por org (não
> global), `proposal_events` alinhado ao `events` woofed, `current_org_id()` anti-recursão, ordem
> do `org_id NOT NULL`/seed UUID fixo/índices no SPLIT 0, contrato `CourseSource` (editor↔portfólio),
> dono do backfill de dinheiro no SPLIT 1, e MCP/pgvector cortados do SPLIT 7 (fase CRM).

### SPLIT UI — Shell & Design System (woofed-shaped, pele Movy)  ✅ FEITO (2026-06-15)
**Objetivo:** migrar a interface inteira para a linguagem visual do **woofed-crm** (P10),
mantendo a **marca Movy** (roxo `#4B1A77` + dourado `#FBB615` + Clash Display/Satoshi).
É **frontend-puro e independente do SPLIT 0** — pode rodar antes/em paralelo. Decisão de marca:
"interface do woofed, cara da Movy". Sem VPS: o woofed é blueprint (Caminho B); replicamos
lendo o código-fonte do clone `C:/dev/woofed-crm`.

**Camada de DS (feito nesta sessão):** porte da camada `@layer components` do woofed para
`app/globals.css`, remapeada às nossas CSS vars light/dark via tokens `--ds-*`. Classes
semânticas disponíveis para todas as telas: `color-fg-*`, `color-bg-surface-*`,
`color-bg-fill-*`, `color-border-*`, `typography-*`, `button-menu-default-md(-selected)`,
`button-fill-primary-md`, `button-outline-secondary-md`, `button-blank-secondary-icon`,
`navbar-container`, `woo-input`, `ds-label`.

**Shell (feito nesta sessão):** `components/layout/AppShell.tsx` reescrito woofed-shaped —
sidebar **colapsável** (208↔76px, persistida em `localStorage`), ícones **Lucide**
(`lucide-react`, já instalado), item ativo via `button-menu-default-selected-md`, settings
fixado no rodapé, topbar por página (`navbar-container`) com breadcrumb + tema + menu de conta,
drawer mobile. Sidebar agora é **superfície clara bordada** (anatomia woofed) em vez do rail
roxo; em dark vira a superfície roxa do tema.

**Arquivos:** `app/globals.css` (tokens `--ds-*` + `@layer components`),
`components/layout/AppShell.tsx`. Sem mudança de schema, sem `as any`.

**Telas não-split migradas (feito 2026-06-15):** `home`, `wiki` (lista/artigo/blocos),
`departments/[slug]`, `settings/users`, `error`, e skeletons de loading
(home/wiki/departments) — Lucide + classes DS + tokens dark-safe (`rgba(var(--ink-rgb),…)`,
`var(--surface)`, `var(--font-body)`). Removido código morto + `as any` em `home`.

**Exclusões conscientes (sem retrabalho):**
- **Câmbio** (`cambio/page.tsx`, `FxConverter/FxStats/FxRatesTable/FxChart`): já 100% token-based
  e theme-aware — reescrever em classes DS seria no-op visual com risco de regressão.
- **`FinancialCalculator.tsx`**: é o **documento financeiro imprimível** (`.fc-*` em papel branco,
  Outfit/Space Mono) — intencionalmente papel nos 2 temas, igual ao PDF da proposta (P documentado).

**Pendente (folda nos splits):** telas **donas de split** adotam o DS dentro do próprio split —
3 (lista `study-plans/page.tsx`), 4 (editor `StudyPlanEditor.tsx`), 5 (proposta/PDF). Os `as any`
restantes (ligados a `study_plans`) são quitados no **SPLIT 0** (regen de tipos).

**Aceite:** ✅ shell colapsável em light/dark/mobile; ✅ type-check + build verdes; ✅ telas
não-split migradas sem regressão; restante folda nos splits 3/4/5.
**Depende de:** —

### SPLIT 0 — Fundação de dados & tenancy-ready
**Objetivo:** schema base multi-org-ready + quitar `as any`. Tudo depende disto.
**Schema (migration 009):** `organizations` (+ seed Movy com **UUID determinístico/fixo**);
`org_id` em `profiles`, `allowed_emails`, `audit_logs`, `study_plans`; `current_org_id()`;
reescrever policies para incluir `org_id = current_org_id()`; default `org_id` = Movy.
- **Campos de integração (antecipado, §3.7):** prever `metadata jsonb` e `external_id` nullable
  ao introduzir entidades de negócio; reservar idempotência determinística para ops futuras.
**Correções de robustez (do architecture-critic):**
- **`current_org_id()` anti-recursão:** lê de `auth.jwt() → app_metadata.org_id` com fallback à
  query; `SECURITY DEFINER STABLE` + `search_path` fixo. Policy de `profiles` **não** pode chamar
  função que consulta `profiles` (recursão infinita de RLS).
- **Ordem do `org_id NOT NULL`:** add **nullable** → **backfill** para UUID-Movy → **set default** →
  **set NOT NULL** (nunca NOT NULL direto numa tabela com linhas).
- **Índices:** `org_id` em todas as tabelas + compostos com colunas filtradas (RLS injeta
  `org_id=current_org_id()` em toda query; sem índice degrada).
- **Policy extensível:** deixar a policy de `study_plans` num formato que o SPLIT 2 (soft-delete/
  hard-delete) **estende**, não substitui inteiro.
**Arquivos:** `supabase/migrations/009_*.sql`, `types/supabase.ts` (regenerar),
`types/database.ts`, `lib/auth/get-user.ts` (expor `orgId`), `lib/supabase/*` (sem mudança de API).
**Aceite:** login + telas atuais funcionam idênticos; RLS por org ativo; nenhum `as any` novo;
type-check verde.
**Depende de:** —

### SPLIT 1 — Engine de cálculo (fonte única + snapshot + dinheiro em centavos)
**Objetivo:** P2 + P3 + P9. Consolidar cálculo, validar no servidor, definir `ComputedTotals`,
**migrar dinheiro para centavos inteiros + moeda** (compatível woofed `*_in_cents`).
`currency_code` acompanha **cada valor** persistido (não só a org) — fronteira Movy↔Lago é
inteiro→inteiro (§3.7 / docs/LAGO-WOOFED-CONVERGENCE.md).
**Arquivos:** `lib/study-plans/calculations.ts` (mantém puro; opera em centavos; adiciona
`computeProposal`), novo `lib/calc/index.ts` (reexport/organização) e `lib/calc/money.ts`
(helpers cents↔display, `Intl`), integrar `lib/financial/calculator.ts`, server action
`app/[locale]/(protected)/study-plans/actions.ts` (revalida + grava `computed`),
`tests/study-financial.test.mjs` (estende casos + casos de arredondamento em centavos).
**Não** mexe em UI ainda; a UI converte na borda.
**Backfill de dinheiro (dono explícito):** floats já gravados em `study_plans.data` (jsonb) **não**
recebem migration aqui — o engine **lê legado float na borda** (helper de coerção) e só persiste
centavos a partir do próximo salvar. (Se for preciso normalizar em massa, fica no SPLIT 2/migration 010.)
**Aceite:** `computeProposal` cobre todos os totais em centavos; server grava `computed` ao
salvar; sem float em dinheiro novo; legado lido sem quebrar; testes verdes incluindo
offshore/visto/arredondamento.
**Depende de:** SPLIT 0.

### SPLIT 2 — Domínio da proposta (study_plans) + seam de contatos (CRM-ready)
**Objetivo:** P5/P7/P8/P10 no dado: status estendido, soft-delete, expiração, snapshot,
multi-opção, duplicar, timeline, **e extrair `contacts`** (woofed-shaped) para a proposta
referenciar `contact_id`. **Toda a evolução do modelo de proposta de uma vez.**
**Schema (migration 010):** `contacts` (woofed-compatível: email/phone únicos, custom_attributes);
`study_plans.contact_id` (+ `deal_id` reservado nullable); migrar `data.student/email/phone` →
`contacts`; estender enum `study_plan_status`; `+computed`, `+currency_code`, `+expires_at`,
`+accepted_at`, `+deleted_at`; `proposal_events`; policies (soft-delete, admin hard-delete).
- **Antecipar (§3.7):** `contacts.external_id` (nullable, único por org) + `metadata jsonb` em
  `contacts`/`study_plans`; `study_plans.computed` em cents+`currency_code` + chave idempotente
  estável (p/ virar item faturável na v3 sem migração destrutiva). Sem criar invoice.
**Arquivos:** `migrations/010_*.sql`, `lib/study-plans/types.ts` (status, options[], computed,
contactRef), novo `lib/crm/contacts.ts` (tipos/queries), `study-plans/actions.ts` (duplicate,
archive, softDelete, restore, hardDelete, changeStatus, upsertContact, emite `proposal_events`),
`types/supabase.ts`.
**Aceite:** proposta referencia contato; duplicar/arquivar/lixeira/restaurar/expirar via actions;
eventos gravados; nenhum dado de estudante perdido na migração; type-check + build verdes.
**Depende de:** SPLIT 0, 1.

### SPLIT 3 — Lista de propostas (UI)
**Objetivo:** gestão da lista. **Reescreve `study-plans/page.tsx` inteiro uma vez.**
**Arquivos:** `app/[locale]/(protected)/study-plans/page.tsx`, `components/study-plans/NewQuoteButton.tsx`,
talvez `components/study-plans/ProposalList*.tsx` (novos), `messages/pt.json`.
**Recursos:** checkbox + seleção total, ações em lote (excluir/arquivar/duplicar/exportar),
ações por linha (abrir/editar/duplicar/PDF/arquivar), status visual, busca, filtros
(status/tipo/data), ordenação, paginação, lixeira, toasts.
**Aceite:** lista usável com filtros/paginação; ações em lote e individuais via actions do SPLIT 2.
**Depende de:** SPLIT 2.

### SPLIT 4 — Editor de proposta (UI)
**Objetivo:** o maior ganho de usabilidade. **Refatora `StudyPlanEditor.tsx` (~11k tok) em wizard.**
**Arquivos:** `components/study-plans/StudyPlanEditor.tsx` (quebrar em subcomponentes por etapa),
`app/[locale]/(protected)/study-plans/[id]/page.tsx`, `messages/pt.json`.
**Recursos:** wizard (Cliente → Preferências → Cursos → Custos → Revisão) com barra de progresso;
**barra fixa** Salvar/Publicar/Salvar-e-sair; **autosave** + "salvo há Xs" + recuperação;
**painel de totais fixo** (Total/Entrada/Saldo/BRL) lendo `computeProposal`; **explicação do
cálculo** ao clicar no número; validação datas × validade do visto (`visaExpiry`); seleção de
curso a partir do portfólio (após SPLIT 6) com fallback à entrada manual.
**Aceite:** consultor monta proposta por etapas, vê totais ao vivo, salva sem rolar; autosave OK.
**Depende de:** SPLIT 1, 2. (Integração portfólio = SPLIT 6.)

### SPLIT 5 — Visualização / PDF / compartilhamento da proposta
**Objetivo:** página de proposta vira central de ação + apresentação chamativa.
**Arquivos:** `components/study-plans/StudyPlanProposal.tsx`,
`app/[locale]/(protected)/study-plans/[id]/proposal/page.tsx`, rota de link público (nova),
geração de PDF server-side (nova).
**Recursos:** barra superior fixa (voltar/editar/duplicar/PDF/imprimir/compartilhar/link/arquivar);
navegação lateral por seção; modos (interno/cliente/impressão/mobile/PDF); capa + branding +
seções ricas; múltiplas opções/comparador; link público + aceite; validade/expiração visível.
**Aceite:** PDF/print fiéis (papel branco nos 2 temas, P já documentado); link público abre sem login.
**Depende de:** SPLIT 2, 4.

### SPLIT 6 — Portfólio (domínio + UI)
**Objetivo:** instituição → campus → curso → preços/promoções. **Aposenta `course_presets`.**
**Schema (migration 011):** tabelas §3.2 + RLS por org; script de migração `course_presets`→`courses`.
**Arquivos:** `migrations/011_*.sql`, `lib/portfolio/*` (novo: tipos, queries), telas novas
`app/[locale]/(protected)/portfolio/**`, item de nav (`AppShell.tsx`), `lib/study-plans/presets.ts`
(adaptar/depreciar), `messages/pt.json`, `types/supabase.ts`.
**Recursos:** CRUD instituições/campus/cursos, abas (visão/campus/cursos/promoções/taxas/docs/
histórico), busca/filtros, duplicar, arquivar, indicador de completude/vigência, alerta de preço vencido.
**Aceite:** editor (SPLIT 4) consome portfólio; presets antigos migrados; sem perda de dado.
**Depende de:** SPLIT 0; integra com SPLIT 4.

### SPLIT 7 — Import documental por IA
**Objetivo:** o diferencial. Pipeline P5 completo.
**Schema (migration 012):** `documents` + bucket Storage `school-docs`.
**Arquivos:** `migrations/012_*.sql`, `lib/ai/*` (camada plugável de modelo + OCR), rotas
`app/api/portfolio/import/**` (upload, process, extract), telas
`app/[locale]/(protected)/portfolio/documents/**` (fila + conferência + comparação de vigência).
**Recursos:** upload (PDF/Excel/imagem); OCR → LLM → validação determinística; tela de conferência
com % de confiança; comparação com preço atual (variação %); publicar/atualizar/criar vigência/
revisar depois; fila com estados, tokens, custo, modelo; escolha modelo rápido/preciso.
**Compatibilidade woofed (só o necessário):** reusar contagem de tokens/custo em
`organizations.ai_usage` (espelha `accounts.ai_usage`) e config de modelo (api_key/model como
`apps_ai_assistents`).
**FORA DE ESCOPO deste split (adiar p/ fase CRM, §8/futuro):** **MCP** (expor/consumir via servidor
MCP) e **pgvector/embeddings** — o pipeline OCR→LLM→validação determinística **não precisa de
embeddings** (embedding é do assistente/chat do CRM, fora de escopo agora). Cortado para não
sobre-engenheirar uma agência single-tenant.
**Aceite:** PDF de price list vira cursos revisáveis; nada salvo sem aprovação; auditoria + versão.
**Depende de:** SPLIT 6 (precisa do destino: courses/price_versions).

### SPLIT 8 — Organização, branding, settings & preferências
**Objetivo:** base do white-label + prefs de usuário.
**Arquivos:** `app/[locale]/(protected)/settings/**` (org/branding/prefs), `AppShell.tsx`,
`messages/pt.json`, possivelmente `organizations.branding`.
**Recursos:** branding da agência (logo/cores/cabeçalho/rodapé das propostas — alimenta SPLIT 5);
prefs por usuário (idioma, tema, fuso, notificações); gestão de usuários por org; papéis adicionais
(revisor/financeiro) se necessário; export de usuários/permissões.
**Depende de:** SPLIT 0; alimenta SPLIT 5.

### SPLIT 9 — Polimento transversal
**Objetivo:** o que cruza tudo, feito por último para não retrabalhar.
**Recursos:** toasts/spinners/skeletons padronizados, a11y/WCAG (alt/aria/contraste),
atalhos de teclado, ajuda contextual (tooltips + links wiki), observabilidade (Sentry),
endpoints destrutivos → POST/PUT + CSRF, anonimização de dados sensíveis em logs/exports, LGPD.
**Depende de:** transversal (aplicado após cada área estabilizar).

---

## 6. Matriz feature → área de código (prova de não-retrabalho)

| Feature pedida | Split que entrega | Arquivo/Tabela principal |
|---|---|---|
| Ações lote / lixeira / filtros / paginação (lista) | 2 (dado) + 3 (UI) | `study_plans`, `study-plans/page.tsx` |
| Duplicar proposta | 2 (action) + 3 (botão) | `actions.ts` |
| Wizard / autosave / barra fixa / totais ao vivo | 4 | `StudyPlanEditor.tsx` |
| Explicação do cálculo / validação de datas | 1 (engine) + 4 (UI) | `calculations.ts`, editor |
| Cálculo financeiro em contexto | 1 + 4 | `lib/financial/calculator.ts`, editor |
| Múltiplas opções / comparador | 2 (dado) + 5 (UI) | `data.options[]`, `StudyPlanProposal.tsx` |
| Status rico / expiração / timeline | 2 | `study_plans`, `proposal_events` |
| PDF / link público / compartilhar / aceite | 5 | proposta + rota pública |
| Cadastro instituição/campus/curso | 6 | `portfolio/**`, migration 011 |
| Preços versionados / promoções / vigência | 6 | `course_price_versions`, `promotions` |
| Import PDF por IA / fila / conferência | 7 | `documents`, `lib/ai/*` |
| Branding da agência na proposta | 8 (config) + 5 (render) | `organizations.branding` |
| Prefs de usuário (tema/idioma/fuso) | 8 | `settings/**` |
| Multi-agência / white-label futuro | 0 (fundação) | `org_id` em tudo |
| Toasts / a11y / observabilidade / segurança | 9 | transversal |

Cada arquivo "quente" (`study_plans`, `StudyPlanEditor.tsx`, `actions.ts`, `page.tsx`,
`StudyPlanProposal.tsx`) é reescrito **em um único split**, evitando abrir o mesmo código
em features diferentes.

---

## 7. Ordem de execução e dependências

```
0 Fundação ──▶ 1 Engine ──▶ 2 Domínio proposta ──▶ 3 Lista (UI)
                                   │                  
                                   └──▶ 4 Editor (UI) ──▶ 5 Proposta/PDF
0 ──▶ 6 Portfólio ──▶ 7 Import IA
                 └──(integra)──▶ 4 Editor
0 ──▶ 8 Org/branding/prefs ──(alimenta)──▶ 5
9 Polimento: transversal, ao final de cada bloco
```

**Sequência recomendada de entrega:** 0 → 1 → 2 → 3 → 4 → 6 → 5 → 7 → 8 → 9.
(Entrega valor de usabilidade cedo — 2/3/4 — antes do portfólio/IA, sem comprometer a fundação.)

---

## 7.1 Protocolo de execução & documentação por split (Definition of Done) — OBRIGATÓRIO

Nenhum split é considerado "pronto" sem cumprir TODOS os itens abaixo. Documentar não é
opcional: faz parte do split.

**Antes de começar um split**
- [ ] Reler a seção do split aqui e confirmar dependências satisfeitas.
- [ ] Detalhar o split em tarefas finas (todo list) ANTES de codar.
- [ ] Atualizar `docs/PRODUCT-ROADMAP.md` se o desenho mudar (o doc é vivo).

**Durante**
- [ ] Um split por vez; deixar cada arquivo na forma FINAL pretendida (sem meio-termo).
- [ ] Sem `(supabase as any)`: regenerar `types/supabase.ts` após cada migration.
- [ ] Toda mudança de regra de negócio passa por `lib/study-plans/calculations.ts` (fonte única).

**Ao concluir (gates)**
- [ ] `npm run type-check` verde.
- [ ] `node --test` (testes de cálculo) verde; estender testes quando tocar dinheiro/datas.
- [ ] `npm run build` verde quando o split toca dinheiro, status, RLS ou rotas.

**Documentação obrigatória ao concluir (OpenWolf + docs)**
- [ ] `.wolf/memory.md` — entrada com ação, arquivos, resultado, ~tokens.
- [ ] `.wolf/cerebrum.md` — registrar QUALQUER decisão de arquitetura/preferência nova.
- [ ] `.wolf/buglog.json` — registrar qualquer bug encontrado/corrigido no caminho.
- [ ] `.wolf/anatomy.md` — registrar arquivos/tabelas novos.
- [ ] `docs/AI-HANDOVER.md` — entrada no "Log de Handover" com o que mudou e onde parou.
- [ ] `docs/PRODUCT-ROADMAP.md` — marcar o split como concluído e anotar desvios do plano.
- [ ] Migrations comentadas (o quê/por quê) e idempotentes.

**Commit**
- [ ] Commit próprio por split (ou poucos), mensagem clara; correções de bug em commit separado.
- [ ] Sem segredos; logs locais do OpenWolf (`token-ledger.json`, `hooks/_session.json`) não vão no commit.

## 8. Itens explicitamente fora de escopo (por enquanto)
CRM ativo / pipeline de vendas (será o **woofed-crm** — ver §3.6/§10.1); integrações com SEC,
sistemas das escolas, ERPs; gateway de pagamento; assinatura eletrônica via terceiros
(DocuSign/Adobe); e-mail marketing. Ficam para fase posterior, sobre esta fundação CRM-ready.

**Futuro documentado (não acionável agora):** billing/metering usage-based via **Lago** —
ver `docs/FUTURE-LAGO-V3.md` (avaliação) e `docs/LAGO-WOOFED-CONVERGENCE.md` (cruzamento
estrutural Lago × woofed × Movy + padrões de engenharia travados desde a v0).

## 10. Decisões em aberto (precisam do dono do produto)

### 10.1 Estratégia de integração com woofed-crm (KEY)
Três caminhos para "virar um produto só". A fundação (§Split 0–2) deixa todos viáveis; mas
precisamos escolher o alvo para não otimizar contra o caminho errado.

| Caminho | Como | Prós | Contras |
|---|---|---|---|
| **A. Mono-Postgres** | woofed (Rails) + Movy (Next/Supabase) no MESMO Postgres; woofed dono do CRM, Movy dono de portfólio/proposta; ligados por `contact_id`/`deal_id` | Sem sync; uma verdade | Conflito de convenção (bigint×uuid, Devise×Supabase Auth, **Rails não usa RLS**); 2 sistemas de migration; acoplamento operacional; risco de segurança p/ SaaS |
| **B. Absorver no stack Supabase** | Reimplementar o domínio CRM do woofed **nativo** na Movy (mesmos nomes/semântica/UX) | 1 stack limpo (uuid/RLS/TS); white-label/multi-tenant de verdade; controle total; "usar a estrutura" = reusar schema+UX | Reimplementar o que o woofed já faz (chat, kanban, WhatsApp); diverge do upstream |
| **C. Dois serviços + API/MCP** | Rodar woofed como serviço de CRM; Movy = portfólio/proposta; integrar via REST/webhooks/MCP do woofed | Aproveita o woofed pronto; baixo acoplamento de schema; cada app idiomático | Duplicação/sync de contatos; sistema distribuído; woofed ainda não é multi-tenant; 2 deploys |

**DECISÃO (2026-06-15, dono do produto): Caminho B — absorver o modelo woofed no stack Supabase.**
Espelhar schema/nomes/UX/dinheiro do woofed nativamente na Movy (1 stack: uuid/RLS/TS estrito,
multi-tenant white-label de verdade), mantendo **C viável** como fallback. **A está descartado**
(choque Devise×Supabase Auth + Rails-sem-RLS, perigoso para SaaS). O woofed é a **blueprint de
schema e UX** do CRM, não necessariamente o código a rodar. Reimplementações idiomáticas honram
nomes/semântica do woofed (§3.6) para migração/convergência trivial.

---

## 11. Glossário rápido
- **Split** = unidade de trabalho por área de código, executada inteira de uma vez.
- **Snapshot** = cópia congelada de preço/cálculo gravada na proposta (respaldo histórico).
- **Tenancy-ready** = schema/RLS já preparados para múltiplas agências, mas rodando só pra Movy.
- **ELICOS / VET / HE** = idioma / técnico / ensino superior (regras de cobrança diferentes).
