# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-16T14:30:00.000Z
> Files: 10 tracked | Anatomy hits: 0 | Misses: 0

## components/hr/

- **DateInputPT.tsx** — `'use client'` reusable `<input type=”date”>` with themed styling. Now adds `className=”movy-field-control”` for focus ring. Props: value, onChange, min, max, style. ~30 lines.
- **ClockWidget.tsx** — `'use client'` time-clock card with purple gradient. Description input now has `className=”movy-field-control”` + `aria-label`. Calls clockInAction/clockOutAction via useTransition. Bilingual (pt/en). ~185 lines.
- **WeekSummary.tsx** — `'use client'` week-at-a-glance bars (Mon–Sun). Shows totalHours per day as colored progress bar with status dots. Props: entries, locale. ~130 lines.
- **RateCard.tsx** — `'use client'` read-only hourly rate display card for employees. Bilingual (pt/en). ~35 lines.
- **SelfInvoiceButton.tsx** — `'use client'` button + shared `<Modal>` for employees to generate their own invoice. Uses `<Button>`, `<Field>/<Input>` from ui/. Bilingual (pt/en). ~120 lines.
- **HrDashboard.tsx** — `'use client'` right-panel dashboard. Exact-match `<nav>` tab bar (Timesheet | Invoices | All Timesheets for admin) uses usePathname for exact matching. Shared `<Modal>` for AddEntry (body: `<Field>+<Input>` from form.tsx, `<Button>` primary/secondary). Empty state uses shared `<EmptyState>` with Clock icon. Approve/reject buttons have `aria-label`. Summary footer: approved/pending/approved total metric blocks. ~310 lines.
- **TimesheetTable.tsx** — `'use client'` table rendering time entries with approve/reject action buttons. Empty state uses shared `<EmptyState>`. Columns: date, employee (optional), clock-in/out, hours, day type, amount, status badge, actions. Calls approveEntryAction/rejectEntryAction. ~145 lines.
- **InvoiceEmployeeFilter.tsx** — `'use client'` employee filter dropdown for invoice list (admin only). Uses shared `<Select>` (movy-field-control). Props: employees[], currentEmployeeId?, locale. Updates URL ?employee= param via router.push; clear button has aria-label. Bilingual (pt/en). ~50 lines.
- **TaxInvoice.tsx** — Print-optimised ABN-format tax invoice component. Print chrome (button) uses `<Button variant=primary>`; all print CSS/layout preserved. Props: data (InvoicePrintData), locale?. ~175 lines.

## app/[locale]/(protected)/hr/invoices/

- **page.tsx** — Invoice list server page. Uses `<PageHeader actions={GenerateInvoiceForm}>`, `<EmptyState icon={FileText}>`. Role-scoped; InvoiceEmployeeFilter + IssueInvoiceButton for admins. Table: invoice#, employee, period, total (tabular-nums), status badge, issued date, View/Print link. Bilingual. ~115 lines.
- **GenerateInvoiceForm.tsx** — `'use client'` modal for generating a new tax invoice. Employee select + period start/end date inputs. Calls generateInvoiceAction, then router.push to print page. Bilingual (pt/en). ~110 lines.

## app/[locale]/(protected)/hr/

- **team/page.tsx** — Employee Directory server page (admin-only). Uses `<PageHeader>`, `<EmptyState icon={Users}>`. KPI grid: repeat(auto-fit,minmax(200px,1fr)). Card grid: repeat(auto-fit,minmax(280px,1fr)). Rate column has fontVariantNumeric tabular-nums. EditRateButton has aria-label. Bilingual pt/en. ~260 lines.
- **clock/page.tsx** — Employee clock self-service page (server component). Uses shared `<PageHeader>` (title+description). No-employee state uses shared `<EmptyState icon={UserX}>`. Renders ClockWidget. ~45 lines.
- **page.tsx** — HR dashboard server component. Uses shared `<PageHeader>` (eyebrow+title). Responsive two-column grid via `repeat(auto-fit, minmax(260px,1fr))`. Left: ClockWidget + WeekSummary + RateCard + SelfInvoiceButton. Right: HrDashboard. ~110 lines.
- **actions.ts** — Server actions for HR module: clockInAction, clockOutAction, logHoursAction, approveEntryAction, rejectEntryAction, generateInvoiceAction, generateOwnInvoiceAction (employee self-invoice), updateEmployeeRateAction, issueInvoiceAction, markInvoicePaidAction. Uses `requireActor()` from lib/actions/auth (role checks via isHrAdmin inline); audit via logAuditWithClient. ~260 lines.
- **timesheets/page.tsx** — Timesheet list server page. Uses shared `<PageHeader>` (eyebrow+title+description). Status filter pills use `color.purple` token (no hardcoded hex). Empty state uses shared `<EmptyState icon={ClockIcon}>`. TimesheetTable with showEmployeeName={isAdmin}. Bilingual (pt/en). ~148 lines.
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

