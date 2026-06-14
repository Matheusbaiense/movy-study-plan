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
- [2026-06-15] **UI DECIDED: remodel the whole product to woofed's interface, Movy-skinned.** Owner-confirmed: adopt woofed's *structure + semantic token system + component recipes*, but keep Movy brand (purple `#4B1A77` + gold `#FBB615`, Clash Display/Satoshi). woofed UI anatomy = Tailwind `@layer components` DS (`color-*`/`button-*`/`typography-*`) + collapsible icon sidebar (72↔200, light surface, NOT a dark rail) + per-page `navbar-container` topbar + Lucide icons + shadcn vars. Implemented as **SPLIT UI** (frontend-only, independent of SPLIT 0; page migration folds into splits 3/4/5/6).
- [2026-06-15] **No VPS / no running woofed needed.** Under Caminho B, woofed is a blueprint; the UI is replicated from the cloned source (`C:/dev/woofed-crm`). A production woofed instance only matters for Caminho C or to trial the real CRM — not for proposal/portfolio/UI work. AllyHub (not woofed) is the test-user research target.
- [2026-06-15] **DS-class layer is the migration path off inline styles.** New semantic classes live in `app/globals.css` (`@layer components`) wired to `--ds-*` tokens that read our light/dark vars. Components should progressively replace inline styles with these classes (and hand-rolled SVGs with `lucide-react`). theme.ts inline tokens still valid during transition.
- [2026-06-15] **UI migration scope = value-driven, not cosmetic (anti-churn).** Audited the repo (grep hardcoded colors/fonts + hand-rolled `<svg>`) to migrate ONLY screens that diverged from the DS/tokens. Migrated non-split screens: home, wiki (list/article/blocks), departments detail, settings/users, error, loading skeletons. Deliberately NOT migrated: **Câmbio** (already token-based; rewrite = visual no-op + regression risk) and **`FinancialCalculator.tsx`** (it's the printable paper financial document — intentionally white in both themes, like the proposal PDF). Split-owned screens (list/editor/proposal) fold into splits 3/4/5; `study_plans`-related `as any` quit in SPLIT 0.
- [2026-06-15] **Roadmap validated by architecture-critic (≈90% ready, "execute SPLIT 0").** Integrated corrections (roadmap §3/§4/§5): (1) `contacts` uniqueness is **per-org** `unique(org_id, lower(email))`/`unique(org_id, phone)` — NOT woofed's GLOBAL index (single-account artifact that would leak contacts across orgs). (2) `proposal_events` adopts woofed `events` shape (`kind`/`scheduled_at`/`done_at`/`from_me`/`status`/`title`). (3) `current_org_id()` must avoid RLS recursion: read `auth.jwt()→app_metadata.org_id` with query fallback, `SECURITY DEFINER STABLE` + fixed `search_path`; never make a `profiles` policy call a function that queries `profiles`. (4) `org_id NOT NULL` ordering: nullable→backfill→default→NOT NULL; seed Movy org with a FIXED UUID; index `org_id`. (5) New `CourseSource` contract (editor↔portfolio seam) so SPLIT 6 plugs a provider instead of reopening `StudyPlanEditor.tsx`. (6) Money backfill owner: SPLIT 1 engine reads legacy float at the edge, persists cents going forward (no mass migration unless SPLIT 2). (7) `ai_usage = {limit, tokens}`; money = `bigint *_in_cents`.
- [2026-06-15] **Cut over-engineering for a single-tenant agency:** MCP and pgvector/embeddings removed from SPLIT 7 (deferred to CRM phase — OCR→LLM→validation needs no embeddings); `organizations.slug`/`status` deferred (only `org_id` needed for tenancy-ready); `audit_logs` (system audit) vs `proposal_events` (user/CRM timeline) kept as two systems with documented distinct purposes.
- [2026-06-15] **SPLIT 0 done in two halves: code/types NOW, DB apply DEFERRED (blocked).** Wrote `migration 009` (organizations + org_id + `current_org_id()` + org-scoped RLS, seeded Movy org fixed UUID), aligned hand-maintained `types/supabase.ts` to the repo migrations (added study_plans/allowed_emails/course_presets/organizations + `study_plan_status` + org_id on profiles/audit_logs), quit ALL `as any` in the repo (narrow `as unknown as X` only at the `jsonb→StudyPlanData` and dynamic-`Record→Insert` seams), widened `logAuditWithClient` client param, and exposed `orgId` from `get-user.ts`. `type-check`+`build` green. **DB apply blocked:** canonical project is `xpthmguzcbmndyyexfbt` (per `.env.local`/types/code) but this session's Supabase MCP only reaches a different account whose sole ACTIVE project `movy-education` (`hvtywvtleoaeooffecrc`) has an INCOMPATIBLE minimal schema (no profiles/audit_logs/roles). Applying 009 there would fail. So 009 must be applied to `xpthmguzcbmndyyexfbt` via dashboard/owner (after confirming 001/008 applied), then ideally regen types. Did NOT mutate any DB.
- [2026-06-15] **`types/supabase.ts` is hand-maintained, source-of-truth = repo migrations (not a live gen).** It claims "auto-generated" historically but diverged from every reachable live DB. Treat `supabase/migrations/*` as canonical; regenerate from `xpthmguzcbmndyyexfbt` only when that project is reachable, and diff against the hand-maintained version before overwriting.
- [2026-06-15] **`movy-education` (`hvtywvtleoaeooffecrc`) is NOT the app's project** — it's a separate/experimental Supabase project with a minimal study_plans/allowed_emails schema. The app runs on `xpthmguzcbmndyyexfbt`. Don't apply Movy migrations to movy-education.

## Decisão — Padrões de convergência Lago × woofed travados desde a v0 (2026-06-15)

**Contexto:** cruzamento estrutural de Lago (billing/metering) e woofed-crm (CRM) com o domínio
Movy (`docs/LAGO-WOOFED-CONVERGENCE.md`). Os três sistemas só convergem de verdade em: (1) dinheiro
em unidade menor inteira + moeda; (2) cliente/tenant (`org_id` ↔ `accounts` ↔ `customers.external_id`);
(3) uso de IA (`ai_usage {limit, tokens}`). woofed↔Movy = alta compat (Caminho B); Lago↔Movy = alta
via API/eventos (nunca absorver schema); Lago↔woofed só se tocam pela Movy.

**Decisão (regras v0, verificáveis em PR):**
- R1 dinheiro `bigint` cents + `currency_code` por valor; nunca float persistido (P9).
- R2 toda entidade de negócio: `org_id` + RLS + índice (P1).
- R3 naming/semântica woofed; R4 unicidade por org (nunca global); R5 snapshot de preço/atributos.
- R6 (NOVO) `metadata jsonb` em toda entidade de negócio.
- R7 (NOVO) `external_id` nullable (único por org) nas entidades de borda.
- R8 (NOVO) chave de idempotência determinística (estilo `transaction_id`) em ops que emitirão evento.
- R9 `ai_usage {limit, tokens}` fixo + modelo `apps_ai_assistents`-shaped.
- R10 três canais de evento separados: `audit_logs` ≠ `proposal_events` ≠ `events` do Lago (metering, v3).
- R11 Customer/Invoice (Lago, agência) ≠ Contact/Proposta (Movy, aluno) — domínios distintos.

**Não antecipar (v3+):** taxes, wallets, plans/charges, webhooks ricos, entitlements, pgvector/MCP.
**Consequência:** SPLITs 0/1/2 ganham R6/R7/R8 (ver patches §6 de LAGO-WOOFED-CONVERGENCE.md).

## Decisão — Assinatura/aceite: MVP in-house (SPLIT 5) antes de DocuSeal (v2) (2026-06-15)

**Contexto:** avaliação do DocuSeal (alternativa open-source ao DocuSign) para o "aceite" da
proposta já escopado no SPLIT 5 (`docs/FUTURE-DOCUSEAL.md`). Diferente do Lago (v3), encosta num
fluxo acionável já.

**Decisão:**
- **MVP-aceite in-house no SPLIT 5 (v1):** assinatura eletrônica **simples** — nome + `accepted_at`
  + IP + user-agent (+ termos) em `proposal_events` (`kind=signed`) + `audit_logs`; seta
  `study_plans.accepted_at`/`status`. **Sem dependência externa.** Default do produto.
- **Seam `SignatureProvider`** (provider in-house default), para plugar assinatura externa depois sem
  reabrir a rota pública (espelha o contrato `CourseSource`).
- **DocuSeal = v2 (opcional, condicionado)**, **antes** da v3/Lago, só quando houver documento formal
  (contrato/termo, múltiplas partes, trilha assinada). Integração **por API + webhooks + embedded**,
  chaveada por `org_id` + `study_plan_id` (`external_id`/`metadata jsonb`/idempotência do §3.7);
  **nunca absorver o schema**; **não** delegar o PDF de apresentação ao DocuSeal.

**Riscos registrados:** AGPLv3 + Section 7(b) Additional Terms (rodar como serviço isolado / Cloud;
validar jurídico); **validade jurídica com cautela** — ESIGN/UETA/eIDAS são do fornecedor, no Brasil
a régua é MP 2.200-2/ICP-Brasil (assinatura simples vale mas tem peso probatório menor); white-label/
lembretes/SMS são Pro.

**Posicionamento:** MVP-aceite (v1/SPLIT 5) · DocuSeal (v2) · Lago (v3).
