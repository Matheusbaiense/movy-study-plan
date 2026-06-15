# Design — Fluxo "Criar proposta → escolher/criar lead" + preço por nacionalidade

- **Data:** 2026-06-15
- **Status:** aprovado para spec (aguardando revisão do dono antes do plano)
- **Splits relacionados:** núcleo do **SPLIT 4 (editor)** + uma migration pequena. NÃO é o SPLIT 4 inteiro.
- **Regra-mãe (P0):** white-label first — toda escolha assume Movy → multi-agência. `org_id` + RLS por
  org, unicidade por org, dinheiro em `*_in_cents`, nada hardcodado de marca.

## 1. Objetivo

Dar à criação de proposta a experiência dos melhores CRMs: o consultor clica em **Criar proposta**,
escolhe um **lead existente** ou **cria um novo lead** na hora, e cai no editor já com o contexto certo.
A nacionalidade do lead faz o **preço do curso se resolver sozinho** (país › mercado › normal), com
**override manual** quando o consultor quiser usar outro preço.

## 2. Escopo

**Dentro (este trabalho):**
1. Modal "passo 0" de criação de proposta: buscar contato existente OU criar novo lead inline.
2. `migration 012`: campo `contacts.nationality` (ISO-3166 alpha-2, nullable, org/RLS).
3. Resolução de preço por nacionalidade + **seleção manual** do preço no editor (Normal/Mercado/País).
4. Helpers de portfólio: `priceVersionLabel` + `CourseSource.listPrices`.
5. Ação `createProposalForContact` (cria `study_plan` com `contact_id`).

**Fora (outros splits, não regredir):**
- Editor completo do SPLIT 4 (wizard multi-etapa, autosave, barra fixa, totais ao vivo, comparador,
  cenários, templates) — fica para o SPLIT 4 cheio.
- Telas de gestão do catálogo/preços (cadastrar/editar/expirar versões) — **SPLIT 6B**.
- `proposal_templates`/`proposal_versions` — adiados (decisão do dono: 012 só com `nationality`).

## 3. Decisões (do Q&A com o dono, 2026-06-15)

- **Label do preço base = "Normal · padrão".**
- **Comportamento de preço:** sem nacionalidade → **Normal**; com nacionalidade → preço de **país/
  mercado** (mais específico vence); o consultor **pode trocar** entre o valor de nacionalidade e o Normal
  no editor. ⇒ o seam precisa **listar os preços disponíveis**, não só resolver um.
- **`contacts.nationality` entra agora** (`migration 012`, só esse campo).
- **Escopo = fluxo + elo de preço** (modal pick/create + nationality + fiação do `CourseSource`).

## 4. Modelo de dados

### 4.1 migration 012 — `contacts.nationality`
```sql
alter table public.contacts
  add column nationality text;            -- ISO-3166 alpha-2 (ex.: 'BR'); NULL = desconhecida
comment on column public.contacts.nationality is
  'ISO-3166 alpha-2 do lead; alimenta current_course_price (país > mercado > normal).';
```
- Nullable (lead pode entrar sem nacionalidade). Sem default de marca/país (white-label).
- RLS herdada da `contacts` (já org-scoped). Sem novo índice (cardinalidade baixa; filtragem é por org).
- Tipos regenerados após aplicar (sem editar `types/supabase.ts` à mão).

### 4.2 Preço — SEM mudança de schema
Já suportado por `course_price_versions(nationality, market_id)` + função `current_course_price`.
A versão com `nationality IS NULL AND market_id IS NULL` é o preço **Normal/padrão**.

### 4.3 Modelo de escopo de preço — CAMADAS, não modo (decisão 2026-06-15)
O preço NÃO é "país OU mercado" (toggle). São **três camadas que coexistem** e a mais específica vence
(`current_course_price` já implementa, migration 011 linhas 343-354): **país > mercado > normal**, depois
`valid_from` mais recente.

- **Normal · padrão** — base; cobre quem não tem regra mais específica.
- **Mercado** — grupo de países (`markets.country_codes[]`) nomeado uma vez e reusado; precifica vários
  países de uma vez (ex.: LATAM = 245).
- **País** — override pontual de 1 país por cima do mercado (ex.: Brasil = 240, Colômbia = 255).

**Regra-chave:** país e mercado são **independentes** — NÃO atrelar o preço de país a um mercado. Override
de país só onde a escola realmente diferencia (resolve "Colômbia ≠ Brasil dentro de LATAM" sem gambiarra).

