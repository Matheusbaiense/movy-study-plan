# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

## Session: 2026-06-15 (SPLIT 2 — proposal domain + CRM contacts seam, migration 010)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 05:xx | Grounded on SPLIT 2 scope + integration rules (R1/R6/R7/R8/R11) + 009 RLS conventions; inspected live `study_plans`/`data` shape via MCP | docs/PRODUCT-ROADMAP.md, LAGO-WOOFED-CONVERGENCE.md, migration 009, lib/calc/*, study-plans/* | full grounding | ~5k |
| 05:xx | Wrote migration 010: `contacts` (org-scoped, woofed-shape, R6 metadata + R7 external_id, unique-per-org partial idx, RLS), `study_plans` cols (contact_id/deal_id/currency_code/expires_at/accepted_at/deleted_at/metadata/external_id + R8 generated `idempotency_key`), enum extend (+6), `proposal_events` (timeline+RLS), soft-delete-aware SELECT policy | supabase/migrations/010_proposal_domain_contacts.sql (new) | written | ~5k |
| 05:xx | Applied 010 via Supabase MCP (DDL pass + idempotent non-destructive backfill pass): `data.student/email/phone`→`contacts` dedup→`study_plans.contact_id`; jsonb kept as working copy (editor relink = SPLIT 4) | MCP apply_migration on `xpthmguzcbmndyyexfbt` | 2 plans migrated, 0 loss | ~3k |
| 05:xx | Advisors check: no new ERRORs; only pre-existing WARNs (009 RLS security-definer helpers + auth leaked-password config). RLS on both new tables | MCP get_advisors | clean | ~1k |
| 05:xx | Regenerated types from live DB (not hand-edited) | types/supabase.ts (MCP generate_typescript_types) | contacts/proposal_events/new cols/enum present | ~2k |
| 05:xx | Domain layer: contacts lib (org-scoped queries + dedup upsert), extended study-plan types (StudyPlanStatus enum, options[], contactRef, new row cols) | lib/crm/contacts.ts (new), lib/study-plans/types.ts | written | ~3k |
| 05:xx | Server actions: duplicate/changeStatus/archive/softDelete/restore/hardDelete/upsertContact — each emits proposal_events + audit; getActor carries org_id; withComputed snapshot intact; list filters deleted_at IS NULL | study-plans/actions.ts, study-plans/page.tsx | written | ~3k |
| 05:xx | Tests: normalizeEmail/Phone + enum-extended assertion | tests/crm-contacts.test.mjs (new) | 3 new cases | ~1k |
| 05:xx | DoD gates | — | type-check ✅ · node --test 13/13 ✅ · build ✅ · migration applied · types regen | ~0.5k |
| 05:xx | Documented split | docs/AI-HANDOVER.md, docs/PRODUCT-ROADMAP.md (SPLIT 2 ✅), .wolf/{cerebrum,memory,anatomy}.md | logged | ~1k |

## Session: 2026-06-15 (SPLIT 1 — calc engine + money in integer cents + computed snapshot)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 04:xx | Explored current float calc shapes + jsonb `data` structure to ground the cents migration | lib/study-plans/calculations.ts, types.ts, lib/financial/calculator.ts, study-plans/actions.ts, defaults.ts, tests/study-financial.test.mjs | full grounding | ~4k |
| 04:xx | Created leaf money module: integer-cents helpers (`toCents` legacy-float border coercion + FP guard, `centsToNumber`, `splitCents`, `formatMoney`/`parseMoneyToCents` via Intl, `Money` type) | lib/calc/money.ts (new) | written | ~1.5k |
| 04:xx | Defined computed snapshot types + barrel | lib/calc/types.ts (new, `ComputedTotals`/`ComputedPerCourse`), lib/calc/index.ts (new) | written | ~1k |
| 04:xx | Refactored calc to a pure integer-cents core (`*Cents`) + `computeProposal`/`COMPUTED_VERSION=1`; kept float fns as `centsToNumber` delegators (UI untouched) | lib/study-plans/calculations.ts | single source in cents | ~3k |
| 04:xx | Added cents bridge to financial calculator (float math intact) | lib/financial/calculator.ts (`computeFinancialCapacityCents`) | engine-aligned | ~1k |
| 04:xx | Server recompute + persist snapshot under `data.computed` (jsonb, no migration, versioned); typed `StudyPlanData.computed?` | study-plans/actions.ts, lib/study-plans/types.ts | snapshot persisted | ~1k |
| 04:xx | Fixed `node --test` ERR_MODULE_NOT_FOUND (value relative import needs `.ts` under Node strip-types); enabled `allowImportingTsExtensions` | tsconfig.json, calculator.ts, calculations.ts | tests resolve | ~1k |
| 04:xx | Extended tests: cents rounding/drift, parse round-trip, splitCents, computeProposal snapshot, financial cents bridge | tests/study-financial.test.mjs | 10/10 green | ~1.5k |
| 04:xx | DoD gates | — | type-check ✅ · node --test 10/10 ✅ · build ✅ | ~0.5k |
| 04:xx | Documented split | docs/AI-HANDOVER.md, docs/PRODUCT-ROADMAP.md (§5 SPLIT 1 ✅), .wolf/{cerebrum,memory,buglog,anatomy}.md | logged | ~1k |

