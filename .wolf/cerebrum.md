# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-06-10

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- **WHITE-LABEL FIRST (regra-mãe — aplicar em TODA decisão técnica).** Owner directive (2026-06-15):
  every technical choice — schema, RLS, API, UI, naming, libs, config, integrations — must assume Movy
  becomes a **white-label / multi-agency SaaS** later. Tie-breaker: always pick the option that makes
  going white-label a **config change, not a rewrite**. Never assume a single agency; never hardcode the
  Movy brand/data. Already-locked consequences: `org_id` + per-org RLS on every business entity;
  uniqueness **per org**, never global; per-org branding/config; woofed-shaped naming; no hardcoded
  secret/brand. This supersedes convenience — when in doubt, choose the multi-tenant-safe path.
- **WOOFED-SHAPED FIRST (regra documentada — consequência do P0/Caminho B).** Owner directive
  (2026-06-15): como Movy e woofed **serão unificados**, TODA modelagem de dado/entidade que tem
  equivalente no woofed deve **nascer no padrão do woofed** — para não dar problema na fusão. Consequências
  travadas: (1) naming de tabela/coluna woofed-shaped; (2) campo de negócio que **não é coluna nativa do
  woofed vai em `custom_attributes` (jsonb)**, NUNCA coluna dedicada (ex.: lead nationality/lead_source/
  preferred_language); (3) `metadata`/`additional_attributes` só p/ dado de integração/sistema; (4) dinheiro
  `*_in_cents`; (5) unicidade **por org** (não global como o woofed single-account). **Desempate:** a opção
  que **sincroniza 1:1 com o woofed sem remapear/migrar** vence. **Antes de criar coluna nova** numa
  entidade com equivalente woofed (contacts, deals, products, events…), **conferir `db/schema.rb` do woofed**
  (`C:/dev/woofed-crm`) e seguir o shape. Reforça R3/R4 da convergência.
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

