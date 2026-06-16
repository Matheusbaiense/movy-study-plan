# Blueprint Competitivo — AllyHub → Movy (por Split)

> **Origem:** pesquisa de UX e engenharia reversa do AllyHub (Sellead white-label) conduzida em
> 2026-06-15/16, 12 sessões, conta de teste `movyeducation@gmail.com` / plano Starter / Austrália.
> Material completo: `.wolf/allyhub-research/ALLY-BLUEPRINT.md` (~4400 linhas, ~90k tok).
> **Uso:** insumo de produto para cada split. Não é o código do concorrente — é pesquisa de UX.
> Atualizado: 2026-06-16.

---

## Visão geral competitiva

### Como o AllyHub é estruturado (3 camadas)

1. **CORE** — Motor de Preços: processa moeda + nacionalidade + fees obrigatórios + câmbio.
2. **AGENT INTERFACE** — "Playground" de orçamentos: monta múltiplas opções dinamicamente (abas).
3. **CLIENT INTERFACE** — Portal público `quote.allyhub.co`: link que o aluno acessa, com marca da agência.

### Modelo de negócio

- **CRM + Quote são GRATUITOS** (plano Starter ilimitado, R$0/usuário, ativo até 2030).
- **Receita principal: AU$150 por quote finalizada** (fee `266546` incluído automaticamente em toda cotação).
- Upsell de features pagas: módulo Financial (moduleType≥7) + Marketing (≥11) + Automações (≥16).
- **Segundo modelo de receita (early access): `/shipment`** — remessa internacional com spread cambial.
  > Insight estratégico: a Movy pode entregar mais valor sem cobrar por quote e sem depender do spread cambial.

### Vantagens competitivas da Movy vs AllyHub

| Frente | AllyHub | Movy |
|--------|---------|------|
| Tech stack | AngularJS 1.x (EOL 2021) | Next.js + TypeScript estrito + Supabase |
| Multi-tenancy | single-account por instalação | multi-org white-label desde o day 1 (P0/P1) |
| RLS / segurança | sem RLS de banco; security by obscurity | RLS por org em todas as tabelas |
| Mobile | sem suporte nativo | mobile-first (Next.js responsivo) |
| Internacionalização | 100% PT-BR (não serve agências globais) | i18n-ready (pt/en/es) |
| Preço | AU$150 por quote | a definir — mas sem taxa por transação |
| Dívida técnica | crítica (AngularJS EOL + bug OSHC bloqueia TODA cotação AU) | nenhuma |
| Dados expostos | bcrypt hash + billing expostos em URL pública | token-gated + RLS |

---

## SPLIT 4 — Editor de proposta (itens ainda pendentes)

### Comportamentos AllyHub a incorporar

**Autosave e estado de rascunho:**
- `autoSave:true` = tolerante a fees expirados (salva o rascunho mesmo com preço vencido).
- `autoSave:false` (Finish) = validação estrita no servidor antes de finalizar.
- Due date calculado automaticamente: **hoje + 10 dias** (nosso campo `expires_at`).
- Após Finish bem-sucedido → redireciona para perfil do aluno na aba "Quotes and Links".
  > Movy: após publicar proposta → redirecionar para página da proposta + emitir `proposal_events`.

**Override de campos de preço por curso:**
- AllyHub expõe campos separados: `editedTuition`, `editedMaterial`, `editedEnrol` (override) +
  `discountTuition`, `discountMaterial`, `discountEnrol` (desconto).
- O agente pode ajustar sem apagar o preço base — rastreabilidade de quanto foi descontado.
  > Movy: no editor, permitir override de `tuition`/`enrolmentFee`/`materialFee` por curso com
  > registro do delta (valor original vs editado) no snapshot. Já temos `scholarship` — expandir.

**Gear menu (⚙️) por opção:**
- AllyHub: 4 ações no menu `...` de cada opção: **My Commission / Add Discount / Duplicate / Delete**.
- "Add custom fee" é enganoso — o modal se chama "Add Discount" e limita o desconto à comissão total.
  > Movy: menu por opção com Duplicar / Renomear / Remover / Marcar recomendada (já temos) +
  > futura fatia: "Adicionar desconto" (descontado da comissão da agência).

**Comissão:**
- AllyHub calcula comissão por fornecedor via `/calculatecommissionplugAndplay`:
  `comissão bruta − desconto aplicado = comissão líquida da agência`.
  Negativo = escola cobra de volta (ex: Lexis = −AU$110 por comissão de −10%).
  > Movy: campo `commission_default` já existe em `institutions`. SPLIT 4/6B: exibir no editor
  > quanto a agência ganha nesta opção (totais de comissão por opção, colapsável).

