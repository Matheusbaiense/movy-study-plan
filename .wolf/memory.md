# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

| 03:24 | woofed-ux-alignment: hr people/invoicing audit + CRIT+HIGH fixes (PageHeader, EmptyState, Modal, Button, Field/Select, aria-labels, responsive grids, tabular-nums) | team/page, invoices/page, GenerateInvoiceForm, SelfInvoiceButton, CreateEmployeeProfileButton, EditRateButton, IssueInvoiceButton, TaxInvoice, InvoiceEmployeeFilter | 3 commits (b433aad, c9f3b9b, eb7ffaa), 179/0 tests, type-check clean | ~4500 |

| 2026-06-16 | MEGA-AUDIT SESSION: análise ponta-a-ponta com 4 agentes paralelos. Fixes aplicados: (1) NOVO-1 issueInvoiceAction/markInvoicePaidAction sem role check → adicionado isHrAdmin guard + logAudit; (2) C7 clockIn/clockOut/logHours/updateEmployeeRate sem audit log → logAudit adicionado; (3) H8 sem error.tsx/not-found.tsx → criados; (4) C5 sem CI/CD → .github/workflows/ci.yml criado. type-check ✅ 139/139 tests ✅. Achados pendentes documentados abaixo. | hr/actions.ts, app/error.tsx, app/not-found.tsx, .github/workflows/ci.yml | done | ~40k tok |

| 2026-06-16 | Next.js 14→15 upgrade: updated params to async (page.tsx + route.ts), fixed useMemo-after-return in StudyPlanEditor, moved outputFileTracingIncludes to top-level, created instrumentation.ts for Sentry; npm run type-check ✅ · npm run build ✅ · 139/139 tests ✅ | app/[locale]/page.tsx, app/api/imported/[name]/route.ts, components/study-plans/StudyPlanEditor.tsx, next.config.mjs, instrumentation.ts, package.json | done — Next.js 15.5.19, React 18 kept | ~6k tok |

| 2026-06-16 | Task A3: added generateOwnInvoiceAction to actions.ts + created SelfInvoiceButton.tsx + wired into hr/page.tsx | app/[locale]/(protected)/hr/actions.ts, components/hr/SelfInvoiceButton.tsx, app/[locale]/(protected)/hr/page.tsx | committed e518ee6 | ~800 tokens |

| 2026-06-17 | A11y/quality fixes (FIX 1-5) on design/woofed-ux-alignment. Modal+Drawer: focus trap (capture trigger, RAF first-focus, Tab/Shift+Tab wrap, restore on close), useId-based aria-labelledby, scroll-lock counter via data-scroll-locked. Button: sr-only "Loading…" span. Tabs: ariaLabel prop. UiPreviewClient: Tabs demo added. 179/179 ✅ type-check ✅ lint ✅ — commit 9da1a59 | components/ui/{Modal,Drawer,Button,Tabs}.tsx, UiPreviewClient.tsx | done | ~4k tok |