- **AllyHub = white-label Sellead (2026-06-15 — CRÍTICO):** O backend real do AllyHub é `api.sellead.com`. AllyHub é um **white-label da plataforma Sellead** — o produto não é proprietário. Isso é vulnerabilidade competitiva grave: dependência de terceiro, limitação de customização.
- **AllyHub Quote 2.0 arquitetura (2026-06-15):** AngularJS parent (`Quote2Ctrl`) + React iframe (`quote2.allyhub.co`, CRA) + `api.sellead.com` REST API + Firebase Firestore (real-time) + Chatwoot + Google Maps + PagSeguro. Auth via JWT Bearer em localStorage. Dois editores: Quote 1.x (AngularJS legacy em `/quote2/edit/{id}/profile`) + Quote 2.0 (React em `/quote-2/edit/{id}`).
- **AllyHub pagamentos 100% brasileiros (2026-06-15):** Gateways: PagBank (até 12x), Ally Checkout (link), PIX. Sem Stripe, sem PayPal, sem gateway australiano. Enorme fraqueza para o mercado AU.
- **AllyHub tech stack (2026-06-15 — pesquisa competitiva):** AllyHub usa **AngularJS 1.x** (confirmado via `angular.element().scope().$apply()` em javascript_tool) — framework em EOL desde 2021. Usa `ui-select` (AngularJS dropdown) que requer manipulação de scope para abrir/pesquisar programaticamente. Também usa Chatwoot (chat widget `.woot-widget-bubble`), CKEditor (rich text), Aussie Translate (integração envio de documentos), Tawk.to (help). Backend hospedado no Railway (`allybilling-production.up.railway.app`). CNPJ brasileiro (Ribeirão Preto SP) — produto 100% em português.
- **AllyHub módulos mapeados (2026-06-15):** Rotas principais: `/all-student` (pipeline kanban 6 estágios), `/student/{id}` (5 abas: Overview/Email/Quotes and Links/Info/Earnings), `/quote-2/edit/{id}` (Quote 2.0 v11.0.2), `/opportunity` (auto-criado ao iniciar cotação), `/report/*` (Performance/Behavior/Sales/Cancellations/Quotes/Commissions), `/experience` (Experiências/marketing), `/campaign`, `/settings/*` (16 sub-seções), `/automation` (pago — não incluso no Starter), `/report/plugandplayagency` (comissões Ally+).
- **AllyHub UX gaps p/ Movy (2026-06-15):** (1) AngularJS EOL = lento, bugs, sem mobile; (2) interface 100% português = não serve agências internacionais; (3) formulário de aluno tem 40+ campos obrigatórios na criação; (4) automações são pagas (Starter não inclui); (5) planos confusos (Starter → Essential R$197/agente → Premium R$297/agente → Enterprise). Movy com Next.js/React é tecnologicamente superior.
- **AllyHub Opportunity auto-criação (2026-06-15):** Ao iniciar uma cotação (criar rascunho de quote), o AllyHub auto-cria um módulo Opportunity (ex.: #OP500) com due date 6 meses automático. Relacionamento: 1 Oportunidade → N Cotações.
- **AllyHub IA Qualification (2026-06-15):** Botão "Start IA Qualification" no perfil do aluno — scoring de lead com IA. Feature premium que a Movy pode replicar via Supabase + LLM.
- **AllyHub modelo de receita por cotação (2026-06-16 — CRÍTICO):** Todo orçamento Ally+ com curso australiano injeta automaticamente uma taxa `AU$150` chamada "Taxa de consultoria (Dólar Australiano)" (tipo: Fee, supplier: "Ally Hub", label UI: "Administrative Tax"). É a comissão da plataforma por transação — cobrada do cliente final e embutida no bill.
- **AllyHub Medibank OSHC auto-sugestão (2026-06-16):** Ao adicionar qualquer curso AU via Ally+, o modal "We found some suggestions" abre automaticamente sugerindo OSHC Medibank (AU$30 transfer fee + AU$70 OSHC Single = AU$100 total). Se aceito, entra no bill automaticamente.
- **AllyHub regra 45 dias data de início (2026-06-16):** Cursos Ally+ exigem data de início ≥ 45 dias a frente da data atual. O botão fica desabilitado com datas mais próximas. Campo de data usa react-datepicker — `fill` via DevTools não dispara React onChange; usar navegação por calendário com cliques em uid.
- **AllyHub catálogo AU limitado (2026-06-16):** Apenas 27 programas australianos (filter = Australia). Escolas: English Path Brisbane (13), LSI Brisbane (4), Lexis English (6 campi: Brisbane/Sydney/Perth/Noosa/Byron Bay), APAC/GEDU (1). Cidades ausentes: Melbourne, Adelaide, Cairns, Gold Coast, Canberra. Fraqueza competitiva grave.
- **AllyHub Quote 2.0 React iframe UIDs (2026-06-16):** UIDs no formato `uid=FRAME_ID_ELEMENT_SEQ` (ex: `uid=25_21`). Mudam a cada re-render do React. SEMPRE tirar `take_snapshot` antes de cada interação para obter UIDs frescos. Checkbox de item: clicar no heading label (uid heading) em vez do próprio checkbox — React usa label toggling.
- **AllyHub bill completo Q501 (2026-06-16):** Course AUD400 + Enrol AUD250 + Material AUD75 + AllyHub Fee AUD150 + Medibank transfer AUD30 + OSHC Single AUD70 + EP Insurance AUD30 = **AUD 1,005** (1 semana EP Brisbane General English Classic Morning).
- **AllyHub playground efêmero (2026-06-16 — CRÍTICO):** O playground do Quote 2.0 é stateless no servidor. GET /draft retorna apenas metadados (id, student_id, quotes[] com converted_value) — sem cursos/fees. O estado completo (cursos + fees) existe só na memória React até o "Finish and Save Quotes". Só `converted_value` persiste via auto-save. Cada reload reconstrói o playground do zero.
- **AllyHub CORS assimetria (2026-06-16):** GET liberado de qualquer origin; PUT/POST CORS-blocked de `app.allyhub.co`, liberado apenas de `quote2.allyhub.co`. AngularJS parent só lê; React iframe é a única origin autorizada para mutações.
- **AllyHub postMessage init (2026-06-16):** React iframe aguarda em /loading até receber `{token, user(JSON string), toEditQuoteId, studentId, isPP}` via MessageChannel do Angular parent. Verifica `e.origin === "https://app.allyhub.co"`.
- **AllyHub JWT com aspas literais (2026-06-16):** `localStorage.token` armazenado como `"eyJ..."` (JSON.stringify de string). Authorization header deve ser `Bearer "eyJ..."` com as aspas literais incluídas.
- **AllyHub fee IDs AU (2026-06-16):** 266546=AllyHub taxa AU$150 (obrigatório), 425150=Medibank OSHC transfer AU$30 (obrigatório), 306366=Medibank OSHC Single AU$70/mês (**priceIsExpired:true**, expirou 2025-12-31), 384576=EP Insurance AU$30/sem (sugerido).
- **AllyHub bug crítico OSHC expirado (2026-06-16):** Fee 306366 (OSHC Single Medibank) tem priceIsExpired:true. Finish (`autoSave:false`) retorna `{"error":true, "totals":[]}` (HTTP 200) e zera converted_value. **Nenhuma cotação AU pode ser finalizada via Ally+ no estado atual.**
- **AllyHub WAF após Finish falho (2026-06-16):** Após PUT `autoSave:false` com `error:true`, todos os PUTs subsequentes falham com `net::ERR_FAILED`. OPTIONS preflight retorna 200 (CORS OK), mas o PUT é bloqueado pelo servidor. Afeta múltiplas abas/quotes/reloads. GET continua funcionando. Parece bloqueio WAF por sessão/IP após payload suspeito.
- **AllyHub acomodações AU (2026-06-16):** Catálogo de acomodações vazio para escolas AU. As 5 escolas do catálogo AU não cadastraram acomodações separadas. Cursos "Full Experience Camp" incluem acomodação no próprio preço do curso.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-06-16] **Pesquisa competitiva/espionagem vai em handover SEPARADO**, nunca no `AI-HANDOVER.md` principal. Criar `docs/AI-HANDOVER-ALLYHUB.md` (ou similar) para não poluir o log de desenvolvimento com sessões de pesquisa. O principal deve ter só uma linha de referência apontando para o arquivo separado.
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
- [2026-06-15] **SPLIT 1 done — calc engine single-source + integer cents + computed snapshot.** New leaf module `lib/calc/` (`money.ts` cents helpers w/ `toCents` legacy-float border coercion + IEEE-754 guard; `types.ts` `ComputedTotals`/`ComputedPerCourse`; `index.ts` barrel). `calculations.ts` now has a pure `*Cents` core + `computeProposal()`/`COMPUTED_VERSION=1`; the old float fns are thin `centsToNumber()` delegators so the UI is untouched (same API/floats). `financial/calculator.ts` keeps float math + adds `computeFinancialCapacityCents()` bridge. Server (`study-plans/actions.ts`) recomputes and persists the snapshot under **`data.computed`** inside the existing jsonb (no column, no migration, versioned); `StudyPlanData.computed?` typed. Legacy floats read at the border, cents persisted from next save (mass backfill deferred to SPLIT 2). type-check/test(10)/build green.
- [2026-06-15] **`allowImportingTsExtensions: true` added to tsconfig (safe: `noEmit` already true).** Node 24 `node --test` strips types but requires `.ts` extensions on relative **value** imports at runtime; pre-existing relative imports in the test-traversed files were all `import type` (erased), so this only surfaced when the engine started importing `lib/calc/money` as a value. Only `calculator.ts` and `calculations.ts` use the explicit `'../calc/money.ts'` specifier; everything else stays extensionless (bundler resolution). webpack/Next build resolves the physical `.ts` file fine.
- [2026-06-15] **SPLIT 2 done — proposal domain + CRM contacts seam (migration 010 APPLIED to `xpthmguzcbmndyyexfbt`).** New `contacts` table (org-scoped, woofed-shape, R6 `metadata jsonb` + R7 `external_id`, uniqueness **per-org** via partial idx on `(org_id,lower(email))`/`(org_id,phone)`/`(org_id,external_id)`, RLS in the 009 pattern). `study_plans` gained `contact_id` (FK→contacts, ON DELETE SET NULL), `deal_id` (reserved, no FK), `currency_code` default 'AUD', `expires_at`, `accepted_at`, `deleted_at`, `metadata jsonb`, `external_id`, and **R8 `idempotency_key` as a GENERATED `'study_plan:'||id` column** (deterministic anchor for becoming a billable item in v3 — no invoice created). Enum `study_plan_status` extended additively (+`ready_review`/`approved_internal`/`viewed`/`negotiating`/`rejected`/`expired` = 10). New `proposal_events` timeline (append-only, woofed `kind/scheduled_at/done_at/from_me`, RLS insert editor+, no update/delete). `study_plans` SELECT policy EXTENDED to be soft-delete-aware (non-deleted to all active org members; trash only to editors+); hard-delete stays admin-only. **Data migration is NON-destructive + idempotent** (`DO` block only touches `contact_id IS NULL`): moves `data.student/email/phone`→`contacts` (dedup email→phone) and sets `contact_id`, **but keeps the jsonb as the editor's working copy** — relinking the editor to `contacts` and deprecating those jsonb fields is SPLIT 4. 2 existing plans migrated, 0 loss. Advisors: no new ERRORs (only pre-existing 009 security-definer WARNs + auth leaked-password config). Types regenerated from live DB (not hand-edited). Domain layer: `lib/crm/contacts.ts` (org-scoped queries + dedup `upsertContact`); `lib/study-plans/types.ts` (`StudyPlanStatus = Enums<'study_plan_status'>`, `options[]`, `contactRef`, new row cols). Server actions added (`duplicate`/`changeStatus`/`archive`/`softDelete`/`restore`/`hardDelete`/`upsertContact`) each emitting `proposal_events` + `audit_logs`; `withComputed` snapshot intact; list filters `deleted_at IS NULL`. type-check/test(13)/build green. **Do NOT touch list/editor UI here — that's SPLIT 3/4.**

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