**Fees obrigatórios vs sugeridos vs específicos da escola:**
- AllyHub tem 3 origens de fee: (1) mandatoryrule (plataforma/seguro), (2) coursecampusvalues
  (escola-específico), (3) agência (markup/desconto).
- O endpoint `/mandatoryrule` auto-adiciona fees OSHC + taxa da plataforma ao escolher um curso.
  > Movy: o motor de regras (`applyRules`) já implementa inclusão automática. No editor, mostrar
  > claramente de onde veio cada taxa: `Regra da agência` / `Preço do portfólio` / `Manual`.

**Falha crítica deles para não repetir:**
- Preço OSHC expirado em `course_price_versions` bloqueia TODAS as cotações AU na plataforma.
  > Movy: `applyRules` + `currentCoursePrice` já lida com vigência. Alerta de impacto no SPLIT 6B
  > é fundamental. Editor deve avisar (não bloquear) quando preço de um curso está próximo de vencer.

---

## SPLIT 5 — Proposta pública / PDF / compartilhamento

### Dois tipos de link externo (arquitetura a adotar)

| Tipo | AllyHub | Comportamento |
|------|---------|---------------|
| **Link direto** | `/quote-detail/{quote_id}/{hash}` | abre uma quote específica |
| **Link gerenciável** | `/quote-online/{link_id}/{hash}` | contém N quotes; agente pode atualizar sem novo link |

> Movy: implementar os dois. O link gerenciável é mais poderoso para negociação:
> o consultor atualiza a proposta (nova opção, preço ajustado) e o aluno, com o mesmo link, vê a versão nova.
> Implementar como `proposal_links` com `study_plan_id` + hash + `expires_at`.

### Tracking e engajamento

- AllyHub dispara dois eventos ao visualizar: view por quote + view por link (separados).
- Campo `like: null` → aluno pode aprovar/rejeitar uma opção específica.
- Agente vê `opened: N` por quote + `view: N` por link.
  > Movy: `proposal_events` (kind=`viewed`/`liked`/`rejected_option`) — registrar IP + user-agent.
  > UI do consultor: badge "Vista 3x · última vez há 2h · gostou da Opção 2".

### Conteúdo da página pública (o que o aluno vê)

AllyHub inclui na página do aluno:
- Breakdown do programa (curso, escola, cidade, período, valor AUD + conversão BRL).
- **YouTube embed da escola** (vídeo institucional).
- Galeria de fotos da escola.
- Seção "Sobre a Escola" e "Comodidades".
- **Branding do consultor** (logo + nome), não da plataforma.
- Botão WhatsApp CTA.
- Conversão de câmbio ao vivo.

> Movy SPLIT 5: página pública precisa ter conteúdo rico da escola (do portfólio: `institutions.logo_url`,
> `institutions.notes` para descrição). YouTube/galeria → `institutions.metadata` (guardado como jsonb no §3.2).
> Branding do consultor → `organizations.branding` (SPLIT 8 fornece, SPLIT 5 consome).

### Fluxo de pagamento/aceite (para o SPLIT 5)

AllyHub no portal do aluno:
- 5 formas: full / poupancinha (entry) / cartaoEntrada / parcelado (2-12x) / pravaler.
- Parcelamento com juros embutidos (4.68%–11.68%).
- Processadores BR: PagBank + ZOOP.

> Movy SPLIT 5 (v1): aceite simples in-house (nome + `accepted_at` + IP + checkbox de termos).
> Parcelamento = informativo (a Movy não processa pagamento — o consultor recebe). Não implementar
> gateway agora. A referência serve para o layout do breakdown de pagamento visível ao aluno.

### Falha de segurança deles (não repetir)

- GET `/quotehash/` expõe bcrypt hash da conta + credits + billing para qualquer pessoa com a URL.
  > Movy: link público carrega apenas os dados da proposta (sem dados internos de org). JWT separado,
  > assinado, com expiração. Nunca expor `org_id`, `contact_id` cru nem dados financeiros da agência.

---

## SPLIT 6B — Portfólio: UI de gestão

### Advanced Search (evolução do `CoursePortfolioPicker`)

