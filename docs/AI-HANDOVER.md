# AI Handover - Movy Study Plan

Este documento e o ponto de passagem entre Codex, Claude e qualquer outro agente que trabalhar neste projeto. Antes de mexer no codigo, leia este arquivo inteiro e atualize o log ao final de cada sessao relevante.

## Regras de Ouro

- **WHITE-LABEL FIRST (regra-mãe, vale acima de todas).** TODA decisão técnica — schema, RLS, API, UI,
  naming, libs, config, integrações — deve assumir que a Movy vai virar **white-label / multi-agência
  (SaaS)** no futuro. Critério de desempate entre duas opções: escolher SEMPRE a que torna o white-label
  uma **mudança de configuração, não uma reescrita**. Nada pode assumir "existe só uma agência" nem
  hardcodar a marca/dados da Movy. Consequências já travadas (não são opcionais): `org_id` + RLS por org
  em toda entidade de negócio; unicidade **por org**, nunca global; branding/config por org; naming
  woofed-shaped; sem segredo/marca hardcoded. Ver `docs/PRODUCT-ROADMAP.md` §2 (P0/P1/P10).
- **WOOFED-SHAPED FIRST (regra-mãe nº2, consequência do white-label/Caminho B).** Como Movy e woofed
  **serão unificados**, toda entidade/campo com equivalente no woofed deve **nascer no padrão do woofed**
  para não quebrar na fusão: naming woofed-shaped; campo de negócio que NÃO é coluna nativa do woofed vai
  em **`custom_attributes` (jsonb)**, nunca coluna dedicada; `metadata`/`additional_attributes` só p/
  integração/sistema; dinheiro `*_in_cents`; unicidade **por org**. Desempate: a opção que sincroniza 1:1
  com o woofed sem remapear vence. **Antes de criar coluna nova**, conferir `db/schema.rb` do woofed
  (`C:/dev/woofed-crm`). Ver `.wolf/cerebrum.md` (User Preferences) e convergência R3/R4.
- O projeto agora e Movy Education. Nao reintroduzir nomes, rotas, textos ou processos da Fyme como marca ativa.
- Conteudo antigo so pode ficar quando for conhecimento/processo realmente reutilizavel e ja neutralizado para Movy.
- Nao adicionar pessoas reais em seed, UI, testes ou exemplos. Evitar nomes como Julia, Marcos, Mariana, Matheus, Beatriz/Beatrice.
- Links oficiais herdados da Fyme devem virar placeholder: `link a adicionar`.
- A navegacao principal deve permanecer enxuta: Home, Knowledge/Departamentos, Study Plan/Propostas, Calculadora Financeira, Settings.
- `dashboard` virou compatibilidade e deve redirecionar para `home`.
- Nao reabrir Campanhas, Equipe/Contatos, Feedbacks, busca global antiga ou idiomas disponiveis sem pedido explicito.
- Se mexer em quote, dinheiro, datas, auth ou RLS, rodar testes e build antes de entregar.

## Checklist de Inicio para Agentes

1. Ler `CLAUDE.md`, `.wolf/OPENWOLF.md`, `.wolf/cerebrum.md` e este arquivo.
2. Conferir `git status --short`; preservar mudancas do usuario e ignorar `.wolf/*` quando forem logs locais.
3. Conferir ultimos commits com `git log --oneline -8`.
4. Para frontend, verificar rotas e componentes antes de editar.
5. Para Supabase, revisar migrations em `supabase/migrations` e evitar mudancas diretas sem registrar migration.
6. Ao finalizar, atualizar a secao "Log de Handover".

## Estado Atual

- Repo: `https://github.com/Matheusbaiense/movy-study-plan.git`
- Producao: `https://movy-study-plan.vercel.app`
- Supabase project id: `xpthmguzcbmndyyexfbt`
- App: Next.js 14, React 18, Supabase SSR, next-intl.
- Node esperado: `24.x`; npm esperado: `11.x`.
- O workspace principal pode nao ter `node_modules`. Se precisar validar sem instalar ali, usar clone temporario com dependencias.

## Rotas Principais

- `/pt/login`: login publico.
- `/pt/home`: Home do portal interno.
- `/pt/dashboard`: redirect para `/pt/home`.
- `/pt/wiki`: Knowledge/Departamentos.
- `/pt/departments`: departamentos do conhecimento.
- `/pt/study-plans`: simulador/criador de study plan/propostas.
- `/pt/financial`: calculadora de capacidade financeira para visto de estudante.
- `/pt/settings`: configuracoes.
- `/pt/settings/users`: gerenciador de usuarios/allowlist.
- `/pt/settings/audit-log`: log/auditoria.

## Auth e Supabase

- O login Google ja foi configurado para redirecionar para o dominio novo da Movy, mas sempre testar depois de mudancas em Supabase Auth.
- Commit mais recente antes deste handover: `f3180c6 feat: email/password login + functional user & allowlist manager`.
- Esse commit adicionou login por email/senha e um gerenciador funcional de usuarios/allowlist.
- Importante: esse commit ainda precisa de QA logado completo e confirmacao de deploy se o proximo agente for continuar a partir dele.
- Vercel MCP/list deployments retornou 403 por escopo de autenticacao, mas o deploy via CLI funcionou em sessao anterior.

## Knowledge e Conteudo Legado

O portal foi limpo para manter apenas conhecimento operacional reutilizavel e o fluxo de propostas/study plans.

Removido ou desativado:

- Campanhas.
- Equipe e contatos.
- Feedbacks.
- Busca global antiga.
- Idiomas disponiveis.
- Importer antigo de SOP.
- Seeds antigas ricas e categorias wiki antigas.
- Imagem importada orfa.
- Referencias explicitas a credenciais/dados bancarios herdados.

Conteudo remanescente deve estar em `data/knowledge-sop-content.json` e migrations correspondentes, com marca Movy e sem nomes proprios desnecessarios.

Migration aplicada no Supabase:

- `supabase/migrations/007_sanitize_movy_knowledge_content_v2.sql`

Validacao feita apos aplicar:

- `login_mentions: 0`
- `movy_bank_mentions: 0`
- `payment_account_mentions: 0`
- `legacy_class_mentions: 0`
- `knowledge_class_mentions: 45`

## Quote / Study Plan

O foco do produto e:

- Simulador e criador de propostas/study plans.
- Cotacao para ELICOS, VET e Higher Education.
- ELICOS vende por semanas e pode ter material.
- VET pode ou nao ter material.
- Higher Education nao deve ter material por padrao.
- Todos tem taxa de matricula.
- Timeline precisa ficar mais clara, responsiva e flexivel.
- O padrao 12 semanas + 4 semanas de ferias pode existir como default, mas o usuario precisa liberdade para alterar a quantidade de semanas entre ferias; calendario e parcelas devem acompanhar.

Testes existentes cobrem regras financeiras e study plan em:

- `tests/study-financial.test.mjs`

## Calculadora Financeira

Feature criada a partir da planilha `Financial Support Calculator (for student visa).xlsx`.

Formula validada contra exemplo da planilha:

- custo de vida = `(24505/12 + 7362/12*(adultos-1) + 3152/12*dependentes_5_18 + 3152/12*dependentes_menor_5) * min(meses,12)`
- escola dependentes = `13502 * dependentes_5_18`
- total AUD = custo de vida + passagem + curso remanescente + escola dependentes
- total BRL = total AUD * cotacao

Valores de Home Affairs mudam com o tempo. Se o usuario pedir precisao atualizada, pesquisar fontes oficiais antes de alterar constantes.

## QA Conhecido

QA anterior passou em clone temporario:

- `node -e "JSON.parse(require('fs').readFileSync('data/knowledge-sop-content.json','utf8')); console.log('knowledge json ok')"`
- `node --test tests\study-financial.test.mjs`
- `npm run build`
- `npm run type-check`

Clone temporario usado antes:

- `C:\Users\baien\AppData\Local\Codex\movy-study-plan-verify-quote`

Smoke anterior em producao:

- `/pt/login` retornou 200.
- `/pt/home`, `/pt/dashboard`, `/pt/study-plans`, `/pt/financial`, `/pt/wiki`, `/pt/settings` redirecionaram usuario deslogado para `/pt/login`.
- `/pt/dashboard` existe para compatibilidade e deve redirecionar para `/pt/home` quando autenticado.

QA pendente de maior prioridade:

- Testar login email/senha.
- Testar login Google depois das mudancas do Supabase.
- Testar todos os botoes logado.
- Testar Settings > Users e allowlist.
- Testar timeline de quote em desktop e mobile.
- Testar calculadora financeira com casos da planilha.

## Deploy

Ultimo deploy confirmado por CLI:

- `vercel deploy --prod --yes`
- Alias informado: `https://movy-study-plan.vercel.app`

Se o MCP da Vercel falhar com 403, usar Vercel CLI autenticado localmente.

## Riscos e Cuidados

- `.wolf/anatomy.md`, `.wolf/cron-state.json` e `.wolf/daemon.log` podem ficar modificados localmente por OpenWolf. Nao commitar sem necessidade.
- Se encontrar credenciais ou senhas antigas em conteudo herdado, remover e avisar para rotacionar se foram reais.
- Nao assumir que valores financeiros oficiais continuam iguais; buscar fonte oficial quando a tarefa pedir atualizacao legal/financeira.
- Evitar refatoracao ampla sem teste, porque ha regras de negocio sensiveis em datas, parcelas e valores.

## Proximas Prioridades

1. Fazer QA logado completo do commit `f3180c6`.
2. Polir UX da timeline do quote.
3. Separar campos por tipo: ELICOS, VET, Higher Education.
4. Revalidar botoes do portal: Home, Knowledge, Study Plans, Financial, Settings.
5. Revisar se ainda existe texto legado ou nomes proprios em UI, seeds, migrations e testes.
6. Depois de estabilizar, atualizar documentacao de uso para equipe Movy.

## Próximo agente — COMECE AQUI

Frontend redesenhado e alinhado ao **Movy Brand Guide 2026** (logo "vela", Outfit/Manrope/
Space Mono, kicker laranja/dourado). Design = `docs/FRONTEND-REFACTOR.md` + o guide em
`C:\Users\baien\Downloads\movy-guideline`. Tudo mergeado na `main` / em produção.
**Regras:** NUNCA reintroduzir a marca de 3 barras (use `components/brand/MovyMark.tsx` ou
`<use href="#movySymColor|Mono">`); nada de Bricolage (fonte = Outfit display + Manrope corpo
+ Space Mono labels); não hardcodar hex — use `lib/ui/theme.ts` + `.movy-card`/`.movy-kicker`.

