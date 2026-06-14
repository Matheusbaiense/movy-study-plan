# Convergência estrutural — Lago × woofed-crm × Movy

> **Status:** pesquisa + documentação (não altera código, schema ou migrations).
> **Objetivo:** cruzar a estrutura de **dois sistemas de referência** — **Lago** (billing/metering)
> e **woofed-crm** (CRM) — com o domínio da **Movy** (portfólio/proposta/cálculo), achar onde os
> três são **a mesma coisa estruturalmente** e travar esses padrões **desde a v0**, para não pagar
> retrabalho/migração destrutiva quando (e se) a v3 (billing) chegar.
>
> **Repos de referência:**
> - Lago — https://github.com/getlago/lago · docs https://docs.getlago.com · https://docs.getlago.com/llms.txt
> - woofed-crm — clonado em `C:\dev\woofed-crm` (Rails 7.1 + Postgres/pgvector + Devise)
>
> **Documentos irmãos:** `docs/FUTURE-LAGO-V3.md` (avaliação Lago, base desta análise) ·
> `docs/PRODUCT-ROADMAP.md` (arquitetura mestre, SPLITS, P1–P10).
> Última atualização: 2026-06-15

---

## 0. TL;DR

- **Os três sistemas só convergem de verdade em três eixos** — e são exatamente os eixos que
  custam **barato agora** e **caro depois**:
  1. **Dinheiro em unidade menor inteira + moeda explícita** (Lago `*_cents`+`currency` ≡
     woofed `*_in_cents` ≡ Movy P9 `*_in_cents`+`currency_code`).
  2. **Entidade cliente/tenant** (Lago `customers.external_id` ≡ woofed `accounts` ≡ Movy
     `organizations`/`org_id`) e **pessoa/lead** (woofed `contacts` ≡ Movy `contacts`).
  3. **Sinal de uso de IA** (woofed `accounts.ai_usage {limit,tokens}` ≡ Movy
     `organizations.ai_usage {limit,tokens}`, consumível pelo metering do Lago).
- **Cuidado de vocabulário (armadilha real):** a palavra **"events"** significa **coisas
  diferentes** nos três. Lago `events` = **medição de uso** (máquina → fatura). woofed `events` =
  **timeline de CRM** (humano: `kind`/`scheduled_at`/`done_at`/`from_me`/`status`). Movy
  `proposal_events` segue o **woofed** (timeline); o `events` do Lago é **outra categoria**, só
  relevante na v3. **Não conflar.**
- **Veredito de compatibilidade:**
  - **woofed ↔ Movy:** **alta** (é o objetivo declarado — Caminho B, §10.1 do roadmap). Movy é
    *superior* em uuid/RLS/multi-tenant/bigint; diverge só em auth (Devise×Supabase) e no fato de
    o woofed ser **single-account** (não multi-tenant).
  - **Lago ↔ Movy:** **alta no eixo certo** (dinheiro inteiro→inteiro, `org_id`↔`customer`, IA como
    fonte de evento), via **API/eventos/webhooks** — **nunca** absorvendo o schema do Lago.
  - **Lago ↔ woofed:** **baixa direta** (woofed não faz billing). Eles só se tocam **através da
    Movy**, nos três eixos do item acima.
- **O que vira padrão único desde já:** dinheiro-cents+moeda, `org_id`/RLS, naming woofed,
  `ai_usage {limit,tokens}`, **`metadata jsonb` + `external_id`/idempotência reservados** (NOVO).
- **O que NÃO antecipar:** tax engine, plans/charges, wallets, webhooks ricos, pgvector/MCP,
  entitlements. Tudo isso é v3+ e está corretamente fora de escopo.

---

## 1. Fontes (o que cada sistema realmente tem)

### 1.1 woofed-crm — schema real (`C:\dev\woofed-crm\db\schema.rb`)

Concreto, lido do `schema.rb` (Rails 7.1, ids `bigint`, gem `money`):

