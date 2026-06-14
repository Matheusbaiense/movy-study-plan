# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-11T22:00:03.052Z
> Files: 108 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.eslintrc.json` — ESLint configuration (~13 tok)
- `.gitignore` — Git ignore rules (~158 tok)
- `CLAUDE.md` — OpenWolf (~110 tok)
- `middleware.ts` — API routes: GET (2 endpoints) (~868 tok)
- `next.config.mjs` — Next.js configuration (~159 tok)
- `package-lock.json` — npm lock file (~73468 tok)
- `package.json` — Node.js package manifest (~288 tok)
- `postcss.config.mjs` — Declares config (~41 tok)
- `README.md` — Project documentation (~293 tok)
- `tailwind.config.ts` — Tailwind CSS configuration (~341 tok)
- `tsconfig.json` — TypeScript configuration (~170 tok)
- `tsconfig.tsbuildinfo` (~84044 tok)
- `vercel.json` (~33 tok)

## .claude/

- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## app/

- `globals.css` — Styles: 83 rules, 19 vars, 1 media queries, 2 animations (~2916 tok)
- `layout.tsx` — metadata (~193 tok)
- `page.tsx` — RootPage (~170 tok)

## app/[locale]/

- `layout.tsx` — LocaleLayout (~191 tok)
- `page.tsx` — LocaleRoot (~57 tok)

## app/[locale]/(protected)/

- `error.tsx` — ProtectedError — uses useEffect (~527 tok)
- `layout.tsx` — ProtectedLayout (~134 tok)

## app/[locale]/(protected)/dashboard/

- `page.tsx` — DashboardRedirect (~78 tok)

## app/[locale]/(protected)/departments/

- `page.tsx` — DepartmentsPage (~809 tok)

## app/[locale]/(protected)/departments/[slug]/

- `loading.tsx` — DepartmentLoading (~2114 tok)
- `page.tsx` — DepartmentPage (~1659 tok)

## app/[locale]/(protected)/financial/

- `page.tsx` — FinancialPage (~99 tok)

## app/[locale]/(protected)/home/

- `loading.tsx` — HomeLoading (~180 tok)
- `page.tsx` — TZ — renders form (~2394 tok)

## app/[locale]/(protected)/settings/

- `layout.tsx` — SettingsLayout (~364 tok)
- `page.tsx` — SettingsPage (~857 tok)
- `SettingsTabs.tsx` — SettingsTabs (~343 tok)

## app/[locale]/(protected)/settings/audit-log/

- `page.tsx` — ACTION_LABELS — renders table (~1082 tok)

## app/[locale]/(protected)/settings/users/

- `actions.ts` — Returns the service-role client, or null if the env var is not configured. (~2908 tok)
- `page.tsx` — UsersPage (~451 tok)
- `UsersManager.tsx` — ROLE_COLORS — renders form, table — uses useRouter, useState (~4614 tok)

## app/[locale]/(protected)/study-plans/

- `actions.ts` — Exports createStudyPlan, updateStudyPlan, deleteStudyPlan, duplicateStudyPlan, changeStudyPlanStatus, archiveStudyPlan, softDeleteStudyPlan, restoreStudyPlan, hardDeleteStudyPlan, upsertContact (SPLIT 2: each emits proposal_events) (~1600 tok)
- `page.tsx` — StudyPlansPage — renders form, table (filters deleted_at IS NULL) (~1593 tok)

## app/[locale]/(protected)/study-plans/[id]/

- `page.tsx` — StudyPlanDetailPage (~241 tok)

## app/[locale]/(protected)/study-plans/[id]/proposal/

- `page.tsx` — StudyPlanProposalPage (~283 tok)

## app/[locale]/(protected)/wiki/

- `actions.ts` — API routes: GET (24 endpoints) (~1917 tok)
- `loading.tsx` — WikiLoading (~614 tok)
- `page.tsx` — WikiPage — renders form, table (~2812 tok)

## app/[locale]/(protected)/wiki/[slug]/

- `page.tsx` — STATUS_STYLES (~3203 tok)

## app/[locale]/(protected)/wiki/[slug]/edit/

- `page.tsx` — WikiEditPage (~608 tok)

## app/[locale]/(protected)/wiki/new/

- `page.tsx` — WikiNewPage (~374 tok)

## app/[locale]/(public)/login/

- `page.tsx` — LoginPage — renders form — uses useState, useParams (~2988 tok)

## app/api/admin/import-knowledge/

- `route.ts` — Next.js API route: GET (~1104 tok)

## app/api/imported/[name]/

- `route.ts` — Next.js API route: GET (~384 tok)

## app/auth/callback/

- `route.ts` — Next.js API route: GET (~318 tok)

## app/unauthorized/

- `page.tsx` — UnauthorizedPage (~792 tok)

## components/brand/

- `BrandDefs.tsx` — Movy mark definitions — the "sail in motion" (Brand Guide 2026, p.12–13). (~438 tok)
- `MovyMark.tsx` — The Movy sail mark. Uses the global defs from <BrandDefs />. (~466 tok)

## components/departments/

- `CategorySection.tsx` — CategorySection — uses useState (~825 tok)

## components/financial/

- `FinancialCalculator.tsx` — INK — renders table — uses useState, useMemo (~4157 tok)

## components/layout/

- `AppShell.tsx` — AppShell — uses useState, useRouter (~4634 tok)

## components/study-plans/

- `NewQuoteButton.tsx` — NewQuoteButton (~218 tok)
- `StudyPlanEditor.tsx` — applicantTypes — uses useState, useMemo (~11343 tok)
- `StudyPlanProposal.tsx` — INK — renders table — uses useMemo (~5369 tok)

## components/wiki/

- `BlockRenderer.tsx` — BlockRenderer — renders table (~627 tok)
- `DeleteContentButton.tsx` — DeleteContentButton (~431 tok)
- `WikiContent.tsx` — WikiContent (~154 tok)
- `WikiForm.tsx` — LOCALE_LABELS — renders form — uses useRouter (~2297 tok)
- `WikiListItem.tsx` — WikiListItem (~988 tok)

## components/wiki/blocks/

- `ChecklistBlock.tsx` — ChecklistBlock (~864 tok)
- `EmailTemplate.tsx` — EmailTemplate — uses useState (~651 tok)
- `InfoBox.tsx` — VARIANTS (~269 tok)
- `StepsBlock.tsx` — StepsBlock (~556 tok)
- `TableBlock.tsx` — TableBlock — renders table (~411 tok)

## data/

- `knowledge-sop-content.json` — Declares 500 (~33735 tok)

## docs/

- `AI-HANDOVER.md` — AI Handover - Movy Study Plan (~4158 tok)
- `BRAND.md` — Marca Movy — referência de implementação (~532 tok)
- `FRONTEND-REFACTOR.md` — Frontend Refactor — "Editorial Movement" (~2160 tok)
- `FUTURE-DOCUSEAL.md` — avaliação do DocuSeal (assinatura eletrônica open-source, alternativa ao DocuSign) para o fluxo de proposta/aceite: MVP-aceite in-house (SPLIT 5) vs. DocuSeal (v2), modelo de integração (API/webhooks/embedded, chaveado por `org_id`+`study_plan_id`), riscos (AGPLv3+Section 7(b), validade jurídica). Irmão de `docs/FUTURE-LAGO-V3.md`.
- `FUTURE-LAGO-V3.md` — Avaliação do Lago (billing/metering usage-based) como futuro v3: casos de uso, fronteira Movy↔Lago, pré-requisitos. Irmão de `docs/LAGO-WOOFED-CONVERGENCE.md`.
- `LAGO-WOOFED-CONVERGENCE.md` — cruzamento estrutural Lago × woofed-crm × Movy: matriz de convergência, compatibilidade, o que antecipar antes da v3 (mapeado a SPLITS) e padrões de engenharia obrigatórios desde a v0 (R1–R11). Irmão de `docs/FUTURE-LAGO-V3.md`.
- `PRODUCT-ROADMAP.md` — Master architecture & roadmap: product repositioning (agency proposal builder), tenancy-ready principle, domain model, SPLITS by code area, execution order. READ before planning Portfolio/Proposals/Calc. (~3600 tok)
- `STUDY-PLANS.md` — Cotações & Study Plans (~1713 tok)

## i18n/

- `request.ts` (~120 tok)
- `routing.ts` — Exports routing (~44 tok)

## lib/

- `slug.ts` — Exports slugify (~62 tok)

## lib/api/

- `audit.ts` — Exports logAudit, logAuditWithClient (~361 tok)

## lib/calc/

- `money.ts` — Money primitives in integer cents (SPLIT 1): toCents (legacy-float border coercion), asCents, centsToNumber, splitCents, formatMoney/parseMoneyToCents (Intl), Money/CurrencyCode types (~620 tok)
- `types.ts` — Computed snapshot types: ComputedTotals, ComputedPerCourse (integer cents + currencyCode + version) (~250 tok)
- `index.ts` — Calc engine barrel: reexports money + types + computeProposal/COMPUTED_VERSION (~80 tok)

## lib/auth/

- `get-user.ts` — Exports Profile, getUser (~205 tok)

## lib/constants/

- `content.ts` — Exports STATUS_STYLES, getStatusLabel (~203 tok)
- `departments.ts` — Exports DEPARTMENTS, DepartmentSlug, DEPT_COLORS, DEPT_ACCENT + 3 more (~1271 tok)

## lib/crm/

- `contacts.ts` — CRM contacts seam (SPLIT 2): org-scoped Contact types + queries (getContactById, findContactByEmail/Phone, listContacts, dedup upsertContact, normalizeEmail/Phone) (~900 tok)

## lib/financial/

- `calculator.ts` — Financial Capability Demonstration for the Australian student visa. (~986 tok)

## lib/permissions/

- `can.ts` — Exports hasMinRole, isEditorOrAbove, isAdminOrAbove, isSuperAdmin, can (~323 tok)

## lib/security/

- `sanitize-html.ts` — Server-safe HTML sanitizer. (~744 tok)

## lib/study-plans/

- `calculations.ts` — Exports money, number, weeks, courseStudyWeeks + 39 more (~3356 tok)
- `defaults.ts` — Exports COURSE_TYPES, COURSE_PRESETS, uid, ELICOS_MODULE_NAMES + 11 more (~2413 tok)
- `types.ts` — Show the holiday/timeline planning in the generated proposal. Default true. (~584 tok)

## lib/supabase/

- `client.ts` — Exports createClient (~80 tok)
- `server.ts` — Exports createClient (~246 tok)
- `service.ts` — Exports createServiceClient (~137 tok)

## lib/ui/

- `theme.ts` — Movy design tokens for inline-style surfaces. (~696 tok)

## messages/

- `en.json` (~761 tok)
- `es.json` (~811 tok)
- `pt.json` (~792 tok)

## public/

- `manifest.json` (~165 tok)

## supabase/

- `FIRST_LOGIN.sql` — Movy Internal Hub — Primeiro Login / First Login Setup (~506 tok)

## supabase/migrations/

- `001_movy_core_study_plans.sql` — Movy Internal Hub core schema + Study Plans. (~2281 tok)
- `002_content_blocks_categories.sql` — Movy Internal Hub — Migration 002: Content Blocks & Categories (~850 tok)
- `003_lockdown_movy_functions.sql` — Lock down helper functions used by triggers/RLS so they are not callable as public RPC. (~181 tok)
- `004_authenticated_audit_inserts.sql` — Allow active authenticated users to write their own audit events. (~153 tok)
- `005_movy_knowledge_content.sql` — Movy Internal Hub - curated knowledge content import. (~44270 tok)
- `006_cleanup_movy_knowledge.sql` — Movy Internal Hub - curated knowledge content import. (~44270 tok)
- `007_sanitize_movy_knowledge_content_v2.sql` — Remove sensitive/legacy text from already-imported knowledge content. (~316 tok)
- `008_course_presets.sql` — Feature 2: Course Presets Manager. (~1160 tok)
- `010_proposal_domain_contacts.sql` — SPLIT 2: contacts table (org-scoped, woofed-shape, R6/R7, RLS), study_plans proposal cols + R8 generated idempotency_key, study_plan_status enum extend, proposal_events timeline + RLS, soft-delete-aware SELECT policy, non-destructive student-data backfill (~1600 tok)

## tests/

- `study-financial.test.mjs` — Declares financial (~882 tok)
- `crm-contacts.test.mjs` — SPLIT 2: normalizeEmail/Phone + study_plan_status enum-extended assertion (~300 tok)

## types/

- `blocks.ts` — Exports TextBlock, StepsBlock, ChecklistBlock, InfoBoxBlock + 4 more (~271 tok)
- `database.ts` — types/database.ts — Convenience aliases used throughout the app (~244 tok)
- `supabase.ts` — types/supabase.ts — Auto-generated from Supabase project xpthmguzcbmndyyexfbt (~3542 tok)
