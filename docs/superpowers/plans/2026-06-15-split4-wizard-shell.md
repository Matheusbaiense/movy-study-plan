# SPLIT 4 (slice 3): wizard shell — Implementation Plan

**Goal:** Step-by-step proposal authoring (Cliente → Preferências → Cursos → Custos → Revisão) without migration 012.

**Delivered:**
- `editor-wizard-steps.ts` — step ids + prev/next helpers
- `EditorWizardNav` — progress bar, step pills, Anterior/Próximo
- `StudyPlanEditor` — one step visible at a time; Cliente (nome/email/tel); Preferências; Cursos; Custos (extras + pagamento); Revisão (resumo + alerta visto + timeline)

**Deferred:** explain panel, BRL, comparador, cenários, templates, version history (migration 012).