- **`accounts`** (tenant — **uma linha só**, single-account): `name`, `site_url`,
  `woofbot_auto_reply`, **`ai_usage` jsonb default `{"limit":16666667,"tokens":0}`**, `segment`,
  `number_of_employees`, **`currency_code` default `"BRL"`**, **`settings` jsonb**.
- **`contacts`**: `full_name`, `phone`, `email`, **`custom_attributes` jsonb**,
  **`additional_attributes` jsonb**, `app_type`/`app_id` (polimórfico). Índices **únicos GLOBAIS**
  em `phone` e `lower(email)`; índice em `additional_attributes->>'chatwoot_id'` (← **padrão de id
  externo via jsonb**, não há coluna `external_id`).
- **`deals`**: `name`, `status` default `"open"`, `stage_id`, `contact_id`, `custom_attributes`,
  `pipeline_id`, `position`, `created_by_id`, **`total_deal_products_amount_in_cents` bigint**,
  `lost_at`, `won_at`, `lost_reason`.
- **`deal_products`** (linha-snapshot): `product_id`, `deal_id`, **`unit_amount_in_cents` bigint**,
  **`product_identifier`** (snapshot), **`product_name`** (snapshot),
  **`total_amount_in_cents` bigint**, `quantity` bigint.
- **`products`** (catálogo): `identifier`, **`amount_in_cents` integer**, `quantity_available`,
  `description`, `name`, `custom_attributes`, `additional_attributes`.
- **`events`** (timeline CRM): `deal_id`, `contact_id`, `app_type`/`app_id`, **`kind` not null**,
  **`scheduled_at`**, **`done_at`**, **`from_me` bool**, **`status` integer**, `custom_attributes`,
  `additional_attributes`, **`title`**, `auto_done`.
- **`pipelines`** / **`stages`** (`position`), **`deal_assignees`**, **`deal_lost_reasons`**.
- **`custom_attribute_definitions`** (`attribute_model`/`attribute_key`/`attribute_display_name`).
- **IA:** **`apps_ai_assistents`** (`enabled`, `api_key`, `model` default `gpt-4o`, `auto_reply`,
  **`usage` jsonb `{"tokens":0}`**); **`embedding_documments`** (`source_type`/`source_id`,
  `content`, **`vector(1536)`** — pgvector, p/ assistente/chat).
- **Integrações:** `apps_chatwoots`, `apps_evolution_apis` (WhatsApp), **`webhooks`** (`url`,
  `status` — **simples**), **`oauth_*`** (Doorkeeper → MCP + OAuth), `installations`.
- **Auditoria/admin:** `motor_audits` (`auditable_*`, `audited_changes`, `request_uuid`) + suíte
  `motor_*` (motor-admin), `taggings`/`tags`.
- **Auth:** `users` (Devise).
- **Não tem:** coluna `external_id` dedicada (usa jsonb), **tabela de taxes**, **multi-currency
  por linha** (só `accounts.currency_code`), **`org_id`/multi-tenant** (é single-account).

### 1.2 Lago — objetos de domínio (docs/llms.txt; ver `FUTURE-LAGO-V3.md`)

- **`customers`**: **`external_id`** (id que VOCÊ controla), `currency` (ISO 4217), `name`,
  `email`, billing/tax config, customer portal.
- **`events`** (metering): **`transaction_id`** (chave de **idempotência**, única por evento),
  **`code`** (qual `billable_metric`), **`properties` jsonb** (campos que a métrica agrega),
  `timestamp`, e binding de assinatura via **`external_subscription_id`**. ⚠️ *Incerteza marcada:*
  o `FUTURE-LAGO-V3.md` cita `external_customer_id` no evento; a API atual liga o evento via
  `external_subscription_id` (e o customer por `external_id`). Conferir a API reference vigente
  ao implementar a v3 — não inventar campo.
- **`billable_metrics`**: `code`, `aggregation_type` (count/sum/max/unique/weighted_sum/latest…),
  `field_name`, filtros (`charge_filters`).
