# FUTURO (v3) — Lago: metering & billing usage-based para a Movy

> **Status:** ideia de produto registrada para **v3** — explicitamente **NÃO é para agora**.
> Hoje o projeto está em **v0** (sem necessidade de monetização/cobrança). Este documento
> é **pesquisa + avaliação de compatibilidade**, não um compromisso de implementação.
> Não altera código, schema ou migrations.
>
> **Repo do Lago:** https://github.com/getlago/lago · Docs: https://docs.getlago.com ·
> Site: https://getlago.com
> Última atualização: 2026-06-15

---

## 0. Resumo / TL;DR

- **Lago** é uma plataforma **open-source de metering (medição de uso) e billing usage-based /
  por assinatura** (AGPLv3). É **API-first**, **payment-agnostic** (Stripe/Adyen/GoCardless) e
  roda em **self-host (Docker Compose)** ou **Lago Cloud**.
- **Onde encaixa na Movy (futuro):** cobrar **as agências pelo uso da própria Movy como SaaS** —
  em especial **medir e cobrar consumo de IA** (já temos a forma `organizations.ai_usage
  {limit, tokens}`, P/§3.1) e **wallets/créditos pré-pagos** (créditos de IA ou por proposta).
- **Sinergia forte:** Lago armazena dinheiro em **unidades menores inteiras** (`*_cents`),
  exatamente como o **P9** da Movy (`*_in_cents` + `currency_code`) e o woofed (`*_in_cents`).
  Multi-moeda ISO 4217 também alinha.
- **Modelo de integração recomendado:** **Lago como serviço externo separado** (self-host/cloud)
  que a Movy chama via **API + eventos + webhooks**. **NÃO** absorver o schema do Lago no
  Postgres/Supabase da Movy (isso seria over-engineering grave para v0–v2).
- **Cuidado conceitual:** **proposta** da Movy = documento **cliente-final** (cotação para o
  aluno) ≠ **invoice** do Lago = **cobrança da agência pela Movy**. São coisas diferentes; não
  conflar.
- **Veredito:** **compatível e promissor para v3**, com escopo enxuto (IA metering + wallets +
  plano SaaS). Prematuro hoje: v0 não tem clientes pagantes nem decisão de monetização SaaS.

---

## 1. O que é o Lago

Lago se descreve como a plataforma open-source de billing para modelos **usage-based,
por assinatura e híbridos** — *"if you can track it, you can bill for it"*. Pontos-chave:

- **Licença:** AGPLv3 (atenção: copyleft forte — ver §7 Riscos). Self-host via **Docker &
  Docker Compose**; ou **Lago Cloud** gerenciado.
- **API-first:** todas as features expostas em **REST API**, com **SDKs** oficiais (Node.js,
  Python, Ruby, Go) e **OpenAPI spec**. Há também **webhooks** e um servidor **MCP** (Lago AI).
- **Payment-agnostic:** orquestra pagamento por cima de gateways (Stripe, Adyen, GoCardless,
  etc.) — o Lago **não é** o gateway, ele decide *o que cobrar* e dispara a cobrança.

### Capacidades centrais (objetos do domínio Lago)

| Capacidade | O que faz | Objetos Lago |
|---|---|---|
| **Event ingestion / metering** | Ingestão em tempo real de eventos de uso, agregados por período de cobrança | `events` (endpoints `usage`/`batch`, até 100 por request), `billable_metrics` |
| **Billable metrics** | Define **como** os eventos agregam (count, sum, max, unique, weighted_sum, latest…) por propriedade do evento | `billable_metrics`, `charge_filters` |
| **Plans & charges** | Planos com taxa recorrente + **charges** usage-based; modelos de preço (standard, graduated, package, percentage, volume, dynamic); cadência in-advance / in-arrears | `plans`, `charges`, `fixed_charges` |
| **Subscriptions** | Atribui um plano a um cliente (assina/atualiza/upgrade/downgrade) | `subscriptions` |
| **Customers** | Cliente cobrável, com moeda, dados de faturamento, portal | `customers`, customer portal |
| **Invoicing** | Geração automática de invoices (assinatura + uso + créditos pré-pagos + one-off); finalizar, void, refresh, PDF, payment URL | `invoices`, `fees`, `credit_notes` |
| **Wallets / créditos pré-pagos** | Carteira que segura **créditos gratuitos ou pré-pagos**, com taxa crédito↔moeda; top-ups | `wallets`, wallet transactions |
| **Coupons / add-ons** | Descontos aplicados ao cliente; taxas one-time em invoices avulsas | `coupons`/`applied_coupons`, `add_ons` |
| **Entitlements** | Controle de acesso a features atrelado ao plano/assinatura | `features`, `privileges`, plan/subscription entitlements |
| **Taxes** | Impostos por cliente/entidade; integrações fiscais (ex.: Avalara) | taxes, `billing_entities` |
| **Multi-currency** | Moedas ISO 4217; valores em **unidades menores inteiras** (`*_cents`) | em todos os objetos monetários |
| **Alerts & analytics** | Alertas de uso/billing por assinatura; analytics de receita (MRR, tendências) | `alerts`, revenue analytics |
| **Cash collection** | Dunning, retries de pagamento, multi-gateway | payment_requests, payments |

