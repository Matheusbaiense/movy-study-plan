# SPLIT 4 — fatia B: comparador de opções (`data.options[]`)

> Spec aprovada pelo dono (2026-06-15, "segue b1 e depois b2"). Sem migration.
> Referência de UX: `docs/competitor-allyhub-blueprint.md` (AllyHub QuotePlayground/TabSystem).

## Objetivo

Permitir múltiplas **opções** na mesma proposta (até 5), **editáveis independentemente** e
**comparadas lado a lado**, e renderizá-las pro aluno na proposta/PDF. Modelo AllyHub: abas
"Opção 1..N", cada uma com nome, mix próprio e total próprio; ações duplicar/editar/remover/recomendada.

## Modelo de dados (já existe — sem migration)

`StudyPlanData.options?: ProposalOption[]` já está nos tipos. Cada `ProposalOption =
{ id, label, courses[], extraCosts?, recommended?, computed? }`. Persiste em `study_plans.data` jsonb
via o autosave atual. Dinheiro em centavos no `computed` (woofed-shaped). **Opção 1 = o mix primário**
(`plan.courses`/`plan.extraCosts`); opções 2..5 vivem em `plan.options[]`.

## B1 — editor (este commit)

### 1. Extrair primitivos compartilhados → `components/study-plans/editor-ui.tsx`
Mover de `StudyPlanEditor.tsx` (sem mudar comportamento): `Section`, `Field`, `NumberInput`,
`MiniStat` + constantes de estilo (`input`, `ghostButton`, `dangerButton`, `pill`, `grid2`, `HAIR`).
Ambos `StudyPlanEditor` e `CourseListEditor` importam daqui (DRY).

### 2. Extrair `components/study-plans/CourseListEditor.tsx`
Recebe uma fatia e emite arrays novos (imutável):
`{ courses, extraCosts, studentLocation, nationality, onCoursesChange, onExtraCostsChange }`.
Contém os cards de curso + custos adicionais + `ModuleEditor` + os handlers de curso
(`updateCourse`, `updateModules`, `updateElicosPattern`, `setCourseStart`,
`updateStandardCourseDuration`, `applyPortfolioCourse`, `applyPriceSnapshot`). Nenhum acesso a
`plan` — só à fatia. O `StudyPlanEditor` passa a usá-lo nos passos **Cursos** e **Custos** para o
mix primário (prova de que a extração não quebrou nada).

### 3. `components/study-plans/OptionsManager.tsx` (passo Revisão)
- Abas: **"Opção 1 (principal)"** + cada `plan.options[]` + botão **"+"** (máx 5).
- Por opção (menu de ações): **renomear**, **duplicar** (clona courses+extras numa nova opção),
  **remover** (só extras; a principal não some), **marcar recomendada** (exclusiva).
- Aba ativa: edita o mix via `CourseListEditor`. Opção 1 edita o primário; opções extras editam
  `plan.options[i]`. Cada edição recomputa `computed` via `computeProposal` e persiste.
- **Faixa de comparação**: todas as opções lado a lado — Total/Fechamento/Saldo (de cada `computed`),
  selo "Recomendada". Em AUD.

### Helper puro (testável) → `lib/study-plans/options.ts`
`createOption(label, from?)`, `duplicateOption(option)`, `withRecomputed(option)` (preenche
`computed = computeProposal({ ...planBase, courses, extraCosts })`), `setRecommended(options, id)`.
Funções puras, imutáveis. **Sem UI.**

## B2 — proposta/PDF (commit seguinte)

`StudyPlanProposal` passa a renderizar as opções lado a lado quando `data.options?.length`, com a
recomendada destacada. Quando não há opções, mantém o render atual (1 mix). Sem mídia/branding rica
(isso é futuro — ver blueprint).

## Fora de escopo (de propósito)

Itens de acomodação/seguro/add-on; câmbio/IOF; landing page rica (mídia/like/WhatsApp); comissão;
payment plan por opção (payments seguem plano-level).

## Testes (APPEND)

`tests/study-financial.test.mjs` ou novo `tests/options.test.mjs`: `createOption`/`duplicateOption`
imutáveis e com novo id; `withRecomputed` produz `computed` em cents inteiros; `setRecommended`
marca exclusivo. **APPEND, nunca overwrite.**

## Gates

`npm run type-check` · `node --test tests/...` · `npm run build` antes de cada push.