- **`plans`/`charges`/`fixed_charges`**, **`subscriptions`** (com `external_id`).
- **`invoices`/`fees`/`credit_notes`**: valores em **`*_cents` (inteiro) + `currency`**.
- **`wallets`** (créditos pré-pagos; rate crédito↔moeda; top-ups; saldos em `*_cents`).
- **`coupons`/`add_ons`**, **`features`/`privileges`** (entitlements), **taxes/`billing_entities`**,
  **`webhooks`** (ricos/assinados), **`alerts`** + revenue analytics, MCP (Lago AI).
- **Dinheiro:** sempre **unidade menor inteira (`*_cents`) + moeda ISO 4217**. Ids: `lago_id`
  (uuid interno) + **`external_id`** (seu).

### 1.3 Movy — hoje (migrations) e alvo (roadmap §3)

- **Hoje:** `study_plans` (001) = `id uuid`, `title`, `student_name`, `applicant_type`,
  `status` enum(`draft|sent|accepted|archived`), **`data` jsonb** (onde hoje mora dinheiro como
  **float**, via `number()` em `lib/study-plans/calculations.ts`), `created_by`/`updated_by`.
  `audit_logs` (001) = `actor_id`/`action`/`entity_type`/`entity_id`/`metadata jsonb`.
  **SPLIT 0 (migration 009, em aplicação):** `organizations` (`currency_code` default `AUD`,
  `settings` jsonb, **`ai_usage` jsonb `{"limit":0,"tokens":0}`**, `branding` jsonb) + `org_id`
  em `profiles`/`allowed_emails`/`audit_logs`/`study_plans` + **`current_org_id()`** + RLS por org.
- **Alvo (roadmap):** `contacts` woofed-shaped (**unicidade por org**, não global),
  `study_plans` + `contact_id` + `deal_id` (reservado nullable) + `computed jsonb` +
  `currency_code` + `expires_at`/`accepted_at`/`deleted_at`; `proposal_events` woofed-shaped;
  **dinheiro `bigint *_in_cents` + `currency_code`** (P9, SPLIT 1); portfólio
  `courses`/`course_price_versions` (SPLIT 6); `documents` com tokens/cost/model (SPLIT 7).

---

## 2. Matriz de cruzamento (Lago × woofed × Movy)

Legenda de **Convergência**: 🟢 = mesma coisa estruturalmente nos sistemas marcados; 🟡 = parcial /
mesma ideia com nuance; 🔴 = só existe em um (divergência). "Antecipar?" responde se vira padrão v0.

