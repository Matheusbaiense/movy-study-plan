# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-16T14:30:00.000Z
> Files: 10 tracked | Anatomy hits: 0 | Misses: 0

## components/hr/

- **ClockWidget.tsx** — `'use client'` time-clock card. Purple gradient background. Shows live elapsed timer in gold when clocked in (setInterval, formatElapsed). Pulsing green dot + LIVE badge when active. Clock In (gold button + optional description input) / Clock Out (translucent white button). Calls clockInAction/clockOutAction server actions via useTransition. Bilingual (pt/en). ~165 lines.

## app/[locale]/(protected)/hr/

- **actions.ts** — Server actions for HR module: clockInAction, clockOutAction, approveEntryAction, rejectEntryAction, generateInvoiceAction, issueInvoiceAction, markInvoicePaidAction. Uses getActor() helper (createClient + profiles query with org_id). ~151 lines.

## lib/hr/

- **types.ts** — HR module type aliases (EmployeeProfile, TimeEntry, HrRateRule, HrInvoice, + inserts + HrInvoiceUpdate), DayType/TimeEntryStatus/InvoiceStatus enums, TimeEntryComputed, InvoiceLine, InvoicePrintData, InvoicePeriod. ~49 lines.
- **queries.ts** — Org-scoped Supabase query helpers: listEmployees, getEmployeeByProfileId, getEmployeeById, upsertEmployee; getActiveClockEntry, clockIn, clockOut, listTimeEntries, updateEntryStatus; listRateRules; listInvoices, getInvoiceById, createInvoice, updateInvoiceStatus, linkEntriesToInvoice, getInvoicePrintData. ~260 lines.
- **calculations.ts** — Pure HR calculation functions: detectDayType (public holiday priority), calculateHours (ms→hours, 2dp), getMultiplier (date-range + max-wins), calculateLineItemCents (integer cents), computeTotalCents (reduce), formatAUD, formatDateAU. ~62 lines.

## tests/

- **hr-calculations.test.mjs** — 17 node:test assertions covering detectDayType/calculateHours/getMultiplier/calculateLineItemCents/computeTotalCents. Run with `node --test`. ~80 lines.

## components/hr/

- **WeekSummary.tsx** — `'use client'` widget: 7-day hours bar chart + approval-status dots for a given `entries: TimeEntry[]`. Uses `getWeekDates()` (Mon–Sun, local-date formatted to avoid UTC timezone drift), `calculateHours`, and theme tokens (`t`, `ink`, `color`, `font`) from `lib/ui/theme`. `MAX_HOURS=10` at module level. Props: `entries`, `locale`. ~129 lines.

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

## docs/superpowers/specs/

- **2026-06-16-hr-time-management-design.md** — Full design spec for HR & Time Management module (Agency Hub › Operations). Covers: schema (4 tables), nav architecture, business logic (rate calc, day_type detection, invoice periods), UI design, TaxInvoice ABN-format PDF (window.print()), access control, data flow, implementation order.

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

- **AppShell.tsx** — Root layout shell: desktop sidebar (collapsible, localStorage-persisted), mobile drawer, topbar with breadcrumb + avatar account menu. NavEntry interface, mainNav array, operationsNav array (HR & Time), SidebarContent inner component, NavItem/Avatar/MenuLink/BreadcrumbFromPath helpers. Uses Lucide icons incl. Clock. ~382 lines.

## components/study-plans/


## components/wiki/


## components/wiki/blocks/


## data/


## .wolf/allyhub-research/

- `ALLY-BLUEPRINT.md` — Blueprint competitivo completo do AllyHub (concorrente SaaS CRM para agências de intercâmbio). Seções 1–49: identidade empresa, planos/preços, termos, tech stack (AngularJS 1.x + React iframe + Sellead backend), mapa de rotas, pipeline de alunos, perfil (5 abas), formulário (40+ campos), Quote 2.0 deep dive, catálogo AU 27 programas, revenue model AU$150/quote, simulação Perth (Lexis 1 semana AU$1,318), comissão BRL (R$789.76/quote), Finish = PUT /draft/{id}, links externos (/quote-detail/ vs /quote-online/), fluxo aluno (PT-BR, checkout, 2-12x), tracking multinível, 14+ endpoints. S45: Settings completo. S46: Builders (Quote Online/PDF/Email Template/Document Template). S47: Dashboard completo — 6 KPI cards, leaderboard, conversion rate, tasks calendar, last interactions; arquitetura 3-sided (type 1=agência/2=escola/3=rede); mapa moduleType (3=free/7=financial/11=marketing/15=full/16=automations); nav completo com 35+ itens e gates; 8 roles. S48: Reports & Commissions — 10 páginas documentadas. S49: Financial CRUD Layer — 7 rotas ocultas. S50: Financial Layer Completo — /financial/dashboard, /instalment/earnings, /instalment/credits, /transition/list. Mapa financeiro 4 camadas completo. S50H (NOVA): /shipment = "Remessa Internacional" — produto early access de remessa internacional (Ally HUB Services - International Shipment); landing page React SPA em iframe; badge "Acesso antecipado aberto — vagas limitadas"; Simulador de Câmbio com taxa ao vivo AUD; integrado ao CRM; conteúdo não extraível via DOM (iframe separado). (~4350+ lines, ~77k tok)

## .wolf/allyhub-research/api-responses/

- `draft-angular-load.network-response` — GET /draft?quote_id=1644823&take=1&where={} (chamada do Angular parent). Prova que draft retorna apenas metadados (id, student_id, quotes list) sem cursos/fees — playground é efêmero.
- `draft-q501-current.network-response` — GET /draft?quote_id=1644823&myTest=1. Idêntico ao acima; confirma que mesmo com parâmetros diferentes o servidor não retorna dados do playground.
- `quote-1644823-current.network-response` — GET /quote/1644823?withBusiness=true. Quote completo em estado draft: bill:[], courses:[], fees:[], converted_value:1005. Confirma que bill só é preenchido após Finish bem-sucedido.

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

