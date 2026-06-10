# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-10T07:22:28.141Z
> Files: 88 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.eslintrc.json` — ESLint configuration (~13 tok)
- `.gitignore` — Git ignore rules (~154 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `middleware.ts` — Exports middleware, config (~718 tok)
- `next.config.mjs` — Next.js configuration (~128 tok)
- `package-lock.json` — npm lock file (~73446 tok)
- `package.json` — Node.js package manifest (~262 tok)
- `postcss.config.mjs` — Declares config (~41 tok)
- `README.md` — Project documentation (~293 tok)
- `tailwind.config.ts` — Tailwind CSS configuration (~216 tok)
- `tsconfig.json` — TypeScript configuration (~170 tok)

## .claude/

- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## app/

- `globals.css` — Styles: 21 rules, 6 vars, 1 animations (~714 tok)
- `layout.tsx` — metadata (~165 tok)
- `page.tsx` — RootPage (~32 tok)

## app/[locale]/

- `layout.tsx` — LocaleLayout (~191 tok)
- `page.tsx` — LocaleRoot (~57 tok)

## app/[locale]/(protected)/

- `error.tsx` — ProtectedError — uses useEffect (~485 tok)
- `layout.tsx` — ProtectedLayout (~134 tok)

## app/[locale]/(protected)/campaigns/

- `page.tsx` — CampaignsPage — renders table (~2233 tok)

## app/[locale]/(protected)/dashboard/

- `loading.tsx` — DashboardLoading (~786 tok)
- `page.tsx` — DashboardRedirect (~79 tok)

## app/[locale]/(protected)/departments/[slug]/

- `loading.tsx` — DepartmentLoading (~2106 tok)
- `page.tsx` — DepartmentPage (~2357 tok)

## app/[locale]/(protected)/home/

- `loading.tsx` — HomeLoading (~179 tok)
- `page.tsx` — HomePage — renders form (~2349 tok)

## app/[locale]/(protected)/search/

- `loading.tsx` — SearchLoading (~389 tok)
- `page.tsx` — SearchPage — renders form (~2058 tok)

## app/[locale]/(protected)/settings/

- `layout.tsx` — SettingsLayout (~448 tok)
- `page.tsx` — SettingsPage (~1170 tok)
- `SettingsTabNav.tsx` — TABS (~500 tok)

## app/[locale]/(protected)/settings/audit-log/

- `page.tsx` — ACTION_LABELS — renders table (~906 tok)

## app/[locale]/(protected)/settings/users/

- `page.tsx` — UsersPage — renders table (~861 tok)

## app/[locale]/(protected)/study-plans/

- `actions.ts` — Exports createStudyPlan, updateStudyPlan, deleteStudyPlan (~1010 tok)
- `page.tsx` — StudyPlansPage — renders form, table (~1266 tok)

## app/[locale]/(protected)/study-plans/[id]/

- `page.tsx` — StudyPlanDetailPage (~236 tok)

## app/[locale]/(protected)/wiki/

- `actions.ts` — API routes: GET (24 endpoints) (~1886 tok)
- `loading.tsx` — WikiLoading (~611 tok)
- `page.tsx` — WikiPage — renders form, table (~2806 tok)

## app/[locale]/(protected)/wiki/[slug]/

- `page.tsx` — STATUS_STYLES (~3724 tok)

## app/[locale]/(protected)/wiki/[slug]/edit/

- `page.tsx` — WikiEditPage (~606 tok)

## app/[locale]/(protected)/wiki/new/

- `page.tsx` — WikiNewPage (~375 tok)

## app/[locale]/(public)/login/

- `page.tsx` — LoginPage — uses useState, useParams (~2160 tok)

## app/auth/callback/

- `route.ts` — Next.js API route: GET (~320 tok)

## app/unauthorized/

- `page.tsx` — UnauthorizedPage (~821 tok)

## components/dashboard/

- `DeptCard.tsx` — DeptCard (~639 tok)

## components/departments/

- `CategorySection.tsx` — CategorySection — uses useState (~805 tok)

## components/layout/

- `AppShell.tsx` — ROLE_COLORS — uses useState, useRouter (~5278 tok)

## components/study-plans/

- `StudyPlanEditor.tsx` — applicantTypes — uses useState, useMemo (~5046 tok)

## components/wiki/

- `BlockRenderer.tsx` — BlockRenderer — renders table (~627 tok)
- `DeleteContentButton.tsx` — DeleteContentButton (~431 tok)
- `WikiContent.tsx` — WikiContent (~154 tok)
- `WikiForm.tsx` — LOCALE_LABELS — renders form — uses useRouter (~2297 tok)
- `WikiListItem.tsx` — WikiListItem (~1108 tok)

## components/wiki/blocks/

- `ChecklistBlock.tsx` — ChecklistBlock (~863 tok)
- `EmailTemplate.tsx` — EmailTemplate — uses useState (~650 tok)
- `InfoBox.tsx` — VARIANTS (~269 tok)
- `StepsBlock.tsx` — StepsBlock (~555 tok)
- `TableBlock.tsx` — TableBlock — renders table (~410 tok)

## i18n/

- `request.ts` (~120 tok)
- `routing.ts` — Exports routing (~44 tok)

## lib/

- `slug.ts` — Exports slugify (~62 tok)

## lib/api/

- `audit.ts` — Exports logAudit (~216 tok)

## lib/auth/

- `get-user.ts` — Exports Profile, getUser (~192 tok)

## lib/constants/

- `content.ts` — Exports STATUS_STYLES, getStatusLabel (~203 tok)
- `departments.ts` — Exports DEPARTMENTS, DepartmentSlug, DEPT_COLORS, DEPT_ACCENT + 3 more (~1069 tok)

## lib/permissions/

- `can.ts` — Exports hasMinRole, isEditorOrAbove, isAdminOrAbove, isSuperAdmin, can (~334 tok)

## lib/security/

- `sanitize-html.ts` — Exports sanitizeHtml, stripHtml, excerpt (~178 tok)

## lib/study-plans/

- `calculations.ts` — Exports money, number, weeks, courseStudyWeeks + 18 more (~1155 tok)
- `defaults.ts` — Exports COURSE_TYPES, COURSE_PRESETS, uid, defaultPaymentParts + 4 more (~1683 tok)
- `types.ts` — Exports CourseType, SegmentKind, ApplicantType, CourseSegment + 5 more (~416 tok)

## lib/supabase/

- `client.ts` — Exports createClient (~80 tok)
- `server.ts` — Exports createClient (~246 tok)
- `service.ts` — Exports createServiceClient (~137 tok)

## messages/

- `en.json` (~761 tok)
- `es.json` (~811 tok)
- `pt.json` (~792 tok)

## public/

- `manifest.json` (~165 tok)

## supabase/

- `FIRST_LOGIN.sql` — Movy Internal Hub — Primeiro Login / First Login Setup (~515 tok)
- `SEED_RICH_CONTENT.sql` — Movy Internal Hub — Seed de conteúdo rico com blocos (~3438 tok)
- `SEED_WIKI_CATEGORIES.sql` — Movy Internal Hub — Wiki Category Seed (~3017 tok)

## supabase/migrations/

- `001_movy_core_study_plans.sql` — Movy Internal Hub core schema + Study Plans. (~2281 tok)
- `002_content_blocks_categories.sql` — Movy Internal Hub — Migration 002: Content Blocks & Categories (~855 tok)
- `003_lockdown_movy_functions.sql` — Lock down helper functions used by triggers/RLS so they are not callable as public RPC. (~181 tok)

## types/

- `blocks.ts` — Exports TextBlock, StepsBlock, ChecklistBlock, InfoBoxBlock + 4 more (~271 tok)
- `database.ts` — types/database.ts — Convenience aliases used throughout the app (~244 tok)
- `supabase.ts` — types/supabase.ts — Auto-generated from Supabase project xpthmguzcbmndyyexfbt (~3542 tok)