## Decisão — Reconciliação de branch + revisão do roadmap vs. propostas GPT/Cursor (2026-06-15)

**Contexto/achado:** descobri (via export de chat do Cursor) que o Cursor **já tinha concluído SPLIT 1
e SPLIT 2** (commits `7326e1f`/`80cab52`/`68c6db5`, migration 010 APLICADA no banco), e que a `main` já
estava nesses commits — mas a branch de trabalho `claude/sleepy-cannon` estava 3 commits atrás, com um
handover desatualizado dizendo "SPLIT 1 = próximo". Eu havia editado o roadmap achando que 1/2 não
estavam feitos. **Do-Not-Repeat:** SEMPRE conferir `git log --oneline --all` e o estado da `main` antes
de planejar — outra branch/agente pode ter avançado sem que o handover local saiba.

**Reconciliação (autorizada pelo dono):** descartei as edições stale, avancei a branch para a `main`
(`git merge --ff-only`, fast-forward para `68c6db5`), e **re-apliquei** as adições do roadmap sobre a
versão atual, marcando 1/2 como ✅ e **re-ancorando** o que eu havia posto "dentro" de 1/2:
- **Motor de regras** → extensão do engine (`lib/calc/rules.ts`, `applyRules`/`PricingRule`) entregue
  no **SPLIT 6** (dono das `pricing_rules`), não reabrindo o engine já entregue do SPLIT 1.
