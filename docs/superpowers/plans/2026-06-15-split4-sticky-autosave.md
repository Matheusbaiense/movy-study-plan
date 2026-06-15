# SPLIT 4 (slice 2): sticky totals bar + autosave — Implementation Plan

**Goal:** Consultant sees live totals while editing and never loses work — without the full wizard refactor or migration 012.

**Delivered:**
- `EditorStickyBar` — fixed bottom bar with Total / Fechamento / Saldo parcelar from `computeProposal`, save status ("Salvo há Xs"), Salvar + Proposta/PDF.
- Autosave — debounced 2.5s after edits; manual Salvar still available.
- Header Salvar removed (actions consolidated in sticky bar).

**Deferred (SPLIT 4 wizard slice 3+):** step wizard, explain panel, BRL column, comparador, cenários, templates, version history (migration 012).
