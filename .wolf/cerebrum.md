# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-06-10

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Prefer fixing documented bugs before starting planned features, even when the feature work is already scoped.
- High bar for visual quality; wants a genuinely professional UI. For a redesign, the ONLY brand constraints are the brand colors and the logo — typography, layout, components are all open to redesign.
- When committing, keep documented bug/error fixes as separate commits from feature/redesign work.
- Each working session MUST be documented in OpenWolf (.wolf/) and docs/AI-HANDOVER.md — a prior agent (Antigravity) skipped this and the user wants it always done.
- Dislikes vanity metrics in an internal tool (e.g., removed Home KPI counters for active users / document / proposal counts — this is not a sales system).

## Key Learnings

- **Project:** movy-study-plan
- **Description:** Simulador local para criar cotações e study plans da Movy Education.

- Validation must run in a temporary clone outside Google Drive when npm/node_modules are involved; Google Drive can corrupt or stall dependency installs.
- Timetable value `Manha` is a persisted/internal value; display it as `Manhã` via a label map instead of changing stored data.
- **Theming system (2026-06-14):** App supports light + dark via `[data-theme='light'|'dark']` on `<html>`. Theme is applied pre-paint by an inline script in `app/layout.tsx` (reads `localStorage['movy-theme']`, falls back to OS `prefers-color-scheme`). `components/ui/ThemeToggle.tsx` toggles + persists it. Brand accent flips: purple is the accent in light, gold in dark.
- **Tokens, not hardcoded colors:** Read semantic tokens from `lib/ui/theme.ts` (`t.text`, `t.surface`, `t.border`, etc.) which map 1:1 to CSS vars in `app/globals.css`. Use `ink(a)` for text/border tints and `purpleA(a)` for brand accents. Do NOT hardcode hex or use `color.purpleDeep` as text — it breaks dark mode.
- **Fonts (2026-06-14):** Now Clash Display (display) + Satoshi (body/UI/mono) via Fontshare `@import`, with Outfit as fallback. `font.mono` is Satoshi (no longer monospaced). This intentionally supersedes the old Brand-Guide stack (Outfit/Manrope/Space Mono) per the user's "only color + logo are fixed" instruction.
- **Active workspace is `C:\dev\movy-study-plan`** (synced with GitHub). The old Google Drive copy is stale — do NOT use it. Codespaces is the cloud dev option; GitHub `Matheusbaiense/movy-study-plan` is the source of truth.
- The printed/PDF document surfaces (financial calculator document, study-plan proposal) must stay WHITE in both themes (they represent paper) — only theme the surrounding form/UI.
- Test user for logged-in QA: `testemovy@movy.com.br` / `teste123!` (role admin). Login is by email, not username.
- PowerShell is the shell: chain commands with `;` (not `&&`) and quote paths containing `(` `)` like `(protected)`.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-06-11] Do not use `git clone --local` from the Google Drive workspace for validation; hardlink creation can fail. Use `git clone --no-local` or a normal copy outside Drive.
- [2026-06-14] Do not use `color.purpleDeep` (or hardcoded hex) for TEXT — it renders dark-on-dark and is invisible in dark mode. Use `t.text` / theme tokens.
- [2026-06-14] In PowerShell, `&&` is not a valid statement separator — use `;`. Quote paths with parentheses (e.g. `"app/[locale]/(protected)/..."`).
- [2026-06-14] Creating a Supabase auth user via raw SQL leaves token columns NULL, which makes GoTrue return 500 "Database error querying schema" on login. Fix: set those token columns to `''` (empty string), not NULL. Prefer the Admin API over raw SQL inserts.
- [2026-06-14] Every session MUST be logged to `.wolf/` (memory, cerebrum, buglog) and `docs/AI-HANDOVER.md`. The Antigravity agent did the redesign but skipped all logging; it had to be reconstructed afterwards.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- [2026-06-11] Kept the `Manha` persisted value unchanged and added a UI label map so existing proposal data remains compatible while the visible Portuguese accent is correct.
- [2026-06-14] Added a full light/dark theme system (default light = "Refined SaaS", dark = "Command-Center"), driven by semantic CSS-variable tokens so the whole app flips with one `[data-theme]` switch. Chosen over per-component dark styling because the app renders mostly with inline styles reading from `lib/ui/theme.ts`.
- [2026-06-14] Replaced the Brand-Guide typography (Outfit/Manrope/Space Mono) with Clash Display + Satoshi for a more "premium" feel. User explicitly authorized changing everything except brand color + logo. NOTE: this conflicts with the older AI-HANDOVER "COMECE AQUI" font rule — the new instruction wins, but flag for the team.
- [2026-06-14] Removed Home KPI counters: an internal tooling hub should not show sales-dashboard vanity metrics, and it also removed non-essential DB count() calls.
- [2026-06-14] Kept the deliberate Space-Mono-style kicker / wide tracking decision intact where it is documented as brand intent; do not "fix" it as a defect.
- [2026-06-15] **Product repositioning:** Movy stops being an internal hub and becomes an agency proposal builder, potentially white-label/SaaS later. Three pillars in priority order: (1) ultra-fast proposal building, (2) AI-assisted portfolio management, (3) automatic explainable calculations. CRM and external integrations (schools/SEC/payments) are OUT of scope. Master plan: `docs/PRODUCT-ROADMAP.md`.
- [2026-06-15] **Tenancy-ready, single-tenant-active:** add `org_id` + `organizations` (seeded "Movy") to the schema/RLS NOW so going multi-agency/white-label later is a config change, not an RLS rewrite or data migration. No table/rule may assume a single agency. App still behaves single-tenant for now.
- [2026-06-15] **Work is organized by SPLITS = code-area work units, not features.** Each hot file (`study_plans`, `StudyPlanEditor.tsx`, `study-plans/actions.ts`, `study-plans/page.tsx`, `StudyPlanProposal.tsx`) is rewritten in exactly ONE split to avoid reopening the same code across features. Execute one split at a time, fully, type-check/test green, own commit. No half-finished states. Order: 0→1→2→3→4→6→5→7→8→9 (see roadmap §7).
- [2026-06-15] **Calc engine = single source of truth + snapshot.** Keep `lib/study-plans/calculations.ts` pure; run client-side for instant preview AND server-side to revalidate on save/publish; store the computed result (and locked FX) on the proposal so the PDF never changes when school prices update.
- [2026-06-15] **Portfolio normalized model replaces `course_presets`:** institutions → campuses → courses → course_price_versions (+ promotions). Proposals reference a course and store a price snapshot.
- [2026-06-15] **AI import never saves directly:** OCR → LLM → deterministic validation → human review (confidence %) → audited publish. Pluggable model layer (fast vs precise) with token/cost ceiling. Document queue with states.
- [2026-06-15] **Quit `(supabase as any)` debt:** regenerate `types/supabase.ts` after every migration; strict TS.
- [2026-06-15] **CRM = woofed-crm (douglara/woofed-crm), with owner authorization.** Future CRM will integrate/merge with woofed-crm to become one product. The Movy architecture must be CRM-ready and woofed-shaped from the start. woofed stack: Rails 7.1 + Postgres(pgvector) + Devise + GoodJob + Vite/Stimulus/Turbo/Inertia + Tailwind + motor-admin + money gem (`*_in_cents`) + MCP server/Doorkeeper OAuth + Chatwoot/Evolution(WhatsApp) + AI assistant/embeddings. **woofed is single-account per install (NOT multi-tenant)** — SaaS would require adding account scoping there too. Cloned for study at `C:/dev/woofed-crm` (sibling, NOT inside Movy repo).
- [2026-06-15] **Domain naming aligns with woofed:** organizations≈accounts, contacts (student/lead), deals (opportunity), pipelines/stages, products/deal_products (catalog + snapshot line items — validates our snapshot principle P3), events (timeline/tasks), custom_attribute_definitions. Proposal references `contact_id` (+ reserved `deal_id`), never student-only-in-jsonb.
- [2026-06-15] **P9 money in integer cents + currency_code (no float).** Matches woofed `*_in_cents` + money gem; eliminates rounding bugs. Engine computes in cents; UI formats with Intl. Migrate existing numeric/AUD float columns in Split 1.
- [2026-06-15] **Integration strategy DECIDED (roadmap §10.1): Caminho B** — absorb the woofed CRM model into the Supabase/Next stack (one clean stack: uuid/RLS/strict-TS, real multi-tenant white-label). woofed is the schema/UX blueprint, not necessarily code to run. C kept viable as fallback; **A discarded** (Devise×Supabase auth + Rails-no-RLS clash). Owner-confirmed 2026-06-15.
- [2026-06-15] **Money DECIDED: integer cents + currency_code everywhere** (owner-confirmed), migrate in Split 1.
- [2026-06-15] **AllyHub/Ally blueprint later via TEST-USER UX research only (not code).** Input for proposal/portfolio UX (Splits 4/5/6). Not actionable now.