| # | Conceito estrutural | Lago | woofed-crm | Movy (hoje → alvo) | Convergência | Ação recomendada (SPLIT) |
|---|---|---|---|---|---|---|
| 1 | **Dinheiro = unidade menor inteira + moeda** | `*_cents` + `currency` | `*_in_cents` (integer; gem money) | float em `data` jsonb → **`bigint *_in_cents` + `currency_code`** | 🟢 **os 3** | **SIM** — P9 / **SPLIT 1**. `bigint` cents; `currency_code` acompanha **o valor**, não só a org. |
| 2 | **Tenant / conta** | `customers` (paga) | `accounts` (1 linha) | `organizations` (`org_id`) | 🟢 org↔account; Lago customer = a agência | **SIM** — **SPLIT 0** (009 já espelha: `currency_code`/`settings`/`ai_usage`/`branding`). |
| 3 | **Multi-tenant real (org_id + RLS)** | billing_entities (multi-customer) | **🔴 single-account** (artefato) | **`org_id` + RLS** (`current_org_id()`) | 🟡 Movy lidera; woofed NÃO é multi-tenant | **SIM** — **SPLIT 0**. Toda entidade carrega `org_id`. **Não** copiar índices globais do woofed. |
| 4 | **Pessoa / lead / cliente-final** | (parte do `customers`) | **`contacts`** (email/phone, custom_attributes) | `data.student` (texto) → **`contacts`** | 🟢 woofed↔Movy | **SIM** — **SPLIT 2**. `contacts` woofed-shaped, **unicidade por org**. |
| 5 | **Sinal de uso de IA** | `events`+`billable_metrics` (mede) | **`accounts.ai_usage {limit,tokens}`** + `apps_ai_assistents.usage {tokens}` | **`organizations.ai_usage {limit,tokens}`** (009) + tokens/cost/model (SPLIT 7) | 🟢 woofed↔Movy idêntico; Lago consome | **SIM** — **SPLIT 0/7**. Manter shape `{limit,tokens}`; SPLIT 7 grava tokens/cost/model. |
| 6 | **Config do modelo de IA** | (n/a — billing) | `apps_ai_assistents` (`api_key`/`model`/`usage`) | (futuro) config de modelo (SPLIT 7) | 🟡 woofed↔Movy | Parcial — **SPLIT 7** segue `api_key`/`model`/`usage{tokens}`. |
| 7 | **Timeline / tarefas (CRM)** | **🔴 não** (events = metering) | **`events`** (`kind`/`scheduled_at`/`done_at`/`from_me`/`status`/`title`) | `proposal_events` (alvo) | 🟢 woofed↔Movy | **SIM** — **SPLIT 2**. `proposal_events` = shape do `events` woofed. **≠ events do Lago.** |
| 8 | **Auditoria de sistema** | (logs internos) | `motor_audits` | **`audit_logs`** (`action`/`entity`/`metadata`) | 🟡 woofed↔Movy | Já existe (P8). Manter **separado** da timeline (item 7). |
| 9 | **Catálogo de itens** | `plans`/`charges` (recorrente) | **`products`** (`amount_in_cents`) | `courses`/`course_price_versions` (SPLIT 6) | 🟡 woofed↔Movy (Movy + rico: ELICOS/VET/HE + vigência) | Parcial — **SPLIT 6**. Lago plans é billing, não cotação. |
| 10 | **Linha-snapshot (preço congelado)** | `fees`/`invoice lines` | **`deal_products`** (`product_identifier`/`product_name`/`unit_amount_in_cents` copiados) | `data.options[].courses[]` snapshot | 🟢 padrão snapshot (deal_products↔Movy) | **SIM** — valida **P3/P4**; **SPLIT 1/2**. |
| 11 | **Moeda por entidade (ISO 4217)** | multi-currency por objeto | só `accounts.currency_code` | `organizations.currency_code` → **+`study_plans.currency_code`** | 🟡 Lago lidera (por objeto) | **SIM** — **SPLIT 1/2**. Proposta carrega `currency_code` (escola AUD × org BRL). |
| 12 | **`external_id` / id de sistema externo** | **`customers.external_id`** + `events.transaction_id` | **🔴 sem coluna** — usa `additional_attributes->>'chatwoot_id'` (jsonb) | **🔴 nada hoje** | 🟡 padrão importante, formas diferentes | **SIM (NOVO)** — reservar `external_id` (nullable) + `metadata jsonb`. **SPLIT 0/2**. |
| 13 | **Idempotência de integração** | **`transaction_id`** (evento) | (jobs GoodJob) | **🔴 nada** | 🔴 só Lago | **SIM (NOVO)** — chave idempotente determinística (`id`+versão) em ops que emitirão evento. **SPLIT 2**. |
| 14 | **Atributos custom (jsonb)** | `metadata` | **`custom_attributes`/`additional_attributes`** em quase tudo | `contacts.custom_attributes` (alvo) | 🟢 woofed↔Movy | **SIM** — **SPLIT 2** + padrão `metadata jsonb` (NOVO, item 12). |
| 15 | **Soft-delete / lixeira** | void/credit_note | `deleted_at` em `motor_*` | **`deleted_at`** (P7) | 🟡 Movy lidera | Já no roadmap (P7) — **SPLIT 2**. |
| 16 | **Webhooks** | ricos/assinados | `webhooks` (`url`/`status`) | **🔴 não** | 🔴 fricção | **NÃO antecipar** (integração v3). |
| 17 | **Taxes / impostos** | rico (`taxes`/billing_entities/Avalara) | **🔴 não** | **🔴 não** (extras: oshc/visa/admin em `data`) | 🔴 só Lago | **NÃO antecipar** (v3). Só garantir extras em cents+currency. |
| 18 | **pgvector / embeddings** | (Lago AI/MCP; billing não usa) | **`embedding_documments` vector(1536)** | **🔴 cortado do SPLIT 7** (fase CRM) | 🔴 fora de escopo | **NÃO antecipar** (confirmado no roadmap §SPLIT 7). |
| 19 | **MCP / OAuth (Doorkeeper)** | servidor MCP | `oauth_*` + MCP | **🔴 não** | 🔴 fora de escopo | **NÃO antecipar** (fase CRM/v3). |
| 20 | **Wallets / créditos pré-pagos** | `wallets` | **🔴 não** | **🔴 não** | 🔴 só Lago | **NÃO antecipar** (v3, candidata nº2 do `FUTURE-LAGO-V3.md`). |

