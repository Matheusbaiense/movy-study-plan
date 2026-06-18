# Simulador de cursos (cálculo avulso) — Design

> Data: 2026-06-18 · Estado: aprovado · Autor: sessão Claude/Opus

## Problema

Às vezes o consultor só quer **planejar curso + férias** (cursos, semanas, férias, datas,
parcelas, visto, total em AUD/BRL) **sem criar uma proposta** (sem contato, sem registro no
banco). Hoje o único caminho de cálculo é `/study-plans/[id]`, que exige um contato + linha
`study_plans` no banco. Falta um modo "rascunho/calculadora" rápido.

## Decisões (validadas com o dono)

1. **Efêmero + ponte opcional para proposta.** Nada é persistido enquanto o consultor calcula.
   Um botão "Transformar em proposta" cria contato + `study_plans` semeado com o cálculo, **só**
   no clique explícito. Segue o padrão do `ScenarioPanel` (nada a remapear no woofed = migration-safe /
   white-label-safe — regra-mãe).
2. **Item de nav próprio**, nomeado **"Simulador"** (a nav já tem "Capacidade Financeira" e
   "Câmbio"; "Calculadora de cursos" colidiria). Rota `/calculator`. Ícone `Calculator`/`Sparkles`.
3. **Picker de portfólio + cabeçalho leve.** Reusa o `CoursePortfolioPicker` (preço por
   mercado/país). Como não há contato, a calculadora tem um cabeçalho com seletor de
   **Nacionalidade** (`countryOptions`) + **Local** (onshore/offshore) que alimentam o picker.

## Arquitetura (composição — quase zero lógica nova)

O motor (`lib/study-plans/calculations.ts`) já é **puro e sem banco**: `computeProposal`,
`buildSchedule`, `planNewVisaDate`, `courseHolidayWeeks`, etc. Os editores foram **extraídos** no
SPLIT 4 (fatia B) justamente para reuso. **Não** reusamos o `StudyPlanEditor` inteiro (750 linhas,
preso a DB + autosave + wizard).

```
app/[locale]/(protected)/calculator/
  page.tsx                       ← server, fino. requireActor() + render do client. SEM DB.
components/calculator/
  CourseCalculator.tsx           ← 'use client'. Dono do StudyPlanData EFÊMERO em React state
                                     (createBlankStudyPlan). Sem autosave, sem persistência.
                                     Cabeçalho (nacionalidade+local) · CourseListEditor ·
                                     ExtraCostsEditor (colapsável) · painel de resultados ·
                                     timeline (buildSchedule) · alerta de visto · ScenarioPanel.
  ConvertToProposalModal.tsx     ← 'use client'. Reusa o mini-fluxo de lead do NewProposalModal
                                     (buscar existente / novo lead). No submit chama a action.
lib/study-plans/calculator.ts    ← PURO. buildProposalSeed(data, contact) → StudyPlanData limpo
                                     (student/email/phone do contato; remove computed/options/
                                     contactRef stale; mantém courses/extraCosts/studentLocation).
```

### Componentes reutilizados (sem duplicação)
- `CourseListEditor` — cards de curso + `CoursePortfolioPicker` (já aceita `nationality`/`location`).
- `ExtraCostsEditor` — custos extras (OSHC, visto…), colapsável.
- `ScenarioPanel` — comparador "e se?" por semanas.
- `computeProposal` + `formatMoney` (cents) — totais (Total/Fechamento/Saldo).
- `/api/fx` — equivalente em BRL (já tem fallback; BRL some se indisponível).
- `buildSchedule` + `formatDate` — tabela de timeline compacta. `planNewVisaDate` — alerta de visto.

## Ponte "Transformar em proposta" (único ponto que toca o banco)

Nova server action em `app/[locale]/(protected)/study-plans/actions.ts`:

```ts
createProposalFromCalculator(input: {
  data: StudyPlanData
  contact: { contactId: string } | { newLead: { fullName; email?; phone?; nationality? } }
}, locale): Promise<void>  // redirect → /[locale]/study-plans/[id]
```

- `requireEditor()` (igual às demais actions de proposta).
- Resolve/cria contato (reusa `upsertContactRecord` + `buildContactAttributes`; a nacionalidade
  do cabeçalho vira `custom_attributes` do contato, como no `NewProposalModal`).
- `withComputed(buildProposalSeed(data, contact))` — **recalcula no servidor** (não confia no
  cliente). Insere `study_plans` com `contact_id`, `status='draft'`.
- `emitProposalEvent('created', { from_calculator: true })` + `logAuditWithClient`.
- `redirect` para o editor `/study-plans/[id]`.

## Erros · Testes · i18n/marca

- **Erros:** `/api/fx` já tem fallback (BRL oculto se falhar). A ponte usa try/catch como o
  `NewProposalModal`; erros exibidos no modal.
- **Testes:** o motor já é coberto. Novo `tests/calculator.test.mts` cobre o helper puro
  `buildProposalSeed` (student/email/phone do contato; strip de computed/options/contactRef;
  preserva courses/extraCosts/studentLocation; imutável). Sem nova lógica de cálculo.
- **i18n/marca:** PT-first; tokens de tema (`t.accent`/`var(--*)`), sem hex novo, sem Bricolage.
- **Acesso:** página e action sob editor+ (mesmo nível das propostas).

## Fora de escopo (YAGNI)
- Salvar rascunhos de cálculo (nova tabela) — rejeitado (migration-safe).
- Reuso do wizard/autosave do `StudyPlanEditor`.
- Multi-opções no simulador (continua só no editor de proposta).
