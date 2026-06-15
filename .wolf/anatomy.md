# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-15T01:15:06.167Z
> Files: 8 tracked | Anatomy hits: 0 | Misses: 0

## components/study-plans/

- **CoursePortfolioPicker.tsx** — `'use client'` subcomponent for searching the course portfolio catalog, picking a course (calls `searchCoursesAction` + `resolveCourseAction`), and switching price versions (calls `listCoursePricesAction`). Props: `nationality`, `location`, `onApply`, `onPriceVersion`. ~103 lines.
- **EditorWizardNav.tsx** + **editor-wizard-steps.ts** — 5-step wizard nav (Cliente → Preferências → Cursos → Custos → Revisão).
- **StudyPlanEditor.tsx** — wizard shell; one step at a time; visa date warning on Revisão.
- **EditorStickyBar.tsx** — fixed bottom bar: Total/Fechamento/Saldo parcelar, save status, Salvar + Proposta/PDF links.
- **ScenarioPanel.tsx** — `'use client'` read-only "what if?" comparator (SPLIT 4 fatia A). Resizes 1st course study weeks into 3 configurable-week variants via `computeScenarios`+`withFirstCourseStudyWeeks`; shows Total/Fechamento/Saldo per column. No persistence. Prop: `plan`. Rendered in Revisão step.
- **editor-ui.tsx** — shared editor primitives extracted from StudyPlanEditor (SPLIT 4 fatia B): `Section`, `Field`, `NumberInput`, `MiniStat` + style tokens (`input`, `ghostButton`, `dangerButton`, `pill`, `grid2`, `HAIR`). Imported by StudyPlanEditor, CourseListEditor, ExtraCostsEditor.
- **CourseListEditor.tsx** — `'use client'` reusable course-cards editor (extracted from StudyPlanEditor). Operates only on a `courses` slice; props `{ courses, studentLocation, nationality, onCoursesChange }`. Owns ModuleEditor + all course handlers. Used by the primary mix AND each proposal option.
- **ExtraCostsEditor.tsx** — `'use client'` small "Custos adicionais" list editor. Props `{ extraCosts, onChange }`. Reused by primary + options.
- **OptionsManager.tsx** — `'use client'` AllyHub-style options tabs (SPLIT 4 fatia B). Opção 1 = primary mix; 2..5 = `plan.options[]`. Tabs + rename/duplicate/remove/recommended + side-by-side comparison strip (Total/Fechamento/Saldo via computeProposal). Props `{ plan, nationality, onChange }`. Rendered in Revisão step. Pure helpers in `lib/study-plans/options.ts`.
- **StudyPlanProposal.tsx** — client proposal/PDF render. SPLIT 4 fatia B2: when `data.options?.length`, renders `OptionsComparison` (options side by side, recommended highlighted) after the summary strip; otherwise unchanged single-mix render.

## ./


## .claude/


## .claude/rules/


## app/


## app/[locale]/


## app/[locale]/(protected)/


## app/[locale]/(protected)/dashboard/


## app/[locale]/(protected)/departments/


## app/[locale]/(protected)/departments/[slug]/


## app/[locale]/(protected)/financial/


## app/[locale]/(protected)/home/


## app/[locale]/(protected)/settings/


## app/[locale]/(protected)/settings/audit-log/


## app/[locale]/(protected)/settings/users/


## app/[locale]/(protected)/study-plans/

- `actions.ts` — Server actions for study plans + portfolio course search/resolve/listPrices (SPLIT 4). Exports: createStudyPlan, updateStudyPlan, duplicateStudyPlan, changeStudyPlanStatus, archiveStudyPlan, softDeleteStudyPlan, restoreStudyPlan, hardDeleteStudyPlan, bulkStudyPlanAction, upsertContact, searchContactsAction, createProposalForContact, deleteStudyPlan, searchCoursesAction, resolveCourseAction, listCoursePricesAction. (~5000 tok)
- `page.tsx` — Study plans list page; entry-point button is now `<NewProposalModal locale={locale} />`. (~1500 tok)
- `NewProposalModal.tsx` — Passo-0 modal for creating proposals; default export, prop `locale: string`. (~est tok)
- `ProposalsList.tsx` — Server-built view-model: all formatting done server-side, interaction client-side. (~5542 tok)