---

## 3. Avaliação de compatibilidade

### 3.1 woofed ↔ Movy — **alta** (é o alvo declarado: Caminho B, §10.1)
- Mesmo vocabulário e semântica: `contacts`, `deals`, `products`/`deal_products`, `events`,
  `pipelines`/`stages`, `custom_attributes`. A Movy **reimplementa idiomaticamente** (uuid, RLS,
  TS estrito, `bigint`), **superando** o woofed em multi-tenant e segurança.
- **Divergências a respeitar (não copiar cegamente):**
  - **Auth:** woofed = Devise (`users`); Movy = Supabase Auth (`profiles`). Ponto de decisão aberto
    (§3.6 do roadmap); não tentar unificar agora.
  - **Single-account:** woofed tem **índices únicos globais** em `contacts` (phone/email) — artefato
    de instalação única. Na Movy isso **vazaria contatos entre orgs**: usar **unicidade por org**.
  - **Money type:** woofed mistura `integer` (`products.amount_in_cents`) e `bigint`
    (`deal_products`, `deals`). Movy padroniza em **`bigint`** (segurança de overflow — já no P9).

### 3.2 Lago ↔ Movy — **alta no eixo certo**, via API (nunca schema)
- **Dinheiro inteiro→inteiro:** a fronteira Movy→Lago é `*_in_cents`→`*_cents`, sem float arriscado.
- **Tenant:** `org_id` (Movy) ↔ `customers.external_id` (Lago) — determinístico, sem PII.
- **IA como fonte de evento:** `ai_usage`/tokens (SPLIT 7) é exatamente o sinal que o Lago mede.
- **Fronteira obrigatória:** Movy = dona do **dado/acesso** (proposta, RLS, roles); Lago = dono da
  **cobrança**. **Proposta (aluno) ≠ invoice (agência).** Não absorver o schema do Lago (AGPLv3 +
  over-engineering). Detalhes e pré-requisitos: `FUTURE-LAGO-V3.md` §3–5.

### 3.3 Lago ↔ woofed — **baixa direta**, convergem só pela Movy
- woofed **não faz billing**; Lago **não faz CRM**. O único contato real é **dinheiro em cents** e o
  **sinal de uso de IA** (`ai_usage`). Ou seja: os três só se encontram **no meio**, na Movy, e
  exatamente nos eixos do §4 abaixo. Isso confirma que **padronizar esses eixos na Movy desde a v0**
  é o que torna **ambas** as integrações futuras (CRM woofed e billing Lago) triviais.

### 3.4 Onde os TRÊS convergem o suficiente p/ virar padrão único já
1. **Dinheiro:** unidade menor inteira + moeda (itens 1, 10, 11).
2. **Cliente/tenant:** `org_id` ↔ `account` ↔ `customer.external_id` (itens 2, 4).
3. **Uso de IA:** `ai_usage {limit,tokens}` como sinal medível (itens 5, 6).

---

## 4. O que antecipar antes da v3 (priorizado, mapeado a SPLITS)