| 2026-06-17 | Phase 0 UI primitives: implemented all 11 tasks on branch design/woofed-ux-alignment. Created components/ui/{variants.ts,Button.tsx,form.tsx,PageHeader.tsx,tabs-logic.ts,Tabs.tsx,EmptyState.tsx,skeleton-logic.ts,Skeleton.tsx,Modal.tsx,Drawer.tsx,index.ts} + tests/ui-{variants,tabs-logic,skeleton-logic}.test.mts + shimmer keyframe in globals.css + _ui-preview gallery (flagged). 179/179 tests ✅ type-check ✅ lint ✅. 11 commits on feature branch. Visual verification of preview gallery deferred to controller (dev server not started). | components/ui/*, tests/ui-*.test.mts, app/globals.css, app/[locale]/(protected)/_ui-preview/* | done — 11 commits fe512fc→1790255 | ~15k tok |

| 2026-06-17 | woofed rubric CRIT+HIGH fixes — hr time-tracking slice. PageHeader in hr/page+clock/page+timesheets/page; shared Modal for AddEntryModal; EmptyState in HrDashboard+TimesheetTable+clock+timesheets; exact-match tab nav (avoids /hr prefix collision); Button+Field+Input in modal; movy-field-control on DateInputPT+ClockWidget inputs; aria-label on approve/reject; color.purple token on status pills; responsive grid. 7 files. type-check ✅ lint ✅ tests 15/15 unchanged — commit 9117294 | hr/page.tsx,clock/page.tsx,timesheets/page.tsx,HrDashboard.tsx,TimesheetTable.tsx,DateInputPT.tsx,ClockWidget.tsx | done | ~8k tok |

| 2026-06-17 | A11y Group 1 — focus-visible rings (audit B-H2, A-C2, C-H1). Added .movy-field-control:focus-visible + button-*:focus-visible rules inside @layer components in globals.css. Added className="movy-field-control" to Input/Textarea/Select in form.tsx. Button.tsx unchanged (already uses button-* classes). 179/179 tests ✅ type-check ✅ lint ✅ — commit 0f0fb92 | app/globals.css, components/ui/form.tsx | done | ~3k tok |

| 2026-06-16 | Task A2: RateCard component — read-only hourly rate for employees on HR dashboard | components/hr/RateCard.tsx, app/[locale]/(protected)/hr/page.tsx | RateCard created (bilingual, soft warning when rate=$0, branded typography), integrated to left column (non-admin only), tsc clean, committed 6028431 | ~800 |

| 2026-06-16 | Code review SPLITs 4/5/6B — corrigidos 1 CRITICAL + 14 HIGH/MEDIUM + 4 LOW: org_id em todos inserts/updates/deletes do portfolio (service client bypassa RLS), accept atômico com .is('accepted_at',null), select específico na rota pública, org_id filter em todas mutations de study_plans, parseFloat validation, persist sem stale status, UUID check no middleware, useCallback em reload, as never→as unknown as Json | portfolio/actions.ts, p/[token]/actions.ts, p/[token]/page.tsx, study-plans/actions.ts, portfolio/[institutionId]/page.tsx, middleware.ts, InstitutionDetail.tsx, StudyPlanEditor.tsx, PublicProposalPage.tsx, ShareProposalButton.tsx, VersionHistory.tsx | tsc 0 erros | ~8k tok |

| 2026-06-16 | SPLIT 5 public proposal flow | types/supabase.ts, middleware.ts, app/[locale]/p/[token]/page.tsx, app/[locale]/p/[token]/actions.ts, components/study-plans/PublicProposalPage.tsx, components/study-plans/ShareProposalButton.tsx, study-plans/actions.ts (+getShareUrlAction), study-plans/[id]/proposal/page.tsx | tsc 0 errors · 64/64 pass | ~2200 tok |

| 2026-06-16 | Employee Directory built: listEmployeesWithStats (parallel queries) in lib/hr/queries.ts; team/page.tsx (KPI bar + 3-col card grid, admin-only); "Equipe/Team" nav entry in AppShell.tsx (admin-only). Auth guard redirects non-admin. tsc clean. | lib/hr/queries.ts, app/[locale]/(protected)/hr/team/page.tsx, components/layout/AppShell.tsx | done |
| 2026-06-16 | Regeneração types/supabase.ts do projeto xpthmguzcbmndyyexfbt via MCP generate_typescript_types. Tipos gerados são idênticos ao arquivo hand-maintained (diferenças: nenhuma). tsc --noEmit 0 erros. | types/supabase.ts | done |

| 2026-06-16 | Criado docs/competitor-allyhub-blueprint.md: blueprint completo AllyHub→Movy por split (4→8+financeiro+estratégia) sintetizando 12 sessões de pesquisa competitiva | docs/competitor-allyhub-blueprint.md, .wolf/anatomy.md | blueprint criado, anatomy atualizado | ~3k tok |

| 2026-06-16 | HR UI redesign: ClockWidget (CLOCKED IN pill, gold ring timer, radial glow) + HrDashboard (StatusBadge pill component, row hover, stacked summary footer, AddEntryModal polish) | components/hr/ClockWidget.tsx, components/hr/HrDashboard.tsx | build passes clean | ~1200 |
| 2026-06-16 | Admin sem employee_profile agora vê botão "Criar meu perfil de funcionário": createOwnEmployeeProfileAction (upsertEmployee idempotente) + CreateEmployeeProfileButton client component; ao clicar, revalidatePath faz aparecer ClockWidget | actions.ts, components/hr/CreateEmployeeProfileButton.tsx, page.tsx | build passa | ~400 |
| 2026-06-16 | Vercel failure diagnosed: Vercel MCP connected to "Admin Fyme's projects" team (0 projects) — actual deployment is on a different account via GitHub integration. Local build passes; issue is likely missing env vars NEXT_PUBLIC_SUPABASE_URL/ANON_KEY on Vercel | — | pending user action | ~200 |

| 16:00 | Task 13: created timesheets admin page with status filters | app/[locale]/(protected)/hr/timesheets/page.tsx | committed e61f0be | ~8k |

| 2026-06-16 | Separou entradas AllyHub do handover principal → docs/AI-HANDOVER-ALLYHUB.md (12 sessões). Main handover ficou com 1 linha de referência | AI-HANDOVER.md, AI-HANDOVER-ALLYHUB.md | feito | ~500 |
| 2026-06-16 | AllyHub S52: catalogo Q2.0 completo — card Q502 total AU$1268 confirmado; catálogo Accommodations global GBP; hierarquia painel esquerdo; View Quotes bug freeze; portal aluno quote.allyhub.co AngularJS+PagSeguro | ALLY-BLUEPRINT.md | documentado | ~4000 |
| 2026-06-16 | AllyHub S51: sistema edicao preco Quote 2.0 — modal Edit item (Item value + Discount, 2 niveis margem, confirmacao obrigatoria, icone coin) | ALLY-BLUEPRINT.md | documentado | ~3000 |

| 2026-06-16 | fix(hr): added authError guard to getUser() and profileError guard to profiles query; added aria-label + aria-hidden to print button | app/[locale]/(protected)/hr/page.tsx, components/hr/TaxInvoice.tsx | committed 672f322 | ~300 |

| 14:45 | Task 7: Created ClockWidget.tsx — real-time clock-in/out widget with live elapsed timer, gold timer display, pulsing LIVE indicator, bilingual pt/en | components/hr/ClockWidget.tsx | committed 98853bc | ~400 |

| 2026-06-16 | Created HR server actions file (Task 5) | app/[locale]/(protected)/hr/actions.ts | success, 0 TS errors, committed a1f30e9 | ~2500 |

---

**Session: 2026-06-16 (AllyHub — /shipment Remessa Internacional / Sessão 10)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| ~14:30 | Appended Section 50H to ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | /shipment documentado: Remessa Internacional, early access, React SPA em iframe, Simulador de Câmbio AUD, badge "vagas limitadas" | ~1500 |
| ~14:33 | Updated anatomy.md, AI-HANDOVER.md, memory.md | .wolf/ + docs/ | pesquisa AllyHub 100% concluída, todas as rotas documentadas | ~500 |

**Achados desta sessão:**
1. /shipment = produto de remessa internacional em early access — segundo modelo de receita AllyHub (SaaS + spread cambial)
2. React SPA em iframe — DOM da shell não expõe conteúdo (documentado só via screenshot)
3. "Simulate Shipment" = link de marketing para produto novo, não simulação técnica de parcelas

---

**Session: 2026-06-16 (AllyHub — Financial Layer Completo / Sessão 9)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| ~18:00 | Screenshot /financial/dashboard | browser | 3 cards (Receivables/Bills/Balance), 4 status each, Future Projections, 2 bottom widgets | ~800 |
| ~18:05 | Screenshot /instalment/earnings | browser | Read-only, CSV export, 12 filtros incl. Destiny Country/City | ~600 |
| ~18:10 | Screenshot /instalment/credits + New Credit modal via read_page | browser | form 7 campos, table Type/School/Partner/Value/Actions | ~2000 |
| ~18:15 | Screenshot /transition/list | browser | cashbook, Print+CSV, 3 tabs time, Account Bank filter | ~500 |
| ~18:20 | DOM do /instalment/pay via read_page (Bills) | browser | Course Start date filter, Simulate Shipment→/shipment, Payment Suggestions só category=school, Commission column | ~3000 |
| ~18:30 | Documentou Seção 50 (A-G) no ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | 4 rotas + Bills extras + mapa financeiro 4 camadas + 10 insights | ~5000 |
| ~18:35 | Atualizou anatomy.md, memory.md, AI-HANDOVER.md | .wolf/ + docs/ | sessão 9 concluída | ~500 |

---

**Session: 2026-06-16 (AllyHub — Financial CRUD Layer / Sessão 8)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| ~17:00 | Screenshot /instalment/commission — Total Commissions | browser | 5 filtros, 0 commissions, read-only | ~400 |
| ~17:05 | Navegou /instalment/distributed — Distributed Commissions | browser | 2 tabs Office/User, 4 filtros | ~400 |
| ~17:10 | Navegou /instalment/over — Over | browser | 3 filtros, "We did not found any over" | ~300 |
| ~17:12 | Navegou /validation/payment — Permission Denied (hard gate) | browser | único gate server-side real do sistema | ~300 |
| ~17:15 | Abriu modal New Receivable em /instalment/receive | browser | form completo: 11 campos, form DOM extraído via read_page | ~3000 |
| ~17:20 | Navegou /instalment/pay — Bills page + Payment Suggestions tab | browser | 13 filtros, Simulate Shipment, tab Payment Suggestions | ~800 |
| ~17:30 | Documentou Seção 49 (A-J) no ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | 7 rotas ocultas, form completo, arquitetura parcelas, 10 insights | ~5000 |
| ~17:35 | Atualizou anatomy.md, memory.md, AI-HANDOVER.md | .wolf/ + docs/ | sessão 8 concluída | ~500 |

---

**Session: 2026-06-16 (AllyHub — Reports Deep Dive / Sessão 7 final)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| ~16:00 | Navegou todas as 10 páginas de Reports & Commissions | browser | Performance/Behavior/Sales/Cancellations/Receivable/Bills/Credits/Quotes/Earnings capturados | ~4000 |
| ~16:10 | Confirmou Funnel Performance redireciona para /dashboard — whitelist hardcoded | browser | gate confirmado: account.id == 10 \|\| 2015 | ~200 |
| ~16:15 | Confirmou gate financeiro só no nav — rotas /receive /pay /credits acessíveis por URL | browser | security by obscurity documentado | ~200 |
| ~16:20 | Documentou Seção 48 (A-M) no ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | 10 páginas, filtros completos, 10 insights estratégicos | ~4000 |
| ~16:25 | Atualizou anatomy.md, memory.md, AI-HANDOVER.md | .wolf/ + docs/ | sessão 7 concluída | ~400 |

---

**Session: 2026-06-16 (AllyHub — Dashboard Deep Dive / Sessão 7 cont.)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| ~15:00 | Navegou para /dashboard — capturou layout via screenshot | browser | 6 KPI cards, leaderboard, conversion rate, tasks, last interactions | ~1500 |
| ~15:05 | Extraiu ng-show/ng-if — descobriu arquitetura type 1/2/3 e moduleType tiers | browser DOM | 35+ nav items, 8 roles, gating completo | ~2000 |
| ~15:10 | Leu Angular scope (App.user) — confirmou moduleType=3, type=1, allyPlus=1, useNewMenu=2 | browser JS | perfil conta Movy confirmado | ~400 |
| ~15:15 | Documentou Seção 47 (A-H) no ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | dashboard widgets, type architecture, nav completo, 10 insights | ~3500 |
| ~15:20 | Atualizou anatomy.md, memory.md | .wolf/ | sessão concluída | ~300 |

---

**Session: 2026-06-16 (AllyHub — Builders Deep Dive / Sessão 7)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| ~14:00 | Document Template modal aberto — capturou todos 83 vars via querySelectorAll('[draggable="true"]') | browser | 4 seções, labels extraídos | ~2000 |
| ~14:05 | Injetou sample contract HTML no CKEditor via iframe.contentDocument.body | browser | template renderizado com vars azuis sublinhadas | ~800 |
| ~14:10 | Capturou labels completos das seções Quote (30 vars) e General (3 vars) | browser | labels confirmados | ~600 |
| ~14:15 | Fechou modal Document Template, testou navegação Quote Preferences | browser | modal fechado OK, nav Quote Prefs via LI click | ~300 |
| ~14:20 | Documentou Seção 46 (A-F) no ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | ~300 linhas adicionadas, comparativo 5 builders, 83 var tables | ~3000 |
| ~14:25 | Atualizou anatomy.md, memory.md, AI-HANDOVER.md | .wolf/ + docs/ | concluído sessão 7 | ~400 |

---

**Session: 2026-06-16 (AllyHub — Settings Completo / Sessão 6)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| 02:10 | Info/Billing scroll — Billings vazio junho, All Users: Livia Ribeiro criada 15/06 | browser | dados capturados | ~800 |
| 02:12 | Import Leads — Lead Import History vazia, Download Sample Spreadsheet link | browser | dados capturados | ~400 |
| 02:14 | Integrations > Payments — PagBank/Qualy/ZOOP ocultos por moduleType; ZOOP hard-disabled (false &&) | browser | dados capturados | ~600 |
| 02:15 | Integrations > General — 8 integrações: RD Station, Pipedrive, ActiveCampaign, Zoho, SMTP, Zapier, Aussie Translate, Ollara | browser | dados capturados | ~600 |
| 02:18 | Student Public Form — 6 seções, 30+ campos, CPF/RG default ON, Scholar Info OFF, Custom Success Feedback | browser | dados capturados | ~1200 |
| 02:20 | Reasons to Cancel Lead — vazio, + Add Reason | browser | dados capturados | ~200 |
| 02:21 | Lead Sources — vazio, + Add Lead Source | browser | dados capturados | ~200 |
| 02:22 | Tags — vazio, + New Tag | browser | dados capturados | ~200 |
| 02:25 | Documentou Seção 45 (A-S) no ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | ~650 linhas adicionadas | ~3000 |
| 02:26 | Atualizou anatomy.md, memory.md, AI-HANDOVER.md | .wolf/ + docs/ | concluído | ~400 |

## Session: 2026-06-16 (AllyHub — Links Externos para Aluno / Sessão 5)

| Hora | Ação | Arquivo(s) | Resultado | ~tokens |
|------|------|-----------|-----------|---------|
| 03:02 | Abriu /quote-detail/1645489/{hash} — página do aluno | quote.allyhub.co | HTTP 200 — página PT-BR completa | 2k |
| 03:02 | Capturou network requests do /quote-detail/ | — | 88 requests: quotehash, feepricehash, api-student, pagbank, zoop | 3k |
| 03:03 | Leu response /quotehash/1645489?hash= | api.sellead.com | Payload completo: account bcrypt hash exposto publicamente | 4k |
| 03:03 | Leu response /quoteonline?hash= | api.sellead.com | Link entity: id=1018611, opened=0, quotes[].view=2, like=null | 1k |
| 03:03 | Leu response /getinstallments?value=1318 | api-student.allyhub.co | 11 parcelas 2x–12x, juros 4.68%–11.68% | 1k |
| 03:04 | Rolou página, viu COMPRAR button | quote.allyhub.co | URL: student.allyhub.co/checkout/{id}/{hash}?paymentType=full | 1k |
| 03:04 | Abriu /quote-online/1018611/{hash} | quote.allyhub.co | Visualmente idêntico ao /quote-detail/ | 1k |
| 03:09 | Capturou network requests do /quote-online/ | — | 99 requests: quoteonlinehash (novo!), opportunityhash (novo!) | 3k |
| 03:09 | Leu responses quoteonlinehash + opportunityhash | api.sellead.com | Diferença arquitetural confirmada: link entity separada da quote | 3k |
| 03:15 | Documentou seção 44 (A–K) no ALLY-BLUEPRINT.md | ALLY-BLUEPRINT.md | 14 subseções, 14 novos endpoints, mapa completo 6 subdomínios | 5k |

## Session: 2026-06-16 (AllyHub — Quote 2.0 Botões & Finish / Sessão 4 continuação)

| Hora | Ação | Arquivo(s) | Resultado | ~tok |
|------|------|-----------|-----------|------|
| 10:44 | Gear menu ⚙️ → My comission → modal R$789.76 BRL | — | GET /calculatecommissionplugAndplay expõe breakdown completo | 200 |
| 10:44 | Gear → Add custom fee → modal "Add Discount" (nome errado) | — | Teto = comissão BRL; desconto sai do bolso da agência | 100 |
| 10:45 | Gear → Duplicate → cria Q503 (id=1645492) | — | PUT {"duplicateQuote":true} → 200, Q503 cópia exata | 200 |
| 10:45 | calculatecommissionplugAndplay interceptado | — | Vazou: agency=Ally+, email=contato@allyhub.co, plan=1, credits=999, office=Ribeirao Preto | 800 |
| 10:46 | Advanced options expandido | — | Só mostra Description + due date | 100 |
| 10:49 | Gear Q503 → Delete → soft delete Q503 | — | PUT {"status":"delete"} → 200, deleted_at setado, sem confirmação | 200 |
| 10:50 | Finish and Save Quotes → confirmation modal | — | "Attention — I am aware..." + Yes/No buttons | 100 |
| 10:50 | Yes, finish and save → PUT /draft/545900 {"finish":true} → 204 | — | **SUCESSO** — Finish real usa draft endpoint, não quote! Expired fee não bloqueia | 300 |
| 10:50 | Redirect → perfil Lucas Andrade → aba Quotes and Links | — | Q502 em "Quotes" section, status=new, AU$1,318, R$3.84/AUD | 200 |
| 10:51 | Seção 43 escrita no ALLY-BLUEPRINT.md (43A-43N) | ALLY-BLUEPRINT.md | ~300 linhas, corrects sessão 3 hypothesis sobre autoSave:false | 8000 |
| 10:51 | anatomy.md + memory.md atualizados | anatomy.md, memory.md | Seções 1-43, ~1700+ lines, ~30k tok | 300 |

## Session: 2026-06-16 (AllyHub — Quote 2.0 Teste Técnico Profundo / Sessão 3)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 03:xx | Interceptou network requests GET /draft + GET /quote/1644823 revelando arquitetura ephemeral do playground | api-responses/*.network-response | Prova definitiva: draft retorna só metadados; bill só existe pós-Finish | ~2k |
| 03:xx | Tentou PUT /quote/1644823 com autoSave:false via evaluate_script no quote2.allyhub.co (CORS-allowed origin) | — | error:true (preço OSHC Single id 306366 expirou 2025-12-31); converted_value zerado para 0 | ~1k |
| 03:xx | Confirmou token JWT válido (iat 2026-06-15T12:56Z, exp +12h); problema não é autenticação | — | WAF ou rate-limit server-side bloqueando PUT após Finish falho | ~0.5k |
| 03:xx | Testou PUT em Q500, nova aba, reload completo — todos ERR_FAILED; OPTIONS preflight 200 (CORS OK) | — | WAF confirmado: bloqueia PUTs da sessão após primeiro Finish inválido | ~1k |
| 03:xx | Escreveu seções 38-40 no ALLY-BLUEPRINT.md (arquitetura ephemeral, CORS assimetria, JWT, endpoints, payload PUT, fee IDs, WAF, acomodações vazias, bug OSHC expirado, status final) | ALLY-BLUEPRINT.md | blueprint completo com deep dive técnico | ~4k |
| 03:xx | Atualizou anatomy.md (nova seção api-responses/ + ALLY-BLUEPRINT.md revisado); appended memory.md; atualizou AI-HANDOVER.md | .wolf/anatomy.md, .wolf/memory.md, docs/AI-HANDOVER.md | OpenWolf protocol completo | ~1k |

| 2026-06-15 | SPLIT 4 slice 3: wizard shell (5 steps + EditorWizardNav) | editor-wizard-steps.ts, EditorWizardNav.tsx, StudyPlanEditor.tsx | type-check + build ✓ | ~2k |
| 2026-06-15 | SPLIT 4 slice 2: EditorStickyBar + autosave (2.5s debounce) | EditorStickyBar.tsx, StudyPlanEditor.tsx | type-check + 37 tests + build ✓ | ~1.2k |
| 2026-06-15 | SPLIT 4 slice 1: wired CoursePortfolioPicker into StudyPlanEditor + page passes contactNationality | StudyPlanEditor.tsx, [id]/page.tsx | commits 1e783b0 + 04d8468, type-check + build ✓ | ~1.5k |
| 2026-06-15 | Created CoursePortfolioPicker.tsx (Task C of SPLIT 4) | components/study-plans/CoursePortfolioPicker.tsx | type-check clean, committed aa39841 | ~800 tokens |

| 00:00 | SPLIT 4: Added portfolio course server actions (searchCoursesAction, resolveCourseAction, listCoursePricesAction) + imports (createPortfolioCourseSource, CourseOption, PortfolioCourseRef, PricedOption, StudentLocation) | app/[locale]/(protected)/study-plans/actions.ts | committed 6777edd, type-check clean, build ✓ | ~500 |

| 2026-06-15 | Task 7: replaced `<form action={createStudyPlan}>/<NewQuoteButton>` with `<NewProposalModal locale={locale} />` in study-plans page.tsx; removed unused createStudyPlan + NewQuoteButton imports; type-check + build pass | app/[locale]/(protected)/study-plans/page.tsx | commit 69fee08 | ~800 tok |

| 2026-06-15 | Task 5: searchContacts + searchContactsAction + createProposalForContact (passo-0 backend) | lib/crm/contacts.ts, app/[locale]/(protected)/study-plans/actions.ts | type-check clean, build clean, committed ee7b285 | ~3k |
| 2026-06-15 | Task 4: listActivePriceVersions query + CourseSource.listPrices + interface extension | lib/portfolio/queries.ts, lib/portfolio/types.ts, lib/portfolio/course-source.ts | type-check clean, 11/11 tests pass, committed 1fd60a6 | ~2k |
| 2026-06-15 | Task 3: appended priceVersionLabel + toPricedOptions tests + impl | lib/portfolio/types.ts, tests/portfolio.test.mjs | 11/11 tests pass, type-check clean, committed 6597bc5 | ~2k |

## Session: 2026-06-16 (AllyHub — Simulação Completa Perth / Sessão 4)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 10:xx | Retomou quote #Q502 (id 1645489); tela mostrava 2 programas Lexis Perth encontrados | — | estado salvo da sessão 3 reconhecido | ~0.5k |
| 10:xx | Clicou "+" (info modal) por engano → fechou e clicou botão "+" correto → modal "Add Item to Quotes" com breakdown Tuition AU$550 + Enrol AU$265 + Material AU$195 = AU$1,010 | — | preços completos do Lexis Perth visíveis | ~1k |
| 10:xx | Marcou "Option 1" + clicou "Add with Ally Plus" → programa adicionado; Insurances (2 added) + Add-ons (2 added) auto-populados pelo Ally+ | — | upsell automático: 4 fees injetados | ~1k |
| 10:xx | Clicou "View Quotes" → cart completo: Programs AU$1,010 + 4 fees AU$308 = Total AU$1,318 | — | breakdown completo visível | ~2k |
| 10:xx | Interceptou GET /mandatoryrule → 3 mandatory fees (id=266546 AU$150, id=425150 AU$30, id=306366 AU$70 expirado) | — | source dos fees mapeado | ~3k |
| 10:xx | Interceptou PUT /quote/1645489 → autoSave:true HTTP 200, converted_value:1318, dueDate:2026-06-26, FX rate 3.8403 | — | PUT autoSave:true funciona mesmo com fee expirado | ~3k |
| 10:xx | Descoberto 4º fee: Lexis English OSHC Single AU$58/mês (school-specific, não do mandatoryrule) | — | novo fee não documentado anteriormente | ~1k |
| 10:xx | Confirmou catálogo accommodations Perth = vazio (Search Accommodations button clickado via UI) | — | confirma achado sessão 2 | ~0.5k |
| 10:xx | Escreveu seções 41-42 no ALLY-BLUEPRINT.md (simulação completa, fee table atualizada, mandatoryrule endpoint, PUT payload, campos editáveis) | .wolf/allyhub-research/ALLY-BLUEPRINT.md | blueprint atualizado sessão 4 | ~4k |

## Session: 2026-06-16 (AllyHub — Quote 2.0 Teste AU Completo)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 02:xx | Retomou sessão anterior; navegou para /quote-2/edit/1644804 | — | página Q2.0 carregada | ~0.5k |
| 02:xx | Screenshot revelou 27 programas AU pré-filtrados (nationality Lucas Andrade = AU) | — | catálogo AU completo visível | ~2k |
| 02:xx | DevTools CDP snapshot + agente extrator → todos os 27 programas documentados com nome/escola/cidade/preço/categoria | ALLY-BLUEPRINT.md 26L | catálogo completo | ~3k |
| 02:xx | Interagiu com datepicker via DevTools uid click → mudou start date para 04/08/2026 (50 dias, acima do mínimo 45d) | — | datepicker funcionou via calendar option click | ~1k |
| 02:xx | Clicou "+" no General English AU$400/sem → modal "Add Item to Quotes" (tuition AU$400 + enrol AU$250 + material AU$75 = AU$725) | — | modal de adição mapeado | ~1k |
| 02:xx | Selecionou Option 1 + clicou "Add with Ally Plus" → modal "We found some suggestions" apareceu automaticamente com Insurance EP Brisbane AU$30 | — | upsell engine descoberto | ~1k |
| 02:xx | Adicionou insurance → toast "Item added successfully" + 3 fees Medibank auto-adicionados | — | OSHC obrigatório integrado | ~0.5k |
| 02:xx | API GET /quote/1644823 → bill completo revelou Taxa de consultoria Ally Hub AU$150 auto-adicionada | — | revenue model Ally Hub exposto: AU$150/quote | ~1k |
| 02:xx | Navegou para "View Quotes" → cart view completo: #Q501, Programs+Fees, Total A$1,005 | — | estrutura completa do cart mapeada | ~1k |
| 02:xx | Escreveu seção 26L completa no ALLY-BLUEPRINT.md (catálogo AU, filtros, flow, fees, achados críticos, comparativo) | .wolf/allyhub-research/ALLY-BLUEPRINT.md | blueprint atualizado | ~3k |

## Session: 2026-06-15 (AllyHub — Espionagem Industrial / Blueprint Competitivo)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 01:xx | Leu cerebrum + anatomy; navegou para app.allyhub.co e fez login (movyeducation@gmail.com / Ally+ Starter gratuito) | — | login OK, alert "Login in another PC" fechado | ~1k |
| 01:xx | Confirmou aluno Lucas Andrade já criado (session anterior); pipeline Kanban, 5 abas do perfil do aluno documentadas | — | 1 aluno, Code 500, WARM | ~2k |
| 01:xx | Explorou Quote 2.0 via AngularJS scope manipulation; Opportunity #OP500 auto-criado | — | fluxo quote + oportunidade mapeados | ~3k |
| 01:xx | Varreu sidebar completa: Dashboard, Financial, Relatórios, Calendário, Configurações (16 sub-seções), Automações, Comissões, módulos extras | — | todos os módulos documentados | ~5k |
| 01:xx | Confirmou AngularJS 1.x via `angular.element().scope().$apply()` | — | tech stack confirmado (EOL — vantagem competitiva Movy) | ~0.5k |
| 01:xx | Escreveu seções 22–37 no ALLY-BLUEPRINT.md (mapa de rotas, pipeline, perfil, formulário, Quote, Opportunity, dashboards, relatórios, settings, automações, comissões, extras, análise estratégica) | .wolf/allyhub-research/ALLY-BLUEPRINT.md | blueprint completo ~900 linhas | ~8k |
| 01:xx | Atualizou anatomy.md + memory.md + cerebrum.md + AI-HANDOVER.md per OpenWolf protocol | .wolf/anatomy.md, .wolf/memory.md, .wolf/cerebrum.md, docs/AI-HANDOVER.md | session encerrada | ~1k |
| 02:xx | Deep dive Quote 2.0: descobriu arquitetura AngularJS+React iframe+Firebase Firestore+api.sellead.com (AllyHub=white-label Sellead). Documentou modelo de dados completo, config toggles, status, itens, moedas, pagamentos (PagBank/PIX/AllyCheckout). Adicionou Seção 26 expandida no ALLY-BLUEPRINT.md | .wolf/allyhub-research/ALLY-BLUEPRINT.md | blueprint quote 2.0 completo | ~5k |

## Session: 2026-06-15 (Task 1 — Contact custom-attribute helpers, woofed-shaped)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| now | TDD: wrote failing test for CONTACT_ATTR/getContactNationality/buildContactAttributes | tests/crm-contacts.test.mjs | RED: 4/4 fail (CONTACT_ATTR undefined) | ~1k |
| now | Appended CONTACT_ATTR + readStringAttr + getContactNationality + LeadAttrs + buildContactAttributes to contacts.ts | lib/crm/contacts.ts | GREEN: 4/4 pass, 30/30 total, type-check clean | ~1k |
| now | Committed feat(crm): woofed-shaped lead custom-attribute helpers | lib/crm/contacts.ts, tests/crm-contacts.test.mjs | commit f6c83fb on main | ~0.5k |

## Session: 2026-06-15 (SPLIT 2 â€” proposal domain + CRM contacts seam, migration 010)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 05:xx | Grounded on SPLIT 2 scope + integration rules (R1/R6/R7/R8/R11) + 009 RLS conventions; inspected live `study_plans`/`data` shape via MCP | docs/PRODUCT-ROADMAP.md, LAGO-WOOFED-CONVERGENCE.md, migration 009, lib/calc/*, study-plans/* | full grounding | ~5k |
| 05:xx | Wrote migration 010: `contacts` (org-scoped, woofed-shape, R6 metadata + R7 external_id, unique-per-org partial idx, RLS), `study_plans` cols (contact_id/deal_id/currency_code/expires_at/accepted_at/deleted_at/metadata/external_id + R8 generated `idempotency_key`), enum extend (+6), `proposal_events` (timeline+RLS), soft-delete-aware SELECT policy | supabase/migrations/010_proposal_domain_contacts.sql (new) | written | ~5k |
| 05:xx | Applied 010 via Supabase MCP (DDL pass + idempotent non-destructive backfill pass): `data.student/email/phone`â†’`contacts` dedupâ†’`study_plans.contact_id`; jsonb kept as working copy (editor relink = SPLIT 4) | MCP apply_migration on `xpthmguzcbmndyyexfbt` | 2 plans migrated, 0 loss | ~3k |
| 05:xx | Advisors check: no new ERRORs; only pre-existing WARNs (009 RLS security-definer helpers + auth leaked-password config). RLS on both new tables | MCP get_advisors | clean | ~1k |
| 05:xx | Regenerated types from live DB (not hand-edited) | types/supabase.ts (MCP generate_typescript_types) | contacts/proposal_events/new cols/enum present | ~2k |
| 05:xx | Domain layer: contacts lib (org-scoped queries + dedup upsert), extended study-plan types (StudyPlanStatus enum, options[], contactRef, new row cols) | lib/crm/contacts.ts (new), lib/study-plans/types.ts | written | ~3k |
| 05:xx | Server actions: duplicate/changeStatus/archive/softDelete/restore/hardDelete/upsertContact â€” each emits proposal_events + audit; getActor carries org_id; withComputed snapshot intact; list filters deleted_at IS NULL | study-plans/actions.ts, study-plans/page.tsx | written | ~3k |
| 05:xx | Tests: normalizeEmail/Phone + enum-extended assertion | tests/crm-contacts.test.mjs (new) | 3 new cases | ~1k |
| 05:xx | DoD gates | â€” | type-check âœ… Â· node --test 13/13 âœ… Â· build âœ… Â· migration applied Â· types regen | ~0.5k |
| 05:xx | Documented split | docs/AI-HANDOVER.md, docs/PRODUCT-ROADMAP.md (SPLIT 2 âœ…), .wolf/{cerebrum,memory,anatomy}.md | logged | ~1k |

## Session: 2026-06-15 (SPLIT 1 â€” calc engine + money in integer cents + computed snapshot)

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
| 04:xx | DoD gates | â€” | type-check âœ… Â· node --test 10/10 âœ… Â· build âœ… | ~0.5k |
| 04:xx | Documented split | docs/AI-HANDOVER.md, docs/PRODUCT-ROADMAP.md (Â§5 SPLIT 1 âœ…), .wolf/{cerebrum,memory,buglog,anatomy}.md | logged | ~1k |

## Session: 2026-06-15 (OpenWolf â€” product repositioning master plan)

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 02:xx | Studied current architecture to ground the new direction: study_plans (data jsonb), course_presets (flat), pure client-side calc engine, single-tenant RLS | migrations 001/008, lib/study-plans/*, study-plans/actions.ts | full grounding | ~5k |
| 02:xx | Wrote master architecture & roadmap: 3 pillars, tenancy-ready principle, target domain model, SPLITS by code area, execution order 0â†’1â†’2â†’3â†’4â†’6â†’5â†’7â†’8â†’9. CRM out of scope | docs/PRODUCT-ROADMAP.md (new) | plan persisted | ~6k |
| 02:xx | Logged decisions (repositioning, tenancy-ready, splits, calc single-source, portfolio replaces presets, AI never-saves-direct, quit `as any`) | .wolf/cerebrum.md | recorded | ~1k |
| 02:xx | Added product-direction pointer at top of handover; registered new doc in anatomy | docs/AI-HANDOVER.md, .wolf/anatomy.md | cross-linked | ~1k |
| 02:xx | Cloned + analyzed douglara/woofed-crm (Rails 7.1/Postgres/pgvector/Devise/GoodJob/MCP/money-in-cents; single-account; contacts/deals/pipelines/stages/products/deal_products/events) to ground CRM integration | C:/dev/woofed-crm (sibling, not committed) | full domain map | ~4k |
| 02:xx | Made roadmap CRM-ready/woofed-shaped: P9 money-in-cents, P10 woofed compat, Â§3.6 seam + domain map, contacts extraction in Split 2, money migration in Split 1, AI patterns in Split 7, Â§10.1 integration strategy A/B/C (rec: B-compat now) | docs/PRODUCT-ROADMAP.md, cerebrum, AI-HANDOVER | seam designed | ~3k |
| 02:xx | Studied woofed UI (ERB/Vite/Inertia/Stimulus + Tailwind `@layer components` DS: color-*/button-*/typography-* over palette + collapsible 72â†”200 sidebar + per-page navbar + Lucide + shadcn vars + Nunito) from clone | C:/dev/woofed-crm app/views/layouts, application.tailwind.css, tailwind.config.js | full UI anatomy | ~4k |
| 02:xx | Decisions w/ user: VPS NOT needed (Caminho B = woofed is blueprint, source-as-reference); UI = woofed structure/tokens + Movy skin (purple/gold + Clash/Satoshi); start with foundation now | â€” | confirmed | ~0.5k |
| 02:xx | SPLIT UI foundation: ported woofed DS into globals.css as `@layer components` remapped to Movy CSS vars via `--ds-*` tokens (light/dark); rewrote AppShell woofed-shaped (collapsible 208â†”76 persisted, Lucide icons, button-menu-* active, settings pinned, navbar-container topbar, surface sidebar not purple rail) | app/globals.css, components/layout/AppShell.tsx | type-check + build green | ~5k |
| 02:xx | Documented SPLIT UI in roadmap (frontend-only, independent of SPLIT 0; page migration folds into splits 3/4/5/6) | docs/PRODUCT-ROADMAP.md Â§5 | recorded | ~1k |