AllyHub oferece filtros de busca no catálogo:
- Nome exato / categoria (HS/HE/VET / ELICOS) / idade do aluno / sazonalidade (intake).
- Fallback "remova filtros" quando não há resultados (UX explícita, não página vazia).
- Badge de parceiro (escola parceira destacada no resultado).
- **Reportar erro de preço** (modal estruturado: tipo de erro + descrição + anexo da price list).

> Movy: `CoursePortfolioPicker` atual tem busca por nome + filtro de tipo. Adicionar:
> - Filtro de intake/sazonalidade (cruzar com `courses.default_intake`).
> - Estado vazio com "nenhum resultado — tente remover filtros" (não sumir silenciosamente).
> - Badge `partnership_status` (já existe em `institutions`).
> - Modal "Reportar erro de preço" → cria `proposal_events` (kind=`price_error_report`) ou
>   entrada em `audit_logs` — não precisa de tabela nova.

### Smart Search (futuro, pós-6B)

- AllyHub: "mais vendidos / mais lucrativos" aparecem no topo da busca.
  > Movy: contar aparições de `courseId` em `study_plans.data` para calcular popularidade.
  > Implementar como query rankeada em `lib/portfolio/queries.ts`, não precisa de ML.

### Editor de regras de preço (telas SPLIT 6B)

AllyHub tem 3 origens de fee (plataforma / escola / agência) sem UI clara — consultores não sabem
de onde vem cada taxa.

> Movy ao construir o editor de regras (`pricing_rules`):
> - Label clara: `origem: regra da agência` / `preço do portfólio` / `manual`.
> - Editor de `pricing_rules` por escopo (org/instituição/campus/curso/tipo) com preview ao vivo
>   de quanto aquela regra acrescentaria em uma cotação de exemplo.
> - Flag `priceIsExpired` visível no catálogo + alerta de impacto (quantas propostas ativas usam
>   este preço) — diferencial vs AllyHub que simplesmente bloqueia.

### Acomodações e seguros (backlog pós-6B)

- AllyHub tem catálogo global de acomodações (Kings Hall, CEA etc.) em GBP, separado de cursos.
- Insurances (OSHC) como item do catálogo com mandatory rule.
  > Movy: `OSHC` atualmente é `ExtraCost` manual. Quando acomodação/seguro virarem catálogo,
  > seguir o mesmo padrão de `course_price_versions` (entidade + vigência + snapshot).
  > Não reabre SPLIT 6A — adicionar tabelas novas em migration futura.

### Multi-office dentro de uma organização

AllyHub tem seletor de "office" no Settings: um account pode ter múltiplos escritórios
(Perth + Sydney + SP) com pipelines e usuários próprios por office.

> Movy: `organizations` é o tenant; escritórios = futuro `departments` ou sub-tenant.
> Para white-label (SPLIT 8), basta configurar `branding` por org. Sub-offices ficam
> fora de escopo agora mas o `org_id` + `profiles.department` já dão base.

---

## SPLIT 7 — Import documental por IA

### Sistema de templates de documentos (insight para o builder)

AllyHub tem um editor de templates (CKEditor 4) com **83 variáveis** divididas em 4 grupos:
- Office (14): nome da agência, endereço, logo, consultor responsável.
- Student (36): nome, passaporte, nacionalidade, CPF, contato de responsável (para menores).
- Quote (30): escola, curso, período, valores, datas, link de pagamento.
- General (3): data atual, quebra de página, número de página.

Variáveis compostas: `[[course_info]]` e `[[accommodation_info]]` expandem múltiplos campos.
Variável `[[page_break]]` controla quebra de página no PDF.
Sintaxe: `[[duplo_colchete]]` proprietária do Sellead.

> Movy SPLIT 7: templates de documento usarão variáveis similares, mas tipadas e com
> autocompletion no editor. Grupos: Agência / Contato / Proposta / Curso / Datas.
> Variáveis compostas via Handlebars ou similar — não proprietário.
> Variáveis para menores: `contact.guardian_name` etc. → em `custom_attributes`.

### Fila de processamento de documentos (insight de UX)

AllyHub para conferência de documentos gerados: Settings → "Generate Document" → editor
intermediário (revisar antes do PDF) → download.

> Movy SPLIT 7: pipeline `uploaded → processing → extracted → review → approved → published`.
> A tela de conferência com diff "preço anterior vs extraído" é o diferencial vs AllyHub
> que não tem import automático de price list.

---

## SPLIT 8 — Organização, branding e settings

### Branding por agência (o que o AllyHub entrega e o que podemos fazer melhor)

