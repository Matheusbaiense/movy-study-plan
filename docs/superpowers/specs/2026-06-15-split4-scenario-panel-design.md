# SPLIT 4 — ScenarioPanel (comparador "e se?" por semanas)

> Spec aprovada pelo dono (2026-06-15). Fatia A do SPLIT 4.

## Problema

O consultor precisa comparar, lado a lado, como o **valor da proposta** muda conforme
a duração de estudo do curso principal. Em ELICOS **não existe duração padrão** (pode ser
4, 7, 20 semanas), então fixar "6/8/12 meses" mentiria sobre o domínio. A comparação é por
**semanas**, configuráveis pelo consultor.

## Decisão (regras-mãe do cerebrum)

- **WHITE-LABEL / WOOFED-SHAPED FIRST.** A opção mais segura de migração é a que **não cria
  dado novo**. O painel é **só-leitura e transitório**: nenhum estado é persistido, logo não
  há entidade a remapear/sincronizar no woofed. Zero schema, zero migration — aderente ao
  escopo da fatia A e ao princípio "snapshot, não recalcula".
- Se no futuro o dono quiser durabilidade, "aplicar cenário" só reescreve as semanas do curso
  real (que já trafega em `study_plans.data`) — sem schema novo. Fica como follow-up.

## Componente

`components/study-plans/ScenarioPanel.tsx` (`'use client'`).

- **Props:** `{ plan: StudyPlanData }`.
- **Baseline:** semanas de estudo do 1º curso via `courseStudyWeeks(plan.courses[0])`.
  Se não houver curso/semana de estudo, renderiza uma dica e nada mais.
- **Estado:** 3 colunas de semanas (`number[]`), semeadas uma vez como
  `[baseline, baseline+10, baseline+20]` (mín. 1, inteiros). Cada coluna é editável.
  Botão "Redefinir" reseme a partir do baseline atual.
- **Cálculo:** `computeScenarios(weeks.map(w => ({ label: \`${w} sem\`, plan: withFirstCourseStudyWeeks(plan, w) })))`.
  Ambos já existem em `lib/calc/scenarios.ts`. Puro, sem mutação do plano.
- **Render:** grid de 3 colunas (colapsa no mobile) reusando `movy-card`, tokens e um
  mini-stat local. Cada coluna mostra: input de semanas, **Total** (`grandTotalCents`),
  **Fechamento** (`upfrontSchoolsCents + extrasTotalCents`), **Saldo a parcelar**
  (`installmentBalanceCents`). Coluna que bate com o baseline ganha selo "Atual".
- **Moeda:** `formatMoney(cents, computed.currencyCode)`.

## Integração no editor

`StudyPlanEditor.tsx` (hot file — mudança cirúrgica):
1. `import { ScenarioPanel } from './ScenarioPanel'`
2. Renderizar `<ScenarioPanel plan={plan} />` dentro do passo **Revisão**, depois do card
   "Revisão da proposta". Sem mexer em `editor-wizard-steps.ts` nem na navegação.

## Testes (APPEND em `tests/study-financial.test.mjs`)

Acrescentar (nunca sobrescrever) casos para `lib/calc/scenarios.ts`:
- `withFirstCourseStudyWeeks` não muta o plano de entrada (identidade preservada).
- redimensionar o 1º curso muda `studyWeeks` e o `grandTotalCents` proporcionalmente.
- plano sem curso de estudo → `withFirstCourseStudyWeeks` retorna o plano inalterado.
- `computeScenarios` preserva ordem e rótulos; todos os cents são inteiros.

## Gates antes do push

`npm run type-check` · `node --test tests/...` · `npm run build`.

## Fora de escopo

Botão "Aplicar cenário"; persistência de cenários; cenários por curso != 1º;
`data.options[]` (isso é a fatia B); templates/versões (fatia C, migration 012).
