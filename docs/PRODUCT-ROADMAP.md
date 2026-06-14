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

---

## 3. Modelo de domínio (alvo)

Notação: `tabela (colunas-chave)`. Toda tabela de negócio tem `org_id`, `created_at`,
`updated_at`, e (quando aplicável) `created_by`, `updated_by`, `deleted_at`.

### 3.1 Tenancy & acesso (existe parcialmente)
```
organizations (id, name, slug, status, branding jsonb, created_at)        [NOVO]
profiles (id, email, full_name, role, is_active, org_id→organizations)    [+org_id]
allowed_emails (email, role, org_id)                                       [+org_id]
audit_logs (id, org_id, actor_id, action, entity_type, entity_id, meta)   [+org_id]
```
Helper RLS: `current_org_id()` → `profiles.org_id` do `auth.uid()`. Toda policy passa a
incluir `org_id = current_org_id()`. Org "Movy" semeada; `org_id` default = Movy.

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
study_plans (id, org_id, title, student_name, applicant_type,
             status[enum estendido], data jsonb, computed jsonb [NOVO snapshot de totais],
             fx jsonb [câmbio travado], expires_at, accepted_at,
             created_by, updated_by, deleted_at [NOVO])
proposal_events (id, org_id, study_plan_id, actor_id, type, metadata, created_at)  [NOVO timeline]
```
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
- **`ExtractionResult`** (saída da IA antes da conferência):
  `{ institution, campus, courses[]: { fields, confidencePerField }, modelUsed, tokens, cost }`.

---

## 5. SPLITS (organizados por área de código)

> Cada split deixa sua área **na forma final**. Ordem em §7. Cada split = 1 branch + 1 commit
> (ou poucos), com type-check + `node --test` verdes e, quando toca dinheiro/datas/RLS, build.

### SPLIT 0 — Fundação de dados & tenancy-ready
**Objetivo:** schema base multi-org-ready + quitar `as any`. Tudo depende disto.
**Schema (migration 009):** `organizations` (+ seed Movy); `org_id` em `profiles`,
`allowed_emails`, `audit_logs`, `study_plans`; `current_org_id()`; reescrever policies para
incluir `org_id = current_org_id()`; default `org_id` = Movy.
**Arquivos:** `supabase/migrations/009_*.sql`, `types/supabase.ts` (regenerar),
`types/database.ts`, `lib/auth/get-user.ts` (expor `orgId`), `lib/supabase/*` (sem mudança de API).
**Aceite:** login + telas atuais funcionam idênticos; RLS por org ativo; nenhum `as any` novo;
type-check verde.
**Depende de:** —

### SPLIT 1 — Engine de cálculo (fonte única + snapshot)
**Objetivo:** P2 + P3. Consolidar cálculo, validar no servidor, definir `ComputedTotals`.
**Arquivos:** `lib/study-plans/calculations.ts` (mantém puro; adiciona `computeProposal`),
novo `lib/calc/index.ts` (reexport/organização), integrar `lib/financial/calculator.ts`,
server action `app/[locale]/(protected)/study-plans/actions.ts` (revalida + grava `computed`),
`tests/study-financial.test.mjs` (estende casos). **Não** mexe em UI ainda.
**Aceite:** `computeProposal` cobre todos os totais; server grava `computed` ao salvar; testes
verdes incluindo regras offshore/visto.
**Depende de:** SPLIT 0.

### SPLIT 2 — Domínio da proposta (study_plans)
**Objetivo:** P5/P7/P8 no dado: status estendido, soft-delete, expiração, snapshot, multi-opção,
duplicar, timeline. **Toda a evolução do modelo de proposta de uma vez.**
**Schema (migration 010):** estender enum `study_plan_status`; `+computed`, `+expires_at`,
`+accepted_at`, `+deleted_at`; `proposal_events`; policies (soft-delete, admin hard-delete).
**Arquivos:** `migrations/010_*.sql`, `lib/study-plans/types.ts` (status, options[], computed),
`study-plans/actions.ts` (duplicate, archive, softDelete, restore, hardDelete, changeStatus,
emite `proposal_events`), `types/supabase.ts`.
**Aceite:** duplicar/arquivar/lixeira/restaurar/expirar funcionam via actions; eventos gravados;
type-check + build verdes (mexe em dinheiro/status).
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
CRM / pipeline de vendas; integrações com SEC, sistemas das escolas, ERPs; gateway de
pagamento; assinatura eletrônica via terceiros (DocuSign/Adobe); e-mail marketing.
Ficam para uma fase posterior, sobre esta fundação.

---

## 9. Glossário rápido
- **Split** = unidade de trabalho por área de código, executada inteira de uma vez.
- **Snapshot** = cópia congelada de preço/cálculo gravada na proposta (respaldo histórico).
- **Tenancy-ready** = schema/RLS já preparados para múltiplas agências, mas rodando só pra Movy.
- **ELICOS / VET / HE** = idioma / técnico / ensino superior (regras de cobrança diferentes).