## app/[locale]/(protected)/study-plans/[id]/


## app/[locale]/(protected)/study-plans/[id]/proposal/


## app/[locale]/(protected)/wiki/


## app/[locale]/(protected)/wiki/[slug]/


## app/[locale]/(protected)/wiki/[slug]/edit/


## app/[locale]/(protected)/wiki/new/


## app/[locale]/(public)/login/


## app/api/admin/import-knowledge/


## app/api/imported/[name]/


## app/auth/callback/


## app/unauthorized/


## components/brand/


## components/departments/


## components/financial/


## components/layout/


## components/study-plans/


## components/wiki/


## components/wiki/blocks/


## data/


## docs/

- `AI-HANDOVER.md` — AI Handover - Movy Study Plan (~12877 tok)
- `PRODUCT-ROADMAP.md` — Movy — Arquitetura Mestre & Roadmap (Portfólio · Propostas · Cálculo) (~12792 tok)

## i18n/


## lib/


## lib/api/


## lib/auth/


## lib/calc/

- `money.ts` — integer-cents money primitives + legacy-float border coercion (toCents/centsToNumber). (~1712 tok)
- `rules.ts` — pure pricing-rules engine (agency/promo layer): applyRulesToCourse/applyRulesToPlan, PricingRule/RuleEffect. Empty ruleSet = no-op. (~2200 tok)
- `scenarios.ts` — pure computeScenarios + withFirstCourseStudyWeeks (N proposal variants side by side). (~600 tok)
- `types.ts`, `index.ts` — ComputedTotals/ComputedPerCourse + barrel.

## lib/constants/

- `countries.ts` — ISO-3166 alpha-2 country list (190 codes) + `countryName(code, locale)` via Intl.DisplayNames + `countryOptions(locale)` sorted {code,name} pairs for lead forms. (~600 tok)

## lib/crm/

- `contacts.ts` — org-scoped CRM contacts seam (SPLIT 2): queries + dedup upsertContact + searchContacts (typeahead) + woofed-shaped lead helpers (CONTACT_ATTR, getContactNationality, buildContactAttributes). RLS-scoped. (~1900 tok)

## lib/financial/


## lib/permissions/


## lib/portfolio/ — SPLIT 6A (catálogo normalizado + seam editor↔portfólio)

- `types.ts` — table aliases (institutions/campuses/courses/course_price_versions/markets/pricing_rules) + PURE mappers: priceVersionToSnapshot (cents→float), buildStudyCourse, rowToPricingRule/isRuleActiveOn/draftToInsert/draftToUpdate; CourseSource/PortfolioCourseRef/PriceSnapshot contracts. (~2300 tok)
- `queries.ts` — org-scoped reads: listInstitutions/listCampuses/listCourses/getCourseWithRefs + currentCoursePrice (RPC). (~1200 tok)
- `pricing-rules.ts` — CRUD de pricing_rules + getActiveRules (→ PricingRule[] p/ o engine). (~900 tok)
- `markets.ts` — CRUD de markets (agrupa nacionalidades em country_codes). (~700 tok)
- `course-source.ts` — createPortfolioCourseSource(supabase): provider do CourseSource (search/resolve/listPrices), aplica applyRulesToPlan no resolve. (~1200 tok)
- `index.ts` — barrel.
- `types.ts` (SPLIT 4 add): priceVersionLabel (País>Mercado>Normal) + toPricedOptions + PricedOption. `queries.ts`: listActivePriceVersions.

## lib/security/


## lib/study-plans/


## lib/supabase/


## lib/ui/


## messages/


## public/


## supabase/


## supabase/migrations/


## tests/

- `study-financial.test.mjs` — Declares financial (~2283 tok)

## types/