## Session: 2026-06-15 (OpenWolf — product repositioning master plan)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 02:xx | Studied current architecture to ground the new direction: study_plans (data jsonb), course_presets (flat), pure client-side calc engine, single-tenant RLS | migrations 001/008, lib/study-plans/*, study-plans/actions.ts | full grounding | ~5k |
| 02:xx | Wrote master architecture & roadmap: 3 pillars, tenancy-ready principle, target domain model, SPLITS by code area, execution order 0→1→2→3→4→6→5→7→8→9. CRM out of scope | docs/PRODUCT-ROADMAP.md (new) | plan persisted | ~6k |
| 02:xx | Logged decisions (repositioning, tenancy-ready, splits, calc single-source, portfolio replaces presets, AI never-saves-direct, quit `as any`) | .wolf/cerebrum.md | recorded | ~1k |
| 02:xx | Added product-direction pointer at top of handover; registered new doc in anatomy | docs/AI-HANDOVER.md, .wolf/anatomy.md | cross-linked | ~1k |
| 02:xx | Cloned + analyzed douglara/woofed-crm (Rails 7.1/Postgres/pgvector/Devise/GoodJob/MCP/money-in-cents; single-account; contacts/deals/pipelines/stages/products/deal_products/events) to ground CRM integration | C:/dev/woofed-crm (sibling, not committed) | full domain map | ~4k |
| 02:xx | Made roadmap CRM-ready/woofed-shaped: P9 money-in-cents, P10 woofed compat, §3.6 seam + domain map, contacts extraction in Split 2, money migration in Split 1, AI patterns in Split 7, §10.1 integration strategy A/B/C (rec: B-compat now) | docs/PRODUCT-ROADMAP.md, cerebrum, AI-HANDOVER | seam designed | ~3k |
| 02:xx | Studied woofed UI (ERB/Vite/Inertia/Stimulus + Tailwind `@layer components` DS: color-*/button-*/typography-* over palette + collapsible 72↔200 sidebar + per-page navbar + Lucide + shadcn vars + Nunito) from clone | C:/dev/woofed-crm app/views/layouts, application.tailwind.css, tailwind.config.js | full UI anatomy | ~4k |
| 02:xx | Decisions w/ user: VPS NOT needed (Caminho B = woofed is blueprint, source-as-reference); UI = woofed structure/tokens + Movy skin (purple/gold + Clash/Satoshi); start with foundation now | — | confirmed | ~0.5k |
| 02:xx | SPLIT UI foundation: ported woofed DS into globals.css as `@layer components` remapped to Movy CSS vars via `--ds-*` tokens (light/dark); rewrote AppShell woofed-shaped (collapsible 208↔76 persisted, Lucide icons, button-menu-* active, settings pinned, navbar-container topbar, surface sidebar not purple rail) | app/globals.css, components/layout/AppShell.tsx | type-check + build green | ~5k |
| 02:xx | Documented SPLIT UI in roadmap (frontend-only, independent of SPLIT 0; page migration folds into splits 3/4/5/6) | docs/PRODUCT-ROADMAP.md §5 | recorded | ~1k |