AllyHub Quote Online builder:
- Upload de logo + banner da agência (png/jpg).
- Cor de fundo do header (`headerBackgroundColor`) configurável com live preview.
- PDF = apenas banner upload, sem controle de layout.
- Descrições em PT/EN/ES por agência.

> Movy SPLIT 8 vai além: `organizations.branding` jsonb com logo + cores + fontes + rodapé
> que alimenta o PDF renderizado (SPLIT 5). O PDF terá layout controlado pela Movy (não só um banner).

### Email templates (insight de UX)

AllyHub: CKEditor 4, dois modos — sem quote (44 variáveis) e com quote (71 variáveis, +27 quote).
Split layout editor/lista de variáveis lado a lado.

> Movy: email transacional via server actions + `proposal_events` (kind=`email`).
> Template visual pode aguardar SPLIT 9 (polimento), mas o mecanismo de disparo deve estar
> pronto no SPLIT 5 (envio do link público).

### Settings — 16 seções mapeadas (referência para SPLIT 8)

| Seção AllyHub | Equivalente Movy | Split |
|---|---|---|
| Organization / Profile | `organizations` (nome, logo, endereço) | 8 |
| Users (por office) | `profiles` + `allowed_emails` | 8 |
| Pipelines / Stages | futuro (woofed CRM) | fora do escopo |
| Payment integrations | fora do escopo (Lago v3) | - |
| Student Public Form | configuração do portal público | 8 |
| Tags / Lead Sources / Cancel reasons | `custom_attribute_definitions` (woofed) | pós-CRM |
| Import leads via planilha | `contacts` bulk import | futuro |
| Integrations (RD Station, Pipedrive, Zapier) | woofed CRM | fora do escopo |
| Aussie Translate | não aplicável | - |
| Quote Preferences (live preview) | `organizations.branding` | 8 |
| Email Template | SPLIT 5 (envio) + 8 (editor) | 5 + 8 |
| Document Template | SPLIT 7 (import) + 8 (editor) | 7 + 8 |
| Automations | fora do escopo | - |

---

## Financeiro (backlog pós-SPLIT 8)

AllyHub tem 4 camadas financeiras documentadas (seção 49–50 do blueprint):

1. **Dashboard/Overview:** 3 cards (Receivables/Bills/Balance), 4 status por card.
2. **CRUD Operacional:** `/instalment/receive` (contas a receber), `/instalment/pay` (a pagar),
   `/instalment/credits` (créditos de escolas/parceiros).
3. **Comissões + Reports:** 10 relatórios, filtros de adimplência, leaderboard de agentes.
4. **B2B + Gates:** `/billing` (3835 registros CM-prefix, cobranças entre agência e plataforma).

**Insights críticos:**
- **Parcelas NÃO são auto-geradas** ao vender uma quote — criação 100% manual post-sale.
  > Movy: `datedInstallments` já calcula — o financeiro deve apenas registrar quando foi recebido,
  > não recalcular. Modelo: `payment_items` como previsão + status de recebimento.
- **5 status de parcela:** Pending / Expired / Partial Paid / Paid / Only Provisioned.
- **Desconto = sai da comissão da agência**, não do preço da escola.
  > Movy: registrar isso explicitamente no snapshot (delta entre preço base e preço praticado).

---

## Decisões estratégicas derivadas desta análise

| Decisão | Racional |
|---------|---------|
| **Não cobrar por quote** | AllyHub cobra AU$150/quote e é grátis no CRM — funciona como lock-in. A Movy pode ser mais valiosa pelo valor do produto (SaaS + white-label). |
| **Não depender de gateway BR** | PagBank/ZOOP é dívida técnica + risco de mercado. Focar em aceite simples e fluxo de pagamento fora da plataforma no MVP. |
| **Fee de plataforma via `pricing_rules`** | A taxa AU$150 do AllyHub é hard-coded. Na Movy, agência configura seu próprio markup como regra — muito mais flexível. |
| **Expiração de preço não deve bloquear** | Bug crítico do AllyHub: preço expirado bloqueia todas as cotações. Movy alerta mas não bloqueia — consultor continua com aviso. |
| **Link público gerenciável > link direto** | Consultor atualiza a proposta; aluno usa o mesmo link. Reduz fricção de reenvio. |
| **Branding da agência no PDF, não da plataforma** | AllyHub faz; Movy precisa fazer melhor (layout controlado, não só banner). |
| **AngularJS = nossa maior vantagem** | AllyHub tem dívida técnica de 5+ anos. Qualquer feature moderna (mobile, PWA, acessibilidade, performance) é automaticamente superior na Movy. |