Ordenado por **(custo de não fazer agora) × (baixo custo de fazer agora)**.

| Prioridade | O que antecipar | Por que custa caro depois | SPLIT alvo | Estado |
|---|---|---|---|---|
| **P-A** | **Dinheiro `bigint *_in_cents` + `currency_code` em toda borda persistida** (nunca float). `currency_code` acompanha **o valor**, não só a org. | Migrar float→cents com dado vivo é destrutivo e arrisca arredondamento em proposta enviada (P3). | **SPLIT 1** (P9) | ✅ no roadmap (reforçar "currency por valor") |
| **P-B** | **`org_id` + RLS em toda entidade de negócio** (`current_org_id()`, índices em `org_id`). | Retrofit de tenancy + RLS em tabela populada = reescrita de policies + risco de vazamento entre orgs. | **SPLIT 0** | ✅ no roadmap (migration 009) |
| **P-C** | **`contacts`/`proposal_events`/(futuro)`deals` woofed-shaped, unicidade por org.** | Extrair `student` do jsonb depois quebra propostas; índice global vazaria contatos. | **SPLIT 2** (P10) | ✅ no roadmap |
| **P-D** | **NOVO: `metadata jsonb` em toda entidade de negócio** (≈ `additional_attributes` woofed). | Sem ele, qualquer integração (Lago/Chatwoot/import) exige migration nova por campo. | **SPLIT 0/2** | 🆕 novo |
| **P-E** | **NOVO: `external_id` (nullable, único por org quando presente) em entidades de borda** (`contacts`, `study_plans`, futuros `documents`). | Mapear Lago `customer.external_id` / id de sistema externo sem coluna = jsonb frágil ou migration tardia. | **SPLIT 0/2** | 🆕 novo |
| **P-F** | **NOVO: chave de idempotência determinística** (`id`+versão, estilo `transaction_id`) em ops que poderão emitir evento externo (uso de IA, mudança de proposta). | Reenvio seguro de evento ao Lago/integração exige idempotência; introduzir depois reabre código quente. | **SPLIT 2** (alinha SPLIT 7) | 🆕 novo |
| **P-G** | **`ai_usage {limit,tokens}` fixo** + SPLIT 7 grava tokens/cost/model (`apps_ai_assistents`-shaped). | É a fonte dos eventos de billing da v3; shape divergente forçaria adaptador. | **SPLIT 0/7** | ✅ no roadmap |
| **P-H** | **`study_plans` modelável p/ virar item faturável sem migração destrutiva**: `computed` em cents + `currency_code` + chave estável (P-F). **Sem** criar invoice — só não fechar a porta. | Se o `computed` não for cents+moeda+idempotente, "faturar uso premium" na v3 vira migração. | **SPLIT 2** | 🟡 parcial (reforçar) |

> **Fora desta lista de propósito** (anti-over-engineering, ver §SPLIT 7 e `FUTURE-LAGO-V3.md`):
> webhooks ricos, taxes, wallets, plans/charges, entitlements, pgvector/MCP. São v3+.

---

## 5. Padrões de engenharia obrigatórios desde a v0 (regras curtas e verificáveis)

Marcação: **[JÁ]** = já no roadmap (P-x / §) · **[NOVO]** = recomendação desta análise.

- **R1 — Dinheiro [JÁ · P9].** Todo valor monetário persistido é **`bigint` em unidade menor
  (cents)** + **`currency_code` ISO 4217 explícito** junto ao valor. **Nunca** `float`/`numeric`
  solto na borda persistida. Engine opera em cents; UI formata com `Intl`.
- **R2 — Tenancy [JÁ · P1].** Toda entidade de negócio carrega **`org_id`** e é escopada por **RLS**
  (`org_id = current_org_id()`), com índice em `org_id`. Nenhuma tabela assume "uma só agência".
- **R3 — Naming de domínio [JÁ · P10].** Nomes/semântica seguem o **woofed**: `contacts`, `deals`,
  `products`/`deal_products`, `events`, `pipelines`/`stages`, `custom_attribute_definitions`.
