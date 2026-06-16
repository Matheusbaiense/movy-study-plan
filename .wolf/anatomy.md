# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-16T14:30:00.000Z
> Files: 10 tracked | Anatomy hits: 0 | Misses: 0

## components/hr/

- **ClockWidget.tsx** — `'use client'` time-clock card. Purple gradient (145deg, #4B1A77→#190A38). Header: clock icon + “CLOCKED IN”/”READY” status pill with pulsing green dot. Clocked-in state: 144px gold ring with HH:MM:SS elapsed + “since HH:MM” caption + description frosted card + Clock Out button. Not clocked-in: description input (Enter submits) + gold Clock In button. Calls clockInAction/clockOutAction via useTransition. Bilingual (pt/en). ~180 lines.
- **WeekSummary.tsx** — `'use client'` week-at-a-glance bars (Mon–Sun). Shows totalHours per day as a colored progress bar with status dots. Props: entries, locale. ~130 lines.
- **HrDashboard.tsx** — `'use client'` right-panel dashboard. Tab bar (Timesheet | Invoices | All Timesheets for admin). Week header + Add Entry / Generate Invoice buttons. Entries table: columns DATE | IN | OUT | HOURS | AMOUNT AU$ | STATUS | ACTIONS. StatusBadge component (pill + colored dot). Row hover highlight. Admin approve/reject buttons. AddEntryModal: date + time inputs, calls logHoursAction. Summary footer: stacked Approved / Pending / Approved Total metric blocks. ~290 lines.
- **TimesheetTable.tsx** â€” `'use client'` table rendering time entries with approve/reject action buttons. Columns: date, employee (optional), clock-in/out times, hours, status badge, actions. Calls approveEntryAction/rejectEntryAction via useTransition. Props: entries, employees (optional), showEmployeeName, locale. ~130 lines.
- **TaxInvoice.tsx** â€” Print-optimised ABN-format tax invoice component. Renders invoice header (agency ABN, logo), employee details, line items table (date, description, hours, rate, amount), totals, payment terms. Uses window.print() via a Print button. Props: data (InvoicePrintData), rateRules. ~160 lines.

## app/[locale]/(protected)/hr/invoices/

- **page.tsx** — Invoice list server page. Auth via supabase.auth.getUser() + profiles query. Fetches listInvoices + listEmployees in parallel. Table with invoice #, period, total (formatAUD), status badge (draft/issued/paid), issued date, View/Print link. Empty state bilingual. Renders GenerateInvoiceForm. ~80 lines.
- **GenerateInvoiceForm.tsx** — `'use client'` modal for generating a new tax invoice. Employee select + period start/end date inputs. Calls generateInvoiceAction, then router.push to print page. Bilingual (pt/en). ~110 lines.

## app/[locale]/(protected)/hr/

- **team/page.tsx** — Employee Directory server page (admin-only, redirects non-admin to /hr). Calls listEmployeesWithStats. KPI summary bar: 4 tiles (employee count, clocked in now, hours this month, pending approvals). 3-column card grid: initials avatar (purple gradient), name+email, RoleBadge (super_admin/admin/employee), AU$/hr rate, stats row (hours, pending, working-now indicator), Timesheets + Invoices action links with ?employee= param. Empty state with Users icon. Bilingual pt/en. ~263 lines.
- **clock/page.tsx** â€” Employee clock self-service page (server component). Auth via supabase.auth.getUser() + profiles query. Fetches employee record via getEmployeeByProfileId; falls back to bilingual "no active profile" message. Fetches active clock entry via getActiveClockEntry. Renders ClockWidget. ~49 lines.
- **page.tsx** â€” HR dashboard server component. Auth via supabase.auth.getUser() + profiles query. Fetches employee record, active clock entry, current-week entries (Monâ€“Sun), and recent entries. Layout: left sidebar (ClockWidget + WeekSummary + nav links) + right panel (TimesheetTable last 20). Bilingual (pt/en). ~99 lines.
- **actions.ts** â€” Server actions for HR module: clockInAction, clockOutAction, approveEntryAction, rejectEntryAction, generateInvoiceAction, issueInvoiceAction, markInvoicePaidAction. Uses getActor() helper (createClient + profiles query with org_id). ~151 lines.
- **timesheets/page.tsx** â€” Admin timesheet list (server component). Auth via supabase.auth.getUser() + profiles. Fetches all org time entries + employees in parallel. Renders pill-style status filters (All / pending / approved / rejected) as anchor links with query-string state. Preserves employeeId filter when switching status. Shows employee clear filter link when active. Renders TimesheetTable with showEmployeeName. Bilingual (pt/en). ~102 lines.
- **invoices/[id]/print/page.tsx** â€” Invoice print/PDF server page. Auth via supabase.auth.getUser() + profiles. Fetches listRateRules + getInvoicePrintData in sequence; 404s if data null. Renders TaxInvoice in a white padded container. ~32 lines.

## lib/hr/

- **types.ts** â€” HR module type aliases (EmployeeProfile, TimeEntry, HrRateRule, HrInvoice, + inserts + HrInvoiceUpdate), DayType/TimeEntryStatus/InvoiceStatus enums, TimeEntryComputed, InvoiceLine, InvoicePrintData, InvoicePeriod. ~49 lines.
- **queries.ts** â€” Org-scoped Supabase query helpers: listEmployees, getEmployeeByProfileId, getEmployeeById, upsertEmployee; getActiveClockEntry, clockIn, clockOut, listTimeEntries, updateEntryStatus; listRateRules; listInvoices, getInvoiceById, createInvoice, updateInvoiceStatus, linkEntriesToInvoice, getInvoicePrintData; listEmployeesWithStats (parallel Promise.all: employee_profiles + profiles + time_entries, aggregates hours/pending/approved/is_clocked_in in JS). ~420 lines.
- **calculations.ts** â€” Pure HR calculation functions: detectDayType (public holiday priority), calculateHours (msâ†’hours, 2dp), getMultiplier (date-range + max-wins), calculateLineItemCents (integer cents), computeTotalCents (reduce), formatAUD, formatDateAU. ~62 lines.
- **index.ts** â€” Barrel export: re-exports everything from types, calculations, queries. ~4 lines.

## tests/

- **hr-calculations.test.mjs** â€” 17 node:test assertions covering detectDayType/calculateHours/getMultiplier/calculateLineItemCents/computeTotalCents. Run with `node --test`. ~80 lines.

## components/hr/

- **WeekSummary.tsx** â€” `'use client'` widget: 7-day hours bar chart + approval-status dots for a given `entries: TimeEntry[]`. Uses `getWeekDates()` (Monâ€“Sun, local-date formatted to avoid UTC timezone drift), `calculateHours`, and theme tokens (`t`, `ink`, `color`, `font`) from `lib/ui/theme`. `MAX_HOURS=10` at module level. Props: `entries`, `locale`. ~129 lines.

## components/study-plans/

- **CoursePortfolioPicker.tsx** â€” `'use client'` subcomponent for searching the course portfolio catalog, picking a course (calls `searchCoursesAction` + `resolveCourseAction`), and switching price versions (calls `listCoursePricesAction`). Props: `nationality`, `location`, `onApply`, `onPriceVersion`. ~103 lines.
- **EditorWizardNav.tsx** + **editor-wizard-steps.ts** â€” 5-step wizard nav (Cliente â†’ PreferÃªncias â†’ Cursos â†’ Custos â†’ RevisÃ£o).
- **StudyPlanEditor.tsx** — wizard shell; one step at a time; visa date warning on Revisão. Now: fetches /api/fx on mount (fxRate state), passes fxRate+courses+extraCosts to EditorStickyBar; “Versões” toggle in header opens/closes VersionHistory panel. ~750 lines.
- **EditorStickyBar.tsx** — fixed bottom bar: Total (clickable → ExplainPanel breakdown per-course)/Fechamento/Saldo parcelar, BRL equivalent under Total (fxRate from /api/fx), save status, Salvar + Proposta/PDF links. Props: +fxRate, +courses, +extraCosts. ~170 lines.
- **VersionHistory.tsx** — `'use client'` collapsible version-history panel. Lists last 20 proposal_versions; inline “Salvar versão” form (label optional); one-click restore with confirm step (calls saveVersionAction/listVersionsAction/restoreVersionAction). ~180 lines.
- **ScenarioPanel.tsx** â€” `'use client'` read-only "what if?" comparator (SPLIT 4 fatia A). Resizes 1st course study weeks into 3 configurable-week variants via `computeScenarios`+`withFirstCourseStudyWeeks`; shows Total/Fechamento/Saldo per column. No persistence. Prop: `plan`. Rendered in RevisÃ£o step.
- **editor-ui.tsx** â€” shared editor primitives extracted from StudyPlanEditor (SPLIT 4 fatia B): `Section`, `Field`, `NumberInput`, `MiniStat` + style tokens (`input`, `ghostButton`, `dangerButton`, `pill`, `grid2`, `HAIR`). Imported by StudyPlanEditor, CourseListEditor, ExtraCostsEditor.
- **CourseListEditor.tsx** â€” `'use client'` reusable course-cards editor (extracted from StudyPlanEditor). Operates only on a `courses` slice; props `{ courses, studentLocation, nationality, onCoursesChange }`. Owns ModuleEditor + all course handlers. Used by the primary mix AND each proposal option.
- **ExtraCostsEditor.tsx** â€” `'use client'` small "Custos adicionais" list editor. Props `{ extraCosts, onChange }`. Reused by primary + options.
- **OptionsManager.tsx** â€” `'use client'` AllyHub-style options tabs (SPLIT 4 fatia B). OpÃ§Ã£o 1 = primary mix; 2..5 = `plan.options[]`. Tabs + rename/duplicate/remove/recommended + side-by-side comparison strip (Total/Fechamento/Saldo via computeProposal). Props `{ plan, nationality, onChange }`. Rendered in RevisÃ£o step. Pure helpers in `lib/study-plans/options.ts`.
- **StudyPlanProposal.tsx** â€” client proposal/PDF render. SPLIT 4 fatia B2: when `data.options?.length`, renders `OptionsComparison` (options side by side, recommended highlighted) after the summary strip; otherwise unchanged single-mix render.

## docs/superpowers/specs/

- **2026-06-16-hr-time-management-design.md** â€” Full design spec for HR & Time Management module (Agency Hub â€º Operations). Covers: schema (4 tables), nav architecture, business logic (rate calc, day_type detection, invoice periods), UI design, TaxInvoice ABN-format PDF (window.print()), access control, data flow, implementation order.

## ./


## .claude/


## .claude/plan/

- **mega-audit.md** — Plano de auditoria pré-produção em 21 dimensões (segurança, qualidade, testes, observabilidade, performance, deps, infra, DR, repo). 47 issues (11 CRITICAL, 27 HIGH, 14 MEDIUM, 8 LOW) priorizados em 4 fases com estimativa de esforço e ordem de execução. ~300 linhas.

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

- `actions.ts` â€” Server actions for study plans + portfolio course search/resolve/listPrices (SPLIT 4). Exports: createStudyPlan, updateStudyPlan, duplicateStudyPlan, changeStudyPlanStatus, archiveStudyPlan, softDeleteStudyPlan, restoreStudyPlan, hardDeleteStudyPlan, bulkStudyPlanAction, upsertContact, searchContactsAction, createProposalForContact, deleteStudyPlan, searchCoursesAction, resolveCourseAction, listCoursePricesAction. (~5000 tok)
- `page.tsx` â€” Study plans list page; entry-point button is now `<NewProposalModal locale={locale} />`. (~1500 tok)
- `NewProposalModal.tsx` â€” Passo-0 modal for creating proposals; default export, prop `locale: string`. (~est tok)
- `ProposalsList.tsx` â€” Server-built view-model: all formatting done server-side, interaction client-side. (~5542 tok)

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

- **AppShell.tsx** — Root layout shell: desktop sidebar (collapsible, localStorage-persisted), mobile drawer, topbar with breadcrumb + avatar account menu. NavEntry interface, mainNav array (now includes Portfólio/Building2), operationsNav array (HR & Time), SidebarContent inner component, NavItem/Avatar/MenuLink/BreadcrumbFromPath helpers. Uses Lucide icons incl. Clock, Building2. ~384 lines.

## app/[locale]/p/[token]/

- **page.tsx** — Public RSC proposal page. No auth. Service client lookup `study_plans WHERE share_token = token AND deleted_at IS NULL`. Renders `PublicProposalPage`. ~30 lines.
- **actions.ts** — `acceptProposalAction(token, signerName)`: validates, inserts `proposal_events(kind='signed')`, sets `study_plans.accepted_at + status='accepted'`. Captures IP from headers. ~60 lines.

## components/portfolio/

- **PortfolioPage.tsx** — Client component for `/portfolio` index. Institution grid with search, countryFlag emoji, course count, expiry badge (PriceExpiryBadge). Create/edit institution modal (InstitutionModal). Calls createInstitutionAction/updateInstitutionAction. ~220 lines.
- **InstitutionDetail.tsx** — Client component for `/portfolio/[id]`. 3-tab UI: Cursos (CoursesTab), Vigências (PricesTab), Regras (RulesTab). Each tab has inline modals and optimistic state updates. Calls all portfolio server actions. ~520 lines.

## components/study-plans/

- **PublicProposalPage.tsx** — `'use client'` public proposal wrapper. Renders `StudyPlanProposal` + sticky AcceptBar (name input + checkbox + button) or AcceptedBanner (green). Calls `acceptProposalAction`. Props: token, data, reference, updatedAt, acceptedAt, studentName. ~160 lines.
- **ShareProposalButton.tsx** — `'use client'` floating gold button (fixed bottom-right). Opens modal with public URL (lazy-loaded via `getShareUrlAction`) + copy button. ~120 lines.


## components/wiki/


## components/wiki/blocks/


## data/


## .wolf/allyhub-research/

- `AI-HANDOVER-ALLYHUB.md` — Log das 12 sessões de pesquisa competitiva AllyHub (2026-06-15/16). Leia só quando for trabalhar com material de pesquisa AllyHub. (~233 linhas)
- `competitor-allyhub-blueprint.md` — Mapa de funcionalidades AllyHub → Movy baseado em vídeos YouTube (produto/roadmap). Insumo para SPLITs futuros. (~72 linhas)
- `ALLY-BLUEPRINT.md` â€” Blueprint competitivo completo do AllyHub (concorrente SaaS CRM para agÃªncias de intercÃ¢mbio). SeÃ§Ãµes 1â€”49: identidade empresa, planos/preÃ§os, termos, tech stack (AngularJS 1.x + React iframe + Sellead backend), mapa de rotas, pipeline de alunos, perfil (5 abas), formulÃ¡rio (40+ campos), Quote 2.0 deep dive, catÃ¡logo AU 27 programas, revenue model AU$150/quote, simulaÃ§Ã£o Perth (Lexis 1 semana AU$1,318), comissÃ£o BRL (R$789.76/quote), Finish = PUT /draft/{id}, links externos (/quote-detail/ vs /quote-online/), fluxo aluno (PT-BR, checkout, 2-12x), tracking multinÃ­vel, 14+ endpoints. S45: Settings completo. S46: Builders. S47: Dashboard completo. S48: Reports & Commissions. S49: Financial CRUD Layer. S50: Financial Layer Completo. S50H: /shipment Remessa Internacional. S51: SistemaEdiÃ§Ã£o PreÃ§os Q2.0. S52 (NOVA): CatÃ¡logo completo Q2.0 â€” card Q502 total AU$1,268 (Programs AU$960 + Fees AU$308); catÃ¡logo Accommodations global GBP (Kings Hall/Expanish/CEA + placement fee); hierarquia painel esquerdo Programs/Accommodations/Insurances/Add-ons; View Quotes mode (bug freeze no draft); portal aluno quote.allyhub.co = AngularJS Sellead re-branded (PagSeguro BRL, 3 idiomas PT/ES/EN, token-gated /signin). (~4400+ lines, ~90k tok)

## .wolf/allyhub-research/api-responses/

- `draft-angular-load.network-response` â€” GET /draft?quote_id=1644823&take=1&where={} (chamada do Angular parent). Prova que draft retorna apenas metadados (id, student_id, quotes list) sem cursos/fees â€” playground Ã© efÃªmero.
- `draft-q501-current.network-response` â€” GET /draft?quote_id=1644823&myTest=1. IdÃªntico ao acima; confirma que mesmo com parÃ¢metros diferentes o servidor nÃ£o retorna dados do playground.
- `quote-1644823-current.network-response` â€” GET /quote/1644823?withBusiness=true. Quote completo em estado draft: bill:[], courses:[], fees:[], converted_value:1005. Confirma que bill sÃ³ Ã© preenchido apÃ³s Finish bem-sucedido.

## docs/

- `AI-HANDOVER.md` — AI Handover principal — log de sessões de desenvolvimento (SPLITs, features, bugs). Pesquisa AllyHub extraída para `.wolf/allyhub-research/`. (~800 linhas)
- `PRODUCT-ROADMAP.md` â€” Movy â€” Arquitetura Mestre & Roadmap (PortfÃ³lio Â· Propostas Â· CÃ¡lculo) (~12792 tok)
- `competitor-allyhub-blueprint.md` — Blueprint competitivo AllyHub→Movy por split (SPLIT 4→8 + financeiro + decisões estratégicas). Criado 2026-06-16 a partir das 12 sessões de pesquisa. (~350 linhas)

## i18n/


## lib/


## lib/api/


## lib/auth/


## lib/calc/

- `money.ts` â€” integer-cents money primitives + legacy-float border coercion (toCents/centsToNumber). (~1712 tok)
- `rules.ts` â€” pure pricing-rules engine (agency/promo layer): applyRulesToCourse/applyRulesToPlan, PricingRule/RuleEffect. Empty ruleSet = no-op. (~2200 tok)
- `scenarios.ts` â€” pure computeScenarios + withFirstCourseStudyWeeks (N proposal variants side by side). (~600 tok)
- `types.ts`, `index.ts` â€” ComputedTotals/ComputedPerCourse + barrel.

## lib/constants/

- `countries.ts` â€” ISO-3166 alpha-2 country list (190 codes) + `countryName(code, locale)` via Intl.DisplayNames + `countryOptions(locale)` sorted {code,name} pairs for lead forms. (~600 tok)

## lib/crm/

- `contacts.ts` â€” org-scoped CRM contacts seam (SPLIT 2): queries + dedup upsertContact + searchContacts (typeahead) + woofed-shaped lead helpers (CONTACT_ATTR, getContactNationality, buildContactAttributes). RLS-scoped. (~1900 tok)

## lib/financial/


## lib/permissions/


## lib/portfolio/ â€” SPLIT 6A (catÃ¡logo normalizado + seam editorâ†”portfÃ³lio)

- `types.ts` â€” table aliases (institutions/campuses/courses/course_price_versions/markets/pricing_rules) + PURE mappers: priceVersionToSnapshot (centsâ†’float), buildStudyCourse, rowToPricingRule/isRuleActiveOn/draftToInsert/draftToUpdate; CourseSource/PortfolioCourseRef/PriceSnapshot contracts. (~2300 tok)
- `queries.ts` â€” org-scoped reads: listInstitutions/listCampuses/listCourses/getCourseWithRefs + currentCoursePrice (RPC). (~1200 tok)
- `pricing-rules.ts` â€” CRUD de pricing_rules + getActiveRules (â†’ PricingRule[] p/ o engine). (~900 tok)
- `markets.ts` â€” CRUD de markets (agrupa nacionalidades em country_codes). (~700 tok)
- `course-source.ts` â€” createPortfolioCourseSource(supabase): provider do CourseSource (search/resolve/listPrices), aplica applyRulesToPlan no resolve. (~1200 tok)
- `index.ts` â€” barrel.
- `types.ts` (SPLIT 4 add): priceVersionLabel (PaÃ­s>Mercado>Normal) + toPricedOptions + PricedOption. `queries.ts`: listActivePriceVersions.

## lib/security/


## lib/study-plans/


## lib/supabase/


## lib/ui/


## messages/


## public/


## supabase/


## supabase/migrations/

- **013_hr_module.sql** â€” HR database schema: 4 tables (employee_profiles, time_entries, hr_rate_rules, hr_invoices) with RLS policies (org-scoped), status enums (time_entry_status, invoice_status), foreign keys, and indexes. ~150 lines.

## tests/

- `study-financial.test.mjs` â€” Declares financial (~2283 tok)
- `hr-calculations.test.mjs` â€” 17 node:test assertions covering detectDayType/calculateHours/getMultiplier/calculateLineItemCents/computeTotalCents. Run with `node --experimental-strip-types --test`. ~80 lines.

## types/