- **next.config.mjs** — Next.js config: CSP (enforcing, built from NEXT_PUBLIC_SUPABASE_URL env var), security headers, Sentry via withSentryConfig (deprecated opts moved under `webpack.*` 2026-06-17), next-intl plugin. `outputFileTracingIncludes` at top-level (Next 15). ~70 lines.
- **eslint.config.mjs** — ESLint 9 flat config (replaced `.eslintrc.json` + `next lint`, 2026-06-17). Bridges `next/core-web-vitals` eslintrc preset via `FlatCompat` (`@eslint/eslintrc`). `lint` script = `eslint .`. Ignores `.next`/`node_modules`/`out`/`.claude`. ~25 lines.
- **instrumentation.ts** — Next.js 15 / Sentry v10 instrumentation hook. `register()` function imports `sentry.server.config` (nodejs runtime) or `sentry.edge.config` (edge runtime). Required to avoid Sentry falling back to Pages Router `_document` patching. ~9 lines.
- **.env.example** — Documented env vars: Supabase (URL + anon key + service role), Wise API, Sentry DSN, site URL, Upstash Redis (rate-limit), `MOVY_PREVIEW` (dev-only; unlocks `/_ui-preview`, NOT an auth bypass). ~45 lines.
- **public/robots.txt** — Disallows /api/ and /(protected)/ paths for all bots.
- **sentry.client.config.ts** / **sentry.server.config.ts** / **sentry.edge.config.ts** — Sentry init: DSN from env, tracesSampleRate 0.1, enabled only in production.

## lib/actions/

- **auth.ts** — CANONICAL server-action auth layer (2026-06-17 audit). `requireActor()` (authenticated + **is_active** checked → `{supabase,user,profile:ActorProfile}`), `requireEditor()`/`requireAdmin()` (role-gated, throw `Permissão insuficiente`), `svc()` (service client or null). `ActorProfile = {id,email,role,org_id}` is the single actor shape. ALL 6 action files use these; never reinvent a local `getActor`/`requireAdmin`/`Actor`. ~75 lines.

## lib/db/

- **json.ts** — jsonb serialization boundary (2026-06-17 audit). `toJson(value)` (domain→jsonb, writes) + `fromJson<T>(value)` (jsonb→domain, reads). Single documented home for the `as unknown as Json` cast; ~20 call sites migrated. Test-traversed `lib/*` import as `'../db/json.ts'` (.ts ext). ~25 lines.

## app/api/health/

- **route.ts** — GET /api/health — returns `{ status: 'ok', ts: ISO }`. nodejs runtime, force-dynamic. ~7 lines.

## supabase/migrations/

- **019_allowed_emails_rls_deny.sql** — Adds restrictive `no_direct_access` policy on `allowed_emails` (all mutations go through service-role). Idempotent via `if not exists`.

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

- **page.tsx** — Wiki list server page. Uses `<PageHeader>` (eyebrow + title + description + canWrite CTA in actions slot). `<EmptyState>` with BookOpen/Search icon for empty list/search. Filter bar: search input (movy-field-control), dept select, status select (editors only), submit. Item list via WikiListItem. ~160 lines.
- **loading.tsx** — Hand-rolled pulse skeleton for wiki list (header + filter bar + 6 item rows). ~43 lines.
- **new/page.tsx** — Create article server page. Auth guard (editor+). Uses `<PageHeader>` + `<WikiForm>`. ~35 lines.


## app/[locale]/(protected)/wiki/[slug]/

- **page.tsx** — Article detail server page. Breadcrumb + 2-col responsive grid (repeat auto-fit). Main card: dept chip, status badge, h1 title, date/tags meta, BlockRenderer or WikiContent. Edit (aria-label) + DeleteContentButton actions (editor+/admin+). Sidebar: related articles + back link. ~257 lines.

## app/[locale]/(protected)/wiki/[slug]/edit/

- **page.tsx** — Edit article server page. Auth guard (editor+). Uses `<PageHeader>` + `<WikiForm mode=edit>`. ~66 lines.


## app/[locale]/(protected)/wiki/new/


## app/[locale]/(public)/login/