### Feature A — Cotação de câmbio ao vivo AUD→BRL  ✅ FEITO (2026-06-12)

Implementado: route handler `app/api/fx/route.ts`. Prioridade: (1) **Wise QUOTE** fee-inclusive
(`POST /v3/profiles/{id}/quotes` AUD→BRL → deriva o % de taxa Wise e aplica → BRL/AUD com taxa;
exige WISE_API_TOKEN **completo** — read-only dá 401 em quote); (2) Wise mid-market `/v1/rates`
(token read-only); (3) open.er-api; (4) frankfurter. Cache 1h em memória. Retorna
`{ rate, asOf, source, mid?, feePct? }`. A calculadora preenche o `exchangeRate`, mostra a fonte
+ data/hora, e o documento traz "mid X + Y% Wise". `WISE_PROFILE_ID` opcional (senão busca o
business). **VALIDADO em produção (2026-06-12):** `/api/fx` → `source: "Wise (com taxas)"`, mid
3.5761 + 0.92% fee = 3.609 BRL/AUD. O `/api/fx` foi tornado **público** no `middleware.ts` (antes o
i18n+auth quebrava o fetch; `/api/*` não era excluído da matcher do next-intl — conferir `/api/imported`).
PENDENTE do usuário: revogar o token read-only `6f40…`. a calculadora `FinancialCalculator.tsx`
faz prefill do `exchangeRate` no mount, mostra "Cotação de DD/MM HH:MM (Perth)" + botão
"atualizar", e o documento impresso traz "Câmbio AUD→BRL: X · cotado em DD/MM HH:MM · fonte …"
(o respaldo). Continua editável (override manual). Granularidade diária (tier grátis).
Histórico abaixo apenas como referência do que foi pedido:

Passos:
1. **Fonte de câmbio**: o Google não tem API oficial de câmbio gratuita. Usar uma pública
   estável e sem chave: `https://open.er-api.com/v6/latest/AUD` (tem `rates.BRL` +
   `time_last_update_utc`), ou `https://api.frankfurter.app/latest?from=AUD&to=BRL` (ECB), ou
   `exchangerate.host`. Escolher uma + definir fallback (última conhecida / valor manual).
2. **Route handler** `app/api/fx/route.ts` (server) — busca AUD→BRL com cache/`revalidate`
   (ex.: 1h) pra não estourar rate limit; retorna `{ rate, asOf }` (ISO). Em erro, retorna o
   último valor conhecido ou `null`.
3. **Calculadora**: no mount, `fetch('/api/fx')` e prefill `exchangeRate`; mostrar label
   "Cotação AUD→BRL de DD/MM às HH:MM (Perth)" com botão "atualizar". Manter editável (override).