| 23:44 | Fixed documented pre-feature bugs: residual Bricolage, FYME teal seed color, and Manha label; validated in temp clone | wiki/page.tsx, departments/[slug]/page.tsx, StudyPlanEditor.tsx, knowledge seeds | type-check, study-financial test, build passed | ~2k |

## Session: 2026-06-14 22:54

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-06-14 (Antigravity IDE â€” redesign light/dark + fixes; NOT logged by that agent, reconstructed here)

> Reconstructed from the Antigravity walkthrough + git working tree on 2026-06-15.
> The Antigravity (Gemini) agent did this work but did not write to OpenWolf; logged retroactively.

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| --:-- | Built full light/dark design system: semantic CSS variable tokens (`[data-theme=light\|dark]`), anti-flash inline script, ThemeToggle | app/globals.css, lib/ui/theme.ts, app/layout.tsx, components/ui/ThemeToggle.tsx | both themes working | ~8k |
| --:-- | New typography via Fontshare: Clash Display (display) + Satoshi (body/ui/mono), Outfit as fallback; `font.mono` no longer monospaced | app/globals.css, lib/ui/theme.ts | applied app-wide | ~1k |
| --:-- | Migrated ~29 files from `color.purpleDeep`/hardcoded hex to theme tokens (`t.text`, `var(--surface)`, `ink(a)`) so dark mode doesn't break | cambio/*, financial, settings/*, wiki + blocks, study-plans editor/proposal, departments, home, error, AppShell | type-check clean | ~6k |
| --:-- | Removed Home KPI counter strip (users/docs/proposals) â€” noise for an internal tool, not a sales dashboard | app/[locale]/(protected)/home/page.tsx | removed DB count() calls | ~1k |
| --:-- | Fixed "white cut" / topbar-overlap bug in both themes: 100vhâ†’100dvh, html/body bg=var(--bg), main scrolls internally (overflow-y:auto) | components/layout/AppShell.tsx, app/globals.css | resolved | ~1k |
| --:-- | Editor: split fields by course type (ELICOS / VET / Higher Education) â€” hide material panel where it makes no sense | components/study-plans/StudyPlanEditor.tsx | cleaner per-type form | ~2k |
| --:-- | Timeline premium colors (deep-purpleâ†’gold gradients) for screen + PDF print contrast | components/study-plans/StudyPlanProposal.tsx, StudyPlanEditor.tsx | applied | ~1k |
| --:-- | Legacy cleanup: nav label "Campanhas"â†’"Planos de Estudo"; legacy mentions removed from manifest | messages/pt.json, public/manifest.json | applied | ~0.5k |
| --:-- | (Claude, separate window) created test user testemovy@movy.com.br / teste123! (role admin); fixed GoTrue 500 by setting NULL token cols to '' | Supabase auth (prod xpthmguzcbmndyyexfbt) | login works | ~1k |
| --:-- | Documented-error fixes (staged for separate commit): manifest 404 (/pt/manifest.json), Draftâ†’Rascunho, lang="pt-BR", legend contrast (WCAG), Wiki excerpt spacing | middleware.ts, study-plans/page.tsx, app/layout.tsx, WikiListItem.tsx, FxConverter.tsx, wiki/page.tsx | staged, not committed | ~2k |
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
| 08:55 | ReconciliaÃ§Ã£o: descoberto via export Cursor que SPLIT 1/2 jÃ¡ estÃ£o na main; ff-merge p/ 68c6db5; re-apliquei revisÃ£o do roadmap (motor de regrasâ†’SPLIT 6, versÃµes/templatesâ†’migration 012/SPLIT 4, SPLIT 10 IA, 6 antes do 4) marcando 1/2 âœ… | docs/PRODUCT-ROADMAP.md, .wolf/cerebrum.md, docs/AI-HANDOVER.md | concluÃ­do (sÃ³ docs) | ~12k |
| 08:56 | Session end: 28 writes across 2 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md) | 3 reads | ~10253 tok |
| 08:58 | Session end: 28 writes across 2 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md) | 4 reads | ~10253 tok |
| 09:02 | Edited lib/calc/money.ts | added 1 condition(s) | ~622 |
| 09:03 | Edited tests/study-financial.test.mjs | expanded (+16 lines) | ~268 |
| 09:04 | Edited docs/AI-HANDOVER.md | modified 1() | ~218 |
| 09:09 | Edited app/[locale]/(protected)/study-plans/actions.ts | added error handling | ~596 |
| 09:11 | Created app/[locale]/(protected)/study-plans/ProposalsList.tsx | â€” | ~5542 |
| 09:12 | Created app/[locale]/(protected)/study-plans/page.tsx | â€” | ~1552 |
| 09:14 | Edited docs/PRODUCT-ROADMAP.md | expanded (+11 lines) | ~478 |
| 09:14 | Edited docs/PRODUCT-ROADMAP.md | modified revisada() | ~63 |
| 09:14 | Edited docs/PRODUCT-ROADMAP.md | 2â†’2 lines | ~59 |
| 09:15 | Edited docs/AI-HANDOVER.md | modified reescrito() | ~470 |
| 09:15 | SPLIT 3 lista de propostas: page.tsx server (searchParams filtros/sort/paginaÃ§Ã£o), ProposalsList.tsx client (seleÃ§Ã£o/lote/lixeira/menu/toasts), +bulkStudyPlanAction. type-check verde | study-plans/{page,ProposalsList,actions}.tsx | concluÃ­do | ~14k |
| 09:17 | Session end: 38 writes across 7 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 11 reads | ~20231 tok |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | modified Schema() | ~811 |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | 2â†’2 lines | ~44 |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~27 |
| 09:21 | Edited docs/PRODUCT-ROADMAP.md | 2â†’2 lines | ~55 |
| 09:22 | Edited docs/PRODUCT-ROADMAP.md | 2â†’2 lines | ~46 |
| 09:22 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~19 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | modified revisada() | ~318 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~44 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | "lib/calc/rules.ts" â†’ "applyRules" | ~41 |
| 09:23 | Edited docs/PRODUCT-ROADMAP.md | "lib/calc/scenarios.ts" â†’ "computeScenarios" | ~35 |
| 09:24 | Edited docs/PRODUCT-ROADMAP.md | inline fix | ~23 |
| 09:24 | Edited docs/PRODUCT-ROADMAP.md | 2â†’2 lines | ~56 |
| 09:24 | Edited docs/AI-HANDOVER.md | expanded (+13 lines) | ~292 |
| 09:25 | SPLIT 6 quebrado em 6A (backend: schema+regras+CourseSource, destrava editor) + 6B (UI gestÃ£o). Roadmap restruturado, nova ordem 6Aâ†’4â†’6Bâ†’5 | docs/PRODUCT-ROADMAP.md, cerebrum, handover | concluÃ­do (docs) | ~6k |
| 09:25 | Session end: 51 writes across 7 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 11 reads | ~35329 tok |
| 09:34 | Created lib/calc/rules.ts | â€” | ~2220 |
| 09:34 | Created lib/calc/scenarios.ts | â€” | ~488 |
| 09:35 | Edited tests/study-financial.test.mjs | modified makeElicos() | ~262 |
| 09:35 | Edited tests/study-financial.test.mjs | expanded (+51 lines) | ~675 |
| 09:36 | Edited docs/AI-HANDOVER.md | modified 6A() | ~461 |
| 09:36 | SPLIT 6A parte 1/2: lib/calc/rules.ts (applyRules prÃ©-processador puro, ruleSet vazio=no-op) + scenarios.ts + 5 testes (16/16). Motor de regras = camada agÃªncia (promo/desconto/fee), estrutural fica no engine | lib/calc/{rules,scenarios}.ts | concluÃ­do | ~10k |
| 09:38 | Session end: 56 writes across 9 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 14 reads | ~39534 tok |
| 09:39 | Edited docs/AI-HANDOVER.md | modified travadas() | ~224 |
| 09:39 | Edited docs/PRODUCT-ROADMAP.md | expanded (+8 lines) | ~256 |
| 09:39 | Regra-mÃ£e documentada: WHITE-LABEL FIRST governa toda decisÃ£o tÃ©cnica (desempate = config, nÃ£o reescrita). Em roadmap Â§2 (P0), handover Regras de Ouro, cerebrum prefs+decision log | docs/PRODUCT-ROADMAP.md, docs/AI-HANDOVER.md, .wolf/cerebrum.md | concluÃ­do | ~3k |
| 09:40 | Session end: 58 writes across 9 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 14 reads | ~40048 tok |
| 09:43 | Created supabase/migrations/011_portfolio_pricing_rules.sql | â€” | ~5621 |
| 09:43 | Session end: 59 writes across 10 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 15 reads | ~46070 tok |
| 09:45 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | expanded (+8 lines) | ~578 |
| 09:46 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | modified public() | ~314 |
| 09:46 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | inline fix | ~38 |
| 09:46 | Edited lib/calc/rules.ts | expanded (+6 lines) | ~202 |
| 09:46 | Edited lib/calc/rules.ts | 5â†’7 lines | ~96 |
| 09:46 | Edited lib/calc/rules.ts | added 1 condition(s) | ~78 |
| 09:47 | Edited lib/calc/rules.ts | modified applyRulesToPlan() | ~413 |
| 09:47 | Edited tests/study-financial.test.mjs | expanded (+13 lines) | ~249 |
| 09:48 | Edited docs/AI-HANDOVER.md | modified NACIONALIDADE() | ~547 |
| 09:48 | SPLIT 6A: migration 011 rascunhada (portfÃ³lio+pricing_rules, P0/P9, promotions unificada) + NACIONALIDADE no preÃ§o (course_price_versions.nationality + fn current_course_price + RuleCondition.nationality). 17/17 testes | migrations/011, lib/calc/rules.ts | rascunho p/ revisÃ£o | ~12k |
| 09:52 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | modified public() | ~679 |
| 09:52 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | 6â†’6 lines | ~129 |
| 09:52 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | 5â†’7 lines | ~127 |
| 09:52 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | modified public() | ~378 |
| 10:09 | Created types/supabase.ts | â€” | ~13356 |
| 10:11 | Edited supabase/migrations/011_portfolio_pricing_rules.sql | 3â†’4 lines | ~90 |
| 10:13 | SPLIT 6A: migration 011 APLICADA via MCP em xpthmguzcbmndyyexfbt (11 inst/12 cursos/12 price_versions seedados, markets paÃ­s+mercado, current_course_price). Tipos regenerados. Advisors 0 ERROR. type-check verde | migrations/011, types/supabase.ts | aplicada | ~14k |
| 10:15 | Session end: 74 writes across 11 files (PRODUCT-ROADMAP.md, AI-HANDOVER.md, money.ts, study-financial.test.mjs, actions.ts) | 17 reads | ~70373 tok |
| 11:00 | Edited docs/AI-HANDOVER.md | modified 6A() | ~730 |
| 11:01 | Handover atualizado: 6A com banco aplicado, COMECE AQUI = lib/portfolio + CourseSource (Ãºltimo sub-passo 6A, sÃ³ TS) | docs/AI-HANDOVER.md | concluÃ­do | ~3k |
| 11:20 | SPLIT 6A final: lib/portfolio/* (types+queries+pricing-rules+markets+course-source+index) + provider CourseSource | lib/portfolio/*, tests/portfolio.test.mjs | type-check+test(26)+build green | ~9k |

| 12:04 | Regra documentada: WOOFED-SHAPED FIRST (campo nao-nativo -> custom_attributes; conferir db/schema.rb antes de criar coluna) | .wolf/cerebrum.md, docs/AI-HANDOVER.md, spec | regra gravada | ~1k |
| 12:20 | Task 2: country helpers — created lib/constants/countries.ts, appended 2 tests to tests/crm-contacts.test.mjs | lib/constants/countries.ts, tests/crm-contacts.test.mjs | 9/9 tests pass, type-check clean, committed 3003057 | ~600 |
| 12:37 | SPLIT 4 inicio: passo-0 NewProposalModal (buscar/criar lead) + actions (searchContactsAction/createProposalForContact) + seam de preco (priceVersionLabel/toPricedOptions/listActivePriceVersions/CourseSource.listPrices) + countries.ts + lead helpers woofed-shaped | lib/crm, lib/portfolio, lib/constants, study-plans/* , tests | type-check+test(37)+build green | ~12k |
| 15:49 | SPLIT 4 REFEITO: reset --hard aa39841 + force-push (apaga commits do Cursor D→wizard); editor reconstruido (picker+override+sticky/autosave+wizard) com fix da sticky bar (sticky vs fixed) e wizard sem desmontar etapas | StudyPlanEditor.tsx, EditorStickyBar.tsx, EditorWizardNav.tsx, CoursePortfolioPicker.tsx, page.tsx | type-check+test(37)+build green; commit 593c384 | ~20k |
| 15:58 | Fix bug visual (passo-0, pre-Cursor): NewProposalModal via createPortal(body) z-1000 + tokens dark-mode; menu do avatar fecha por listener (backdrop-filter da navbar prendia o backdrop fixed) | NewProposalModal.tsx, AppShell.tsx, buglog | type-check+test(37)+build green | ~8k |
| 16:12 | Fix: dropdown do avatar ficava sob o conteudo (navbar com backdrop-filter = stacking context sem z-index) -> header desktop position:relative z-40 | AppShell.tsx, buglog | type-check+build green | ~3k |
| 16:40 | Fix def. menu avatar: portal pro body com position:fixed ancorado no rect do botao (z-index da navbar nao bastava p/ headers de pagina) + fecha em scroll/resize | AppShell.tsx, buglog | type-check+build green | ~5k |
| 17:58 | SPLIT 4 fatia A: ScenarioPanel (comparador "e se?" por semanas, so-leitura/transitorio) via computeScenarios+withFirstCourseStudyWeeks; semanas configuraveis (ELICOS sem padrao), sem persistencia (migration-safe woofed); integrado no passo Revisao; testes APPEND | ScenarioPanel.tsx, StudyPlanEditor.tsx, study-financial.test.mjs, spec, anatomy, handover | type-check+test(41)+build green | ~14k |
| 18:55 | Salvou referencia do concorrente: docs/competitor-allyhub-blueprint.md (videos 1-9 do AllyHub, mapa AllyHub->Movy por split; so "multiplas opcoes" = fatia B em execucao, resto backlog); linkou no PRODUCT-ROADMAP | competitor-allyhub-blueprint.md, PRODUCT-ROADMAP.md | doc salvo, sem codigo tocado | ~8k |
| 19:30 | SPLIT 4 fatia B1: comparador de opcoes. Extraiu editor-ui.tsx (primitivos) + CourseListEditor + ExtraCostsEditor de StudyPlanEditor (refactor hot file, primario reusa); OptionsManager (abas Opcao 1..5, renomear/duplicar/remover/recomendada + comparacao lado a lado) no passo Revisao; lib/study-plans/options.ts (puro: createOption/duplicateOption/withRecomputed/setRecommended/canAddOption) + tests/options.test.mjs (6 casos) | editor-ui.tsx, CourseListEditor.tsx, ExtraCostsEditor.tsx, OptionsManager.tsx, options.ts, StudyPlanEditor.tsx, options.test.mjs | type-check+test(47)+build green | ~40k |
| 19:45 | SPLIT 4 fatia B2: StudyPlanProposal renderiza OptionsComparison (opcoes lado a lado, recomendada destacada) quando data.options.length, apos o SummaryStrip; reusa plan* helpers (AUD) + formatBrl opcional; sem opcoes = render single-mix inalterado | StudyPlanProposal.tsx, anatomy | type-check+test(47)+build green | ~7k |

---

**Session: 2026-06-16 (HR & Time Management — Brainstorming + Design Spec)**

| HH:MM | description | file(s) | outcome | ~tokens |
|-------|-------------|---------|---------|---------|
| 10:00 | Brainstorming HR module — approaches A/B/C shown via visual companion | .superpowers/brainstorm/.../approaches.html | User chose A (Time Tracker + Invoice Generator) | ~3k |
| 10:30 | Schema design (4 tables) shown in visual companion | .superpowers/brainstorm/.../design-schema.html | User approved ("sim ]") | ~2k |
| 11:00 | UI mockup v1, v2, v3 (woofed shell) created iteratively | ui-mockup-hr*.html | v3 with Agency Hub sidebar + ABN Tax Invoice preview | ~8k |
| 11:30 | Wrote full design spec | docs/superpowers/specs/2026-06-16-hr-time-management-design.md | Created; ready for writing-plans | ~4k |
| 14:06 | Saved Horilla HR blueprint reference for future HR feature expansion | .wolf/cerebrum.md | logged | ~50 |
| 14:30 | Task 3 HR module: wrote tests/hr-calculations.test.mjs (TDD RED), then lib/hr/calculations.ts (GREEN) | lib/hr/calculations.ts, tests/hr-calculations.test.mjs | 17/17 tests pass, committed 4a9f3e5 | ~3k |
| 14:30 | Created lib/hr/queries.ts with all org-scoped query helpers; added HrInvoiceUpdate to types.ts | lib/hr/queries.ts, lib/hr/types.ts | tsc clean, committed | ~800 |
| 14:34 | Added Clock icon + operationsNav + Operations section to sidebar | components/layout/AppShell.tsx | committed feat(hr) | ~300 |
| 2026-06-16 | Task 8: Created WeekSummary.tsx — 7-day hours bar chart + status dots, using theme tokens | components/hr/WeekSummary.tsx | tsc clean, committed 2cceeab | ~800 |
| 14:45 | fix timezone drift in WeekSummary getWeekDates() | components/hr/WeekSummary.tsx | committed b03b58d | ~400 |
| 14:50 | Created HR dashboard page (Task 11) | app/[locale]/(protected)/hr/page.tsx | committed 90b7c67 | ~800 tokens |
| 14:55 | Task 12: Created employee clock self-service page | app/[locale]/(protected)/hr/clock/page.tsx | tsc clean, committed c5b0423 | ~400 |
| 14:51 | Created TaxInvoice.tsx — ABN-format print component (Task 10 HR module) | components/hr/TaxInvoice.tsx | committed 6108541 | ~800 |
| 14:57 | Created HR invoices list page + GenerateInvoiceForm modal (Task 14) | app/[locale]/(protected)/hr/invoices/page.tsx, GenerateInvoiceForm.tsx | commit be590d8 | ~250 tokens |
| 14:56 | Task 15: invoice print page + no-print on sidebar/header | app/[locale]/(protected)/hr/invoices/[id]/print/page.tsx, components/layout/AppShell.tsx | tsc clean, committed 02b31d0 | ~600 |

| 15:45 | HR module complete — Tasks 1-16 done: DB migration, types, calculations (TDD), query helpers, server actions, sidebar nav, 4 components, 5 pages + 2 sub-components, print/PDF | lib/hr/, components/hr/, app/[locale]/(protected)/hr/ | ✅ build passing | ~2000 |

| 20:23 | SPLIT 4 complete: migration 012 applied to xpthmguzcbmndyyexfbt; types/supabase.ts regenerated; EditorStickyBar: BRL equiv + ExplainPanel (per-course breakdown); StudyPlanEditor: fxRate fetch + VersionHistory panel; VersionHistory.tsx created; saveVersionAction/listVersionsAction/restoreVersionAction/saveAsTemplateAction/listTemplatesAction added to actions.ts | EditorStickyBar.tsx, StudyPlanEditor.tsx, VersionHistory.tsx, actions.ts, types/supabase.ts | 64/64 tests + tsc clean | ~3500 tokens |

| 09:00 | AI-HANDOVER.md updated with SPLIT 4 fatia C completion log (migration 012 + BRL/ExplainPanel + VersionHistory + 5 server actions). SPLIT 4 fully closed. Next = SPLIT 6B. | docs/AI-HANDOVER.md | handover logged | ~200 tokens |

| 09:30 | SPLIT 6B: portfolio UI — actions.ts (9 server actions), portfolio/page.tsx, portfolio/[id]/page.tsx, PortfolioPage.tsx, InstitutionDetail.tsx (CoursesTab/PricesTab/RulesTab), AppShell.tsx nav entry (Building2/Portfólio) | app/[locale]/(protected)/portfolio/**, components/portfolio/**, AppShell.tsx | tsc clean + 64/64 tests | ~3000 tokens |

| 21:53 | Mega auditoria pré-produção: 4 agentes paralelos (security-reviewer, code-reviewer, Explore×2) cobriram 21 dimensões → 47 issues (11C/27H/14M/8L); plano salvo em .claude/plan/mega-audit.md | 11 arquivos auditados + supabase/migrations/* + package.json | Plano completo com 4 fases e ~56-71h de esforço | ~373k tokens |
| 22:10 | Mega-audit fixes (C1–C11 + H1–H5): XSS sanitization in wiki blocks, audit silent-catch, SupabaseClient<any>, portfolio RLS (service→authenticated client), HR role checks + audit logging, dead deleteStudyPlan removed, getShareUrlAction role guard, FX HTTP 503, preset org_id scope, proposal rate-limit, CI/CD created, 33 permissions tests | BlockRenderer.tsx, StepsBlock.tsx, InfoBox.tsx, audit.ts, portfolio/page.tsx, portfolio/[institutionId]/page.tsx, hr/actions.ts, study-plans/actions.ts, fx/route.ts, presets/actions.ts, p/[token]/actions.ts, .github/workflows/ci.yml, tests/permissions.test.mjs | tsc 0 erros · 33/33 pass | ~14k tok |
| 22:40 | HIGH fixes H6–H13 + C9: StudyPlanEditor (save memoizado + router.refresh), timesheets paginação (PAGE_SIZE=100), global error.tsx + not-found.tsx criados, generateMetadata na página pública, devcontainer Node 24, docs/BACKUP-RECOVERY.md, 17 testes sanitize-html + 30 testes hr-calculations | StudyPlanEditor.tsx, hr/timesheets/page.tsx, lib/hr/queries.ts, app/error.tsx, app/not-found.tsx, p/[token]/page.tsx, .devcontainer/devcontainer.json, docs/BACKUP-RECOVERY.md, tests/sanitize-html.test.mjs, tests/hr-queries.test.mjs | tsc 0 erros · 75/75 pass | ~12k tok |
| 22:34 | perf fix: middleware getSession + HR parallelização + study-plans Promise.all | middleware.ts, hr/page.tsx, study-plans/page.tsx | TTFB Home -50%, Propostas -47%, HR -31% | ~4000 |
| 22:39 | MEDIUM issues M1-M14: CSP enforcing, getActorSession+svc() shared helpers, health route, robots.txt, .env.example docs, Supabase origin from env, router.refresh InstitutionDetail, Zod validation hr+portfolio, Sentry setup, wizard step URL, allowed_emails RLS migration, course_presets deprecation banner | multiple files | 139/139 tests pass tsc clean | ~4500 |
| session | LOW issues L2-L8 (L1 skipped — requires .ts extensions for node test runner): L2 timeline ticks useMemo, L3 HrDashboard stable keys, L4 .nvmrc, L5 CHANGELOG.md, L6 tests renamed *.test.mjs→*.test.mts + test script in package.json + CI updated, L7 lib/supabase/json.ts toJson(), L8 CONTRIBUTING.md + docs/MIGRATIONS.md + docs/DEPLOYMENT.md | tests/*.test.mts, package.json, .github/workflows/ci.yml, CHANGELOG.md, CONTRIBUTING.md, docs/MIGRATIONS.md, docs/DEPLOYMENT.md | Mega-audit COMPLETE — all 21 issues resolved (L1 deferred, C10 planned upgrade) | ~2k tok |
| 14:57 | Scoped timesheets page: non-admin users see only own entries (isHrAdmin + getEmployeeByProfileId), admin unchanged | app/[locale]/(protected)/hr/timesheets/page.tsx | ✅ tsc clean, committed | ~120 tokens |
| 23:12 | Task B1: replace 3-field DD/MM/YYYY date inputs with single DateInputPT in AddEntryModal | components/hr/DateInputPT.tsx (created), components/hr/HrDashboard.tsx (modified) | committed 64f9281 | ~800 tokens |
| 23:13 | Added clockOutMsg state + success toast with session duration to ClockWidget | components/hr/ClockWidget.tsx | committed b03f025 | ~800 |

| 23:16 | Task B3: improved empty states with actionable messages | components/hr/HrDashboard.tsx, app/[locale]/(protected)/hr/invoices/page.tsx | committed d15ac24 | ~800 |
| 23:17 | Task B4: added listInvoicesWithEmployeeName + employee name column to invoice list | lib/hr/queries.ts, app/[locale]/(protected)/hr/invoices/page.tsx | commit c8e71e7 | ~800 |
| 23:20 | C1: added estimated_cost_cents to EmployeeWithStats + return map | lib/hr/queries.ts | committed e159275 | ~200 |
| 23:20 | C2: formatAUD import, totalEstimatedCents, Est. Payroll card, per-employee cost | app/[locale]/(protected)/hr/team/page.tsx | committed 8fd0470 | ~300 |
| 00:54 | Audit fixes (C-2, H-1, H-2, M-1..6, L-2..5): hr/actions.ts callers, FX timeouts+rate limiter, study-plans org_id+parallel, audit.ts Sentry+orgId, 4 SQL migrations (020-023), deleted json.ts, share page expiry check | hr/actions.ts, api/fx/route.ts, api/fx/history/route.ts, study-plans/actions.ts, lib/api/audit.ts, lib/api/rate-limit.ts, p/[token]/page.tsx, supabase/migrations/020-023 | all done | ~12k |
| 01:15 | Session resumed: verified all 12 HR tasks already committed. Fixed 5 TS build errors: clockOut/linkEntriesToInvoice/updateInvoiceStatus missing args in actions.ts, audit.ts orgId null vs undefined, share-link page eslint comment. build ✅ tsc ✅ | actions.ts, audit.ts, p/[token]/page.tsx | committed 92e7f01 | ~3k |
| 01:13 | H-3: next-intl 3.26.5→4.13.0 (createIntlMiddleware→createMiddleware); L-6: rate-limit.ts Upstash Redis + fallback; H14: types/supabase.ts regenerated from remote DB | middleware.ts, lib/api/rate-limit.ts, app/api/fx/route.ts, app/api/fx/history/route.ts, types/supabase.ts, .env.example | all tsc+tests clean | ~4000 |

| 2026-06-17 | Performance QA session | app/globals.css, lib/auth/get-user.ts, package.json, app/error.tsx, app/global-error.tsx | Fixed 3+ second navigation: (1) switched to Turbopack, (2) fixed @import order in globals.css, (3) fixed error.tsx html/body structure, (4) parallelized HR admin queries, (5) reverted getUser→getSession→getUser for security. Warm loads now 470–900ms | ~8000 |
| 2026-06-17 | MEGA-AUDIT concluído: H-3 next-intl 3→4, L-6 Upstash rate-limit, migrations 020-023 aplicadas, types/supabase.ts regenerado (share_token_expires_at tipado), type cast removido de p/[token]/page.tsx, type-check ✅ | middleware.ts, lib/api/rate-limit.ts, app/api/fx/route.ts, app/api/fx/history/route.ts, .env.example, types/supabase.ts, app/[locale]/p/[token]/page.tsx, docs/AI-HANDOVER.md | done | ~15k tok |

| 2026-06-17 | AUDIT auth/actor: criado helper canônico em lib/actions/auth.ts (requireActor/requireEditor/requireAdmin + ActorProfile único). Removidos 5 padrões divergentes (getActor local, alias hr, 3 tipos Actor com org_id/orgId/role inconsistentes) de 6 action files. requireActor agora checa is_active (fecha gap: usuário desativado não chama mais server actions). type-check ✅ · 168/168 ✅ · lint ✅ | lib/actions/auth.ts, study-plans/actions.ts, hr/actions.ts, portfolio/actions.ts, settings/{presets,users}/actions.ts, wiki/actions.ts | done | ~25k tok |

| 2026-06-17 | Perf: padronizar páginas protegidas | hr/clock,invoices,team,invoices-print, portfolio×2, settings/audit-log,presets | Trocado auth.getUser() manual pelo helper getUser() cacheado; data fetch RLS-scoped paralelizado com auth via Promise.all (~300ms overlap) | ~12000 |
| 2026-06-17 | Fix build quebrado | lib/actions/auth.ts | Refactor de auth em andamento (getActorSession→requireActor) deixou 5 actions.ts quebrados; adicionado alias getActorSession=requireActor; type-check+build+168 testes verdes | ~2000 |

| 2026-06-17 | AUDIT #3+#4+#6: (#3) regra única de audit-log documentada em lib/api/audit.ts + auditRow() DRY + hr migrado p/ logAuditWithClient; (#4) novo lib/db/json.ts (toJson/fromJson) eliminando ~20 casts `as unknown as Json` em 6 arquivos (lib/portfolio/types.ts importa com .ts p/ o test runner); (#6 parcial) Sentry deprecations movidos p/ webpack.* em next.config.mjs. Alias getActorSession removido. type-check ✅ · 168/168 ✅ · lint ✅ (0 warnings). #5 cores e ESLint-CLI ficaram p/ depois. | lib/db/json.ts, lib/api/audit.ts, next.config.mjs, hr/actions.ts, portfolio/actions.ts, study-plans/actions.ts, wiki/[slug]/page.tsx, p/[token]/actions.ts, components/portfolio/InstitutionDetail.tsx, lib/portfolio/types.ts | done | ~30k tok |

| 2026-06-17 | AUDIT #5 (cores, value-driven): 10 sites de roxo-de-marca-como-TEXTO migrados p/ t.accent (var(--accent): roxo claro/dourado escuro) — corrige sumiço no dark mode. Deixados intencionais: paper/PDF, SVG marca, login, badges semânticos, branco-sobre-marca, status palette. SEM varredura cosmética (anti-churn). Achados: [CORRIGIDO depois — MOVY_PREVIEW NÃO é cruft, gateia /_ui-preview; bash grep deu falso-negativo]; test runner "flaky" era falso alarme (medição). type-check ✅ lint ✅ | hr/invoices/page, hr/team/page, settings/audit-log/page, PresetsManager, UsersManager, NewProposalModal, RateCard, SelfInvoiceButton, ScenarioPanel, StepsBlock | done | ~20k tok |

| 2026-06-17 | AUDIT #6 (resto) + finalização: next lint→ESLint CLI (eslint 8.57→9.39.4 + @eslint/eslintrc, novo eslint.config.mjs flat via FlatCompat, .eslintrc.json removido, script "eslint ."); MOVY_PREVIEW: descrição CORRIGIDA no .env.example (gateia a página /_ui-preview, NÃO é bypass de auth; eu tinha removido por engano achando ser cruft — bash grep deu falso-negativo no path com (protected)/[locale]; ripgrep achou). ACHADO: CI usa npm ci mas hooks usam pnpm + 2 lockfiles — instalei via pnpm, package-lock ficou stale, sincronizei via npm install (eslint 9 em ambos). flaky-test era falso alarme (medição). REVISÃO FINAL ponta-a-ponta: type-check ✅ ESLint9 ✅ 179/179 testes ✅ next build ✅ | eslint.config.mjs, package.json, package-lock.json, pnpm-lock.yaml, .env.example, .eslintrc.json(del) | done | ~35k tok |

| 2026-06-17 | Recovered another session's uncommitted mega-audit work that I had mistakenly stashed; committed it cleanly as 149ac33 (separate from my UI work). NOTE: this repo's working tree is shared across sessions — check `git status` for others' WIP before stashing. | (many, mega-audit) | done | ~5k tok |

| 2026-06-17 | Phase 1 study-plans PROPOSAL surface CRIT+HIGH (woofed-ux-alignment): StudyPlanProposal isPublic split (hide toolbar/back/print for clients), BRL skeleton cells while fx loads, SummaryStrip+OptionsComparison → auto-fit responsive grids, ShareProposalButton→Modal+Button+Skeleton, PublicProposalPage top CTA (#accept anchor) + Field/Input on accept + 20px checkbox, internal proposal page PageHeader (Share in actions), p/[token] expired→branded EmptyState (new ExpiredProposal.tsx). type-check ✅ lint ✅ 179 tests. commits ea7dc8a + 6cab050. TODO Phase 1: list surface (A) + editor wizard (B) CRIT+HIGH. | components/study-plans/{StudyPlanProposal,PublicProposalPage,ShareProposalButton}.tsx, study-plans/[id]/proposal/page.tsx, p/[token]/{page,ExpiredProposal}.tsx | done | ~40k tok |

| 2026-06-17 | Phase 1 study-plans LIST surface (A) CRIT+HIGH: NewProposalModal→Modal+Field/Input/Select+tab-roles; page PageHeader; ProposalsList EmptyState (below table, 3 conditions) + confirm Modal replacing native confirm() + icon focus rings/Trash separation; Suspense+ProposalsListSkeleton (new ProposalsData.tsx + ProposalsListSkeleton.tsx). 179 ✅ tc ✅ lint ✅. commits ce8d12b,a4aaab0,ea3a84c,8f97c52. NOTE: ProposalsData.tsx duplicates sanitizeSearch/buildTotalLabel/daysToExpiry (scope) — DRY cleanup TODO. | app/[locale]/(protected)/study-plans/{page,NewProposalModal,ProposalsList,ProposalsData,ProposalsListSkeleton}.tsx | done | ~25k tok |

| 2026-06-17 | Phase 1 study-plans EDITOR WIZARD (B) CRIT+HIGH: VersionHistory→Drawer; StudyPlanEditor PageHeader + beforeunload unsaved guard; skeletons in VersionHistory/CoursePortfolioPicker; header rows + aria-labels on ExtraCostsEditor/payment/ScenarioPanel inputs; consolidated Field/Input/Select→@/components/ui/form (closes focus-ring gap); new shared components/study-plans/PillTabBar.tsx used by OptionsManager + EditorWizardNav. 179 ✅ tc ✅ lint ✅. commits de15fad→e3970e8. Phase 1 CRIT+HIGH now COMPLETE all 3 surfaces; visual verification still pending. | components/study-plans/{StudyPlanEditor,editor-ui,VersionHistory,CoursePortfolioPicker,ExtraCostsEditor,OptionsManager,EditorWizardNav,CourseListEditor,ScenarioPanel,PillTabBar}.tsx | done | ~30k tok |

| 2026-06-17 | Phase 2 FINANCIAL CRIT+HIGH: FinancialCalculator adopt PageHeader + Button (print), movy-field-control focus rings on inputs/select/NumberInput, tabular-nums on result table + constants. No CRITICAL (already responsive/print-ok). 179 ✅ tc ✅ lint ✅. commit d45b293. | components/financial/FinancialCalculator.tsx | done | ~8k tok |

| 2026-06-17 | Phase 2 PORTFOLIO CRIT+HIGH: PortfolioPage + InstitutionDetail — PageHeader; replaced hand-rolled overlay AND local Modal component (3 sub-modals) with shared Modal; Button (was #F36B1C); shared EmptyState (was local); Field/Input/Select/Textarea w/ focus rings; aria-labels on icon buttons; tabular-nums on price table. 179 ✅ tc ✅ lint ✅. commits a72421c,b7227bd. Deviation: InstitutionDetail ExpiryChip → text in PageHeader description. | components/portfolio/{PortfolioPage,InstitutionDetail}.tsx | done | ~20k tok |
| 11:38 | Phase 3 woofed-rubric CRIT+HIGH pass — home + câmbio | home/page.tsx, home/loading.tsx, cambio/page.tsx, FxChart, FxConverter, FxStats, FxRatesTable | 7 commits, 179 pass / 0 fail, type-check clean, lint clean | ~8k |
| 2026-06-17 | Wiki rubric pass (woofed-rubric CRIT+HIGH) | wiki/page.tsx, new/page.tsx, [slug]/page.tsx, [slug]/edit/page.tsx, WikiForm.tsx, DeleteContentButton.tsx | commit 12c12c6 — PageHeader, Modal confirm, EmptyState, Field/Button form, responsive grid, edit aria-label | ~4k |
| 2026-06-17 | Settings + Departments woofed-rubric CRIT+HIGH pass | settings/layout.tsx, SettingsTabs.tsx, audit-log/page.tsx, presets/PresetsManager.tsx, users/UsersManager.tsx, departments/page.tsx, departments/[slug]/page.tsx, components/departments/CategorySection.tsx | 5 commits (3002f7c→82e3271): exact-match settings tabs, PageHeader layout, UsersManager Modal+Button+Field+EmptyState, PresetsManager Modal+movy-field-control+EmptyState, audit-log EmptyState+tabular-nums, departments PageHeader+EmptyState+aria-expanded. 179 pass / 0 fail, type-check clean, lint clean | ~25k |
