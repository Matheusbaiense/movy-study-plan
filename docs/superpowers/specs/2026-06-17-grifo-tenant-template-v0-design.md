# Grifo — Tenant-Template v0 (Primeira Conexão hub↔Woofed) — Design

> Status: aprovado para virar plano de implementação (2026-06-17)
> Branch: `feat/grifo-tenant-template-v0`
> Escopo desta fatia: **a primeira conexão de código** — o hub Next.js lendo o
> Postgres do Woofed, já no formato de **tenant-template parametrizado**.

---

## 1. Contexto e decisões de arquitetura (Grifo)

**Grifo** é o produto **white-label vendável** do owner. Peças:

- **Hub** (`movy-study-plan`, Next.js + atualmente Supabase) — a "cara"/porta de entrada.
- **Woofed** (`woofed-crm`, Ruby on Rails + Postgres/pgvector + Redis + Sidekiq/GoodJob) —
  o **braço de CRM**, dono do schema, rebrandado p/ Grifo (rebrand é fatia futura).
- **Chatwoot** — serviço **à parte, já integrado ao Woofed**. Fora de escopo.

Decisões travadas no brainstorming (2026-06-17):

1. **Inclusão do Woofed = hub roda SOBRE o Postgres do Woofed.** O hub lê/escreve direto
   no banco do Woofed (fusão real, "um dado só"). Não é merge de codebase (Rails ≠ Next.js).
2. **Tenancy = database-per-tenant (isolamento por silo).** "Multi-tenant sem compartilhar
   banco." 1 cliente vendido = 1 stack isolado (hub + Woofed + Postgres). O Woofed é usado
   **single-account nativo** — sem reforma de multitenancy no Rails.
3. **Woofed é dono do schema.** As migrations do Rails são a fonte de verdade. O hub é
   **consumidor**; ele **não roda migrations** no Postgres do Woofed. Campo de negócio que o
   hub precise e não exista nativo vai em `custom_attributes` (jsonb); dado de integração/
   sistema em `additional_attributes`. Dinheiro em `*_in_cents`. (regras já no cerebrum)
4. **O tenant nasce gerenciável** (princípio "1 hora hoje vs 1 dia amanhã"). O **app** do
   painel de controle vem depois, mas o **contrato** dele entra agora: tudo config-driven,
   template parametrizado, registry de tenants, e um contrato de admin (token + health).
   Regra dura: **cliente pago nunca é provisionado na mão** — provisionar = rodar o template.

### Plano de 2 camadas (referência — só o tenant está em escopo aqui)

```
PLANO DE CONTROLE (Grifo Admin) — fatia futura
  └─ registry de tenants + provisioning via API EasyPanel + "entrar como"
PLANO DOS TENANTS (isolados)    — ESTA fatia entrega o template de UM tenant
  └─ hub + Woofed + Postgres, parametrizado por env
```

---

## 2. Escopo desta fatia (v0)

### Dentro (In)

- Subir o **Woofed local** (docker compose já traz Postgres+Redis; `./bin/dev` em :3001) com
  `db:seed`, para servir de fonte de dados real.
- **Camada de acesso Postgres** no hub (`lib/db/`) apontando para o Postgres do Woofed,
  **parametrizada por env** (`GRIFO_TENANT_ID`, `WOOFED_DATABASE_URL`).
- Reescrever **`lib/crm/contacts.ts`** para ler a tabela `contacts` do Woofed (hoje lê do
  Supabase).
- **Renderizar a lista de contacts** do Woofed numa rota existente/nova do hub.
- **Registry de tenants v0** — estrutura mínima (arquivo `config/tenants.ts` ou tabela), com
  1 tenant `demo`. Define identidade de tenant como first-class.
- **Contrato de admin stub** — `app/api/admin/health/route.ts` protegido por
  `GRIFO_ADMIN_TOKEN`, devolvendo status do tenant (nome, conexão OK, contagem de contacts).

### Fora (Out — próximas fatias)

- **Auth unificada (Devise do Woofed).** Nesta v0 o **login do hub continua no Supabase**;
  só os **dados de contacts** passam a vir do Woofed. Isso mantém a fatia fina e
  **não quebra o login atual**. A unificação de identidade é a fatia 2.
- Escritas/sync além de leitura de `contacts` (writes e outras entidades: fatias seguintes).
- Rebrand visual Woofed → Grifo.
- App do **painel de controle** e **provisioning** via API do EasyPanel.
- **Deploy na VPS** — v0 é **local** (provar a arquitetura na máquina primeiro).

---

## 3. Schema do Woofed em jogo (real — `db/schema.rb` v2026_06_01)

`contacts` (single-account, sem `account_id`):

| coluna | tipo | nota |
|---|---|---|
| `id` | bigint | PK |
| `full_name` | string | |
| `phone` | string | único (NULLIF '') |
| `email` | string | único por `lower(email)` |
| `custom_attributes` | jsonb | campos de negócio do hub vão aqui |
| `additional_attributes` | jsonb | integração (ex.: `chatwoot_id`) |
| `app_type` / `app_id` | string/bigint | origem (ex.: chatwoot/evolution) |
| `created_at` / `updated_at` | datetime | |