- **Cenários** (`computeScenarios`) → extensão consumida no **SPLIT 4**.
- **`proposal_versions` + `proposal_templates`** → **migration 012 nova no SPLIT 4** (010 já aplicada).
- **SPLIT 7** documents renumerado para **migration 013**.
- **Comparador/templates/histórico/seam de IA** → SPLIT 4; **SPLIT 10** (autoria por IA, futuro) com
  seam `ProposalComposer` já no SPLIT 4; **alertas de impacto de preço/promo** → SPLIT 6.
- **Reordenação confirmada:** **6 antes do 4**. Ordem atual: 0✅→1✅→2✅→**3→6→4**→5→7→8→9 (+10 futuro).
- **§8** lista os itens GPT conscientemente adiados (wiki/câmbio/seguros/SSO/anexos/audit-UI/dashboard).

**Decisão do dono nesta sessão:** só reconciliar o **roadmap** agora (sem codar feature). Próximo split
a executar quando retomar = **SPLIT 3** (lista) — ou 6, conforme a reordenação.

## SPLIT 4 (início) — passo-0 lead-flow + seam de preço por nacionalidade (2026-06-15)

Executado via subagent-driven-development (8 tasks, TDD, 1 implementer por task + review do controller).
**Entregue:** (1) `NewProposalModal` (passo-0): "Criar proposta" → buscar lead existente OU criar novo lead
inline → cria `study_plan` com `contact_id` e abre o editor. (2) Lead **woofed-shaped**: nacionalidade/
origem/idioma em `contacts.custom_attributes` (helpers `CONTACT_ATTR`/`getContactNationality`/
`buildContactAttributes`), `searchContacts`, `lib/constants/countries.ts`. (3) Seam de preço:
`priceVersionLabel`, `toPricedOptions`, `listActivePriceVersions`, `CourseSource.listPrices`. (4) Actions
`searchContactsAction`/`createProposalForContact`. type-check ✅ · node --test 37/37 ✅ · build ✅.