## app/api/admin/import-knowledge/


## app/api/imported/[name]/


## app/auth/callback/


## app/unauthorized/


## components/brand/


## components/departments/


## components/financial/


## components/ui/ (Phase 0 primitives — 2026-06-17)

- **variants.ts** — Pure helper: `buttonClass(variant: ButtonVariant) → className`. Maps 'primary'/'secondary'/'icon' to existing global CSS classes (button-fill-primary-md, etc.). ~10 lines.
- **Button.tsx** — `'use client'` forwardRef button wrapping existing button-* CSS classes via `buttonClass`. Props: variant, loading, disabled, className + all native button attrs. When loading=true renders a `<span class="sr-only">Loading…</span>` for AT. ~22 lines.
- **form.tsx** — `'use client'` form primitives: `Field` (label+hint wrapper), `Input`, `Textarea`, `Select` (all forwardRef). Inline styles from `t.*` theme tokens. ~50 lines.
- **PageHeader.tsx** — `'use client'` per-screen header: optional eyebrow (kicker), h1 title (Clash Display), description, right-aligned actions slot. ~28 lines.
- **tabs-logic.ts** — Pure helper: `isTabActive(pathname, href) → boolean`. Exact match OR startsWith(href+'/'). ~3 lines.
- **Tabs.tsx** — `'use client'` underline tab bar using next/link + usePathname. Props: items: TabItem[], ariaLabel?: string (default 'Section navigation'). aria-label on nav. Underline accent on active tab. ~50 lines.
- **EmptyState.tsx** — `'use client'` centered icon+title+description+optional action card. Props: icon: LucideIcon, title, description?, action?. ~28 lines.
- **skeleton-logic.ts** — Pure helper: `skeletonRows(count) → number[]`. Clamps to min 1. ~4 lines.
- **Skeleton.tsx** — `'use client'` shimmer skeleton primitives: `Skeleton` (single bar, uses .movy-skeleton CSS class) + `SkeletonText` (grid of rows, last at 60%). ~18 lines.
- **Modal.tsx** — `'use client'` portal overlay modal. SSR-safe (mounted guard), Escape+outside-click close, scroll-lock counter (data-scroll-locked), focus trap (Tab/Shift+Tab wrap), trigger capture/restore, useId aria-labelledby. Props: open, onClose, title?, children, width. ~105 lines.
- **Drawer.tsx** — `'use client'` slide-in side panel portal. SSR-safe, Escape+outside-click close, focus trap (Tab/Shift+Tab wrap), trigger capture/restore, useId aria-labelledby, header always rendered (close button present even without title), side='right'|'left'. Props: open, onClose, title?, children, width, side. ~100 lines.
- **index.ts** — Barrel re-exporting all 10 primitives + helpers. ThemeToggle deliberately excluded. ~12 lines.

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

- **WikiListItem.tsx** — `'use client'` article list row: dept icon, dept chip, status badge, title (display font), excerpt, date+tag footer, chevron arrow. Uses STATUS_STYLES from lib/constants/content. ~93 lines.
- **WikiContent.tsx** — Client component rendering sanitized HTML body of an article. DOMPurify-safe. ~? lines.
- **WikiForm.tsx** — `'use client'` create/edit form for wiki articles. Migrated (2026-06-17 rubric) to use `<Field>+<Input>/<Textarea>/<Select>` from ui/form and `<Button variant=primary loading>` / `<Button variant=secondary>`. Language tabs (pt/en/es), dept+status selectors, tags, featured toggle. ~130 lines.
- **BlockRenderer.tsx** — `'use client'` recursive block renderer: text/steps/checklist/infobox/email/table/section. Dispatches to block sub-components. ~70 lines.
- **DeleteContentButton.tsx** — `'use client'` delete action button. Migrated (2026-06-17 rubric) from native confirm() to `<Modal>` confirmation dialog with danger button. Bilingual (pt/en/es). ~60 lines.

## components/wiki/blocks/