| 23:44 | Fixed documented pre-feature bugs: residual Bricolage, FYME teal seed color, and Manha label; validated in temp clone | wiki/page.tsx, departments/[slug]/page.tsx, StudyPlanEditor.tsx, knowledge seeds | type-check, study-financial test, build passed | ~2k |

## Session: 2026-06-14 22:54

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-06-14 (Antigravity IDE — redesign light/dark + fixes; NOT logged by that agent, reconstructed here)

> Reconstructed from the Antigravity walkthrough + git working tree on 2026-06-15.
> The Antigravity (Gemini) agent did this work but did not write to OpenWolf; logged retroactively.

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| --:-- | Built full light/dark design system: semantic CSS variable tokens (`[data-theme=light\|dark]`), anti-flash inline script, ThemeToggle | app/globals.css, lib/ui/theme.ts, app/layout.tsx, components/ui/ThemeToggle.tsx | both themes working | ~8k |
| --:-- | New typography via Fontshare: Clash Display (display) + Satoshi (body/ui/mono), Outfit as fallback; `font.mono` no longer monospaced | app/globals.css, lib/ui/theme.ts | applied app-wide | ~1k |
| --:-- | Migrated ~29 files from `color.purpleDeep`/hardcoded hex to theme tokens (`t.text`, `var(--surface)`, `ink(a)`) so dark mode doesn't break | cambio/*, financial, settings/*, wiki + blocks, study-plans editor/proposal, departments, home, error, AppShell | type-check clean | ~6k |
| --:-- | Removed Home KPI counter strip (users/docs/proposals) — noise for an internal tool, not a sales dashboard | app/[locale]/(protected)/home/page.tsx | removed DB count() calls | ~1k |
| --:-- | Fixed "white cut" / topbar-overlap bug in both themes: 100vh→100dvh, html/body bg=var(--bg), main scrolls internally (overflow-y:auto) | components/layout/AppShell.tsx, app/globals.css | resolved | ~1k |
| --:-- | Editor: split fields by course type (ELICOS / VET / Higher Education) — hide material panel where it makes no sense | components/study-plans/StudyPlanEditor.tsx | cleaner per-type form | ~2k |
| --:-- | Timeline premium colors (deep-purple→gold gradients) for screen + PDF print contrast | components/study-plans/StudyPlanProposal.tsx, StudyPlanEditor.tsx | applied | ~1k |
| --:-- | Legacy cleanup: nav label "Campanhas"→"Planos de Estudo"; legacy mentions removed from manifest | messages/pt.json, public/manifest.json | applied | ~0.5k |
| --:-- | (Claude, separate window) created test user testemovy@movy.com.br / teste123! (role admin); fixed GoTrue 500 by setting NULL token cols to '' | Supabase auth (prod xpthmguzcbmndyyexfbt) | login works | ~1k |
| --:-- | Documented-error fixes (staged for separate commit): manifest 404 (/pt/manifest.json), Draft→Rascunho, lang="pt-BR", legend contrast (WCAG), Wiki excerpt spacing | middleware.ts, study-plans/page.tsx, app/layout.tsx, WikiListItem.tsx, FxConverter.tsx, wiki/page.tsx | staged, not committed | ~2k |
| 08:52 | Edited docs/PRODUCT-ROADMAP.md | modified applyRules() | ~538 |
| 08:52 | Edited docs/PRODUCT-ROADMAP.md | modified reverso() | ~288 |
| 08:52 | Edited docs/PRODUCT-ROADMAP.md | modified pendente() | ~166 |
| 08:52 | Edited docs/PRODUCT-ROADMAP.md | modified pendente() | ~164 |
| 08:52 | Edited docs/PRODUCT-ROADMAP.md | modified 4() | ~487 |
| 08:53 | Edited docs/PRODUCT-ROADMAP.md | modified Schema() | ~581 |
| 08:53 | Edited docs/PRODUCT-ROADMAP.md | modified Schema() | ~78 |
| 08:53 | Edited docs/PRODUCT-ROADMAP.md | modified pede() | ~413 |
| 08:53 | Edited docs/PRODUCT-ROADMAP.md | expanded (+7 lines) | ~296 |
| 08:54 | Edited docs/PRODUCT-ROADMAP.md | modified revisada() | ~265 |
| 08:54 | Edited docs/PRODUCT-ROADMAP.md | modified ADIADAS() | ~466 |
| 08:54 | Edited docs/PRODUCT-ROADMAP.md | modified 15() | ~194 |
| 08:55 | Edited docs/AI-HANDOVER.md | modified o() | ~552 |
| 08:55 | Reconciliação: descoberto via export Cursor que SPLIT 1/2 já estão na main; ff-merge p/ 68c6db5; re-apliquei revisão do roadmap (motor de regras→SPLIT 6, versões/templates→migration 012/SPLIT 4, SPLIT 10 IA, 6 antes do 4) marcando 1/2 ✅ | docs/PRODUCT-ROADMAP.md, .wolf/cerebrum.md, docs/AI-HANDOVER.md | concluído (só docs) | ~12k |
| 08:56 | Session end: 28 writes across 2 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md) | 3 reads | ~10253 tok |
| 08:58 | Session end: 28 writes across 2 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md) | 4 reads | ~10253 tok |
| 09:02 | Edited lib/calc/money.ts | added 1 condition(s) | ~622 |
| 09:03 | Edited tests/study-financial.test.mjs | expanded (+16 lines) | ~268 |
| 09:04 | Edited docs/AI-HANDOVER.md | modified 1() | ~218 |
| 09:09 | Edited app/[locale]/(protected)/study-plans/actions.ts | added error handling | ~596 |
| 09:11 | Created app/[locale]/(protected)/study-plans/ProposalsList.tsx | — | ~5542 |
| 09:12 | Created app/[locale]/(protected)/study-plans/page.tsx | — | ~1552 |
| 09:14 | Edited docs/PRODUCT-ROADMAP.md | expanded (+11 lines) | ~478 |
| 09:14 | Edited docs/PRODUCT-ROADMAP.md | modified revisada() | ~63 |
| 09:14 | Edited docs/PRODUCT-ROADMAP.md | 2→2 lines | ~59 |
| 09:15 | Edited docs/AI-HANDOVER.md | modified reescrito() | ~470 |
| 09:15 | SPLIT 3 lista de propostas: page.tsx server (searchParams filtros/sort/paginação), ProposalsList.tsx client (seleção/lote/lixeira/menu/toasts), +bulkStudyPlanAction. type-check verde | study-plans/{page,ProposalsList,actions}.tsx | concluído | ~14k |
| 09:17 | Session end: 38 writes across 7 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 11 reads | ~20231 tok |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | modified Schema() | ~811 |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | 2→2 lines | ~44 |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~27 |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | 2→2 lines | ~55 |
| 09:22 | Edited docs/PRODUCT-ROADMAP.md | 2→2 lines | ~46 |
| 09:22 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~19 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | modified revisada() | ~318 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~44 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | "lib/calc/rules.ts" → "applyRules" | ~41 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | "lib/calc/scenarios.ts" → "computeScenarios" | ~35 |
| 09:24 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~23 |
| 09:24 | Edited docs/PRODUCT-ROADMAP.md | 2→2 lines | ~56 |
| 09:24 | Edited docs/AI-HANDOVER.md | expanded (+13 lines) | ~292 |
| 09:25 | SPLIT 6 quebrado em 6A (backend: schema+regras+CourseSource, destrava editor) + 6B (UI gestão). Roadmap restruturado, nova ordem 6A→4→6B→5 | docs/PRODUCT-ROADMAP.md, cerebrum, handover | concluído (docs) | ~6k |
| 09:25 | Session end: 51 writes across 7 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 11 reads | ~35329 tok |
| 09:34 | Created lib/calc/rules.ts | — | ~2220 |
| 09:34 | Created lib/calc/scenarios.ts | — | ~488 |
| 09:35 | Edited tests/study-financial.test.mjs | modified makeElicos() | ~262 |
| 09:35 | Edited tests/study-financial.test.mjs | expanded (+51 lines) | ~675 |
| 09:36 | Edited docs/AI-HANDOVER.md | modified 6A() | ~461 |
| 09:36 | SPLIT 6A parte 1/2: lib/calc/rules.ts (applyRules pré-processador puro, ruleSet vazio=no-op) + scenarios.ts + 5 testes (16/16). Motor de regras = camada agência (promo/desconto/fee), estrutural fica no engine | lib/calc/{rules,scenarios}.ts | concluído | ~10k |