**Cadastro (SPLIT 6B):** ao adicionar preço, escolhe escopo = Normal | Mercado (seleciona 1 mercado salvo)
| País (seleciona 1 país da lista mundial ISO-3166).

**Determinismo:** um país deve pertencer a **no máximo 1 mercado por org** (validado na UI de mercados do
6B). Sem essa regra, país em 2 mercados com preço cai no desempate por `valid_from` desc — funciona, mas é
ambíguo. Não é bloqueio deste trabalho (preço por país já cobre o caso); fica registrado para o 6B.

## 5. Camada de portfólio (`lib/portfolio`)

### 5.1 `priceVersionLabel(version, markets?)` — PURO, testável
Deriva a label de exibição de uma `course_price_version`:
- `nationality` setada → `País · <nome ou código>` (ex.: "País · Brasil")
- senão `market_id` setado → `Mercado · <market.name>` (resolve via lista de markets passada)
- senão → `Normal · padrão`
Retorna `{ kind: 'country'|'market'|'default', label, scopeValue }`.

### 5.2 `CourseSource.listPrices(courseId): Promise<PricedOption[]>`
Novo método no contrato (aditivo — não quebra `search`/`resolve`). Lista as versões **ativas/vigentes**
do curso, cada uma mapeada para:
```ts
interface PricedOption {
  priceVersionId: string
  label: string                    // de priceVersionLabel
  kind: 'country' | 'market' | 'default'
  snapshot: PriceSnapshot          // float, pronto pro editor (buildStudyCourse)
  matchesNationality?: string|null // qual nacionalidade essa versão atende
}
```
- `resolve(courseId, { nationality })` continua **auto-escolhendo** a mais específica (já implementado);
  o editor usa `listPrices` para mostrar o seletor de override.

### 5.3 `createProposalForContact(supabase, { orgId, contactId, actorId })`
- Cria `study_plans` com `contact_id`, `status='draft'`, `data` = `createBlankStudyPlan()` com
  `contactRef`/`student`/`email`/`phone`/nacionalidade espelhados do contato.
- Emite `proposal_events` (`kind='status_change'`/created) + `audit_logs`, como as ações do SPLIT 2.
- Retorna o `id` para o editor redirecionar.

## 6. UX — modal "passo 0"

```
[Criar proposta] ─▶ Modal "Para quem é essa proposta?"
   ├─ busca (typeahead em contacts, org-scoped)  ──▶ seleciona lead ──┐
   └─ "Criar novo lead" ▶ form inline                                 │
        (nome · email · telefone · nacionalidade)                     │
        └─ upsertContact (dedup email/telefone por org) ──────────────┤
                                                                       ▼
                                   createProposalForContact ─▶ abre /study-plans/[id] (editor)
```

- Busca: reusa/estende `lib/crm/contacts.ts` (ex.: `searchContacts(supabase, q)` org-scoped, limit ~8).
- Novo lead: form curto; nacionalidade = `<select>` de países (alpha-2). Validação leve (nome obrigatório).
- Componente client (`'use client'`) que chama uma **server action**; nada de `supabase as any`.
- No editor: cada curso do portfólio mostra "Preço aplicado: <label> ▼" com as `listPrices` para troca;
  trocar reconstrói o curso de `buildStudyCourse(snapshot)` da versão escolhida.

## 7. Considerações white-label

- `nationality` é por contato (por org via RLS); nenhuma suposição de "todos são brasileiros".
- `markets`/preços por org → cada agência define seus mercados e tabelas de preço (config, não reescrita).
- Labels e países vêm de dados/tabela de referência, não de strings de marca Movy.

## 8. Testes / DoD

- **Puros (node --test):** `priceVersionLabel` (país/mercado/normal + market name lookup);
  `listPrices` mapper (ordenação Normal→Mercado→País, label correta, cents→float).
- **Comportamento:** resolução auto (com/sem nacionalidade) já coberta; +teste de "override" reconstrói
  o curso a partir de outra versão.
- **Gates:** `npm run type-check` ✅ · `node --test` ✅ · `npm run build` ✅ (toca dinheiro → build obrigatório).
- **Migration 012** aplicada em `xpthmguzcbmndyyexfbt` + tipos regenerados (segue o padrão da 010/011).
- Docs/`.wolf` atualizados; commit próprio; push fast-forward para `origin/main`.

## 9. Dependências e ordem

- Depende de: SPLIT 2 (`contacts`), SPLIT 6A (`lib/portfolio` + `CourseSource`) — ambos ✅.
- Habilita o resto do SPLIT 4 (editor cheio) e a SPLIT 6B (gestão de preços usa `priceVersionLabel`).