- **StepsBlock.tsx** — Numbered steps block with title + step cards (step.title, step.body, step.note). Orange (#F36B1C) step counters. ~58 lines.
- **InfoBox.tsx** — Info/warning/alert/tip callout with left border accent. Variants: tip/warn/alert/info. ~27 lines.
- **TableBlock.tsx** — Table block renderer. ~? lines.
- **EmailTemplate.tsx** — Email template block renderer. ~? lines.
- **ChecklistBlock.tsx** — Interactive checklist block with Supabase-persisted progress. ~? lines.


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

- `study-financial.test.mts` — Financial calc tests (formerly .mjs, now TypeScript ESM). ~100 lines.
- `hr-calculations.test.mts` — 17 node:test assertions covering detectDayType/calculateHours/getMultiplier/calculateLineItemCents/computeTotalCents. ~80 lines.
- `hr-queries.test.mts` — HR query tests. ~80 lines.
- `options.test.mts` — 6 tests for study-plans option helpers (createOption/duplicateOption/withRecomputed/setRecommended/canAddOption). ~107 lines.
- `permissions.test.mts` — Role permission matrix tests (isAdminOrAbove, isEditorOrAbove, etc.). ~100 lines.
- `portfolio.test.mts` — Portfolio action tests. ~100 lines.
- `sanitize-html.test.mts` — HTML sanitisation tests. ~100 lines.
- `crm-contacts.test.mts` — CRM contact tests. ~80 lines.
- `ui-variants.test.mts` — 4 tests for buttonClass helper (primary/secondary/icon/unknown fallback). ~18 lines.
- `ui-tabs-logic.test.mts` — 4 tests for isTabActive (exact/sub-route/sibling/partial-segment). ~18 lines.
- `ui-skeleton-logic.test.mts` — 3 tests for skeletonRows (length/clamp-0/clamp-negative). ~14 lines.

Run with: `npm test` → `node --experimental-strip-types --test 'tests/*.test.mts'`

## app/[locale]/(protected)/_ui-preview/

- **page.tsx** — Server component: 404s unless `MOVY_PREVIEW=1`. Renders UiPreviewClient. ~7 lines.
- **UiPreviewClient.tsx** — `'use client'` primitives gallery showing all Phase-0 components. TEMP — for screenshot verification only, not shipped to production. ~55 lines.

## Root docs

- **CHANGELOG.md** — Keep-a-changelog format. Documents all audit fixes and notable changes since project start.
- **CONTRIBUTING.md** — Dev setup, branch conventions, money-in-cents rule, server action pattern, no console.log policy.
- **docs/MIGRATIONS.md** — How to write and apply Supabase migrations; idempotency rules; RLS conventions.
- **docs/DEPLOYMENT.md** — Vercel deploy process, required env vars, DB migration order, rollback strategy, `/api/health` probe.

## types/



## Admissions sector (setor de matrículas por escola — 2026-06-18)

- **supabase/migrations/024_admissions.sql** — 2 tabelas: `school_admissions` (1 por institution: enrolment_type, portal_url, streams[], documents jsonb, contacts jsonb, notes) + `school_admission_credentials` (login/password, RLS editor+, separada). RLS espelha institutions (read ativos, write editor+, delete admin+).
- **supabase/migrations/025_admissions_seed.sql** — seed idempotente DO-block das 28 escolas da planilha (acha-ou-cria institution, upsert admissions+credencial). Gerado por scripts/parse-admissions-xlsx.mjs + normalização manual.
- **lib/admissions/types.ts** — SchoolAdmission/Credential aliases, STREAMS/DOC_TAGS/CONTACT_ROLES unions, AdmissionDocument/Contact, SchoolAdmissionView; PURE parseDocuments/parseContacts/parseStreams (jsonb→domínio, testáveis).
- **lib/admissions/queries.ts** — listAdmissions (join institution, sem senha), getAdmissionById, listInstitutionsWithoutAdmission, revealCredential (só aqui a senha sai do banco). +index.ts barrel.
- **app/[locale]/(protected)/admissions/actions.ts** — upsertAdmissionAction/deleteAdmissionAction/upsertCredentialAction (requireEditor) + revealPortalPasswordAction (audita 'admissions_portal_revealed').
- **app/[locale]/(protected)/admissions/page.tsx** + **[id]/page.tsx** + **loading.tsx** — lista (server) + detalhe (server) + skeleton.
- **components/admissions/AdmissionsList.tsx** — grid client com busca, chips de stream, cadeado se tem portal, modal "Adicionar escola".
- **components/admissions/AdmissionDetail.tsx** — detalhe: Matrícula&Portal (senha mascarada + Revelar auditado), Documentos (checklist+tags), Notes, Contatos.
- **components/admissions/AdmissionEditor.tsx** — Drawer de edição estruturada (campos+streams+documentos+contatos+credencial).
- **scripts/parse-admissions-xlsx.mjs** — parser build-time da planilha → 025 seed (não roda em runtime).
- **tests/admissions-parse.test.mts** — 4 testes dos parsers puros.
- AppShell mainNav: entrada **Admissions** (GraduationCap) perto de Portfólio.