**Decisões/aprendizados:**
- **WOOFED-SHAPED FIRST aplicado:** campos de lead em `custom_attributes` (sem migration) → sync 1:1 com o
  CRM. Ver regra em User Preferences.
- **Preço = camadas (país > mercado > normal), não modo "ou".** Override de país só onde a escola
  diferencia (CO ≠ BR dentro de LATAM). `current_course_price` já resolve; `priceVersionLabel` rotula.
- **Seletor de preço no editor + course picker = DEFERIDOS pro SPLIT 4 cheio** (reabririam
  `StudyPlanEditor.tsx`; regra arquivo-quente-1x). Seam (`listPrices`/labels/nacionalidade) já pronto.
- **Do-Not-Repeat (subagent):** um implementer SOBRESCREVEU `tests/crm-contacts.test.mjs` (tinha testes do
  SPLIT 2) ao "criar" o arquivo — perdeu cobertura. Pego no review do controller e restaurado. **Sempre
  instruir 'APPEND, nunca overwrite' quando o subagente toca arquivo de teste existente, e conferir o diff.**

## SPLIT 6A CONCLUÍDO — `lib/portfolio/*` + provider `CourseSource` (2026-06-15)

Fechado o último sub-passo do 6A (só código TS; migration 011 já estava aplicada). Novo módulo
**`lib/portfolio/`** espelhando `lib/crm/contacts.ts`:
- **`types.ts`** = aliases das 6 tabelas + **mappers PUROS** (sem DB, testáveis): `priceVersionToSnapshot`
  (cents→float na borda via `centsToNumber`), `buildStudyCourse` (snapshot→`StudyCourse` legado, parte de
  `createCourse` p/ herdar segments/defaults), `rowToPricingRule`/`isRuleActiveOn`/`draftToInsert`/
  `draftToUpdate` (DB jsonb ↔ engine `PricingRule`), `asCourseType`. Contratos `CourseSource`/
  `PortfolioCourseRef`/`PriceSnapshot` (roadmap §4).
- **`queries.ts`** = reads org-scoped + `currentCoursePrice` via `supabase.rpc('current_course_price',
  { p_course, p_nationality })`. **`pricing-rules.ts`** = CRUD + `getActiveRules`→`PricingRule[]`.
  **`markets.ts`** = CRUD. **`course-source.ts`** = `createPortfolioCourseSource(supabase)` (search/resolve;
  `resolve` aplica `applyRulesToPlan` por cima num plano de 1 curso, devolvendo snapshot float + course
  editor-ready + extras/adjustments explicáveis). `index.ts` = barrel.

**Aprendizados/decisões reutilizáveis:**
- **Snapshot = verdade do catálogo (P3); regras = camada separada.** `PortfolioCourseRef.snapshot` guarda o
  preço resolvido cru (float); o `course` derivado é que recebe a camada agência (promo/desconto/fee). Assim
  o snapshot continua um registro fiel da `price_version`, e a resolução é point-in-time (`takenAt`).
- **RPC setof one-row:** `current_course_price` pode vir como objeto único OU array de 1 — tratar os dois
  (`Array.isArray(data) ? data[0] : data`).
- **Provider reutiliza `applyRulesToPlan` (não reimplementa regras)** rodando sobre um plano mínimo de 1
  curso (`singleCoursePlan`); extras de `agency_fee` saem em `adjustedPlan.extraCosts` (lista vazia → só os
  adicionados). Mantém o engine do SPLIT 1/6A intocado.
- **`nationality` do aluno ainda é contexto, não dado:** falta virar campo no `contacts`/proposta — fazer no
  SPLIT 4 ao religar o editor aos contatos. (Já registrado como pendência no roadmap §3.2 e handover.)
- DoD: type-check ✅ · `node --test` 26/26 ✅ (9 novos em `tests/portfolio.test.mjs`, só mappers puros) ·
  build ✅. `lib/portfolio` ainda não é importado pelo app (consumido no SPLIT 4/6B) → zero efeito runtime.

**Próximo = SPLIT 4 (editor).** Ordem: `4 → 6B → 5 → 7 → 8 → 9 (+10)`.