- **R4 — Unicidade por org [JÁ · P10].** Chaves naturais (email/phone) são únicas **por org**,
  **nunca globais**. Não replicar os índices únicos globais do woofed (artefato single-account).
- **R5 — Snapshot [JÁ · P3/P4].** Linha de negócio guarda **cópia congelada** de preço/atributos
  (espelha `deal_products`: `product_identifier`/`product_name`/`*_in_cents`), não só FK.
- **R6 — `metadata jsonb` [NOVO].** Toda entidade de negócio tem um **`metadata jsonb`** (≈
  `additional_attributes` woofed) para extensão/integração **sem migração nova**.
- **R7 — `external_id` [NOVO].** Entidades de borda (`contacts`, `study_plans`, futuros
  `documents`/`events`) reservam **`external_id` nullable** (único por org quando presente) p/
  mapear sistemas externos — espelha `customers.external_id` (Lago) e o
  `additional_attributes->>'chatwoot_id'` (woofed).
- **R8 — Idempotência [NOVO].** Operações que poderão emitir evento externo (uso de IA, mudança de
  proposta) expõem uma **chave de idempotência determinística** (estilo `transaction_id`, derivável
  de `id`+versão) **desde já**, mesmo sem consumidor.
- **R9 — Uso de IA [JÁ · §3.1].** `ai_usage` tem shape fixo **`{limit, tokens}`**; config de modelo
  segue `apps_ai_assistents` (`api_key`/`model`/`usage{tokens}`).
- **R10 — Eventos separados [JÁ · P8 + NOVO clareza].** Três canais que **nunca** se fundem:
  **`audit_logs`** (auditoria imutável de sistema) · **`proposal_events`** (timeline de negócio,
  woofed-shaped) · **`events` do Lago** (metering — categoria à parte, só v3).
- **R11 — Domínios separados [NOVO · conceitual].** "**Customer/Invoice**" (cobrança da agência —
  Lago, v3) e "**Contact/Proposta**" (aluno — Movy, hoje) são domínios distintos; nenhum
  campo/tabela funde os dois.

**Checklist de revisão (PR):** toda tabela nova passa por R1–R7 antes do merge (dinheiro? cents+moeda;
entidade de negócio? `org_id`+RLS+índice; nomes woofed; unicidade por org; metadata jsonb;
borda? external_id+idempotência).

---

## 6. PATCHES A APLICAR (após SPLIT 0)

> **Por que aqui:** `docs/PRODUCT-ROADMAP.md`, `.wolf/cerebrum.md` e `.wolf/anatomy.md` estão sendo
> editados/commitados por **outro agente (SPLIT 0)** agora. Para evitar colisão, os textos abaixo
> ficam **prontos para colar** após o SPLIT 0 fechar. Todos são **aditivos** (apêndice/nova
> subseção), seguros independentemente do estado atual desses arquivos.

### PATCH 1 — `docs/PRODUCT-ROADMAP.md` · nova subseção **§3.7** (inserir ao final da Seção 3, logo após §3.5/§3.6)

```markdown
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
```

### PATCH 2 — `docs/PRODUCT-ROADMAP.md` · notas curtas nos SPLITS 0/1/2 (adicionar uma linha em cada bloco "Schema/Arquivos")

- **SPLIT 0** (após "Schema (migration 009)"): adicionar a linha:
```markdown
- **Campos de integração (antecipado, §3.7):** prever `metadata jsonb` e `external_id` nullable
  ao introduzir entidades de negócio; reservar idempotência determinística para ops futuras.
```
- **SPLIT 1** (no "Objetivo" ou "Aceite"): adicionar a frase:
```markdown
`currency_code` acompanha **cada valor** persistido (não só a org) — fronteira Movy↔Lago é
inteiro→inteiro (§3.7 / docs/LAGO-WOOFED-CONVERGENCE.md).
```
- **SPLIT 2** (no "Schema (migration 010)"): adicionar a linha:
```markdown
- **Antecipar (§3.7):** `contacts.external_id` (nullable, único por org) + `metadata jsonb` em
  `contacts`/`study_plans`; `study_plans.computed` em cents+`currency_code` + chave idempotente
  estável (p/ virar item faturável na v3 sem migração destrutiva). Sem criar invoice.
```