4. **Proposta/PDF e calculadora**: exibir o câmbio usado + timestamp ("Câmbio AUD→BRL: X,XX ·
   cotado em DD/MM HH:MM") — esse é o respaldo visual contra "câmbio congelado".
5. **Travar por proposta (recomendado)**: adicionar `fxRate?: number` e `fxAsOf?: string` em
   `StudyPlanData`; ao gerar, gravar a cotação/horário daquele momento para o PDF manter o
   valor da época, **mostrando a data/hora** (cotação daquele dia, não congelada à toa).
6. Timezone: usar `Australia/Perth` na exibição (o app já usa esse TZ).

### Feature B — Gestor de Presets das escolas  ✅ FEITO (2026-06-12)

Implementado: migration `008_course_presets.sql` **aplicada** (tabela + RLS + seed com 12
presets). `lib/study-plans/presets.ts` (tipo `DbPreset` + `dbPresetToOption`). Server actions
`settings/presets/actions.ts` (create/update/delete, admin + service role + audit). UI
`settings/presets/page.tsx` + `PresetsManager.tsx` (edição inline de preço/campos por tipo,
add/remove) + aba "Presets" em `settings/layout.tsx`. O editor (`study-plans/[id]/page.tsx` →
`StudyPlanEditor` prop `presets`) lê os presets do banco no dropdown "Aplicar preset" (fallback
para `COURSE_PRESETS`). Também corrigido no banco vivo o teal `#057570`→`#3A1560` do
`departments.links-recursos`. Plano original abaixo, apenas como referência:

Admin edita preços/escolas em Configurações sem mexer em código. Hoje os presets são a const
`COURSE_PRESETS` em `lib/study-plans/defaults.ts`. Passos (nesta ordem):

1. **Aplicar** `supabase/migrations/008_course_presets.sql` (já escrita, NÃO aplicada) via
   Supabase MCP `apply_migration` ou SQL editor. Cria `course_presets` (RLS: active users
   leem, admin gere) e popula com os presets atuais.
2. **Tipos**: `generate_typescript_types` do Supabase → `types/supabase.ts` (ou cast como em
   `allowed_emails`).
3. **Server actions** `settings/presets/actions.ts` — espelhar `settings/users/actions.ts`
   (requireAdmin + service client + audit): create/update/delete preset, validando números/tipo.
4. **UI** `settings/presets/page.tsx` + `PresetsManager.tsx` (client) — listar por tipo
   (ELICOS/VET/HE), editar preço/matrícula/material/parcelas, adicionar/remover. Reusar
   `.movy-card` + kicker laranja + tokens. Add aba "Presets" em `settings/layout.tsx`.
5. **Ligar o editor**: em `study-plans/[id]/page.tsx` (server) buscar `course_presets` ativos
   (por sort_order) e passar prop `presets` a `StudyPlanEditor`; o dropdown "Aplicar preset…"
   e `applyPreset` passam a usar a prop em vez de `COURSE_PRESETS` (manter a const como fallback).

Estado desta sessao: bugs documentados de marca/label corrigidos na branch
`fix/documented-brand-bugs` (Bricolage residual removido de Wiki/Departamentos, teal FYME
`#057570` trocado por roxo Movy nos seeds/migrations de knowledge, label `Manha` exibida como
`Manha` acentuado na UI sem mudar o valor persistido). Validado em clone temporario fora do Drive:
`npm run type-check`, `node --test tests/study-financial.test.mjs`, `npm run build`.
Proximo passo: confirmar a fonte externa de cambio e implementar Feature A.

## 🧭 DIREÇÃO DO PRODUTO 2026-06-15 — Movy vira app de agência (LEIA PRIMEIRO)

O produto deixou de ser "hub interno" e passa a ser um **gerador de propostas para agências
de intercâmbio** (futuramente white-label / SaaS). **Plano mestre e roadmap por splits:**
`docs/PRODUCT-ROADMAP.md` — leia ANTES de planejar/codar Portfólio, Propostas ou Cálculo.

- **3 pilares (prioridade):** (1) montagem ultrarrápida de propostas, (2) gestão de portfólio
  com IA, (3) cálculos automáticos e explicáveis. **CRM e integrações externas estão FORA de escopo.**
- **Tenancy-ready:** adicionar `org_id`/`organizations` (org "Movy" semeada) no schema/RLS já
  na fundação, para virar multi-agência depois sem reescrever RLS. Nada pode assumir 1 só agência.
- **Trabalho por SPLITS** (unidades por área de código, não por feature) — ver roadmap §5/§7.
  Ordem: 0→1→2→3→4→6→5→7→8→9. Um split por vez, completo, type-check/teste verdes, commit próprio.
- **Cálculo:** `lib/study-plans/calculations.ts` é fonte única (cliente p/ preview + servidor p/
  validar) e a proposta guarda snapshot do cálculo + câmbio (não recalcula vivo).
- **Portfólio normalizado** (institutions→campuses→courses→price_versions+promotions) **aposenta**
  `course_presets`. **Import por IA nunca salva direto** (OCR→LLM→validação→revisão humana).
- **CRM-ready / woofed-crm:** o CRM futuro será o **woofed-crm** (Rails+Postgres; clone de estudo
  em `C:/dev/woofed-crm`). A arquitetura é escrita woofed-shaped para fundir-se num produto só:
  `organizations`≈`accounts`, `contacts`/`deals`/`pipelines`/`stages`/`products`/`deal_products`/
  `events`. **Dinheiro em centavos inteiros + currency_code** (P9, igual woofed `*_in_cents`).
  Estratégia de integração (A mono-DB / B absorver no Supabase / C serviço+MCP) está em aberto —
  ver roadmap §10.1 (recomendação: B-compatível agora, C viável depois, evitar A).

## ⚠️ ATUALIZAÇÃO 2026-06-14 — Sistema de tema claro/escuro (LEIA antes do "COMECE AQUI")

O frontend ganhou um **sistema completo de tema claro + escuro**. Isso muda regras do "COMECE AQUI" abaixo:

- **Tema:** `[data-theme='light'|'dark']` no `<html>`, aplicado pré-paint por script inline em `app/layout.tsx`
  (lê `localStorage['movy-theme']`, fallback para preferência do SO). Toggle: `components/ui/ThemeToggle.tsx`.
  Acento da marca vira: **roxo no claro, dourado no escuro**.
- **Tokens, não hex:** ler `lib/ui/theme.ts` (`t.text`, `t.surface`, `t.border`, helper `ink(a)`, `purpleA(a)`),
  que mapeiam para CSS vars em `app/globals.css`. **NUNCA** usar `color.purpleDeep`/hex como TEXTO (some no escuro).
- **Fontes mudaram:** agora **Clash Display (display) + Satoshi (corpo/UI/mono)** via Fontshare, Outfit como fallback.
  Isso **substitui** a regra antiga de Outfit/Manrope/Space Mono — o usuário autorizou mudar tudo exceto cor + logo.
  (`font.mono` deixou de ser monoespaçado.) A regra de fonte do "COMECE AQUI" está obsoleta; mantida só como histórico.
- **Documentos impressos (PDF):** o documento da calculadora financeira e a proposta de study plan ficam **brancos
  nos dois temas** de propósito (representam papel). Tematizar só o formulário ao redor.
- **Constraint que continua valendo:** cor de marca + logo "vela" (`components/brand/MovyMark.tsx`).

## Log de Handover

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

### 2026-06-15 - SPLIT 4 · fatia B: comparador de opções (B1 editor + B2 proposta)

> **Estado:** entregue (B1 `79f6367` + B2 `ae582aa`). type-check ✅ · `node --test` 47/47 ✅ · build ✅.
> Sem migration. Spec: `docs/superpowers/specs/2026-06-15-split4-options-comparator-design.md`.
> Referência de UX: `docs/competitor-allyhub-blueprint.md` (AllyHub QuotePlayground/TabSystem).

Múltiplas opções comparáveis na proposta (modelo AllyHub), até 5, editáveis **independentemente**.
`plan.courses` = Opção 1 (principal); 2..5 em `plan.options[]` (jsonb, sem migration).

- **B1 (editor):** refactor DRY — extraídos `editor-ui.tsx` (Section/Field/NumberInput/MiniStat +
  tokens), `CourseListEditor.tsx` (cards de curso) e `ExtraCostsEditor.tsx` de `StudyPlanEditor`; o
  mix primário passou a reusá-los (prova de não-regressão). `OptionsManager.tsx` no passo **Revisão**:
  abas Opção 1 + 2..5, menu renomear/duplicar/remover/recomendada, faixa de comparação lado a lado.
  Helpers puros `lib/study-plans/options.ts` + `tests/options.test.mjs` (6 casos).
- **B2 (proposta/PDF):** `StudyPlanProposal` renderiza `OptionsComparison` (opções lado a lado,
  recomendada destacada) após o resumo quando há `data.options`. Sem opções = render single-mix igual.

**Fora de escopo (backlog no blueprint):** acomodação/seguro/add-on por opção; câmbio/IOF; landing
page rica (mídia/like/WhatsApp); comissão; payment plan por opção.
**⚠️ Validação visual da rota protegida pendente** (não consigo abrir o app autenticado): testar no
editor → passo Revisão → "Opções da proposta" (criar/duplicar/renomear/recomendar, comparação) e a
proposta/PDF com 2+ opções.

### 2026-06-15 - SPLIT 4 · fatia A: ScenarioPanel (comparador "e se?" por semanas)

> **Estado:** entregue. type-check ✅ · `node --test` 41/41 ✅ · build ✅. Commit direto em `main`.
> Spec: `docs/superpowers/specs/2026-06-15-split4-scenario-panel-design.md`.

Novo `components/study-plans/ScenarioPanel.tsx` (`'use client'`) — comparador **só-leitura e
transitório** que redimensiona as semanas de estudo do 1º curso em 3 variantes e totaliza cada uma
via `computeScenarios` + `withFirstCourseStudyWeeks` (já no engine, puros). Mostra Total / Fechamento /
Saldo a parcelar por coluna; a coluna que bate com o baseline ganha selo "Atual"; botão "Redefinir".

**Decisões (regras-mãe):** (1) ELICOS **não tem duração padrão** (dono: "pode ser 4, 7, 20 semanas"),
então as colunas são **semanas configuráveis**, nunca 6/8/12 meses fixos. (2) **Nada é persistido** →
nenhuma entidade nova para remapear no woofed = a opção mais migration-safe (white-label/woofed-shaped
first). "Aplicar cenário" ficou de fora (mutar semanas de ELICOS com módulos é delicado) — follow-up.

Integração cirúrgica no hot file `StudyPlanEditor.tsx`: 1 import + 1 `<Section title="Cenários de
duração">` no passo **Revisão** (sem mexer em wizard nav). Testes **APPEND** em
`tests/study-financial.test.mjs` (não-mutação, resize só do 1º curso/1º segmento, plano sem study
segment inalterado, ordem/labels/cents inteiros).

**Próximo:** fatia B (comparador `data.options[]`) ou C (migration 012: templates + versões).

### 2026-06-15 - SPLIT 4 (editor) REFEITO: picker + override + sticky/autosave + wizard — **COMECE AQUI**

> **Estado:** Splits prontos: **UI ✅ · 0 ✅ · 1 ✅ · 2 ✅ · 3 ✅ · 6A ✅**. SPLIT 4 editor entregue
> (picker · auto-price · override · sticky/autosave · wizard 5 etapas). Migration 012 + comparador/cenários
> ainda pendente. type-check ✅ · `node --test` 37/37 ✅ · build ✅.
> Plano: `docs/superpowers/plans/2026-06-15-split4-course-picker.md`.

**Contexto do refazimento:** a primeira passada (feita no Cursor com um modelo fraco) entrou em `main`
com bugs visuais. A pedido do dono, o histórico foi resetado para `aa39841` (Task C) com `git reset --hard`
+ `push --force`, e o editor foi reconstruído nesta sessão (Claude/Opus). Os bugs foram corrigidos:

- **Barra de totais:** `position: sticky; bottom:0` dentro do `<main>` — antes era `position: fixed`, que
  atravessava por baixo da sidebar no desktop. Agora respeita a largura da coluna de conteúdo.
- **Wizard:** as 5 etapas ficam **montadas** (alternadas por `display`), então o `CoursePortfolioPicker`
  preserva busca + seletor de preço ao trocar de etapa (antes desmontava e perdia o estado local).
- **Autosave:** inicia em `'saved'` com `lastSavedAt` no mount (sem "Alterações não salvas" ao abrir limpo)
  e tem guarda `isPending` (sem save sobreposto). Debounce 2,5s via `updateStudyPlan`.
- **`CoursePortfolioPicker`:** estilos alinhados aos tokens de input do editor.

**Editor:** o `<select>` "Aplicar preset…" foi substituído por `CoursePortfolioPicker` em cada card de
curso. Busca typeahead → `resolveCourseAction` preenche identidade + preço pela nacionalidade do lead +
`studentLocation`; seletor "Preço aplicado" (Normal/Mercado/País) via `listCoursePricesAction`. Mesmo tipo
= overlay (preserva cronograma/módulos); tipo diferente = curso resolvido inteiro. `priceVersionId` gravado.
**Wizard 5 etapas:** Cliente → Preferências → Cursos → Custos → Revisão (resumo + alerta visto × datas +
timeline), `EditorWizardNav` com progresso/pills/Anterior-Próximo. Sidebar + sticky bar visíveis sempre.
**Server actions:** `searchCoursesAction`, `resolveCourseAction`, `listCoursePricesAction`.
**Página:** `[id]/page.tsx` lê `contact_id` → `getContactNationality` → prop `contactNationality`.
**Presets legados:** prop `presets` mantida (não usada na UI). Campos manuais continuam como fallback.
**A verificar visualmente no app rodando** (rota protegida, não dá pra screenshotar daqui): sticky bar,
transições do wizard e o dropdown do picker em telas estreitas.
**DEFERIDO:** migration 012 (templates + histórico de versões), comparador de opções, cenários 6/8/12.

### 2026-06-15 - SPLIT 4 (início): fluxo "criar proposta → escolher/criar lead" + seam de preço por nacionalidade

> **Estado:** Splits prontos: **UI ✅ · 0 ✅ · 1 ✅ · 2 ✅ · 3 ✅ · 6A ✅**. SPLIT 4 **iniciado**
> (passo-0 + seam de preço). **SEM migration** (campos de lead em `custom_attributes`, padrão woofed).
> type-check ✅ · `node --test` 37/37 ✅ · build ✅. Spec/plano em `docs/superpowers/`.

- **Regra nova documentada: WOOFED-SHAPED FIRST** (ver Regras de Ouro no topo). Campos de negócio sem
  coluna nativa no woofed vão em `custom_attributes`, nunca coluna dedicada — sync 1:1 com o CRM futuro.
- **Fluxo de criação de proposta (passo-0):** botão "Criar proposta" abre `NewProposalModal`
  (`app/[locale]/(protected)/study-plans/NewProposalModal.tsx`) → buscar lead existente (typeahead) OU
  criar novo lead inline (nome* · email · telefone · nacionalidade + expander origem/idioma) → cria o
  `study_plan` com `contact_id` e abre o editor. Server actions novas em `study-plans/actions.ts`:
  `searchContactsAction`, `createProposalForContact` (+ `ContactPick`).
- **Lead woofed-shaped:** `lib/crm/contacts.ts` ganhou `CONTACT_ATTR` (nationality/lead_source/
  preferred_language), `getContactNationality`, `buildContactAttributes`, `searchContacts`. Nacionalidade
  mora em `custom_attributes.nationality` (alpha-2). `lib/constants/countries.ts` = lista ISO + `countryName`/`countryOptions`.
- **Seam de preço:** `lib/portfolio` ganhou `priceVersionLabel` (País·X > Mercado·Y > Normal·padrão),
  `toPricedOptions`, `listActivePriceVersions` e **`CourseSource.listPrices`** — tudo pronto pro editor
  oferecer troca de preço (Normal/Mercado/País). Resolução automática por nacionalidade já existia em `resolve`.
- **DEFERIDO pro SPLIT 4 cheio (não reabrir `StudyPlanEditor.tsx` 2×):** refatorar em wizard +
  comparador/cenários/templates/autosave (migration 012). **Course picker + seletor de preço JÁ ENTREGUES**
  (2026-06-15 slice 1). Ver `docs/superpowers/plans/2026-06-15-split4-course-picker.md`.
- **Modelo de preço (decisão):** país e mercado são **camadas que coexistem** (mais específico vence), não
  um modo "ou". Override de país só onde a escola diferencia (Colômbia ≠ Brasil dentro de LATAM). Ver roadmap §3.2/§4.3.

### 2026-06-15 - SPLIT 6A CONCLUÍDO: `lib/portfolio/*` + provider `CourseSource`

> **Estado:** Splits prontos: **UI ✅ · 0 ✅ · 1 ✅ · 2 ✅ · 3 ✅ · 6A ✅ (banco + código)**.
> Migrations 010 + 011 aplicadas em `xpthmguzcbmndyyexfbt`. **Próximo a executar = SPLIT 4 (editor).**
> Ordem: `4 → 6B → 5 → 7 → 8 → 9 (+10)`.

- **Fechado o último sub-passo do 6A (SÓ código TS, sem migration).** Novo módulo **`lib/portfolio/`**:
  - **`types.ts`** — aliases das 6 tabelas + **mappers PUROS** (testáveis sem DB): `priceVersionToSnapshot`
    (cents→float na borda via `centsToNumber`), `buildStudyCourse` (snapshot→`StudyCourse` legado, parte de
    `createCourse`), `rowToPricingRule`/`isRuleActiveOn`/`draftToInsert`/`draftToUpdate` (DB jsonb ↔ engine
    `PricingRule`), `asCourseType`. Define o contrato **`CourseSource`** + `PortfolioCourseRef` + `PriceSnapshot`.
  - **`queries.ts`** — leituras org-scoped (espelha `lib/crm/contacts.ts`): `listInstitutions/listCampuses/
    listCourses/getCourseWithRefs` (+ embed `institutions(name)`/`campuses(name)`) e **`currentCoursePrice`**
    via `supabase.rpc('current_course_price', { p_course, p_nationality })` (resolve país>mercado>padrão sob RLS).
  - **`pricing-rules.ts`** — CRUD de `pricing_rules` + **`getActiveRules(onDate)`** (filtra is_active/janela,
    mapeia p/ `PricingRule[]` — alimenta `applyRulesToPlan`). **`markets.ts`** — CRUD de `markets`.
  - **`course-source.ts`** — **`createPortfolioCourseSource(supabase): CourseSource`**: `search(q)` lista cursos
    do catálogo; `resolve(courseId, { nationality, onDate, location })` → `PortfolioCourseRef` (snapshot float
    travado **+** `course` editor-ready com a camada agência aplicada via `applyRulesToPlan` por cima, **+**
    `extras`/`adjustments` explicáveis). **Destrava o SPLIT 4.** `index.ts` = barrel.
- **Convenções respeitadas:** sem `(supabase as any)` (só `as unknown as` nos seams jsonb↔tipo); imports
  runtime relativos `.ts` com extensão explícita (node --test). Money sempre em float só na borda do editor.
- **QA:** `tests/portfolio.test.mjs` (9 testes dos mappers puros: cents→float, snapshot→course elicos/vet,
  rowToPricingRule, isRuleActiveOn janela, draftToInsert/Update). **type-check ✅ · `node --test` 26/26 ✅ ·
  build ✅.** Nada no app importa `lib/portfolio` ainda (consumido no SPLIT 4/6B) — zero efeito em runtime.
- **Reconciliado `docs/PRODUCT-ROADMAP.md` §3.2** (cents, `nationality`+`market_id`, `markets`, promoções
  unificadas em `pricing_rules`, RPC `current_course_price`) e marcado **6A ✅** (§5 + headers + §7).
- **Pendência ligada ao SPLIT 4:** a **nacionalidade do aluno** precisa virar campo no `contacts`/proposta
  (hoje passada por contexto a `resolve`/motor). Adicionar quando o editor for religado aos contatos.

### 2026-06-15 - SPLIT 6A: migration 011 APLICADA + país/mercado + tipos regenerados

> **Estado:** `origin/main` = `57b1555`. Splits prontos: **UI ✅ · 0 ✅ · 1 ✅ · 2 ✅ · 3 ✅ · 6A (banco) ✅**.
> Toda a árvore de trabalho está commitada e empurrada. Ordem dos splits: `6A → 4 → 6B → 5 → 7 → 8 → 9 (+10)`.

- **Migration 011 APLICADA** via Supabase MCP no projeto canônico `xpthmguzcbmndyyexfbt`. Portfólio
  normalizado vivo: `institutions/campuses/courses/course_price_versions/markets/pricing_rules` (todas
  P0: org_id + RLS por org + índices; dinheiro em `*_in_cents`). Seed dos 12 presets → **11 instituições,
  11 campus, 12 cursos, 12 vigências**. `markets`/`pricing_rules` **vazias** (no-op). `course_presets` DEPRECATED.
- **Nacionalidade = país + mercado:** `course_price_versions.nationality` + `.market_id`; tabela `markets`
  (por org); função SQL **`current_course_price(course, nationality, on_date)`** resolve país > mercado >
  padrão sob RLS. Motor de regras (`lib/calc/rules.ts`) aceita `nationality` como condição.
- **Tipos regenerados** do banco real (`types/supabase.ts` agora tem as 6 tabelas + a função). Advisors:
  **0 ERROR**. type-check ✅, build ✅.

- **🔜 O QUE FALTA NO 6A (último sub-passo, SÓ código TS, sem migration):**
  1. **`lib/portfolio/*`** — tipos + queries: listar instituições/campus/cursos; ler preço via RPC
     `current_course_price` (`supabase.rpc('current_course_price', { p_course, p_nationality })`); CRUD de
     `pricing_rules` (admin) e `markets`. Converter `*_in_cents` → float na borda (cents↔dollars, `lib/calc/money`).
  2. **Provider do contrato `CourseSource`** (§4 do roadmap): `search(q)` (busca cursos do catálogo) +
     `resolve(courseId, { nationality })` → `PortfolioCourseRef` (snapshot de preço resolvido, em float p/ o
     editor legado), aplicando `applyRulesToPlan` por cima (camada agência). Define-se contra a interface;
     o **SPLIT 4 (editor) consome via o seam** sem reabrir `StudyPlanEditor.tsx`.
  - **Pendência ligada ao SPLIT 4:** a **nacionalidade do aluno** precisa virar campo no `contacts`/proposta
    (hoje passada por contexto ao motor/resolver). Adicionar quando o editor for religado aos contatos.
  - **Reconciliar `docs/PRODUCT-ROADMAP.md` §3.2** (refletir: dinheiro em cents, `nationality`+`market_id`,
    `markets`, promoções unificadas em `pricing_rules`) — o §3.2 ainda descreve o desenho antigo.
- **Depois do 6A:** **SPLIT 4 (editor)** = maior ganho de usabilidade (wizard, autosave, barra fixa,
  totais ao vivo, seleção de curso do portfólio com taxa automática, comparador, cenários, templates).

### 2026-06-15 - SPLIT 6A: migration 011 RASCUNHADA (revisão) + dimensão de NACIONALIDADE no preço

- **Migration 011 escrita (`supabase/migrations/011_portfolio_pricing_rules.sql`) — RASCUNHO, NÃO
  APLICADA.** Aguarda revisão do dono → aplicar via Supabase MCP no projeto `xpthmguzcbmndyyexfbt` +
  regen de tipos. 6 tabelas (`institutions/campuses/courses/course_price_versions/pricing_rules`), todas
  **P0**: org_id default Movy + RLS por org + índices; unicidade por org; `metadata`/`external_id` (R6/R7);
  **dinheiro em `*_in_cents` (P9)**. Espelha 1:1 os padrões da 010.
- **Decisão de desenho:** `promotions` **unificada dentro de `pricing_rules`** (promoção = regra com
  `effect=promo_rate_override` + janela `valid_from/until`) — uma só mecânica, casando com o `applyRules`
  testado. `conditions jsonb` ↔ campo `when` do tipo TS. `pricing_rules` começa **vazia** (no-op), gerida
  por admin.
- **NACIONALIDADE (pedido do dono — escolas têm preços por nacionalidade/mercado):**
  - `course_price_versions.nationality` (nullable; NULL = padrão/todas; 'BR' sobrepõe p/ brasileiros).
  - Função SQL `current_course_price(course, nationality, on_date)` (SECURITY INVOKER → respeita RLS):
    resolução **mais específico vence** (match de nacionalidade > NULL), depois `valid_from` recente.
  - **Motor de regras (`lib/calc/rules.ts`) atualizado:** `RuleCondition.nationality` + `RuleContext.
    nationality` + `applyRulesToPlan(plan, rules, { nationality })` — promo/desconto por nacionalidade.
    +1 teste → **17/17 verdes**, type-check limpo.
  - **Pendência p/ SPLIT 4:** a nacionalidade do aluno precisa morar no `contacts`/proposta (campo novo) —
    hoje é passada por contexto. Reconciliar `docs/PRODUCT-ROADMAP.md` §3.2 (cents/nationality/unificação)
    ao aplicar a migration.
- **Pontos em revisão pelo dono:** unificar promoções em pricing_rules? cidade de campus vazia no seed?
  pricing_rules gerida por admin (vs editor)?

### 2026-06-15 - SPLIT 6A (parte 1/2): motor de regras + cenários (puro, testado)

- **Insight que definiu o escopo:** o `calculations.ts` já codifica as regras ESTRUTURAIS
  (material por tipo, depósito, offshore<25=sem parcela) — não duplicar. `pricing_rules`/`applyRules`
  é **só a camada configurável da agência**: promoções, desconto, fee/markup. A "inclusão automática
  de taxa" vem dos DADOS do portfólio (price_version), não de regra.
- **`lib/calc/rules.ts` (NOVO):** `applyRules*` como **pré-processador puro** — ajusta o curso (promo
  rate / markup / desconto via bolsa) + adiciona extras (agency_fee) ANTES do `computeProposal`, deixando
  o engine do SPLIT 1 **intocado**. **ruleSet vazio = no-op.** Efeitos: `promo_rate_override`,
  `discount_pct`/`discount_fixed`, `agency_fee`, `agency_markup_pct`. Condições: tipo/min-max semanas/
  modo/intake; escopo org/instituição/campus/curso/tipo. **Decisão do dono:** fee da agência fica
  **disponível mas off por padrão** (`isActive:false`); escopo v1 = promo+desconto+agência.
- **`lib/calc/scenarios.ts` (NOVO):** `computeScenarios` (puro, totaliza N variantes via engine) +
  `withFirstCourseStudyWeeks` (helper p/ "24 vs 12 semanas").
- **QA:** +5 testes (no-op, promo condicional, desconto, agency_fee on/off, cenários) → **16/16 verdes**;
  `tsc --noEmit` ✅. Nada importa esses módulos ainda (consumidos no SPLIT 4/6B) — sem efeito no app.
- **Próximo (SPLIT 6A parte 2/2):** migration 011 (portfólio + `pricing_rules` + RLS), seed
  `course_presets→courses`, `lib/portfolio/*` + provider `CourseSource`, regen de tipos (precisa Supabase MCP).

### 2026-06-15 - SPLIT 6 quebrado em 6A (backend) + 6B (UI) — roadmap restruturado (só docs)

- A pedido do dono, quebrei o SPLIT 6 (grande demais) por **backend vs UI**:
  - **6A** (backend, **destrava o SPLIT 4**): migration 011 (portfólio + `pricing_rules` + RLS), seed
    `course_presets→courses` (+ regras ELICOS default), `lib/calc/rules.ts` (`applyRules`, com testes) +
    `scenarios.ts`, `lib/portfolio/*` (queries + provider `CourseSource`), regen de tipos.
  - **6B** (UI de gestão): telas CRUD instituições/campus/cursos/promoções + editor de regras + alertas
    de impacto + nav. Frontend puro sobre o 6A.
- **Nova ordem:** `0✅→1✅→2✅→3✅ → 6A → 4 → 6B → 5 → 7 → 8 → 9 (+10)`. Roadmap atualizado (§5 splits,
  §6 matriz, §7 ordem+diagrama, header, refs cruzadas 4/7/10 → 6A). Decisão em `.wolf/cerebrum.md`.
- **Próximo a EXECUTAR = SPLIT 6A.** Recomendado: análise de requisitos focada (schema do portfólio +
  quais regras seedar) antes da migration, igual ao SPLIT 3.

### 2026-06-15 - SPLIT 3 CONCLUÍDO: lista de propostas (filtros, lote, lixeira, paginação)

- **`study-plans/page.tsx`** reescrito (server): `searchParams` como estado (`q`/`status`/`type`/`sort`/
  `view`/`page`), query `study_plans` filtrada (busca `ilike` **sanitizada** contra injeção em `or()`,
  status/tipo validados, ordenação, paginação `range` + `count:exact`, `deleted_at` null/not-null p/
  ativas×lixeira). Formata view-model `ProposalItem` server-side (total via `data.computed.grandTotalCents`
  → `formatMoney`, fallback `money(planGrandTotal)`; dias p/ expirar de `expires_at`).
- **`study-plans/ProposalsList.tsx`** (NOVO, client, co-localizado): seleção (checkbox + selecionar-todos),
  barra de ações em lote (arquivar/excluir · restaurar na lixeira), menu por linha (editar/proposta/
  duplicar/arquivar/excluir · restaurar/hard-delete-admin), badges de 10 status, indicador de expiração,
  busca debounced→URL, paginação, toasts via `useTransition`+`router.refresh()` (idiom do `UsersManager`).
- **`actions.ts`**: +`bulkStudyPlanAction(ids, op, locale)` (archive/soft_delete/restore) aditivo — getActor
  1×, emite `proposal_events` por id, 1 audit, 1 revalidate; retorna `BulkResult` (não lança) p/ toast.
- **Decisões:** co-localizei o client na rota (não `components/`) p/ importar `./actions` sem caminho com
  `(protected)`. Adiados: export/PDF/email→SPLIT 5; duplicar-em-lote (per-row no v1); i18n completo→SPLIT 9.
- **QA:** `tsc --noEmit` ✅ (in-place). Build verificado no worktree principal antes do push.
- **Próximo:** **SPLIT 6** (portfólio instituição→campus→curso→preços + motor de regras `pricing_rules`).

### 2026-06-15 - Reconciliação de branch + revisão do roadmap vs. propostas GPT/Cursor (só docs)

- **Achado:** via export de chat do Cursor (`cursor_chat_documenta_o_de_mudan_as_do_proje.json`),
  descobri que o Cursor **já concluiu SPLIT 1 e SPLIT 2** (commits `7326e1f`/`80cab52`/`68c6db5`,
  migration 010 aplicada) e que a **`main` já estava nesses commits**. A branch `claude/sleepy-cannon`
  estava **3 commits atrás**, e o handover dela dizia "SPLIT 1 = próximo" — desatualizado. Eu havia
  planejado adições de roadmap achando que 1/2 não estavam feitos.
- **Ação (autorizada pelo dono):** `git merge --ff-only main` (fast-forward p/ `68c6db5`); descartei as
  edições stale e **re-apliquei** as melhorias do roadmap sobre a versão atual, marcando 1/2 como ✅ e
  **re-ancorando** o escopo extra como continuação (sem reabrir o que já foi entregue):
  - Motor de regras → `lib/calc/rules.ts` (extensão do engine) entregue no **SPLIT 6**; cenários →
    `computeScenarios` no SPLIT 4.
  - `proposal_versions` + `proposal_templates` → **migration 012 no SPLIT 4** (010 já aplicada);
    SPLIT 7 (documents) renumerado p/ **migration 013**.
  - Comparador / templates / histórico de versões / **seam `ProposalComposer`** → SPLIT 4;
    **SPLIT 10** (autoria por IA, futuro); alertas de impacto de preço/promo → SPLIT 6.
  - **Reordenação confirmada: 6 antes do 4.** Ordem: 0✅→1✅→2✅→**3→6→4**→5→7→8→9 (+10 futuro).
  - §8 lista os itens GPT conscientemente adiados (wiki/câmbio/seguros/SSO/anexos/audit-UI/dashboard).
- **Fix do SPLIT 1 (NIT de revisão, commit separado):** `parseMoneyToCents` (`lib/calc/money.ts`)
  reescrito locale-aware — corrige milhar pt-BR com ponto (`"1.234.567"` ia virar `1.234` via parseFloat)
  e milhar en-US; lone-comma=decimal pt-BR, lone-dot=decimal p/ 1-2 dígitos / milhar p/ ≥3. Era NIT
  dormente (só usado em testes hoje; borda de dinheiro do SPLIT 4). +9 casos de teste → **11/11 verdes**.
  NIT 1 (`toCents` 2 casas) já estava documentado; NIT 3 (estilo de import) deixado (build verde, mexer
  arriscaria a resolução `.ts` do node test). Registrado em `.wolf/buglog.json` (bug-014).
- **⚠️ Para o próximo agente:** confira `git log --oneline --all` e o estado da `main` ANTES de planejar
  — pode haver branch/agente mais avançado que o handover local. **Próximo split a EXECUTAR = SPLIT 3.**

### 2026-06-15 - SPLIT 2 CONCLUÍDO: domínio da proposta + seam de contatos CRM-ready (migration 010 APLICADA)

> P1 (org_id+RLS) · P7 (soft-delete) · P8 (auditoria) · P10 (CRM-ready, woofed-shape) ·
> R6 (metadata jsonb) · R7 (external_id) · R8 (idempotency_key determinístico).
> Migration 010 **aplicada** no projeto canônico `xpthmguzcbmndyyexfbt` via Supabase MCP; tipos regenerados.

- **Migration `supabase/migrations/010_proposal_domain_contacts.sql` (aplicada em 2 passos no MCP:
  estrutura + backfill de dados):**
  - **`contacts`** (woofed-compatível): `org_id` NOT NULL default Movy + FK, `full_name`, `email`,
    `phone`, `custom_attributes jsonb`, **`metadata jsonb` (R6)**, **`external_id` (R7, nulo)**,
    `created_by/updated_by`, `deleted_at`, timestamps. Unicidade **por org** via índices parciais:
    `(org_id, lower(email))`, `(org_id, phone)`, `(org_id, external_id)` (ignoram vazios/nulos).
    Trigger `set_updated_at`. RLS no padrão 009 (`current_org_id()`/`is_active_user()`/
    `current_user_role()`): leitura ativa na org (deletados só p/ editores+), insert/update editor+,
    delete admin-only.
  - **`study_plans`** ganhou `contact_id` (FK→contacts, ON DELETE SET NULL), `deal_id` (reservado,
    sem FK), `currency_code` (default 'AUD'), `expires_at`, `accepted_at`, `deleted_at`,
    **`metadata jsonb` (R6)**, **`external_id` (R7)** e **`idempotency_key` (R8)** — coluna **GERADA**
    `'study_plan:'||id` (determinística/estável; âncora p/ virar item faturável no v3 sem migração
    destrutiva). Índices: `contact_id`, parcial `(org_id, updated_at) WHERE deleted_at IS NULL`,
    único parcial `(org_id, external_id)`.
  - **Enum `study_plan_status` estendido** (aditivo, idempotente): + `ready_review`,
    `approved_internal`, `viewed`, `negotiating`, `rejected`, `expired` (total 10).
  - **`proposal_events`** (timeline append-only, woofed-shape): `org_id`+FK, `study_plan_id`
    (ON DELETE CASCADE), `contact_id`, `actor_id`, `kind`, `title`, `scheduled_at`, `done_at`,
    `from_me`, `metadata jsonb`. RLS: leitura ativa na org, insert editor+ (sem update/delete = imutável).
  - **Policy `study_plans` SELECT estendida** (não substituída em massa): não-deletados visíveis a
    todos os membros ativos; deletados (lixeira) só a editores+ (que restauram). Hard-delete continua
    admin-only via policy do 009.
  - **Data migration NÃO destrutiva:** bloco `DO` idempotente (só processa `contact_id IS NULL`)
    extrai `data.student/email/phone` → cria/dedup `contacts` (por email, depois telefone) → seta
    `study_plans.contact_id`. **O jsonb permanece como cópia de trabalho** (o editor ainda lê
    `data.student/email/phone`; o religamento ao contato é SPLIT 4). 2 planos existentes migrados,
    0 perda: ambos com `contact_id` apontando p/ contato com o nome correto.
- **Advisors (security) pós-DDL:** sem **ERRORs** novos. Só WARNs **pré-existentes**: 3×
  `authenticated_security_definer_function_executable` (helpers RLS do 009 — intencional) +
  `auth_leaked_password_protection` (config de Auth). RLS habilitada nas 2 tabelas novas.
- **Tipos:** `types/supabase.ts` **regenerado** do banco (não editado à mão) — inclui `contacts`,
  `proposal_events`, novas colunas de `study_plans` e enum estendido.
- **Código (seam de domínio, SEM tocar UI de lista/editor — isso é SPLIT 3/4):**
  - `lib/crm/contacts.ts` (novo): tipos (`Contact`/`ContactInsert`) + queries org-scoped
    (`normalizeEmail/Phone`, `getContactById`, `findContactByEmail/Phone`, `listContacts`,
    `upsertContact` com dedup por id→email→telefone). Lógica fora dos wrappers (regra de organização).
  - `lib/study-plans/types.ts`: `status` agora usa `StudyPlanStatus = Enums<'study_plan_status'>`
    (em lockstep com o banco), `StudyPlanData` ganhou `options?: ProposalOption[]` (multi-opção) e
    `contactRef?: ContactRef`; `StudyPlanRow` ganhou as colunas novas (opcionais).
  - `app/[locale]/(protected)/study-plans/actions.ts`: novas server actions
    **`duplicateStudyPlan`, `changeStudyPlanStatus`, `archiveStudyPlan`, `softDeleteStudyPlan`,
    `restoreStudyPlan`, `hardDeleteStudyPlan`, `upsertContact`** — cada uma emite `proposal_events`
    (helper `emitProposalEvent`, best-effort como a auditoria) + grava `audit_logs`. `getActor` passou
    a trazer `org_id`. `withComputed` (snapshot autoritativo do SPLIT 1) **intacto**; `createStudyPlan`/
    `updateStudyPlan` agora também emitem evento (`created`) e validam status contra o enum vivo.
  - `study-plans/page.tsx`: lista filtra `deleted_at IS NULL` (mantém a lista correta com soft-delete).
- **Eventos emitidos por ação:** `created` (create), `duplicated` (duplicate), `status_change`
  (changeStatus/archive, `metadata.to`), `deleted`/`restored` (soft-delete/restore),
  `contact_linked` (upsertContact com `studyPlanId`). Hard-delete não gera evento (cascateia) — fica
  registrado em `audit_logs` (`study_plan.hard_delete`).
- **DoD:** `npm run type-check` ✅ · `node --test tests/study-financial.test.mjs tests/crm-contacts.test.mjs`
  ✅ (13/13: 10 herdados + 3 novos de contatos/enum) · `npm run build` ✅ (warning pré-existente em
  `FxChart.tsx`) · migration aplicada sem advisor ERRORs novos · tipos regenerados.
- **Próximo (SPLIT 3):** UI de lista/lixeira (usar `softDelete`/`restore`/`hardDelete`/`duplicate`/
  `changeStatus`) e, no SPLIT 4, religar o editor a `contacts` (parar de depender de
  `data.student/email/phone`, então deprecar esses campos do jsonb).

### 2026-06-15 - SPLIT 1 CONCLUÍDO: engine de cálculo (fonte única + snapshot + dinheiro em centavos)

> P2 (snapshot, não recálculo) + P3 + P9 (dinheiro em centavos inteiros + `currency_code`).
> NENHUMA migration de banco neste split — o snapshot vive dentro do jsonb existente.

- **Novo módulo `lib/calc/` (folha, sem imports de domínio):**
  - `money.ts` — primitivos de dinheiro em **centavos inteiros**: `toCents` (coerção de
    legado float na borda, com guarda de drift IEEE-754 e half-away-from-zero), `asCents`,
    `centsToNumber`, `splitCents` (última parcela absorve o resto), `formatMoney`/`formatMoneyValue`
    (`Intl`, a moeda viaja COM o valor), `parseMoneyToCents` (pt-BR + en-US), `money()`,
    tipos `Money`/`CurrencyCode`, `DEFAULT_CURRENCY='AUD'`.
  - `types.ts` — `ComputedTotals` e `ComputedPerCourse` (todos os campos monetários em centavos +
    `currencyCode` + `version`). Fica em `lib/calc` para evitar ciclo com `study-plans/types.ts`.
  - `index.ts` — barrel (`export *` de money/types + `computeProposal`/`COMPUTED_VERSION`).
- **`lib/study-plans/calculations.ts` (fonte única, agora em centavos):** núcleo `*Cents` puro
  (`courseTotalCents`, `courseDepositCents`, `coursePaymentBalanceCents`, `courseUpfrontCents`,
  `planGrandTotalCents`, etc.) + `computeProposal(plan, currencyCode='AUD'): ComputedTotals` +
  `COMPUTED_VERSION = 1`. As funções float existentes (`courseTotal`, `planGrandTotal`, …) viraram
  **delegadores finos** `centsToNumber(...)` — a UI **não foi tocada** (mesma API, mesmos floats).
- **`lib/financial/calculator.ts`:** mantém a matemática float intacta; adiciona a ponte
  `computeFinancialCapacityCents(input, baseCurrencyCode='AUD', exchangedCurrencyCode='BRL'): FinancialResultCents`
  (converte o resultado para centavos na borda) para juntar a capacidade financeira ao snapshot inteiro.
  Pós-review: o resultado carrega moeda **por grupo de valor** (`baseCurrencyCode` nos `*Cents` AUD,
  `exchangedCurrencyCode` nos `*BrlCents`) — nunca formatar BRL com o código AUD.
- **Legado float (dono explícito = engine na borda):** floats já gravados em `study_plans.data`
  **não** recebem migration. O engine lê via `toCents` na borda e só **persiste centavos a partir
  do próximo salvar**. Normalização em massa fica para SPLIT 2/migration 010.
- **Server revalida + grava snapshot** em `app/[locale]/(protected)/study-plans/actions.ts`:
  helper `withComputed(data)` recomputa no servidor e grava sob **`data.computed`** (dentro do jsonb
  existente, **sem coluna nova**, versionado) tanto no create quanto no update. O `computed` enviado
  pelo cliente é ignorado (recompute autoritativo no servidor). Campo `computed?: ComputedTotals`
  adicionado em `StudyPlanData` (tipado, sem `any`).
- **Config:** `tsconfig.json` ganhou `allowImportingTsExtensions: true` (seguro: `noEmit` já era
  true). Necessário porque o runner `node --test` (type-stripping nativo do Node 24) exige extensão
  `.ts` em imports relativos de **valor** — os imports relativos pré-existentes nesses arquivos eram
  todos `import type` (apagados pelo Node). Só `calculator.ts` e `calculations.ts` usam `'../calc/money.ts'`.
- **Testes** (`tests/study-financial.test.mjs`): +6 casos — `toCents`/drift FP, round-trip
  `centsToNumber`/`parseMoneyToCents` (pt-BR/en-US), `splitCents`, `formatMoney`, `computeProposal`
  (snapshot versionado + arredondamento de centavos em extras `0.1+0.2=30`), e a ponte cents
  financeira. Casos offshore/visto/ELICOS existentes seguem verdes (10/10).
- **DoD:** `npm run type-check` ✅ · `node --test tests/study-financial.test.mjs` ✅ (10/10) ·
  `npm run build` ✅ (warning pré-existente em `FxChart.tsx`, não relacionado).
- **API pública estabilizada:** `ComputedTotals`, `ComputedPerCourse`, `computeProposal`,
  `COMPUTED_VERSION`; helpers `toCents`/`asCents`/`centsToNumber`/`splitCents`/`formatMoney`/
  `parseMoneyToCents`/`money`; ponte `computeFinancialCapacityCents`.

### 2026-06-15 - DocuSeal avaliado para o aceite da proposta (integrado ao roadmap + OpenWolf)

- **DocuSeal avaliado** (`docs/FUTURE-DOCUSEAL.md`) como alternativa open-source ao DocuSign para o
  fluxo de proposta/aceite (encosta no SPLIT 5, diferente do Lago que é v3).
- **Recomendação:** **MVP-aceite in-house no SPLIT 5 (v1)** — assinatura eletrônica simples (nome +
  `accepted_at` + IP + user-agent + termos) em `proposal_events`/`audit_logs`, **sem dependência**;
  desenhado como seam `SignatureProvider`. **DocuSeal = opção de serviço externo para v2** (antes da
  v3/Lago), só quando houver documento formal — via **API/webhooks/embedded**, chaveado por
  `org_id`+`study_plan_id` (`external_id`/`metadata`/idempotência §3.7), **NUNCA absorção de schema**.
- **Riscos registrados:** AGPLv3 + Section 7(b); validade jurídica com cautela (BR = MP 2.200-2/ICP-Brasil).
- **Patches aplicados:** `PRODUCT-ROADMAP.md` (SPLIT 5 seam de aceite, §8 cross-link, §3.7 reuso),
  `.wolf/anatomy.md` (registro do doc), `.wolf/cerebrum.md` (decisão). Posicionamento:
  MVP-aceite (v1/SPLIT 5) · DocuSeal (v2) · Lago (v3).

### 2026-06-15 - SPLIT 0 CONCLUÍDO: migration 009 APLICADA no banco canônico + tipos regenerados

> Desbloqueado. O usuário reautorizou o Supabase MCP na org correta ("Movy education",
> `yihffwtnjahnakvsakod`) e a migration **009 foi aplicada no projeto canônico
> `xpthmguzcbmndyyexfbt`**. O "BLOQUEIO" da entrada anterior está resolvido.

- **Aplicado em produção (via Supabase MCP `apply_migration`, projeto `xpthmguzcbmndyyexfbt`):**
  - `organizations_tenancy` — `organizations` criada + org **Movy** semeada (UUID fixo
    `11111111-1111-4111-8111-111111111111`); `current_org_id()` SECURITY DEFINER; RLS por org em
    `profiles/audit_logs/study_plans/course_presets`; `handle_new_user()` carimba `org_id`.
  - **Descoberta:** o banco vivo tem MAIS tabelas que as migrations 001/008 do repo descreviam
    (`departments`, `contents`, `campaigns`, `checklist_progress`, `allowed_domains`). Estendi a 009
    para adicionar a **coluna `org_id` + índice** nelas também (backfill Movy → default → NOT NULL).
    **10 tabelas** agora carregam `org_id`. O **RLS org-scoped dessas tabelas extras foi DEFERIDO**
    aos splits donos (wiki=contents, departments, etc.) — não reescrevi policies não-auditadas.
  - `organizations_rls_and_grants` — corrige advisor ERROR (`organizations` estava SEM RLS):
    habilita RLS + policies (membros leem a própria org; admins atualizam). Tranca `EXECUTE` de
    `current_org_id()` (revoke de `public`/`anon`, grant só a `authenticated`) ao padrão dos outros
    helpers RLS.
  - O arquivo `supabase/migrations/009_organizations_tenancy.sql` no repo contém TUDO acima
    (idempotente) — é a fonte única para reaplicar em ambiente limpo.

- **`types/supabase.ts` REGENERADO** a partir do projeto real (MCP `generate_typescript_types`,
  não mais hand-maintained). Agora inclui as 10 tabelas reais + `organizations` + FKs `*_org_id_fkey`
  + enums (`app_role`, `content_status`, `study_plan_status`) + funções. Cabeçalho marca a origem.
  - Fix de consumo: `components/departments/CategorySection.tsx` — `content_type` agora `string | null`
    (os tipos gerados expuseram que a coluna é nullable de verdade; o componente já tratava null).

- **Advisors de segurança (pós-DDL):** zero ERRORs. Restam só WARNs aceitáveis: os 3 helpers RLS
  (`current_org_id`/`current_user_role`/`is_active_user`) executáveis por `authenticated` (necessário
  p/ RLS funcionar, padrão do projeto) e "leaked password protection" do Auth (config pré-existente,
  decisão do usuário).

- **QA:** `npm run type-check` ✅ e `npm run build` ✅ (26 rotas compilam). Migration aplicada e
  verificada (org=1, `study_plans` com `org_id` null = 0, `current_org_id` existe).

### 2026-06-15 - SPLIT 0 (parcial): tipos/tenancy no código + migration 009 escrita; APLICAÇÃO BLOQUEADA

> Executei a parte segura e local do SPLIT 0 (fundação de dados & tenancy-ready). A escrita da
> migration está pronta e o código já está alinhado aos tipos, mas a **aplicação no banco está
> bloqueada** por um achado importante — leia o bloco "BLOQUEIO" abaixo antes de continuar.

- **Feito (local, verificado — `type-check` e `build` verdes, zero `as any` no repo):**
  - `supabase/migrations/009_organizations_tenancy.sql` — cria `organizations` (espelha woofed
    `accounts`, com `ai_usage {limit,tokens}`, `currency_code`, `settings`, `branding`), semeia a org
    **Movy com UUID fixo** `11111111-1111-4111-8111-111111111111`, adiciona `org_id` em
    `profiles/allowed_emails/audit_logs/study_plans` (+`course_presets` se existir) na ordem segura
    (nullable → backfill → default → NOT NULL), cria `current_org_id()` **SECURITY DEFINER**
    (JWT `app_metadata.org_id` com fallback a `profiles`, anti-recursão), reescreve as policies RLS
    com escopo `org_id = current_org_id()` e atualiza `handle_new_user()` para carimbar `org_id`.
    Idempotente. **Assume migrations 001/008 já aplicadas** (schema rico).
  - `types/supabase.ts` — alinhado às migrations (fonte da verdade). Adicionados: `organizations`,
    `study_plans`, `allowed_emails`, `course_presets`, enum `study_plan_status`, função
    `current_org_id`, e coluna `org_id` em `profiles`/`audit_logs`. (Arquivo é **hand-maintained**, não
    gerado — ver cabeçalho.)
  - **Quitado TODO o `as any` do repo** (era débito por tipos faltando): `study-plans/actions.ts`,
    `study-plans/page.tsx`, `study-plans/[id]/page.tsx`, `.../proposal/page.tsx`,
    `settings/users/{actions,page}.tsx`, `settings/presets/{actions,page}.tsx`, `wiki/actions.ts`.
    Onde havia costura `jsonb → StudyPlanData` ou `Record<string,unknown> → Insert`, usei cast
    estreito `as unknown as X` (honesto e localizado), não `as any`.
  - `lib/api/audit.ts` — `logAuditWithClient` aceita `SupabaseClient<any,any,any>` (remove o `as any`
    dos callsites).
  - `lib/auth/get-user.ts` — agora expõe `orgId` (defensivo: `profile.org_id ?? null`, funciona mesmo
    antes da 009 ser aplicada).

- **🔴 BLOQUEIO (precisa de decisão/ação humana antes de aplicar a 009):**
  - O app aponta para o projeto canônico **`xpthmguzcbmndyyexfbt`** (`.env.local`, header dos tipos,
    código). É o schema "rico" (profiles/audit_logs/roles) que as migrations 001/008 descrevem.
  - **O Supabase MCP desta sessão NÃO tem acesso a `xpthmguzcbmndyyexfbt`** — ele só lista projetos de
    outra conta/org. Portanto **não foi possível aplicar a migration 009 nem regenerar tipos via MCP.**
  - O único projeto ACTIVE acessível pelo MCP é **`movy-education` (`hvtywvtleoaeooffecrc`)**, que tem
    um schema **mínimo e incompatível** (só `study_plans` com `data`+colunas geradas `student`/`school`
    e `allowed_emails` com `email`+`added_at`; **sem** `profiles`/`audit_logs`/`course_presets`/roles).
    Aplicar a 009 nele **falharia**. Trate `movy-education` como experimento separado, não-canônico.
  - **Ação necessária:** aplicar `009_organizations_tenancy.sql` em `xpthmguzcbmndyyexfbt` via o SQL
    editor do dashboard (ou um MCP/login conectado àquela conta), confirmando antes que **001 e 008 já
    foram aplicadas lá**. Depois, idealmente regenerar `types/supabase.ts` a partir do projeto real
    (`npx supabase gen types ... --project-id xpthmguzcbmndyyexfbt`) e conferir contra a versão
    hand-maintained atual. **Não apliquei nada em produção** (sem acesso + é ação destrutiva-sensível).

- **QA:** `npm run type-check` ✅ e `npm run build` ✅ (único warning é o pré-existente de `useMemo` em
  `FxChart.tsx`, sem relação). Nenhuma mudança aplicada em banco.

### 2026-06-15 - Replanejamento dos splits (validado por architecture-critic) + roadmap atualizado
> O planejamento original foi feito antes da decisão woofed; revalidei o plano contra a integração
> woofed/DS e o estado atual (fundação de UI pronta). Usei `architecture-critic` (adversarial) em vez
> de regerar do zero — a arquitetura já estava ~90% woofed-aligned (commit anterior). Veredito do
> crítico: **pode executar SPLIT 0**, com correções pontuais (todas integradas).

- **Correções integradas no `docs/PRODUCT-ROADMAP.md`:**
  - §3.1: `current_org_id()` **anti-recursão** (ler `auth.jwt()→app_metadata.org_id` + fallback;
    `SECURITY DEFINER STABLE` + `search_path` fixo); `ai_usage = {limit, tokens}`; dinheiro `bigint`;
    `slug`/`status` de `organizations` adiados (só `org_id` p/ tenancy-ready).
  - §3.4: `contacts` com unicidade **por org** (`unique(org_id, lower(email))`/`(org_id, phone)`) —
    NÃO o índice global do woofed (vazaria contatos entre orgs). `proposal_events` alinhado ao
    `events` do woofed (`kind`/`scheduled_at`/`done_at`/`from_me`/`status`/`title`). Dois sistemas de
    evento justificados (audit_logs=sistema, proposal_events=timeline de negócio).
  - §4: novo contrato **`CourseSource`** (seam editor↔portfólio) — SPLIT 4 coda contra a interface
    com provider manual; SPLIT 6 só pluga o provider de portfólio, **sem reabrir** `StudyPlanEditor.tsx`.
  - SPLIT 0: ordem do `org_id NOT NULL` (nullable→backfill→default→NOT NULL), seed Movy com **UUID
    fixo**, **índices** em `org_id`, policy de `study_plans` **extensível** (SPLIT 2 estende, não troca).
  - SPLIT 1: **dono do backfill de dinheiro** — engine lê legado float na borda; persiste centavos a partir do próximo salvar.
  - SPLIT 7: **MCP e pgvector/embeddings FORA de escopo** (fase CRM) — corte de over-engineering.
  - SPLIT UI marcado **✅ FEITO**; exclusões conscientes (Câmbio, FinancialCalculator) documentadas.
  - Nit: glossário renumerado para §11 (ordem monotônica).
- **Decisões registradas** em `.wolf/cerebrum.md` (Decision Log).
- **Ordem de entrega mantida:** 0 → 1 → 2 → 3 → 4 → 6 → 5 → 7 → 8 → 9 (o `CourseSource` resolve o risco do 4↔6).
- **Próximo:** executar **SPLIT 0** (migration 009 + regen de tipos + quitar `as any`).

### 2026-06-15 - SPLIT UI (cont.): migração de telas não-split para o DS + auditoria
> Continuação da fundação. Princípio de engenharia: **migrar só onde há valor real**, sem churn
> cosmético. Auditei o repo (grep de cores/fontes hardcoded e `<svg>` à mão) para achar exatamente
> as telas que **divergiam** do DS/tokens — o resto já era token-based (mesma linguagem do novo shell).

- **Migradas (Lucide + classes DS + tokens, dark-safe):**
  - `home/page.tsx`: removido código morto (`counts()` com `as any`), setas de texto → `ArrowRight`.
  - `wiki/page.tsx`: ícones à mão → `Search`/`Plus`, botões crus → `button-fill-primary-md`,
    `#2A1153`/`rgba(28,18,51,…)` → tokens (`--border`, `color-fg-*`), input de busca tokenizado.
  - `wiki/[slug]/page.tsx`: `Chevron/Edit/Back` à mão → `ChevronRight`/`Pencil`/`ArrowLeft`,
    fontes `Outfit` literais → `var(--font-body)`.
  - `components/wiki/blocks/EmailTemplate.tsx`: emoji `✓` → `Check`/`Copy` (Lucide), `Outfit`→token,
    cor do "copiado" → dourado (visível no header roxo em dark).
  - `departments/[slug]/page.tsx`: prefixos `+`/`->` → `Plus`/`ArrowRight`, `Outfit`→`font.display`.
  - `settings/users/UsersManager.tsx`: fontes `Outfit`→`var(--font-body)` (resto já tematizado).
  - `error.tsx`: SVG à mão → `AlertTriangle`/`RotateCcw`, botão → `button-fill-primary-md`, tokens.
  - `home/loading.tsx`, `wiki/loading.tsx`, `departments/[slug]/loading.tsx`: skeletons quebravam no
    dark (`rgba(28,18,51,…)` some, `#fff` fixo) → `rgba(var(--ink-rgb),…)` + `var(--surface)`.
- **NÃO migradas (decisão consciente, sem retrabalho):**
  - **Câmbio** (`cambio/page.tsx`, `FxConverter/FxStats/FxRatesTable/FxChart`): já 100% token-based
    e theme-aware — reescrever em classes DS seria no-op visual com risco de regressão.
  - **`FinancialCalculator.tsx`**: é o **documento financeiro imprimível** (estilos `.fc-*` em papel
    branco, Outfit/Space Mono) — intencionalmente "papel" nos dois temas, igual ao PDF da proposta
    (decisão P já documentada). Manter.
  - Telas **donas de split** (lista/editor/proposta) e `as any` ligados a `study_plans`: ficam para os
    splits 3/4/5 e o **SPLIT 0** (regen de tipos resolve os `as any`), evitando refazer.
- **QA:** `npm run type-check` ✅ e `npm run build` ✅ (só warning pré-existente de `useMemo` em `FxChart`).
- **Próximo:** replanejar splits (woofed/DS) + integrar no roadmap → push → executar SPLIT 0.

### 2026-06-15 - SPLIT UI: remodelar interface para woofed (pele Movy) — fundação
> Decisão do dono: mover a interface inteira para a linguagem visual do **woofed-crm**, mantendo a
> marca Movy (roxo `#4B1A77` + dourado `#FBB615` + Clash Display/Satoshi). **Sem VPS** — woofed é
> blueprint (Caminho B), replicado do clone `C:/dev/woofed-crm`. Detalhes em `.wolf/cerebrum.md` e
> `docs/PRODUCT-ROADMAP.md` §5 (SPLIT UI).

- **Camada de DS (woofed-shaped, pele Movy):** portada a camada `@layer components` do woofed para
  `app/globals.css`, remapeada às nossas CSS vars light/dark via tokens `--ds-*`. Classes disponíveis:
  `color-fg-*`, `color-bg-surface-*`, `color-bg-fill-*`, `color-border-*`, `typography-*`,
  `button-menu-default-md(-selected)`, `button-fill-primary-md`, `button-outline-secondary-md`,
  `button-blank-secondary-icon`, `navbar-container`, `woo-input`, `ds-label`.
- **AppShell reescrito (`components/layout/AppShell.tsx`):** sidebar **colapsável** (208↔76px,
  persistida em `localStorage`), ícones **Lucide** (`lucide-react`), item ativo via
  `button-menu-default-selected-md`, settings fixo no rodapé, topbar por página (`navbar-container`)
  com breadcrumb + tema + menu de conta, drawer mobile. Sidebar agora é **superfície clara bordada**
  (anatomia woofed); em dark vira a superfície roxa do tema.
- **QA:** `npm run type-check` ✅ e `npm run build` ✅ em 2026-06-15.
- **Próximo:** migrar telas para as classes do DS dentro dos splits 3 (lista), 4 (editor), 5 (proposta/PDF),
  + passes incrementais em home/wiki/departments/settings/câmbio/financeiro. SPLIT 0 (schema) segue pendente.

### 2026-06-14 - Redesign claro/escuro + separação de campos + fixes (sessão Antigravity, documentada retroativamente)

> O agente Antigravity (Gemini IDE) executou este trabalho mas NÃO registrou em OpenWolf/handover.
> Reconstruído a partir do walkthrough + working tree em 2026-06-15. Detalhes finos em `.wolf/memory.md` e `.wolf/buglog.json` (bug-004..009).

- **Design system claro/escuro:** tokens semânticos em CSS vars (`app/globals.css`), `lib/ui/theme.ts` reescrito para
  tokens theme-aware (`t.*`, `ink()`, `purpleA()`), script anti-flash em `app/layout.tsx`, `ThemeToggle.tsx`.
  Novas fontes Clash Display + Satoshi. ~29 arquivos migrados de hex/`color.purpleDeep` para tokens.
- **Home:** removida a faixa de KPIs (contadores) — ruído para ferramenta interna; também tirou chamadas `count()`.
- **Bug "corte branco" / sobreposição do topbar:** `100vh`→`100dvh`, `html/body` com `var(--bg)`, `<main>` rola
  internamente (`overflow-y:auto`). Resolvido nos dois temas. (bug-004)
- **Editor:** campos separados por tipo de curso (ELICOS / VET / Higher Education); painel de material só onde faz sentido.
- **Timeline:** gradientes roxo→dourado para tela e contraste de impressão no PDF.
- **Legado:** label de navegação "Campanhas"→"Planos de Estudo" (`messages/pt.json`); menções legadas removidas do manifest.
- **Fixes de erro documentados (a commitar SEPARADO do redesign):** manifest 404 `/pt/manifest.json` (`middleware.ts`);
  `Draft`→`Rascunho` (`study-plans/page.tsx`, `pt.json`); `lang="pt-BR"` (`app/layout.tsx`); contraste de legendas WCAG
  (`FxConverter.tsx`, `WikiListItem.tsx`); espaçamento de excerpt da Wiki (`wiki/page.tsx`). (bug-006, 008, 009)
- **Usuário de teste (criado pelo Claude em outra janela):** `testemovy@movy.com.br` / `teste123!` (role admin).
  Login é por **email**. Tive que corrigir colunas de token NULL no GoTrue (erro 500). (bug-007)
- **QA:** `npm run type-check` limpo em 2026-06-15 com todas as mudanças no working tree.
- **Pendências apontadas:** limpar propostas de teste no banco (lixo); validar deploy na Vercel; revogar token read-only
  da Wise (`6f40…`) que apareceu em chat anterior.

### 2026-06-11 - Redesign de marca + planejamento de férias + promoção
- Redesign completo alinhado ao Brand Guide 2026 (marca "vela", Outfit, kicker laranja/dourado)
  em TODAS as telas: home, shell, login, propostas (lista + editor), capacidade financeira,
  informações (lista + artigo), departamentos (lista + detalhe), configurações (geral, usuários,
  audit-log), unauthorized, error. Acentos PT corrigidos (editor, calculadora, departamentos).
- IA da Home: foco em Proposta + Capacidade Financeira; CRM "em breve"; conhecimento só pelo
  menu; Home é o 1º item da nav. Bugs do hambúrguer/avatar corrigidos; avatar tem menu.
- Proposta: toggle "incluir planejamento de férias" + nova seção "Planejamento de férias &
  cronograma" (barra estudo/férias + lista + datas-chave). `node --test` 4/4; type-check verde.
- Branch `feat/frontend-editorial` mergeada na `main` e deployada em produção.
- PENDENTE (ordem): Feature A = cotação de câmbio ao vivo AUD→BRL (respaldo data/hora, não
  congelado); depois Feature B = gestor de presets (migration `008_course_presets.sql` escrita,
  não aplicada). Ver "Próximo agente — COMECE AQUI". Resíduos menores: WikiForm/new/edit,
  StudyPlanProposal já com a vela, loading skeletons.

### 2026-06-11 - Bugs documentados antes da Feature A

- Branch nova: `fix/documented-brand-bugs`.
- Corrigido residuo off-brand de fonte: `Bricolage Grotesque` removida de
  `app/[locale]/(protected)/wiki/page.tsx` e
  `app/[locale]/(protected)/departments/[slug]/page.tsx`; agora usam `font.display`.
- Corrigido teal FYME `#057570` em `data/knowledge-sop-content.json` e nos seeds/migrations
  `005_movy_knowledge_content.sql` / `006_cleanup_movy_knowledge.sql`, usando roxo Movy.
- Corrigida label visual do turno no editor: valor armazenado continua `Manha`, mas a UI exibe
  `Manha` acentuado.
- Validacao em clone temporario fora do Drive
  `C:\Users\baien\AppData\Local\Codex\movy-study-plan-verify-brand-bugs-20260611234008`:
  `npm run type-check` passou, `node --test tests/study-financial.test.mjs` passou (4/4),
  `npm run build` passou.
- Pendente imediato: escolher a fonte de cambio externa (sem Google) para iniciar Feature A.

### 2026-06-11 - Limpeza forte e deploy

- Portal simplificado para Home, Knowledge/Departamentos, Study Plans/Propostas, Calculadora Financeira e Settings.
- Campanhas, feedbacks, equipe/contatos, busca global antiga e telas nao usadas foram removidas/desativadas.
- `dashboard` passou a redirecionar para `home`.
- Conteudo de knowledge foi sanitizado para Movy e a migration `007_sanitize_movy_knowledge_content_v2.sql` foi aplicada no Supabase.
- Build, type-check e testes passaram em clone temporario.
- Deploy de producao feito via Vercel CLI.

### 2026-06-11 - Auth e usuarios

- Commit `f3180c6` adicionou login por email/senha e gerenciador funcional de usuarios/allowlist.
- Ainda precisa QA logado completo e confirmacao de deploy depois desse commit.

### 2026-06-11 - Documento de passagem

- Criado este handover para manter Codex e Claude alinhados.
- `CLAUDE.md` deve apontar para este documento como leitura obrigatoria.

### 2026-06-11 - Performance de carregamento

- Diagnostico: as paginas protegidas estavam lentas principalmente por duas causas combinadas: `getUser()` repetido na mesma renderizacao e prefetch automatico do Next em menus/listas protegidas, disparando varias chamadas Supabase em background.
- Correcao aplicada: `getUser()` passou a usar `cache()` do React por request.
- Correcao aplicada: middleware nao chama Supabase em rotas publicas como login/unauthorized/root.
- Correcao aplicada: links internos protegidos passaram a usar `prefetch={false}` para carregar dados apenas quando o usuario clica.
- QA: `node --test tests\study-financial.test.mjs`, `npm run type-check` e `npm run build` passaram em copia temporaria limpa `C:\Users\baien\AppData\Local\Codex\movy-study-plan-perf-verify-20260611`.
- Observacao: nao usar `npm ci` diretamente dentro do workspace em Google Drive; ficou lento/travado. Para QA, usar copia temporaria local com `node_modules` fora do Drive.

### 2026-06-11 - Browser QA producao

- Browser QA deslogado em `https://movy-study-plan.vercel.app` passou para login, erro de credencial invalida e redirects de rotas protegidas.
- Rotas testadas deslogado: `/pt/home`, `/pt/dashboard`, `/pt/wiki`, `/pt/departments`, `/pt/study-plans`, `/pt/financial`, `/pt/settings`; todas redirecionaram para `/pt/login` sem console errors.
- Login mobile em 390x844 passou sem overflow horizontal, com inputs/botoes visiveis.
- Achado pendente: botao Google ainda leva para `accounts.google.com` com `redirect_uri=https://xpthmguzcbmndyyexfbt.supabase.co/auth/v1/callback` e mostra "continue to xpthmguzcbmndyyexfbt.supabase.co". Isso exige ajuste de dominio/auth custom domain no Supabase/Google, nao e apenas front-end.

### 2026-06-16 - HR & Time Management module fully implemented

- 16 tasks complete: DB migration (supabase/migrations/013_hr_module.sql), domain types (lib/hr/types.ts), rate calculations with TDD (lib/hr/calculations.ts — 17 tests passing), query helpers (lib/hr/queries.ts), barrel export (lib/hr/index.ts), server actions (app/[locale]/(protected)/hr/actions.ts), sidebar nav update (components/layout/AppShell.tsx).
- Components: ClockWidget.tsx (live elapsed timer, clock in/out), WeekSummary.tsx (7-day bar chart), TimesheetTable.tsx (approve/reject), TaxInvoice.tsx (ABN-format print/PDF).
- Pages: HR dashboard (hr/page.tsx), clock self-service (hr/clock/page.tsx), admin timesheets with filters (hr/timesheets/page.tsx), invoice list (hr/invoices/page.tsx + GenerateInvoiceForm.tsx), invoice print (hr/invoices/[id]/print/page.tsx).
- All 38 tests passing (17 hr-calculations + 21 study-financial). TypeScript clean. Next.js build clean.
- Key conventions confirmed: no `getUser` helper — use `supabase.auth.getUser()` + profiles query directly; `organizations.settings` not `metadata`; role is `'super_admin'` (not `'owner'`); server actions use `getActor()` pattern for org-scoped auth.