## Decisão — SPLIT 6 quebrado em 6A (backend) + 6B (UI) (2026-06-15)

**Contexto:** SPLIT 3 (lista) entregue/pushed (`8b308cd`). O dono perguntou se quebrava o SPLIT 6.
SPLIT 6 acumulava migration + telas CRUD + motor de regras + provider + seed — grande demais p/ "um
split inteiro, testes verdes, commit próprio".

**Decisão (recomendação do Claude, aceita):** quebrar por **backend vs UI** (NÃO catálogo×regras, que
deixaria o editor esperando os dois):
- **SPLIT 6A — backend:** migration 011 (`institutions/campuses/courses/course_price_versions/promotions/
  pricing_rules` + RLS + índices), seed `course_presets→courses` (+ regras ELICOS default),
  `lib/calc/rules.ts` (`applyRules`, função pura, **com testes**) + `lib/calc/scenarios.ts`,
  `lib/portfolio/*` (queries + provider `CourseSource`), regen de tipos. **Destrava o SPLIT 4.**
- **SPLIT 6B — UI de gestão:** telas CRUD (instituições/campus/cursos/promoções/**editor de regras**),
  filtros, completude/vigência, **alertas de impacto** ("X propostas usam este preço"), nav. Frontend
  puro sobre o 6A (como o SPLIT 3 foi sobre o SPLIT 2). Independente do editor.

**Por que esse corte:** o editor (4) só precisa de dados + `CourseSource` + motor de regras = tudo no 6A;
com o seed dos presets, a proposta já monta com taxa automática sem esperar a UI. O motor de regras ganha
**testes** antes de qualquer tela (onde um bug de cobrança passaria). **Nova ordem: 6A → 4 → 6B → 5.**

## Decisão — White-label first é a regra-mãe de TODA decisão técnica (2026-06-15)

**Diretriz do dono (verbatim de intenção):** "todas as decisões técnicas desse projeto precisam sempre
se basear na ideia de ele virar um white-label no futuro. Isso precisa ser regra documentada."

**Regra (governa todas as outras):** qualquer escolha técnica — schema, RLS, API, UI, naming, libs,
config, integrações — assume Movy → **white-label / multi-agência (SaaS)**. **Desempate:** preferir
SEMPRE a opção que torna o white-label **config, não reescrita/migração**. Proibido assumir agência única
ou hardcodar marca/dados Movy. Consequências verificáveis em PR: `org_id`+RLS por org em toda entidade,
unicidade por org (nunca global), branding/config por org, naming woofed-shaped, zero segredo/marca
hardcoded. **Documentada em:** `docs/PRODUCT-ROADMAP.md` §2 (P0), `docs/AI-HANDOVER.md` (Regras de Ouro,
1º item), e User Preferences acima. P1/P10 e R1–R11 (convergência) são consequências deste P0.

## Decisão — Banco de dados: Supabase hoje → VPS PostgreSQL futuro (2026-06-16)

**Contexto:** Owner confirmou que o sistema hoje roda no Supabase (hosted), mas a intenção é migrar
para PostgreSQL em VPS própria no futuro (quando escalar ou por custo/controle).

**Regras para portabilidade (aplicar em TODO código SQL e data layer):**

- **Standard SQL only:** usar apenas recursos do PostgreSQL puro. Nunca usar extensões ou funções
  exclusivas do Supabase (ex.: `supabase_functions.*`, `graphql.*`, `realtime.*` direto em código).
- **`auth.uid()` é Supabase-specific:** em RLS pode usar agora, mas manter um `current_user_id()`
  wrapper no schema para que na migração apenas a função wrapper mude, não todas as políticas.
- **Supabase Auth = camada substituível:** não acoplar lógica de negócio ao esquema `auth.*` diretamente.
  Toda referência ao usuário passa por `profiles` (nossa tabela). Na migração, auth.users → outro sistema
  (NextAuth, Clerk, custom) sem tocar regras de negócio.
- **Migrations versionadas e idempotentes:** todo DDL em `supabase/migrations/` com número sequencial.
  Nenhuma alteração de schema fora de migration. Na migração para VPS, rodar as migrations em sequência
  deve recriar o schema 100% identico.
- **Storage = referência por path, não por URL Supabase:** guardar o path relativo do arquivo, nunca
  a URL `storage.googleapis.com/...` do Supabase hardcoded no banco. O bucket pode mudar para S3/MinIO.
- **data layer (`lib/hr/queries.ts`, `lib/crm/`, etc.) usa apenas o Supabase JS client como adaptador.**
  A lógica de negócio não chama `supabase.rpc()` sem wrapper. Na migração, o client é trocado
  (para `pg`/Prisma/Drizzle) e os wrappers absorvem a mudança sem refatorar actions/components.
- **RLS policies continuam válidas no PostgreSQL padrão** (é uma feature nativa do PG, não do Supabase).
  A migração mantém as políticas — só muda quem define o `current_user` (role do PG em vez de JWT).
- **Não usar `pg_graphql`, `pgvector` (se não migrar junto), `pgsodium`, ou `vault`** sem avaliar
  se o VPS futuro terá essas extensões. Se usar, documentar dependência explicitamente.

**Resumo:** escrever como se o Supabase fosse só um host conveniente de PostgreSQL + auth.
O código deve ser agnóstico ao host — só o client de conexão muda na migração.

## Future Blueprint References

- **Horilla HR** (2026-06-16): https://github.com/horilla/horilla-hr � open-source Django HR platform.
  Owner wants this as the **feature reference blueprint** for future HR module expansions (leave management,
  payroll, recruitment, performance reviews, etc.). Do NOT implement now � use as inspiration when planning
  new HR features. Check this repo before brainstorming any new HR capability.


## Do-Not-Repeat

### 2026-06-16 — L1: Never remove .ts extensions from local imports in this project

Removing explicit `.ts` extensions from imports inside `lib/` breaks the `node --experimental-strip-types --test` runner (ERR_MODULE_NOT_FOUND) even though `tsc --noEmit` accepts extensionless imports. The test runner resolves ESM imports literally — `.ts` extension must be present. This project's test setup requires explicit `.ts` on all local imports in `lib/`.

### 2026-06-16 — issueInvoiceAction / markInvoicePaidAction precisam de role check

Qualquer nova action de HR que muda status de invoice DEVE ter `isHrAdmin` guard. Não é suficiente chamar apenas `getActor()` — o pattern correto é: `const { supabase, profile } = await getActor(); if (!isHrAdmin(profile.role)) throw new Error('Insufficient permissions')`. Ver `approveEntryAction` como modelo. O mesmo vale para `logAudit` — toda mutação financeira/HR deve ser rastreada.

### 2026-06-16 — Shared auth helper for server actions

All server action files now import `getActorSession()` and `svc()` from `lib/actions/auth.ts` instead of duplicating the Supabase client setup. When adding new action files, import from there — never reinvent the pattern.

## Key Learnings — Performance & Dev Server (2026-06-17)

- **Turbopack enforces CSS spec strictly:** `@import` rules MUST precede all other CSS including `@tailwind`. webpack was lenient; Turbopack throws `Parsing CSS source code failed: @import rules must precede all rules`. Solution: put @import at the very top of globals.css before @tailwind base/components/utilities. See bug-030.
- **Next.js webpack dev server corrupts .next cache on Windows** causing ENOENT routes-manifest.json and `Cannot find module vendor-chunks/next-intl.js`. Fix: delete .next dir AND switch to Turbopack (`next dev --turbopack`) which has a different, stable persistent cache. See bug-031.
- **getUser() vs getSession() security tradeoff:** `auth.getSession()` reads JWT from cookie locally (~0ms) but doesn't validate with Supabase Auth server — sessions revoked server-side still appear valid. `auth.getUser()` makes a ~300ms HTTP round-trip but properly validates. For server components handling data access (get-user.ts), always use `getUser()`. Middleware can use `getSession()` for redirect-only checks.
- **app/error.tsx vs global-error.tsx structure:** Inner error boundaries (error.tsx) render INSIDE the root layout — they must NOT have `<html>/<body>` tags. Only `global-error.tsx` (which replaces the root layout on catastrophic errors) needs `<html><body>`. See bug-029.
- **Do-Not-Repeat:** [2026-06-17] Never put @import after @tailwind in globals.css — Turbopack CSS spec enforcement breaks all pages with 500. Always place @import at the absolute top.
- **Do-Not-Repeat:** [2026-06-17] Never add `<html><body>` to app/error.tsx — only global-error.tsx should have them. Inner error boundaries render inside the layout.
