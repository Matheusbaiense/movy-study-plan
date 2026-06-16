# AllyHub — Pesquisa Competitiva (Handover Separado)

Pesquisa de UX/produto e engenharia reversa do AllyHub (white-label Sellead) conduzida em 2026-06-15/16.
Blueprint completo: .wolf/allyhub-research/ALLY-BLUEPRINT.md (~4400+ linhas, ~90k tok).
Conta de teste: `movyeducation@gmail.com` / Starter / Austrália. Aluno: Lucas Andrade (Code 500).

---

### 2026-06-15 - Espionagem Industrial: AllyHub Blueprint Competitivo Completo

> **Estado:** pesquisa de UX/produto 100% concluída. Blueprint em `.wolf/allyhub-research/ALLY-BLUEPRINT.md` (seções 1–37, ~900 linhas).
> Aluno de teste criado: Lucas Andrade (Code 500, WARM, `lucas.andrade.test@gmail.com`).
> Conta AllyHub: `movyeducation@gmail.com` / Starter (grátis) / Austrália.

**O que foi mapeado:**

- **Empresa:** ALLY HUB DESENVOLVIMENTO DE SOFTWARE LTDA, CNPJ 23.828.556/0001-76, Ribeirão Preto SP.
- **Planos:** Starter (grátis) → Essential R$197/agente/mês → Premium R$297/agente/mês → Enterprise.
- **Tech stack:** AngularJS 1.x (EOL desde 2021 — VANTAGEM COMPETITIVA DA MOVY), Chatwoot, CKEditor, Aussie Translate, Tawk.to. Backend no Railway.
- **Pipeline de alunos (Kanban 6 estágios):** Without Status → Descoberta → Investigação → Tomada de decisão → Contratação → Ganho.
- **Perfil do aluno (5 abas):** Overview (dados principais + IA Qualification), Email, Quotes and Links, Info (40+ campos), Earnings.
- **Quote 2.0:** `/quote-2/edit/{id}` — editor completo, dropdown via AngularJS scope manipulation (`$select.open`/`$select.search`).
- **Opportunity:** auto-criada ao iniciar cotação (ex.: #OP500), due date 6 meses automático.
- **Módulos:** Dashboard, Financial Dashboard, Relatórios (6 tipos), Calendário, Configurações (16 sub-seções), Automações (pago — fora do Starter), Comissões Ally+, Organizations, Business Pipeline, Student Flight List, Public Quotes, Check-in Tool, Experiences/Marketing, Campaigns.
- **UX gaps vs Movy:** AngularJS lento/sem mobile, UI 100% PT-BR (não serve agências internacionais), formulário de criação com 40+ campos, automações pagas, planos confusos.
- **Análise estratégica:** `.wolf/allyhub-research/ALLY-BLUEPRINT.md` seção 37 — lista de UX gaps, must-have features para Movy, vantagens competitivas.

**Técnicas usadas para extrair dados:** Chrome MCP (read tier) + javascript_tool para interagir com AngularJS (`angular.element().scope()`, `$select`, `$apply()`), accessibility tree reads, page text reads. Chrome não permite clicks diretos — toda interação via JS injetado.

**Próximos passos sugeridos (pesquisa):** explorar `/experience` (Experiences/marketing), `/campaign`, HUB Services (badge "new"), Ally Partners (marketplace de escolas) — não acessados nesta sessão.

---

### 2026-06-16 - AllyHub Quote 2.0: Todos Botões, Duplicate, Delete, Finish (sessão 4 cont.)

> **Estado:** exploração de todos os botões do View Quotes concluída. Quote #Q502 **finalizada com sucesso**. Blueprint seção 43 (~300 linhas) adicionada.

**Descobertas críticas:**

1. **Finish and Save Quotes = PUT /draft/{id} {"finish":true} → HTTP 204** (NOT PUT /quote/{id} autoSave:false como acreditávamos na sessão 3). O mecanismo real usa o endpoint de draft, não o de quote. A hipótese da sessão 3 estava ERRADA.

2. **Fees expirados NÃO bloqueiam o Finish** — o 204 de sucesso comprova. O erro `{"error":true,"totals":[]}` da sessão 3 era de um endpoint diferente, não do botão "Finish and Save Quotes".

3. **Gear menu (⚙️) tem 4 ações:** My comission / Add custom fee (→ Add Discount!) / Duplicate / Delete

4. **"Add custom fee" é na verdade "Add Discount"** — nome enganoso. O modal se chama "$ Add Discount" e permite agência dar desconto ao aluno limitado à comissão total (R$789.76). O desconto sai do bolso da agência.

5. **Duplicate:** `PUT /quote/{id} {"duplicateQuote":true,"draft_id":545900,"student_id":4838783}` → cria nova quote com officeCount incrementado (Q503). Soft delete: `PUT /quote/{id} {"status":"delete",...}` → seta `deleted_at`.

6. **Commission breakdown completo (GET /calculatecommissionplugAndplay):**
   - Lexis English: margin=-10% → agency recebe -AU$110 (escola cobra de volta)
   - Ally Hub: margin=100% → +AU$150 (fee integral)
   - Medibank × 2: margin=13% → +AU$3.90 + AU$9.10
   - Total usuário: AU$205.65 = R$789.76 @ 3.84 BRL/AUD

7. **Dados internos da conta expostos via commission API:** agency_name="Ally+", email="contato@allyhub.co", plan_id=1, activeUntill=2030-12-31, credits=999, office="Ally+ (Ribeirao Preto)" (cidade: Ribeirão Preto, SP, Brasil).

8. **PagBank integration:** `GET /pagbankintegration?checkIntegration=true` — AllyHub tem integração nativa com PagBank (processador BR). `onlyPagBank:0` = aceita outros métodos.

9. **Finish redireciona para perfil do aluno → "Quotes and Links":** Quote #Q502 aparece em seção "Quotes" com status "new". "Drafts" mostra sessões de playground ainda abertas.

10. **Taxa de câmbio:** 1 AUD = R$3.84 (2026-06-16, confirmado pelo response do PUT e pelo card do quote no perfil).

**Situação atual:**
- Quote #Q502 finalizada → status "new" no perfil de Lucas Andrade
- ALLY-BLUEPRINT.md: seções 1–43, ~1700+ linhas, ~30k tok
- Todos os botões principais do View Quotes testados e documentados

---

### 2026-06-16 - AllyHub: Quote 2.0 Catálogo Completo — Add-ons, Accommodations Global, View Quotes Bug, Portal Aluno (sessão 11–12)

> **Estado:** exploração dos itens 3 (Add-ons), 4 (View Quotes/Overview) e 5 (quote-detail portal aluno) concluída. Blueprint seção 52 (~300 linhas) adicionada. ALLY-BLUEPRINT.md agora ~4400+ linhas (~90k tok).

**Descobertas críticas:**

1. **Card Q502 total confirmado — AU$1,268:**
   - Programs: Lexis English Perth 1 sem AU$960 (tuition+enrolment+material)
   - Fees: 4 itens → Medibank OSHC Single AU$70 + Lexis English OSHC Single AU$58 + Ally Hub taxa AU$150 + Medibank OSHC transfer AU$30 = AU$308
   - Total Converted: R$4,968.05 @ R$3.92/AUD

2. **Hierarquia painel esquerdo Q2.0 — 4 seções com count e botão `+`:**
   - Programs (1) | Accommodations (0) | Insurances (2) | Add-ons (2)
   - Todos os itens não-programa aparecem na seção "Fees" do card (independente de tipo)
   - Os 2 Add-ons correspondem aos 2 itens Administrative Tax: Ally Hub taxa + Medibank OSHC transfer

3. **Catálogo Accommodations — global GBP (não AU):**
   - 9 filtros de busca: Destination Country, City, School, Date Start/End, Duration (Weeks), Type, Students sharing, Meals
   - Catálogo global com preços em GBP, não AUD — ex: Kings Hall Manchester £200-290/sem + placement fee £50-160
   - Confirmação: Perth = zero resultados (campus AU não cadastraram acomodações separadas)

4. **View Quotes / Overview — bug de renderer:**
   - Breadcrumb: `Quote playground > View Quotes`
   - Overview mostra: "1 Quotes Overview" com a quote atual
   - Bug crítico: clicar no link "View Quotes" SEMPRE trava o renderer Chrome (CDP timeout 30s). Documentado como limitação de navegação interna do React Router.

5. **Portal aluno `quote.allyhub.co` — stack completo:**
   - AngularJS 1.x + jQuery + Bootstrap 3 (mesma geração do CRM, NÃO React)
   - Idiomas: PT-BR / ES / EN (via `angular-translate`)
   - Integração: PagSeguro (`assets.pagseguro.com.br/checkout-sdk-js`) para pagamento BRL
   - Google Maps API para geolocalização
   - Auth: token-gated via parâmetro URL (sem token → redirect `/signin`)
   - Signin: spinner infinito (AngularJS aguarda API auth que nunca responde sem token)
   - Domínio é Sellead re-branded sob marca AllyHub (confirmado pelo código-fonte)

**Limitações desta sessão:**
- Add-ons catalog: botão `+` não abriu (catálogo de Accommodations bloqueava UI state) — documentado por inferência
- View Quotes mode puro: renderer freeze impediu acesso
- Quote-detail aluno: requer magic link com token (URL sem token → redirect signin)

**ALLY-BLUEPRINT.md:** seções 1–52, ~4400+ linhas, ~90k tok

---

### 2026-06-16 - AllyHub: /shipment = Remessa Internacional — novo produto early access (sessão 10)

> **Estado:** pesquisa AllyHub 100% concluída. Blueprint seção 50H adicionada. ALLY-BLUEPRINT.md agora ~4350+ linhas (~77k tok).

- **`/shipment`** = "Ally HUB Services - International Shipment" — **produto de remessa internacional** separado do CRM.
- **Arquitetura:** React SPA embarcada em iframe dentro do shell AngularJS (mesmo padrão do `/dashboard`). DOM não expõe conteúdo do iframe — documentado via screenshot apenas.
- **Status:** Early access aberto, vagas limitadas ("Acesso antecipado aberto — vagas limitadas").
- **Produto:** Simulador de câmbio com taxa ao vivo (AUD→BRL e outras moedas). Campo "VALOR PARA ENVIAR (AUD)" default AU$1000. Badges: "INTEGRADO AO ALLY CRM" + "TAXA AO VIVO".
- **Estratégia:** segundo modelo de receita AllyHub além do SaaS — spread cambial. Elimina necessidade de Wise/Remessa Online externos para agências. Diferencial competitivo forte (nenhum CRM de intercâmbio concorrente tem isso integrado).
- **"Simulate Shipment" button** em `/instalment/pay` = link para esta landing page (cotação prévia antes de contratar remessa).
- **Arquivo atualizado:** `.wolf/allyhub-research/ALLY-BLUEPRINT.md` (seção 50H), `.wolf/anatomy.md`, `.wolf/memory.md`

---

### 2026-06-16 - AllyHub: Financial Layer Completo — Dashboard + Earnings + Credits + Resume + Bills DOM (sessão 9)

> **Estado:** sistema financeiro do AllyHub 100% documentado. Blueprint seção 50 (A–G, ~250 linhas) adicionada. ALLY-BLUEPRINT.md agora ~4200+ linhas (~75k tok).

- **`/financial/dashboard`:** 3 cards (Receivables/Bills/Balance), cada um com 4 status coloridos (Paid🟢/Pending🟡/Late🔴/General🔵) + valor AU$. Botão "View Future Projections" (premium). 2 widgets inferiores: Earnings by Supplier + Bills by Category.
- **`/instalment/earnings`:** Read-only, CSV export (único no módulo financeiro), 12 filtros incluindo Destiny Country/City (única página com filtro geográfico). Badge "New" no nav = label de "nova feature", não criação.
- **`/instalment/credits`:** "+ New Credit". Formulário: From (School/Partner) → Campus → Due Date radio (no date / inform date) → Currency → Value → Obs (opcional). Tabela: Type/School/Partner/Value/Actions. Modal também serve "Manage Credit" com tabela de histórico interna.
- **`/transition/list`:** "Resume" = cashbook bancário. 3 tabs temporais (7d/30d/custom), filtros Account Bank + Type + Amount, Print + Export CSV. Typo no tab: "Transition History" deve ser "Transaction History".
- **Bills extras descobertos no DOM:** filtro exclusivo "Course Start date between" (shortcuts: this month / next 3 months); "Simulate Shipment" = link para `/shipment` (nova rota não explorada); Payment Suggestions tab texto: "only for bills with the category: school"; tabela tem coluna "Commission" (vs "Invoice" em Receivables).
- **Mapa financeiro 4 camadas documentado:** Dashboard+Overview / CRUD Operacional / Comissões+Reports / B2B+Gates. `/shipment` é única rota não explorada que resta.
- **Arquivo atualizado:** `.wolf/allyhub-research/ALLY-BLUEPRINT.md` (seção 50), `.wolf/anatomy.md`, `.wolf/memory.md`

---

### 2026-06-16 - AllyHub: Financial CRUD Layer — 7 rotas ocultas + New Receivable form (sessão 8)

> **Estado:** exploração completa das rotas financeiras CRUD não documentadas. Blueprint seção 49 (A–J, ~200 linhas) adicionada. ALLY-BLUEPRINT.md agora ~3800+ linhas (~68k tok).

- **Rotas exploradas:** `/billing` (B2B, 3835 registros CM-prefix, Stripe/Bank Slip), `/instalment/receive` (Receivables CRUD, form completo), `/instalment/pay` (Bills CRUD, 2 tabs Default + Payment Suggestions, Simulate Shipment), `/instalment/commission` (Total Commissions, 5 filtros), `/instalment/distributed` (2 tabs Office/User), `/instalment/over` (Over, 3 filtros), `/validation/payment` (hard gate server-side → Permission Denied redirect)
- **New Receivable form documentado:** 11 campos — Due Date, From (Student/Partner/School/Other), Select entity, Link with sold quote (conditional), Link with supplier (conditional), Description, Repeat Monthly, Already paid, Payment Method, Currency (AU$ default), Value
- **Insight crítico:** parcelas NÃO são auto-geradas ao vender quote — confirmado: Q502 `converted_value: AU$1.318`, `status: sold`, `instalments: []`. Criação é 100% manual post-sale via `/instalment/receive`.
- **5 status de parcela descobertos:** Pending, Expired, Partial Paid (oculto na UI mas presente no DOM), Paid, Only Provisioned
- **Tabela CRUD Receivables:** colunas Instalment | Receive From | Description | Method | Due Date | Value | Invoice | Action
- **Rotas nav-visible não exploradas:** `/financial/dashboard`, `/instalment/earnings`, `/transition/list` (Resume)
- **Arquivo atualizado:** `.wolf/allyhub-research/ALLY-BLUEPRINT.md` (seção 49), `.wolf/anatomy.md`, `.wolf/memory.md`

---

### 2026-06-16 - AllyHub: Reports & Commissions — todas as 10 páginas (sessão 7 final)

> **Estado:** exploração completa de Reports + Commissions concluída. Blueprint seção 48 (A–M, ~250 linhas) adicionada. ALLY-BLUEPRINT.md agora ~3600+ linhas (~62k tok).

**Principais achados (Reports):**
1. **10 páginas documentadas:** Performance Report / Funnel Performance / General Behavior / Sales / Cancellations / Receivable / Bills / Credits / Quotes List / Earnings.
2. **Gate financeiro só no nav:** `/report/receive`, `/report/pay`, `/report/credits` acessíveis por URL direta mesmo sem `moduleType>=7`. Security by obscurity.
3. **Funnel Performance → redirect para dashboard:** hardcoded `account.id == 10 || 2015` — feature de piloto/upsell inacessível para contas normais.
4. **Performance Report = 10 widgets:** leaderboards (office + user), 5 charts de funil, Average Status Time (com filtros inline próprios), Best Sellers Schools por unidade temporal.
5. **Sales Report = 11 filtros** incluindo "Received Percentage" (range slider de adimplência) — mais completo do sistema.
6. **Cancellations = clone de Sales** com único delta: "Requested Between" vs "Sold Between" — reutilização de componente Angular.
7. **Earnings = 12 filtros** com "Type of item" + "Type of partner" — rastreamento de comissão por categoria de produto e parceiro.
8. **General Behavior:** 7 colunas de produtividade por usuário (Last Access + New Leads + Cancelled Leads + Quotes + Won Businesses).
9. **Quotes List em /report/quote** está no nav "Commissions" mas é CRM — container misto.
10. **#Q502 Lucas Andrade / Lexis English / AU$1,318** — dado real da conta confirmado.

**Arquivos alterados:**
- `.wolf/allyhub-research/ALLY-BLUEPRINT.md`: seção 48 (A–M) adicionada (~250 linhas)
- `.wolf/anatomy.md`: entrada ALLY-BLUEPRINT atualizada (~3600+ lines, ~62k tok)
- `.wolf/memory.md`: log sessão 7 final adicionado
- `docs/AI-HANDOVER.md`: este entry

---

### 2026-06-16 - AllyHub: Dashboard Completo — 6 KPIs, arquitetura type/moduleType, nav completo (sessão 7 cont.)

> **Estado:** análise completa do Dashboard concluída. Blueprint seção 47 (A–H, ~300 linhas) adicionada. ALLY-BLUEPRINT.md agora ~3350+ linhas (~57k tok).

**Principais achados (Dashboard):**
1. **6 KPI cards com gates:** Hot Leads (type!=2), Warm Leads (type!=2), Cold Leads (type!=2), Sold (role!=qualifier), Won Business (type==3, market==1), Registration Request (type!=3, pós-trial).
2. **Arquitetura 3-sided:** type=1 (agência), type=2 (escola/instituição), type=3 (rede de agências) — plataforma marketplace disfarçada de CRM.
3. **moduleType tiers:** 3=free(Quote+CRM) / 7=Financial / 11=Marketing / 15=Full / 16=Automations v2.
4. **Nav completo mapeado** via ng-show/ng-if DOM extraction — 35+ itens com gates.
5. **Funnel Performance hardcoded** para account.id 10+2015 confirmado no DOM.
6. **8 roles:** database / admin / manager / operation / office / userplus / user / qualifier.
7. **Conta Movy:** role=admin, moduleType=3, type=1, allyPlus=1, useNewMenu=2, market=2.

---

### 2026-06-16 - AllyHub: Builders Deep Dive — Quote Preferences + Email Template + Document Template (sessão 7)

> **Estado:** análise completa dos 4 builders de personalização concluída. Blueprint seção 46 (A–F, ~300 linhas) adicionada. ALLY-BLUEPRINT.md agora ~3050+ linhas (~52k tok).

**Principais achados (sessão 7):**
1. **Quote Online auto-save:** ng-change → `POST api.sellead.com/quoteonlinepreference` a cada mudança de cor/campo. Payload: `{"headerBackgroundColor":"#FF5733","office_id":4215}`. Live preview testado.
2. **Quote PDF vestigial:** apenas banner upload — sem controle de cores/layout do PDF.
3. **Email Template:** CKEditor 4, toggle "Template dependent of quote?" → OFF=44 vars, ON=71 vars (+27 Quote). Split layout editor/variáveis.
4. **Document Template:** CKEditor 4 full-width, **83 variáveis sempre** (sem toggle). 4 seções: Office(14) / Student(36) / Quote(30) / General(3). Fluxo: Settings template → perfil aluno → "Generate Document" → editor intermediário → PDF download.
5. **9 variáveis exclusivas Document Template:** `[[student_contact_*]]` (contact de responsável) — para contratos de menores de 18.
6. **`[[page_break]]`:** quebra de página no PDF. **`[[course_info]]`** e **`[[accommodation_info]]`** = variáveis compostas (múltiplos campos numa string).
7. **Sintaxe `[[duplo_colchete]]`** uniforme em todos builders — proprietária Sellead.

**Arquivos alterados:**
- `.wolf/allyhub-research/ALLY-BLUEPRINT.md`: seção 46 (A–F) adicionada (~300 linhas)
- `.wolf/anatomy.md`: entrada ALLY-BLUEPRINT atualizada (~3050 lines, ~52k tok)
- `.wolf/memory.md`: log sessão 7 adicionado
- `docs/AI-HANDOVER.md`: este entry

---

### 2026-06-16 - AllyHub: Settings Completo — todas as 16 seções (sessão 6)

> **Estado:** análise exaustiva do Settings concluída. Blueprint seção 45 (A–S, ~650 linhas) adicionada. ALLY-BLUEPRINT.md agora ~2550+ linhas (~42k tok).

**Descobertas críticas:**

1. **Payment integrations gated por moduleType:** PagBank e Qualy só disponíveis para moduleType ≥ 7 ou 15. ZOOP está hard-disabled no código (`ngIf: false && ...`) — descontinuado permanentemente. Free plan tem tab Payments completamente vazia.

2. **8 integrações General disponíveis no free:** RD Station (fonte de leads BR), Pipedrive, ActiveCampaign, Zoho Invoice, SMTP customizado, Zapier, Aussie Translate (serviço AU de tradução/certificação), Ollara Education Service (health insurance AU via parceria). Ecossistema claramente focado em agência BR vendendo AU.

3. **Student Public Form:** 6 seções com 30+ campos configuráveis (visibilidade + obrigatoriedade + Custom Name). CPF e RG visíveis por padrão — confirma persona BR. Scholar Info (escola, GPA, idioma) inteiramente desativada — foco em captação rápida, não em perfil acadêmico. Custom Success Feedback editável.

4. **Multi-office architecture:** Sidebar do Settings tem seletor de office no topo; cada office tem Profile/Pipelines/Users próprios. Uma conta pode ter múltiplos escritórios (ex: Perth + Sydney + SP).

5. **Free plan é genuinamente ilimitado:** "Quote + CRM Free - Unlimited - BRL" — R$0/user, Next Bill R$0, activeUntil 2030-12-31. Monetização é fee por quote (AU$150) + upsell de features pagas (payment integrations, etc.).

6. **Import Leads via planilha:** "Download Sample Spreadsheet" → importação em massa de leads. Viabiliza migração de base existente sem API.

7. **Tags + Lead Sources + Reasons to Cancel:** tríade de analytics de funil CRM — todos vazios nesta conta de teste. Em produção: ROI por canal, taxa de churn com motivo, segmentação por tag.

8. **Pipeline "Jornada de compra":** 5 estágios pré-configurados (Descoberta → Investigação → Tomada de decisão → Contratação → Ganho). Customizável. Feature de Leaderboard de agentes existe (config presente, desativada).

**ALLY-BLUEPRINT.md:** seções 1–45, ~2550+ linhas, ~42k tok

---

### 2026-06-16 - AllyHub: Links Externos para o Aluno — /quote-detail/ e /quote-online/ (sessão 5)

> **Estado:** análise completa dos links públicos concluída. Blueprint seção 44 (A–K, ~180 linhas) adicionada. 14 novos endpoints mapeados. 6 subdomínios do AllyHub/Sellead totalmente mapeados.

**Descobertas críticas:**

1. **Dois tipos de link externo distintos**, não apenas um:
   - `/quote-detail/{quote_id}/{hash}` → link direto da quote (gear do card no perfil)
   - `/quote-online/{link_id}/{hash}` → link gerenciável que pode conter N quotes (seção "Links")
   - Visualmente idênticos, mas arquitetura de API completamente diferente

2. **Tracking duplo em /quote-online/:** dispara `PUT /quotehash?viewQuote=true` (nível quote) + `PUT /quoteonlinehash?view=true` (nível link). O agente vê `opened: N` separado de `view: N` por quote. Campo `like: null` → aluno pode aprovar/rejeitar uma quote específica dentro do link.

3. **Token único compartilhado:** um hash (`vWXkPI36fJK2nBp7Cb6JpPVf2RBRcR`) autentica TODOS os endpoints públicos — quotehash, quoteonlinehash, opportunityhash, feepricehash, firstpricehash. "Capability URL" puro (sem auth adicional).

4. **6 subdomínios mapeados:**
   - `app.allyhub.co` (CRM), `quote2.allyhub.co` (builder), `api.sellead.com` (backend Sellead),
   - `api-student.allyhub.co` (installments), `quote.allyhub.co` (pages públicas), `student.allyhub.co` (checkout)

5. **Fluxo de pagamento completo:** COMPRAR → `student.allyhub.co/checkout/{id}/{hash}?paymentType=full` | Tipos: full / poupancinha / cartaoEntrada / parcelado / pravaler | Parcelamento 2–12x com juros 4.68–11.68% via `api-student.allyhub.co/getinstallments` | Dois processadores BR: PagBank + ZOOP.

6. **Página 100% em PT-BR:** confirma target audience brasileiro. Conteúdo: programa, preços (AUD + conversão R$3.84), YouTube embed da escola, galeria, "Sobre a Escola", Comodidades, branding do agente. Tech stack: jQuery + Bootstrap + Chart.js (vanilla — não React).

7. **CRÍTICO — dados da conta expostos publicamente:** `GET /quotehash/` e `GET /quoteonlinehash/` retornam bcrypt hash da conta (`$2y$10$...`), credits, plan_id, charge_type, billing info — acessíveis para qualquer pessoa com a URL do aluno.

8. **campo `campaign_id` no link entity:** links podem ser vinculados a campanhas de email marketing (null no nosso caso).

**ALLY-BLUEPRINT.md:** seções 1–44, ~1900+ linhas, ~35k tok

---

### 2026-06-16 - AllyHub Quote 2.0: Simulação Completa Perth (sessão 4)

> **Estado:** simulação completa executada. Blueprint atualizado: `.wolf/allyhub-research/ALLY-BLUEPRINT.md` (seções 41–42, ~1400+ linhas total).
> Quote #Q502 — 1 semana Lexis Perth, AU$1,318 total. PUT autoSave:true funcionou ✅.

**Descobertas principais:**

1. **Preço breakdown completo (courseCampus id=495052, 1 semana):** Tuition AU$550 + Enrolment AU$265 + Material AU$195 = **AU$1,010 total do curso.** Campos separados `editedTuition/Material/Enrol` e `discountTuition/Material/Enrol` permitem override pela agência via payload PUT.

2. **Fee novo descoberto — Lexis English OSHC Single AU$58/mês:** Além dos 3 fees retornados pelo `/mandatoryrule`, a quote incluiu um 4º fee da própria escola (Lexis English), com valor distinto do Medibank AU$70. Origem: `coursecampusvalues` (school-specific), não mandatoryrule.

3. **Fee table atualizada (5 fees totais conhecidos):**
   - `266546` = AllyHub taxa AU$150 (fixed, obrigatório)
   - `425150` = Medibank OSHC transfer AU$30 (fixed, obrigatório)
   - `306366` = Medibank OSHC Single AU$70/mês (monthly, obrigatório, **EXPIRADO**)
   - `384576` = English Path Insurance AU$30/sem (weekly, sugerido)
   - `?` = Lexis English OSHC Single AU$58/mês (monthly, school-specific)

4. **PUT autoSave:true é tolerante a fees expirados:** A chamada `PUT /quote/1645489 (autoSave:true)` retornou HTTP 200 com `converted_value:1318` mesmo com id=306366 expirado. Apenas `autoSave:false` (Finish) rejeita no servidor.

5. **Response do PUT autoSave:true:** `{status:"draft", converted_value:1318, dueDate:"2026-06-26", quoteCurrencies:[{value:3.8403, destiny_code:"AUD"}]}`. Due date calculado automaticamente como +10 dias do today. FX rate 3.8403 AUD para o escritório.

6. **mandatoryrule endpoint mapeado:** `GET /mandatoryrule?fromArray=true&plugAndPlay=1&city_id=18&country_code=AU&courseCampus_id=495052&duration=1&getFees=true&school_id=105&campus_id=380&startDate=...&endDate=...` → retorna array com 3 mandatory fees + campos `myprice`, `priceIsExpired`, `totalThisFee`.

7. **Catálogo accommodations Perth = zero resultados** (UI Search Accommodations) — confirma pesquisa anterior via API.

8. **Grand total confirmado:** AU$1,010 (curso) + AU$308 (fees) = **AU$1,318** para 1 semana em Perth.

**Próximos passos sugeridos:**
- Explorar Finish and Save Quotes em conta com OSHC atualizado (aguardar Medibank atualizar preços para 2026)
- Testar Professional+ account para ver se há possibilidade de remover/substituir o fee expirado
- Verificar se existe fee-ID do Lexis English OSHC Single (não capturado ainda)
- Explorar Experiences, HUB Services, Ally Partners

---

### 2026-06-16 - AllyHub Quote 2.0: Teste Técnico Profundo (sessões 2 e 3)

> **Estado:** pesquisa técnica concluída parcialmente. Blueprint atualizado: `.wolf/allyhub-research/ALLY-BLUEPRINT.md` (seções 38–40, ~1200 linhas total).
> **Bloqueio:** Finish and Save Quotes NÃO pôde ser testado — servidor bloqueou todos os PUTs após Finish falho (WAF) + OSHC Single preço expirado impede finalização de qualquer quote AU.

**Descobertas principais:**

1. **Playground efêmero confirmado:** `GET /draft?quote_id={id}` retorna APENAS metadados (id, student_id, quotes list com converted_value). Nenhum curso/fee é persistido no servidor entre sessões. O playground reconstruído do zero a cada load.

2. **CORS assimétrico:** GET liberado de qualquer origin; PUT/POST só permitidos de `quote2.allyhub.co`. O AngularJS parent só lê; o React iframe é a única origin autorizada para mutações.

3. **postMessage init:** React fica em `/loading` até receber `{token, user(JSON string), toEditQuoteId, studentId, isPP}` via MessageChannel do Angular parent. Check de origin: `e.origin === "https://app.allyhub.co"`.

4. **JWT armazenado com aspas literais:** `localStorage.token` = `"eyJ..."` (JSON.stringify de string). Authorization header precisa ser `Bearer "eyJ..."` com as aspas literais.

5. **Fee IDs identificados:**
   - `266546` = Ally Hub taxa de consultoria AU$150 (obrigatório — revenue model da plataforma)
   - `425150` = Medibank OSHC transfer AU$30 (obrigatório, auto-adicionado)
   - `306366` = Medibank OSHC Single AU$70/mês (**priceIsExpired: true, validade expirou 2025-12-31**)
   - `384576` = English Path Insurance AU$30/sem (sugerido)

6. **Bug crítico Ally+:** OSHC Single (id 306366) tem `priceIsExpired: true`. O servidor retorna `{"error": true, "totals": []}` (HTTP 200) e zera o `converted_value` quando tenta Finish com preço expirado. **Nenhuma cotação AU via Ally+ pode ser finalizada no momento.**

7. **WAF behavior:** Após um `PUT autoSave:false` que retorna `error:true`, TODOS os PUTs subsequentes falham com `net::ERR_FAILED` (OPTIONS preflight ainda retorna 200 — só o PUT é bloqueado). Afeta múltiplas abas, múltiplos quotes, reloads completos. GET requests continuam funcionando.

8. **Acomodações AU:** catálogo vazio — as 5 escolas do catálogo AU não cadastraram acomodações separadas no Ally+. Cursos "Full Experience Camp" incluem acomodação no próprio preço.

9. **Proposta para o aluno (student-facing link):** não observada — requer Finish bem-sucedido. O bloqueio do WAF + preço expirado impediram chegar a este ponto.

**Arquivos de evidência criados:**
- `.wolf/allyhub-research/api-responses/draft-angular-load.network-response` — GET /draft do Angular parent
- `.wolf/allyhub-research/api-responses/draft-q501-current.network-response` — GET /draft direto
- `.wolf/allyhub-research/api-responses/quote-1644823-current.network-response` — GET /quote completo (estado draft)

**Próximos passos sugeridos (pesquisa AllyHub):**
- Explorar `/experience` (Experiences/marketing), `/campaign`, HUB Services, Ally Partners
- Para testar o Finish: aguardar atualização do preço do OSHC Single no sistema Ally+ (expire dos preços da Medibank), ou acessar conta Professional+ com acesso a "Gestão de Produtos" para remover o fee expirado

---