> **Nota de precisão:** os nomes de objetos acima vêm do índice da API do Lago
> (https://docs.getlago.com/llms.txt) e do README. Não verifiquei campo-a-campo cada payload
> (ex.: nome exato de cada `*_cents`); ao implementar em v3, confira a API reference atual. O que
> é **certo** e relevante para nós: Lago opera em **inteiros de unidade menor** + moeda explícita.

---

## 2. Features candidatas (com mapeamento para o domínio Movy)

Ordenadas do **mais provável de fazer sentido** ao **menos**.

### 2.1 Metering de IA → billing usage-based da própria Movy (candidata nº 1)

- **Movy hoje:** `organizations.ai_usage = { limit: number, tokens: number }` (§3.1, espelha
  woofed `accounts.ai_usage`). O SPLIT 7 (import por IA) já registra **tokens/custo/modelo** por
  documento processado.
- **Mapeamento Lago:** cada extração/uso de IA vira um **event** (`code: "ai_tokens"`,
  `properties: { tokens, model }`) enviado à API de eventos do Lago, com `external_customer_id =
  org_id`. Uma **billable_metric** agrega (ex.: `sum` de `tokens`) e uma **charge** no plano da
  agência precifica o excedente acima do `limit`.
  > ⚠️ **Caveat (conferir na API reference ao implementar):** a API atual do Lago liga o **event**
  > à assinatura via **`external_subscription_id`** (e o customer por `external_id`), não por um
  > campo `external_customer_id` no evento. O `external_customer_id = org_id` citado aqui é o
  > mapeamento conceitual (org Movy ↔ customer Lago); validar o nome exato do campo do evento na
  > API reference vigente ao implementar a v3. Ver `docs/LAGO-WOOFED-CONVERGENCE.md` §1.2.
- **Por que encaixa:** a Movy já tem o **sinal de uso** e a fronteira de tenant (`org_id`). O
  Lago resolve a parte chata (agregação por período, faturas, dunning) sem reimplementar.

### 2.2 Wallets / créditos pré-pagos (candidata nº 2)

- **Caso de uso:** vender **créditos de IA** ou **créditos por proposta** pré-pagos às agências
  ("compre 1.000 extrações", "100 propostas premium").
- **Mapeamento Lago:** `wallet` por `customer` (= org), com taxa crédito↔moeda; consumo debita a
  wallet conforme os mesmos `events`. Top-up gera invoice de compra de crédito.
- **Por que encaixa:** modelo pré-pago combina bem com agência pequena (sem surpresa de fatura) e
  reusa o mesmo pipeline de eventos da §2.1.

### 2.3 Assinatura/plano para monetizar a Movy como SaaS (candidata nº 3)

- **Caso de uso:** cobrar uma **mensalidade por agência** (plano Base/Pro) + excedente de uso.
- **Mapeamento Lago:** `plan` (recorrente) + `subscription` por `org`; `org_id` da Movy ↔
  `external_customer_id` do Lago. **Entitlements** do Lago poderiam destravar features por plano
  — mas atenção, isso **compete** com o RLS/roles próprios da Movy (ver §3, over-engineering).
- **Interação com tenancy:** **1 organização Movy = 1 customer Lago**. O `current_org_id()` e o
  RLS continuam sendo a autoridade de **isolamento de dados**; o Lago só cuida de **cobrança**.

### 2.4 Multi-moeda + dinheiro em centavos (sinergia, não feature nova)

- **P9 da Movy:** `bigint` em `*_in_cents` + `currency_code`; engine opera em centavos, UI
  formata com `Intl`. **woofed:** `*_in_cents` (gem money).
- **Lago:** mesma filosofia — **unidades menores inteiras** + moeda ISO 4217. Logo a fronteira
  Movy↔Lago é **inteiro→inteiro**, sem conversão de float arriscada. Forte ponto a favor.

### 2.5 Invoicing — com uma fronteira conceitual obrigatória

- **NÃO conflar dois documentos:**
  - **Proposta Movy** (`study_plans` + `StudyPlanProposal.tsx`, P3 snapshot) = **cotação
    cliente-final** que a agência manda **para o aluno**. Continua 100% dona da Movy.
  - **Invoice Lago** = **fatura que a Movy (ou a plataforma) emite para a agência** pelo uso do
    SaaS. É outro público, outro ciclo, outro dado.
- Misturar os dois seria erro de modelagem. O Lago **não** deve gerar a proposta do aluno; e a
  proposta do aluno **não** deve virar invoice do Lago.

---

## 3. Avaliação de compatibilidade (o que encaixa / o que é over-engineering)

### ✅ O que encaixa bem

- **Centavos inteiros + moeda explícita:** alinhamento direto P9 ↔ Lago (§2.4).
- **`org_id` como chave de cliente:** a fronteira de tenant da Movy mapeia 1:1 para `customer`
  do Lago (`external_customer_id = org_id`). Tenancy-ready (P1) facilita isso.
- **Sinal de uso de IA já existe:** `ai_usage {limit, tokens}` + tokens/custo do SPLIT 7 são
  exatamente o tipo de evento que o Lago foi feito para medir.
- **Integração por API/eventos/webhooks:** combina com a Movy ser Next.js/Supabase (chamadas
  server-side + route handlers, como já fazemos com `/api/fx`).
- **Self-host alinhado à postura "1 stack que controlamos":** assim como o woofed virou blueprint
  no Caminho B, o Lago pode rodar como **serviço dedicado** sob nosso controle.

### ⚠️ O que é over-engineering / fricção

- **Absorver o schema do Lago no Supabase da Movy:** **não fazer.** Reimplementar billable
  metrics, charges, dunning, credit notes, etc. nativamente seria reescrever um produto inteiro.
  Diferente do woofed (onde o **Caminho B** faz sentido porque CRM é parte do núcleo do produto),
  **billing não é o núcleo da Movy** — é infra. Use o produto pronto via API.
- **Entitlements do Lago vs RLS/roles da Movy:** o Lago tem `features`/`privileges` por plano.
  Mas a Movy **já** tem autoridade de acesso (RLS por `org_id`, roles em `profiles`). Deixar o
  Lago controlar acesso a feature criaria **duas fontes de verdade** de autorização. Preferir:
  Lago decide **cobrança**; Movy decide **acesso**. Só sincronizar um flag de plano se necessário.
- **AGPLv3 (self-host):** copyleft forte. Rodar o Lago **como serviço separado** (processo/ça
  container próprio, comunicação por rede/API) é o padrão e mantém o código da Movy não-derivado.
  **Não** linkar/embutir código AGPL no app Next.js. Avaliar juridicamente antes da v3; Lago
  Cloud evita a questão de licença do self-host.
- **Operar mais um serviço:** Lago self-host = Postgres + Redis + workers + UI. Custo
  operacional real. Para v0–v2 (sem clientes pagantes) isso é peso morto. Lago Cloud reduz isso,
  mas aí é custo $ recorrente.
- **Reconciliação de dois bancos:** `org`/`profiles`/`ai_usage` na Movy vs `customers`/`wallets`/
  `subscriptions` no Lago. Vira **sistema distribuído** com sincronização eventual (webhooks).
  Aceitável, mas é complexidade que só se paga quando há receita real.

---

## 4. Modelo de integração recomendado

**Lago como serviço externo, integrado por API + eventos + webhooks.** Nunca absorver o schema.

```
                Movy (Next.js + Supabase, RLS por org_id)
                  │
                  │  (1) uso de IA / proposta premium acontece
                  ▼
        server action / route handler  ──(2) POST event──▶   Lago (self-host ou Cloud)
        (external_customer_id = org_id)                        - billable_metrics agregam
                  ▲                                            - plans/charges precificam
                  │                                            - wallets debitam crédito
                  │  (4) webhook: invoice criada / paga,       - invoices + cash collection
                  └──── wallet baixa, alerta de uso ───────────┘
                  │
                  ▼
        Movy reage: atualiza estado de billing do org (cache/flag),
        bloqueia/libera uso conforme limite, mostra status — SEM virar dona da fatura.
```

Princípios da fronteira:
- **Movy = dona do dado de negócio e do acesso** (propostas, portfólio, contatos, RLS, roles).
- **Lago = dono da cobrança** (medição → fatura → coleta). Uma direção de verdade para cada coisa.
- **Chave de junção:** `org_id` (Movy) ↔ `external_customer_id` (Lago). Determinístico, sem PII.
- **Idempotência:** eventos com `transaction_id` único (derivado do id do uso de IA/proposta)
  para reenvio seguro — espelha o cuidado do P3 (snapshot) e da idempotência de migrations.
- **Fallback:** se o Lago estiver indisponível, **enfileirar eventos** e reenviar (o uso de IA
  não pode travar a operação da agência por causa de billing).

Alternativa **Lago Cloud** vs **self-host**: começar a v3 (se chegar lá) em **Cloud** para validar
o modelo de monetização sem custo operacional de infra; migrar para self-host só se volume/licença
justificarem.

---

## 5. Pré-requisitos antes da v3 sequer considerar isto

Não abrir este tema enquanto **todos** abaixo não forem verdade:

1. **Existe decisão de monetização SaaS** — o dono do produto decidiu cobrar agências pela Movy
   (mensalidade, uso de IA, créditos). Sem isso, billing não tem propósito.
2. **Existem clientes pagantes reais (ou contratados)** — billing antes de receita é vaidade.
3. **Tenancy/`org` estável em produção** — SPLIT 0 (migration 009, `current_org_id()`, RLS por
   org) concluído, validado e rodando multi-org de verdade (não só "Movy" semeada).
4. **`ai_usage` virou tracking real** — SPLIT 7 medindo tokens/custo/modelo por org de forma
   confiável e auditável (a fonte dos eventos de billing).
5. **Dinheiro 100% em centavos** — P9/SPLIT 1 concluído (engine em centavos), para a fronteira
   Movy↔Lago ser inteiro→inteiro.
6. **Clareza jurídica de licença** — decisão Cloud vs self-host (AGPLv3) revisada.

Ou seja: isto vem **depois** da fundação (SPLITS 0–2), do import por IA (SPLIT 7) e de uma decisão
de negócio que **hoje não existe**.

---

## 6. Riscos e alternativas

**Riscos**
- **Licença AGPLv3** no self-host (copyleft) — mitigar rodando como serviço isolado ou usando
  Cloud; validar com jurídico.
- **Complexidade operacional** (mais um serviço com Postgres/Redis/workers).
- **Sincronização eventual** entre Movy e Lago (webhooks podem falhar — exige fila/retry).
- **Sobreposição de responsabilidade** (entitlements do Lago vs RLS/roles da Movy) — manter
  fronteira clara para não criar duas fontes de verdade de autorização.
- **Lock-in de modelo de preço** — desenhar planos/metrics cedo demais pode engessar pricing.

**Alternativas a considerar na época da decisão**
- **Stripe Billing puro** (sem Lago) — se o pricing for simples (assinatura fixa + talvez metered
  via Stripe). Menos poder de metering, menos infra, mas já temos afinidade com gateways.
- **Metering caseiro no Supabase** — uma tabela `usage_events` + agregação SQL + cobrança manual.
  Suficiente para os **primeiros poucos clientes**; evita operar Lago cedo demais. Pode ser o
  **passo intermediário** antes de adotar Lago quando o volume justificar.
- **Openmeter / outros** — avaliar o cenário open-source de metering vigente na época.

Regra prática: **só introduzir Lago quando o metering caseiro começar a doer** (muitos clientes,
pricing complexo, dunning/credit notes/multi-gateway de verdade). Antes disso, é peso.

---

## 7. Aviso explícito — isto é v3 (hoje v0)

- **Hoje (v0):** a Movy **não cobra ninguém**, não tem clientes pagantes e **não decidiu** o
  modelo de monetização. Construir metered billing agora seria **prematuro** e desviaria do
  norte do produto (propostas rápidas, portfólio com IA, cálculo confiável — §1 do roadmap).
- **Por que registrar mesmo assim:** para a ideia **não se perder** e para a fundação atual
  (centavos inteiros, `org_id`, `ai_usage`) ser reconhecida como **já compatível** com este
  futuro — sem exigir reescrita quando/se a v3 chegar.
- **Status fora de escopo:** alinhado ao §8 do `docs/PRODUCT-ROADMAP.md` (CRM/integrações
  externas/gateway de pagamento estão fora de escopo agora). Lago entra na **mesma categoria de
  futuro**, condicionado aos pré-requisitos da §5.

---

## 8. Terminologia (consistência com o roadmap)

- `org_id` / `organizations` — fronteira de tenant (P1, §3.1). Vira `external_customer_id` no Lago.
- `*_in_cents` + `currency_code` — dinheiro em inteiro de unidade menor (P9). Casa com `*_cents`
  do Lago.
- `ai_usage { limit, tokens }` — forma fixada em `organizations` (§3.1); fonte dos eventos de uso.
- **SPLIT 0 / 1 / 7** — fundação tenancy (009), engine em centavos, import por IA (tokens/custo).
- **Proposta** = documento cliente-final (`study_plans`); **invoice** = cobrança da agência (Lago).
  **Não** são a mesma coisa.

> **Pendência de cross-link:** convém adicionar, no futuro, **uma linha** em
> `docs/PRODUCT-ROADMAP.md` (§8 "fora de escopo" ou seção de futuro) apontando para este arquivo.
> Não foi feito agora para evitar colisão com edições paralelas do roadmap (SPLIT 0 em andamento).