### PATCH 3 — `docs/PRODUCT-ROADMAP.md` · §8 (fora de escopo) — cross-link de futuro

Adicionar ao final da §8:
```markdown
**Futuro documentado (não acionável agora):** billing/metering usage-based via **Lago** —
ver `docs/FUTURE-LAGO-V3.md` (avaliação) e `docs/LAGO-WOOFED-CONVERGENCE.md` (cruzamento
estrutural Lago × woofed × Movy + padrões de engenharia travados desde a v0).
```

### PATCH 4 — `.wolf/cerebrum.md` · nova entrada de decisão arquitetural (anexar ao final da seção de decisões)

```markdown
## Decisão — Padrões de convergência Lago × woofed travados desde a v0 (2026-06-15)

**Contexto:** cruzamento estrutural de Lago (billing/metering) e woofed-crm (CRM) com o domínio
Movy (`docs/LAGO-WOOFED-CONVERGENCE.md`). Os três sistemas só convergem de verdade em: (1) dinheiro
em unidade menor inteira + moeda; (2) cliente/tenant (`org_id` ↔ `accounts` ↔ `customers.external_id`);
(3) uso de IA (`ai_usage {limit, tokens}`). woofed↔Movy = alta compat (Caminho B); Lago↔Movy = alta
via API/eventos (nunca absorver schema); Lago↔woofed só se tocam pela Movy.

**Decisão (regras v0, verificáveis em PR):**
- R1 dinheiro `bigint` cents + `currency_code` por valor; nunca float persistido (P9).
- R2 toda entidade de negócio: `org_id` + RLS + índice (P1).
- R3 naming/semântica woofed; R4 unicidade por org (nunca global); R5 snapshot de preço/atributos.
- R6 (NOVO) `metadata jsonb` em toda entidade de negócio.
- R7 (NOVO) `external_id` nullable (único por org) nas entidades de borda.
- R8 (NOVO) chave de idempotência determinística (estilo `transaction_id`) em ops que emitirão evento.
- R9 `ai_usage {limit, tokens}` fixo + modelo `apps_ai_assistents`-shaped.
- R10 três canais de evento separados: `audit_logs` ≠ `proposal_events` ≠ `events` do Lago (metering, v3).
- R11 Customer/Invoice (Lago, agência) ≠ Contact/Proposta (Movy, aluno) — domínios distintos.

**Não antecipar (v3+):** taxes, wallets, plans/charges, webhooks ricos, entitlements, pgvector/MCP.
**Consequência:** SPLITs 0/1/2 ganham R6/R7/R8 (ver patches §6 de LAGO-WOOFED-CONVERGENCE.md).
```

### PATCH 5 — `.wolf/anatomy.md` · registrar os novos docs (anexar à lista de docs)

```markdown
- `docs/LAGO-WOOFED-CONVERGENCE.md` — cruzamento estrutural Lago × woofed-crm × Movy: matriz de
  convergência, compatibilidade, o que antecipar antes da v3 (mapeado a SPLITS) e padrões de
  engenharia obrigatórios desde a v0 (R1–R11). Irmão de `docs/FUTURE-LAGO-V3.md`.
```

---

## 7. Terminologia (consistência com o roadmap)

`org_id`/`organizations` (tenant, P1) · `*_in_cents` + `currency_code` (P9) · `ai_usage {limit, tokens}`
(§3.1) · `current_org_id()`/RLS (SPLIT 0) · `proposal_events` woofed-shaped ≠ `audit_logs` ≠ `events`
do Lago · **proposta** (aluno, `study_plans`) ≠ **invoice** (agência, Lago) · SPLITS 0/1/2/7.