O hub mapeia essas colunas para seu tipo `Contact`. Campos do hub que não existirem aqui
**não viram coluna** — leem de `custom_attributes`.

---

## 4. Arquitetura da fatia (unidades)

| Unidade | Arquivo | Responsabilidade | Depende de |
|---|---|---|---|
| Conexão Postgres | `lib/db/woofed/pool.ts` | pool `pg` para o Postgres do Woofed, lido de `WOOFED_DATABASE_URL` | env |
| Resolução de tenant | `lib/db/tenant.ts` | resolve tenant atual via `GRIFO_TENANT_ID` → entrada no registry → conexão | registry |
| Registry | `config/tenants.ts` | lista de tenants (id, nome, domínio, conexão, plano, status); 1 `demo` | — |
| Repositório de contacts | `lib/crm/contacts.ts` (reescrita) | `SELECT` em `contacts`, mapeia p/ `Contact` | pool, tenant |
| UI | rota/page do hub que lista contacts | render | repositório |
| Admin contrato | `app/api/admin/health/route.ts` | health do tenant atrás de `GRIFO_ADMIN_TOKEN` | pool, registry |

**Cliente de banco:** `pg` (driver cru) nesta v0, com queries SQL explícitas e tipos `zod`/TS
no mapeamento. (Kysely/Drizzle por introspecção é uma evolução natural na fatia de schema —
fora de escopo aqui para manter a v0 enxuta. Em nenhuma hipótese a lib roda migrations.)

**Fluxo de dados:**
```
request → resolveTenant(env GRIFO_TENANT_ID) → registry → pool(WOOFED_DATABASE_URL)
        → SELECT … FROM contacts → map → Contact[] → render
```

**Erro/validação:**
- Conexão indisponível → erro claro e cedo (fail-fast), sem fallback silencioso.
- Coluna/shape inesperado → o mapeamento `zod` falha explícito (não mascara).
- `GRIFO_ADMIN_TOKEN` ausente/!= → 401 no endpoint admin.

---

## 5. Env / config (v0)

```
GRIFO_TENANT_ID=demo
WOOFED_DATABASE_URL=postgres://postgres:password@localhost:5432/woofed_crm_development
GRIFO_ADMIN_TOKEN=<token aleatório local>
# Supabase: mantém as vars atuais (login do hub ainda usa Supabase nesta fatia)
```

Tudo via env. **Zero** hardcode de marca, domínio ou conexão — trocar tenant é trocar env,
não código (critério de sucesso abaixo).

---

## 6. Riscos e mitigação

- **Quebrar o login do hub.** Mitigação: v0 **não toca auth**; Supabase Auth continua. Só os
  dados de `contacts` migram de fonte.
- **Hub rodar migration no banco do Woofed.** Mitigação: camada `lib/db` é leitura nesta v0;
  proibição explícita de migrations do lado do hub (Woofed é dono do schema).
- **Divergência de seed.** Mitigação: comparar a lista do hub com a do Woofed em `:3001` como
  teste de aceite.
- **Conexão direta Next.js↔Postgres sem pool adequado.** Mitigação: um pool `pg` único por
  processo; revisitar PgBouncer quando for à VPS (fora de escopo v0).

---

## 7. Testes

- **Integração:** com um Postgres Woofed seedado, `contacts.ts` retorna os mesmos contatos
  que o Woofed mostra. (AAA; sem mock do banco — exercita o caminho real.)
- **Unit:** mapeamento coluna→`Contact`, incluindo leitura de campo via `custom_attributes` e
  caso de `email`/`phone` vazios (índices NULLIF do Woofed).
- **Admin:** `/api/admin/health` → 200 com token válido, 401 sem token.

---

## 8. Critérios de sucesso (verificáveis)

1. `docker compose up -d` + `rails db:seed` no Woofed → hub local com
   `GRIFO_TENANT_ID=demo` e `WOOFED_DATABASE_URL` apontando p/ esse Postgres **lista os mesmos
   `contacts`** que aparecem no Woofed em `http://127.0.0.1:3001`.
2. Trocar `WOOFED_DATABASE_URL`/`GRIFO_TENANT_ID` aponta o hub para **outro** Postgres
   **sem alterar código** (prova o template parametrizado).
3. `GET /api/admin/health` com `GRIFO_ADMIN_TOKEN` válido devolve nome do tenant, conexão OK e
   contagem de `contacts`.
4. O login do hub (Supabase) **continua funcionando** (nada de auth foi quebrado).

---

## 9. O que esta fatia destrava (próximas fatias)

1. **Auth unificada** — hub autentica contra `users` (Devise) do Woofed; fim do Supabase Auth.
2. **Schema ownership / leitura+escrita** — demais entidades (`deals`, `pipelines`, `stages`,
   `products`, `events`) e writes.
3. **Rebrand Woofed → Grifo.**
4. **Painel de controle** (app) + **provisioning** via API EasyPanel (usa o registry desta v0).
5. **Deploy na VPS / EasyPanel** do tenant-template.
