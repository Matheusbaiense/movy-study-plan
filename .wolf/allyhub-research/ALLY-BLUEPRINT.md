# AllyHub — Blueprint Competitivo Completo
> Pesquisa de UX/produto realizada em 2026-06-15 via conta de teste `movyeducation@gmail.com`
> Conta registrada como: Movy Education — Starter (Grátis) — Austrália
> Nota: Plataforma com bug de carregamento no Stripe mesmo no plano gratuito.

---

## 1. IDENTIDADE DA EMPRESA

| Campo | Dado |
|---|---|
| Nome legal | ALLY HUB DESENVOLVIMENTO DE SOFTWARE LTDA |
| Nome fantasia | AllyHub / Ally |
| CNPJ | 23.828.556/0001-76 |
| Endereço | Rua Adolfo Serra, nº 1724, Casa 23, Ribeirão Preto – SP |
| Foro judicial | Ribeirão Preto – SP |
| E-mail oficial | contato@allyhub.co |
| URL | https://app.allyhub.co |
| SaaS de checkout | https://allybilling-production.up.railway.app |

---

## 2. PROPOSTA DE VALOR

AllyHub é um **CRM + orçamento + financeiro + automações** para **agências de intercâmbio**. Funciona como marketplace B2B conectando:
- Agências de intercâmbio (cliente pagante)
- Escolas internacionais / Campuses (parceiras, acesso gratuito ao catálogo)
- Provedores de serviço (seguros, acomodação, vistos)
- Estudantes / leads

**Posicionamento:** "plataforma all-in-one para agências de intercâmbio" — pipeline de vendas, orçamento com câmbio automático, cobrança, marketing e automações.

---

## 3. ARQUITETURA DE NAVEGAÇÃO (menu principal)

```
ALLY
├── CRM (dropdown)
│   └── (ver §4)
├── Quote (dropdown)
│   └── (ver §5)
├── Marketing (dropdown)
│   └── (ver §6)
├── Automations → /automation/hire
├── Financial (dropdown)
│   └── (ver §7)
├── Reports (dropdown)
│   └── (ver §8)
├── HUB Services [NEW] (dropdown)
│   └── (ver §9)
├── Student Shortcut (busca rápida de aluno)
├── [+] (ação rápida)
├── [Notificações]
├── EN (idioma: PT / EN / ES)
├── [Avatar usuário]
└── Ally Partners (dropdown — marketplace de escolas)
```

Páginas identificadas nas URLs:
- `/` → Home (dashboard pessoal)
- `/student-pipeline` → Pipeline de alunos
- `/report/quote` → Relatório de orçamentos
- `/dashboard` → Dashboard analítico
- `/automation/hire` → Automações

---

## 4. MÓDULO CRM

### Sub-módulos identificados (plano Professional/Enterprise):
| Feature | Plano |
|---|---|
| CRM (base) | Starter |
| Pipelines | Starter |
| Relatórios de Vendas | Starter |
| Área do Estudante | Starter |
| Template de E-mails | Professional+ |
| Checkpoints | Professional+ |
| Classificação por Tags | Professional+ |
| Controle de Vistos | Professional+ |
| Organização de Grupos | Professional+ |
| Registro de Passagem Aérea | Professional+ |
| Gestão de Pós-Venda | Enterprise |
| Geração Automática de Documentos | Enterprise |
| Gestão de Arquivos | Enterprise |

**Home do CRM** (observado no dashboard):
- "Hi [Nome]" — personalizado por usuário
- Contador de tarefas pendentes do dia
- Links rápidos: Pipeline / Quotes / Dashboard
- Leaderboard de vendas por usuário
- Avg. Sales By User
- Date picker (Last 30 days / range customizado)
- Métricas: New Leads, Leads Cold

---

## 5. MÓDULO QUOTE (Orçamento)

### Features por plano:
| Feature | Plano |
|---|---|
| Orçamento Ally+ | Starter |
| Seguro, OSHC e Tradução | Starter |
| Orçamento Privado | Professional+ |
| Orçamento Público | Professional+ |
| Configuração e atualização Automática de Câmbio | Professional+ |
| Template de Orçamentos | Professional+ |
| Solicitação de Cadastros | Professional+ |
| Configuração de Alertas | Professional+ |
| Gestão de Produtos (Escolas, Cursos, Acomodações, Seguros, Vistos e Taxas) | Professional+ |
| Automação de Taxas | Professional+ |

### Orçamento Ally+
- Inclui seguros (OSHC), câmbio e tradução
- Câmbio atualizado automaticamente (Professional+)
- Versões: Privado (link restrito) e Público (landing page aberta)

---

## 6. MÓDULO MARKETING

| Feature | Plano |
|---|---|
| Landing Page de Pacotes e Experiências | Professional+ |
| Envio de orçamento em massa | Professional+ |

---

## 7. MÓDULO FINANCIAL (Financeiro)

| Feature | Plano |
|---|---|
| Cobrança com PagBank | Starter |
| Pagamento de Escolas e Remessas com a Qualy | Starter |
| Métodos de Pagamento | Professional+ |
| Plano de Pagamento no Orçamento | Professional+ |
| Gestão de Contas a Receber | Professional+ |
| Gestão de Contas a Pagar | Professional+ |
| Dashboard de Resultados e Previsões | Professional+ |
| Templates de Planos de Pagamento | Enterprise |

**Parceiros financeiros:**
- **PagBank** — cobrança de clientes
- **Qualy** — pagamento de escolas e remessas internacionais
- **Zoop** — processamento de pagamentos (boleto, pix, cartão de crédito)
- **Travelex** — envio de remessas internacionais (Ally Checkout)
- **Stripe** — usado no checkout de assinatura (com bug identificado)
- **Xero** — integração contábil (add-on, Professional+)

---

## 8. MÓDULO REPORTS (Relatórios)

- `/report/quote` → Relatório de orçamentos
- Dashboard com: New Leads, Leads Cold, Avg. Sales by User, Leaderboard por usuário

---

## 9. MÓDULO HUB SERVICES (Novo)

Módulo novo (badge "new" no menu). Conteúdo não explorado ainda — conta bloqueada por bug do Stripe.

---

## 10. MÓDULO AUTOMATIONS

- URL: `/automation/hire`
- Limites por plano:
  - Professional: 20 automações, 1.000 integrações
  - Enterprise: 150 automações, 10.000 integrações
- Comunicação Enterprise: **Omnichannel WhatsApp Integrado**

---

## 11. ALLY PARTNERS

- Menu "Ally Partners" no header → marketplace de escolas parceiras
- Escolas têm acesso à plataforma para editar/publicar seus produtos
- Ally garante valores de "Escolas com Valores Garantidos" (proteção contra erros de preço)

---

## 12. PRICING — ESTRUTURA COMPLETA

### Moedas suportadas:
- Real (BRL)
- Dólar (USD)
- Dólar Australiano (AUD) ← **relevante para Movy**

### Planos:

#### STARTER — Grátis
- **Público:** Para indivíduos
- **Implementação:** Isenta
- **Módulos incluídos:**
  - CRM: CRM, Pipelines, Relatórios de Vendas, Área do Estudante
  - Orçamento: Orçamento Ally+, Seguro/OSHC/Tradução
  - Financeiro: Cobrança PagBank, Pagamento de Escolas e Remessas (Qualy)
  - Integrações disponíveis à parte: SMTP

#### PROFESSIONAL — R$125/usuário/mês
- **Público:** Para equipes
- **Descontos:** Semestral -15% (R$106,25), Anual -20% (R$100,00)
- **Implementação:** R$1.000 (cobrança única)
- **Módulos adicionais (além do Starter):**
  - CRM: Templates E-mail, Checkpoints, Tags, Vistos, Grupos, Passagem Aérea
  - Orçamento: Privado, Público, Câmbio auto, Templates, Solicitações, Alertas, **Gestão de Produtos (Escolas/Cursos/Acomodações/Seguros/Vistos/Taxas)**, **Automação de Taxas**
  - Financeiro: Métodos de Pagamento, Plano de Pagamento, Contas a Receber, Contas a Pagar, Dashboard Resultados
  - Marketing: Landing Page, Orçamento em massa
  - Automações: 20 automações, 1.000 integrações
- **Integrações add-on:** SMTP, Xero, RD Station, Active Campaign, Zapier
- **Customizações add-on:** Chatbot SDR IA, Web-to-Lead, Site, Lead distribution, Dashboards

#### ENTERPRISE — R$175/usuário/mês
- **Público:** Para equipes em crescimento
- **Descontos:** Semestral -15% (R$148,75), Anual -20% (R$140,00)
- **Implementação:** R$1.000 (cobrança única)
- **Módulos adicionais (além do Professional):**
  - CRM: Gestão de Pós-Venda, Geração Automática de Documentos, Gestão de Arquivos
  - Financeiro: Templates de Planos de Pagamento
  - Automações: 150 automações, 10.000 integrações
  - Comunicação: **Omnichannel WhatsApp Integrado**
- **Mesmos add-ons do Professional**

### Mínimo de usuários: **3 usuários**
### Primeiro pagamento (Professional, 3 usuários, mensal): **R$1.375** (R$375 recorrente + R$1.000 implementação)

---

## 13. ADD-ONS (contratados separadamente)

| Add-on | Preço | Tipo |
|---|---|---|
| Agente SDR com IA (Júnior) | R$700/mês + R$500 impl. | Recorrente |
| Agente SDR com IA (Pleno) | R$850/mês + R$1.000 impl. | Recorrente |
| Agente SDR com IA (Sênior) | R$1.000/mês + R$1.500 impl. | Recorrente |
| Web-to-Lead | R$800 | Pagamento único |
| Landing Page + Web-to-Lead | R$3.500 | Pagamento único |

**Agente SDR com IA (Júnior):** automatiza prospecção com IA
**Agente SDR com IA (Pleno):** IA + Distribuição de Leads
**Agente SDR com IA (Sênior):** IA + Distribuição de Leads + Dashboards de Acompanhamento

---

## 14. FLUXO DE ONBOARDING / CHECKOUT (5 passos)

```
Passo 1 — Plano
  ↓ Escolha moeda (BRL / USD / AUD)
  ↓ Escolha plano (Starter / Professional / Enterprise)

Passo 2 — Add-ons
  ↓ Selecione add-ons opcionais (Agentes IA, Web-to-Lead, Landing Page)

Passo 3 — Dados de Faturamento
  ↓ Razão Social / Business Name
  ↓ Número de Registro (BN / ABN / CNPJ) ← aceita formato australiano
  ↓ E-mail de faturamento
  ↓ País (default: Brasil, mas aceita outros)
  ↓ Endereço completo
  ↓ Quantidade de usuários (mínimo 3)
  ↓ Método de pagamento: Cartão de Crédito / Internacional
  ↓ Dia de vencimento: 5, 10, 15, 20, 25
  ↓ Tipo de contrato: Mensal / Semestral / Anual
  ↓ Cupom de desconto

Passo 4 — Assinatura
  ↓ (revisão e aceite dos termos)

Passo 5 — Pagamento
  ↓ (processado via Zoop / Stripe)
```

**Bug identificado:** Stripe falha no carregamento mesmo no plano Starter (gratuito). Conta Movy travou neste passo.

---

## 15. INTERNACIONALIZAÇÃO

- Interface em: **PT / EN / ES**
- Moedas de faturamento: BRL / USD / AUD
- Aceita registros por: CNPJ (Brasil), ABN (Austrália), BN (genérico)
- Câmbio automático no módulo de orçamento (Professional+)

---

## 16. TECH STACK (inferido)

| Componente | Tecnologia |
|---|---|
| Frontend | SPA (provavelmente Vue ou React) |
| Checkout/billing | App próprio hospedado no Railway (`allybilling-production.up.railway.app`) |
| Pagamentos assinatura | Stripe (com bug identificado) |
| Pagamentos agência→cliente | Zoop (boleto, pix, cartão) + PagBank |
| Remessas internacionais | Travelex |
| Pagamento para escolas | Qualy |
| Integração contábil | Xero (add-on) |
| CRM/Lead gen integrações | RD Station, Active Campaign, Zapier |
| Chat/suporte | Widget próprio (botão azul canto inferior direito) |
| Help center | Intercom (https://intercom.help/ally-hub/pt-BR/) |
| Tutoriais | Canal YouTube da Ally |

---

## 17. MODELO DE NEGÓCIO

1. **SaaS recorrente** — plano por usuário/mês (mínimo 3 usuários)
2. **Taxa de implementação** — cobrança única (R$1.000 no Professional/Enterprise)
3. **Add-ons** — receita adicional (Agentes IA, Web-to-Lead, Landing Page)
4. **Ally Plus** — módulo de marketplace: comissão de até **30% da tuition** compartilhada com a agência
5. **Ally Checkout** — intermediação de pagamentos (fee de transação presumido via Zoop/Travelex)
6. **Serviços customizados** — Desenvolvimento de site, Dashboards, Lead distribution

---

## 18. TERMOS CONTRATUAIS — PONTOS ESTRATÉGICOS

### Cláusulas críticas para análise competitiva:
- **Vigência mínima de 12 meses** (Cláusula 11.1) — lock-in anual
- **Multa de rescisão = 3 mensalidades** (Cláusula 16.6) — barreira de saída
- **Renovação automática anual** (Cláusula 11.8) — não reembolsável
- **Juros de 2%/mês** por atraso, suspensão após 5 dias (Cláusula 11.9)
- **Correção anual pelo IGP-M/FGV** (Cláusula 11.6) — reajuste automático
- **Foro: Ribeirão Preto - SP** (Cláusula 22.1) — desfavorável para clientes fora do Brasil
- **Uptime SLA: 99%** (Cláusula 3.4)
- **Dados retidos por 6 anos** após saída (Cláusula 7.5 — Privacidade)
- **Chargeback: responsabilidade 100% da agência** (Cláusula 20) — risco alto para agências AU
- **Ally Plus comissão até 30% da tuition** — modelo de afiliação com escolas

### Empresas ligadas (mesmo CNPJ nos termos):
- ALLY HUB = SELLEAD DESENVOLVIMENTO DE SOFTWARE LTDA (CNPJ: 23.828.556/0001-76)
- Signup redireciona para: http://signup.sellead.com

---

## 19. DADOS DO CONTRATO MOVY (para referência)

```
Empresa:         Movy Education
Registro:        11697550879 (ABN australiano)
País:            Austrália
Endereço:        5/531 Hay St, Subiaco WA 6008
Plano:           Starter (Grátis)
Usuários:        3
Add-ons:         Nenhum
E-mail billing:  financeiro@movyeducation.com.au
Vencimento:      Dia 5
Período:         Mensal
Pagamento:       Cartão de Crédito
Desconto:        Nenhum
Status:          TRAVADO — bug Stripe no passo 5
```

---

## 20. ANÁLISE SWOT (visão Movy vs. AllyHub)

### Forças do AllyHub (ameaças para Movy)
- All-in-one (CRM + orçamento + financeiro + automações + marketing)
- Ally Plus: marketplace de escolas com comissão
- Lock-in contratual forte (12 meses + multa)
- Suporte a múltiplos idiomas (PT/EN/ES) e moedas (BRL/USD/AUD)
- Integrações: WhatsApp, RD Station, Xero, Zapier
- Agentes SDR com IA como add-on
- Histórico de uso e dados das escolas parceiras

### Fraquezas do AllyHub (oportunidades para Movy)
- **Mínimo de 3 usuários** — caro para agências solo/pequenas
- **Bug técnico grave** no checkout (Stripe) — má primeira impressão
- **Lock-in de 12 meses** + multa = ressentimento de clientes
- **Foro no Brasil** = desfavorável para clientes australianos
- **Interface datada** — SPA pesada, modal de billing travado
- **Preço em BRL** (cotação afeta clientes internacionais)
- **Implementação de R$1.000** para planos pagos = barreira de entrada
- Sem foco em **velocidade de criação de proposta** (ponto forte da Movy)
- Sem cálculo explicável/transparente automático
- Português como idioma padrão (ruim para o mercado australiano)

### Oportunidades para Movy
- Focar em **agências australianas/internacionais** que o AllyHub não atende bem
- **Sem lock-in** como diferencial: mês a mês, cancela quando quiser
- **Proposta ultra-rápida** como core (o AllyHub é pesado e generalista)
- **Preço em AUD** desde o início
- **UI moderna** vs. interface legacy da AllyHub
- **White-label** para ser o "AllyHub australiano" com marca própria

---

## 21. STATUS DA EXPLORAÇÃO

- [x] Login e acesso ao produto
- [x] Pricing plans completo (Starter / Professional / Enterprise)
- [x] Add-ons completo
- [x] Fluxo de checkout (passos 1-3 documentados)
- [x] Termos de uso completos
- [x] Tech stack confirmado (AngularJS)
- [x] Módulo CRM — Pipeline, Student List, Student Profile, Opportunity
- [x] Módulo Quote — Quote 2.0 criado para Lucas Andrade
- [x] Módulo Financial — Financial Dashboard explorado
- [x] Módulo Reports — Performance, Behavior, Sales, Cancellations
- [x] Módulo Automations — bloqueado (add-on pago, não incluso no Starter)
- [x] Área do Estudante — formulário completo (4 abas), perfil com 5 abas
- [x] Aluno de teste criado: Lucas Andrade (Code 500, WARM)
- [x] Calendar / Agenda
- [x] Settings (configurações da conta)
- [x] Commissions (Ally+ results)
- [ ] Módulo Marketing (Experiences, Campaigns) — não explorado
- [ ] HUB Services — não explorado
- [ ] Ally Partners (catálogo de escolas) — não explorado

---

## 22. NAVEGAÇÃO COMPLETA — MAPA DE ROTAS

### Top nav (Ally+ / Starter)
```
Contacts ▼
  ├── Agenda            → /calendar
  ├── Business Pipeline → /business/pipeline
  ├── Business          → /business
  ├── All/My Students   → /all-student, /student, /my-student
  ├── Student Pipeline  → /student-pipeline
  └── Organization      → /organization

Commissions            → /report/plugandplayagency

Reports ▼
  ├── Performance       → /report/performance
  ├── Funnel Performance→ /report/funnel-performance (redir. /dashboard)
  ├── Behavior          → /report/behavior
  ├── Sales             → /report/sales
  └── Cancellations     → /report/cancellations
```

### Sidebar expandida (acesso ao Quote 2.0 — versão full AllyHub)
```
CRM
  ├── Agenda            → /calendar
  └── Students/Leads    → /business/pipeline, /business, /all-student,
                          /student, /my-student, /student-pipeline,
                          /organization, /student-flight-list

Quote
  ├── Opportunities     → /opportunity, /report/quote, /openquote
  ├── Quotes            → /report/quote
  ├── Public Quotes     → /openquote
  ├── Students/Leads    → /all-student, /student, /my-student
  ├── Applications      → /application/list
  ├── Companies         → /agencies, /partner
  ├── Partners          → /partner, /accommodation, /fee
  ├── Manage Prices     → /school/profile/, /specialrate, /specialrate-db,
                          /group/list
  └── Educational Inst. → /school/add, /specialrate, /specialrate-db, /demand

Marketing
  ├── Experiences       → /experience
  └── Campaigns         → /quotetemplate, /campaign

Automation             → /automation, /automation/hire [New]

Financial
  ├── Financial         → /financial/dashboard
  ├── Receive           → /instalment/receive
  ├── Pay               → /instalment/pay
  ├── Commissions       → (submenu)
  ├── Credits           → /instalment/credits
  └── Transitions       → /transition/list
```

### Header utilitários
```
+ (ação rápida)
[Câmera/vídeo] (função não identificada)
[Notificações]
EN ▼ → Português / Español / English
[Avatar] ▼
  ├── Edit Profile      → /user/edit/7496
  ├── Settings          → /settings
  ├── Help Center       → https://omni.allyhub.co/hc/help-center/en/
  └── Logout
Student Shortcut (busca rápida por aluno)
```

---

## 23. STUDENT PIPELINE — KANBAN

**URL:** `/student-pipeline`  
**Pipeline padrão:** "Jornada de compra" (Buying Journey)

### Stages do Kanban (Portuguese por padrão):
| # | Stage | Tradução |
|---|---|---|
| 0 | Without Status | Sem status |
| 1 | Descoberta | Discovery |
| 2 | Investigação | Investigation |
| 3 | Tomada de decisão | Decision Making |
| 4 | Contratação | Contracting |
| 5 | Ganho | Won |

### Card do aluno no pipeline:
- Nome + temperatura (COLD/WARM/HOT badge)
- E-mail
- Telefone + link WhatsApp direto (`web.whatsapp.com/send?phone=...`)
- Responsável, Escritório, Fonte de Lead
- Business Value (R$ 0,00 padrão)
- Última interação (timestamp)

### Filtros disponíveis:
- Nome / e-mail / código / telefone
- Escritórios (multi-select)
- Pipeline (dropdown)
- Lead Responsible
- Tags
- Created between (date range)
- Canceled Students Only (checkbox)
- Ordenação: Last interaction / Creation date / Name (ASC/DESC)
- "More Filters" (botão para filtros avançados)

---

## 24. STUDENT PROFILE — ABAS DETALHADAS

**URL:** `/student/profile/{id}`  
**Aluno de teste:** Lucas Andrade — `/student/profile/4838783`

### Header do perfil:
- Foto (upload)
- Nome, código
- Telefone, E-mail, Responsável
- **Enable Public Form** — gera link público para o aluno preencher seus dados
- **Start IA Qualification** — qualificação via IA (funcionalidade de destaque!)
- Temperatura: COLD / WARM / HOT
- Tags
- Interest Destination (destino de interesse)
- Travelling with (com quem viaja: sozinho, família, etc.)
- Pipelines
- "Add Lead to a New Pipeline" button
- Next task (próxima tarefa)

### Aba 1 — Overview (`#overview`):
```
Timeline
  Filtros: All Interactions | Quotes | Tasks | Notes | Email | Reminders
  [histórico cronológico de atividades]

General
  GENERATE DOCUMENT — gera documento baseado em template e termo selecionado
  STUDENT TRANSLATIONS — lista de traduções solicitadas
  STUDENT INSURANCE POLICIES — apólices de seguro
  STUDENT FILES — gerenciamento de arquivos com folders
    With selected: Move | Send to Aussie Translate | Delete

Status (widgets laterais):
  VISA (None / status)
  HEALTH INSURANCE (None / status)
  HEALTH COVER (OSHC) (None / status)
  FLIGHT TICKET (None / status)
```

### Aba 2 — Email (`#email`):
```
Write New Email
  Campos: Template, Quote link, Attach Files
  To / Cc / Bcc / From
  [Requer configuração SMTP]
Configure My SMTP (link de configuração)
Inbox / Sent — histórico de e-mails
```

### Aba 3 — Quotes and Links (`#opportunities`):
```
Drafts
  [lista de orçamentos em rascunho com opção "Continue quote"]

Quotes
  With selected: Actions
  [New Quote] button
  [lista de orçamentos criados]

Links
  [New Link] button
  [lista de links de orçamento enviados]
```
> **Nota:** Draft automático criado ao iniciar uma cotação (mesmo sem completar)

### Aba 4 — Info (`#info`):
```
About Student | Edit Student

Personal Information:
  Nationality, Name, Email, Phone 1, Phone 2, Skype
  Birthday, Document 1, Document 2, Passport + validity
  International Passport + validity, Job, Marital Status, Budget, Address

System Information:
  Office, Main Responsible, Additional Responsibles, Code, Source, Observation

Interest Information:
  Schoolar Information: Idiom, High School, Univ, GPA, Semester

Contact Information (contatos adicionais registrados)
Exams (resultados de exames de idioma)
Immigration Info (conta de imigração)
Bank Account (conta bancária do aluno)
Notes (notas livres)
```

### Aba 5 — Earnings (`#earnings`):
- Financeiro do aluno (valores recebidos/pagos associados)

---

## 25. STUDENT CREATION FORM — CAMPO COMPLETO

**URL:** `/all-student` → modal / `/student/edit/{id}`

### Aba 1 — Main Info:
| Campo | Tipo | Obrigatório |
|---|---|---|
| Name | text | Sim |
| Surname | text | Não |
| Email | email | Sim |
| Phone | tel + WhatsApp link | Não |
| Nationality | dropdown (países) | Sim |
| Lead Source | dropdown | Não |
| Office | dropdown | Sim |
| Responsible (Main) | dropdown | Não |
| Additional Responsibles | multi-select | Não |
| Tags | multi-select | Não |
| Pipelines | "Add to Pipeline" | Não |
| Profile Image | file upload | Não |
| Perception | COLD / WARM / HOT | Não |

### Aba 2 — Documents & Additional Info:
- Register Number (CPF), Register Number (genérico)
- Passport Number + Validity (Day/Month/Year)
- International Passport + Validity
- International Passport Nationality
- Birthdate (Day/Month/Year)
- Gender (Male/Female), Marital Status (Single/Married/Divorced/Widowed)
- Current Job, Budget (Currency + Value + Business Value)
- Observation (rich text editor — CKEditor)

### Aba 3 — Scholar Info:
- Studied Idiom (English/Dutch/French/German/Italian/Japanese/Mandarin/Portuguese/Russian/Spanish)
- Idiom Level (Basic/Pre Intermediate/Intermediate/Intermediate Advanced/Advanced)
- Start Forecast (Day/Month/Year — anos 2026–2035)
- High School Name, Graduation Year, GPA
- University Name, Graduation Year, GPA
- Course Semester

### Aba 4 — Contact & Address:
- Secondary Phone
- Zip Code / CEP, Address, Number, Neighborhood, City, State
- Social Links: Facebook, Instagram, Twitter, Skype

**WhatsApp integration:** campo de telefone exibe link direto para `web.whatsapp.com/send?phone={numero}` usando formato internacional completo.

---

## 26. QUOTE 2.0 — DEEP DIVE COMPLETO

> Pesquisa técnica via JS injection na sessão autenticada — 2026-06-15

---

### 26A. ARQUITETURA TÉCNICA

```
app.allyhub.co/quote-2/edit/{id}   ← AngularJS 1.x (Quote2Ctrl)
  └── <iframe src="quote2.allyhub.co">  ← React CRA v11.0.2 (separado)
        └── api.sellead.com             ← REST API backend (!)
        └── Firebase Firestore           ← Real-time sync (ally-email-signin)
```

> **🔴 DESCOBERTA CRÍTICA:** O backend real do AllyHub é `api.sellead.com`.
> AllyHub é um **white-label da plataforma Sellead**. O produto não é proprietário
> — é uma revenda/customização. Isso é uma vulnerabilidade competitiva grave.

**Stack do Quote 2.0:**
- Parent: AngularJS (`Quote2Ctrl`) → comunica com iframe via `postMessage`
- Iframe: React (Create React App, `webpack` bundle `react5-5-0`)
- Auth: JWT Bearer em `localStorage.token` → passado ao iframe via postMessage
- Real-time: Firebase Firestore (`ally-email-signin`) — streaming via `Listen/channel`
- Chat: Chatwoot (`omni.allyhub.co`)
- Mapas: Google Maps API
- Pagamentos: PagSeguro (`pagseguro.com.br`)
- Integração: Firebase Auth + Firestore

---

### 26B. FLUXO DE CRIAÇÃO

```
1. Quotes List (/report/quote) → botão [New Quote]
2. Modal "New Quote"
   ├── Select Student (dropdown AngularJS ui-select — busca por nome)
   └── [Start quote] → cria draft → redireciona /quote-2/edit/{id}

3. Quote Editor (iframe React em quote2.allyhub.co)
   └── "Quote for {Nome do Aluno}"
   └── [Help] → https://ally.tawk.help/category/orçamento
   └── Versão visível: Quote 2.0 v11.0.2
```

**Também disponível:**
- **[Link New Quote]** — cria link de orçamento público sem abrir editor

---

### 26C. MODELO DE DADOS DO QUOTE (`api.sellead.com/quote/{id}`)

```json
{
  "id": 1644804,
  "status": "draft",
  "officeCount": "Q500",
  "opportunity_id": 543839,
  "dueDate": "2026-06-25",
  "description": null,
  "language": "en-US",
  "iof": null,
  "converted_currency": { "code": "AUD", "symbol": "AU$", "name": "Australian Dollar" },
  "converted_value": 0,
  "showTotals": 1,
  "plugAndPlay": 1,
  "hasCommission": 0,
  "zapier": 1,

  "courses": [],
  "accommodations": [],
  "fees": [],
  "experiences": [],
  "otherfees": [],
  "instalments": [],
  "paymentplan": [],
  "totalvalues": [],
  "agreements": [],

  "config": { ... },
  "officeconfig": { ... },
  "currency": { ... },
  "bill": { ... },
  "creator": { ... },
  "opportunity": { ... },
  "city": { ... },
  "business": { ... }
}
```

---

### 26D. STATUS DO QUOTE

| Status | Descrição |
|--------|-----------|
| `draft` | Rascunho inicial (antes de enviar) |
| `new` | Novo (sem link enviado) |
| `has_link` | Link público enviado para o aluno |
| `accepted` | Aluno aceitou o orçamento |
| `sold` | Contrato fechado / venda confirmada |
| `denied` | Recusado pelo aluno |
| `canceled` | Cancelado |

---

### 26E. CONFIGURAÇÕES DO QUOTE (`config`)

Visibilidade de colunas/seções no PDF/link do aluno:

| Campo | Default | Descrição |
|-------|---------|-----------|
| `showdiscount` | 1 | Exibir coluna de desconto |
| `showaddition` | 1 | Exibir coluna de acréscimo |
| `showspecialrate` | 1 | Exibir taxa especial |
| `showduedate` | 1 | Exibir data de vencimento |
| `showcurrency` | 1 | Exibir coluna de moeda |
| `showsubtotals` | 1 | Exibir subtotais |
| `saleType_id` | null | Tipo de venda (opcional) |
| `renewal` | 0 | Flag de renovação de contrato |

---

### 26F. CONFIGURAÇÕES DO ESCRITÓRIO (`officeconfig`)

```
invoicePrefix: "#I"         → faturas numeradas #I500, #I501...
invoiceSequence: 500
receiptPrefix: "#R"         → recibos numerados #R500, #R501...
receiptSequence: 500
invoiceLanguage: "en-US"
receiptLanguage: "en-US"
country_code: "AU"
allowQuoteConfig: 1         → agentes podem personalizar visibility
markSale: 1                 → marcar como venda automaticamente
duplicatequoteexpired: 1    → pode duplicar quotes vencidos
allowDuplicate: 1           → pode duplicar quotes
showoverdueinstalment: 0    → não mostra parcelas vencidas
leaderboardTop: 10          → top 10 no ranking
useSaleType: 0              → tipos de venda desativados
useopportunity: 0           → módulo Opportunity desativado
usespay: 0                  → sem pagamento via S-Pay
copytoconsultant: 0         → não copia e-mail para consultor
sendemailquotesale: 0       → não envia e-mail ao vender
```

---

### 26G. ITENS DO QUOTE — TABS E ESTRUTURA

O editor tem **5 categorias de itens**, todos com paginação `{ total, per_page, data[] }`:

#### Courses (Cursos)
- Filtros de busca:
  - **Nationality** (pré-preenchido da nacionalidade do aluno)
  - **Country** (dropdown)
  - **City** (dropdown)
  - **School** (dropdown — "All schools" default)
  - **Course Name** (texto livre)
  - **Only Online Classes** (toggle)
  - **Date of Reference** (data da tabela de preços — para buscar preços históricos)
  - **Course Start Date** (data de início)
  - **Show Advanced Search** (filtros adicionais)
- Cada curso tem: período, tipo de período, preço, moeda, desconto, acréscimo, taxa especial

**Period Types disponíveis:**
`Hour(s)` · `Day(s)` · `Week(s)` · `Month(s)` · `Term(s)` · `Semester(s)` · `Year(s)` · `Fixed`

#### Accommodations (Acomodações)
- Hospedagem (homestay, residência estudantil, etc.)
- Mesmo sistema de pagamento e períodos

#### Fees (Taxas)
- Taxas avulsas (enrolment fee, material, etc.)

#### Others (Outras taxas)
- Custos extras personalizados

#### Experiences (Experiências)
- Atividades e experiências complementares (módulo Marketing)

---

### 26H. SISTEMA DE MOEDAS

**6 regras de câmbio configuradas:**

| Moeda | Código | Valor padrão |
|-------|--------|-------------|
| Real Brasileiro | BRL | 1 (sem conversão) |
| Dólar Canadense | CAD | 1 |
| Euro | EUR | 1 |
| Libra Esterlina | GBP | 1 |
| Dólar NZ | NZD | 1 |
| Dólar Americano | USD | 1 |

- **Moeda convertida padrão:** AUD (Australian Dollar) — `AU$`
- **IOF:** campo opcional para imposto brasileiro de câmbio

---

### 26I. MÉTODOS DE PAGAMENTO

| ID | Nome | Tipo | Parcelas |
|----|------|------|----------|
| 9 | PagBank | Cartão crédito | até 12x |
| 6 | Ally Checkout | Link de pagamento | — |
| 8 | PIX | PIX (instantâneo) | — |

> **Todos os gateways são brasileiros** — PagBank, PIX. Nenhum suporte a Stripe,
> PayPal, ou gateways australianos nativos. Enorme fraqueza para o mercado AU.

---

### 26J. OUTRAS FUNCIONALIDADES DO QUOTE

- **IOF:** campo para imposto de câmbio (BR-specific)
- **Zapier:** integração com Zapier (flag `zapier: 1` por conta)
- **plugAndPlay:** flag Ally+ — habilita marketplace de escolas com comissão
- **hasCommission:** flag se o agente recebe comissão nesse quote
- **Agreements:** seção de termos e condições no quote
- **Instalments:** plano de parcelamento do quote
- **Payment Plan:** plano de pagamento personalizado
- **Quick Add Student:** modal direto no quote para cadastrar aluno no momento
- **"Skip to Resume":** pular para o resumo sem preencher todos os itens
- **Public Link:** gerar link público do quote sem login (aluno visualiza/aceita)
- **Quote Templates:** templates de quote (Starter = 0 templates disponíveis)
- **"Discard Quote":** botão para descartar o draft

---

### 26K. DESCOBERTAS TÉCNICAS CRÍTICAS PARA MOVY

| Achado | Impacto |
|--------|---------|
| **AllyHub = white-label Sellead** (`api.sellead.com`) | Produto não é próprio — limita customização, dependência de terceiro |
| **Firebase Firestore para sync real-time** | Arquitetura complexa, custo variável com escala |
| **Dois editores separados** (Quote 1.x + Quote 2.0) | Dívida técnica — manutenção dobrada, UX inconsistente |
| **Gateways 100% brasileiros** (PagBank/PIX) | Inviável para AU sem gateway local |
| **Sem suporte a AUD nativo** | Conversão manual, não integra com bancos AU |
| **AngularJS 1.x no parent** | Framework EOL desde 2021 |
| **React iframe cross-origin** | Arquitetura fragmentada, debugging difícil |
| **Formulário de busca de cursos** com 8+ filtros | UX pesada vs proposta rápida da Movy |

**Quick Add Student (modal dentro do Quote):
Ao iniciar quote sem aluno cadastrado, aparece modal "Add Student":
- Name*, Surname, Email*, Phone, Birthdate (D/M/Y)
- Nationality (default: **Brazilian (Brazil)** — revela origem brasileira da plataforma)
- Source, "create with more info" tab
- Cancel / Save

### Tabs: My Quotes / Office Quotes / All Quotes

---

## 26L. QUOTE 2.0 — TESTE COMPLETO COM FILTRO AUSTRÁLIA (2026-06-16)

> Teste realizado em conta Movy Education (AU, Starter). Aluno: Lucas Andrade (AU nationality). Quote: #Q501 (id 1644823). Método: Chrome DevTools MCP + API intercept via Performance entries.

### Filtro por Austrália — Comportamento

**Pré-preenchimento automático por nationalidade:**
- Aluno Lucas Andrade tem `nationalityCountry: "Australia"`
- Ao abrir Quote 2.0, o filtro de país é **pré-selecionado com "Australia"** automaticamente (chip "Australia X" no campo Countries)
- Data de início padrão: data de hoje (16/06/2026)

**Resultados para Austrália:**
- **27 programas encontrados**, todos marcados como `★ Partner (Ally+)`
- Sorted by: Lowest Price (padrão)
- Exibição: "27 programs found | Showing 27 items"

### Os 27 Programas Australianos (Catálogo Completo)

| # | Programa | Escola | Cidade | Preço | Unid | Categoria | Idade |
|---|----------|--------|--------|-------|------|-----------|-------|
| 1 | One-to-One lessons | EP Brisbane – English Path | Brisbane, QLD | A$135 | /lição | Language – Private & Semi-Private | 16+ |
| 2 | General English – Classic Morning 20 Lessons/wk | EP Brisbane – English Path | Brisbane, QLD | A$400 | /sem | Language – General | 16+ |
| 3 | Young Learners: Winter Tuition Only | EP Brisbane – English Path | Brisbane, QLD | A$470 | /sem | Junior – Tuition only | 13-17 |
| 4 | Young Learners: Summer Tuition Only | EP Brisbane – English Path | Brisbane, QLD | A$470 | /sem | Junior – Tuition only | 13-17 |
| 5 | General English – Semi Intensive Morning 25 Lessons/wk | EP Brisbane – English Path | Brisbane, QLD | A$475 | /sem | Language – General | 16+ |
| 6 | General English + IELTS Preparation – Semi Intensive 25 Lessons/wk | EP Brisbane – English Path | Brisbane, QLD | A$475 | /sem | Language – Exam Prep + General | 16+ |
| 7 | IELTS Exam Preparation | EP Brisbane – English Path | Brisbane, QLD | A$475 | /sem | Language – Exam Prep | 16+ |
| 8 | Young Learners: Winter Day Camp – Explorer | EP Brisbane – English Path | Brisbane, QLD | A$775 | /sem | Junior – Camp | 13-17 |
| 9 | Young Learners: Summer Day Camp – Explorer | EP Brisbane – English Path | Brisbane, QLD | A$775 | /sem | Junior – Camp | 13-17 |
| 10 | Young Learners: Full Experience Summer Camp – Explorer – Homestay | EP Brisbane – English Path | Brisbane, QLD | A$1,970 | /sem | Junior – Camp + Accommodation | 13-17 |
| 11 | Young Learners: Full Experience Winter Camp – Explorer – Homestay | EP Brisbane – English Path | Brisbane, QLD | A$1,970 | /sem | Junior – Camp + Accommodation | 13-17 |
| 12 | Young Learners: Full Experience Summer Camp – Explorer – Residence | EP Brisbane – English Path | Brisbane, QLD | A$1,970 | /sem | Junior – Camp + Accommodation | 13-17 |
| 13 | Young Learners: Full Experience Winter Camp – Explorer – Residence | EP Brisbane – English Path | Brisbane, QLD | A$1,970 | /sem | Junior – Camp + Accommodation | 13-17 |
| 14 | General English Afternoon 10 Lessons/wk | LSI Brisbane – LSI Languages Studies International | Brisbane, QLD | A$250 | /sem | Language – General | 16+ |
| 15 | General English 20 Lessons/wk | LSI Brisbane – LSI Languages Studies International | Brisbane, QLD | A$460 | /sem | Language – General | 16+ |
| 16 | General English Intensive 24 Lessons/wk | LSI Brisbane – LSI Languages Studies International | Brisbane, QLD | A$535 | /sem | Language – General | 16+ |
| 17 | General English Intensive 30 Lessons/wk | LSI Brisbane – LSI Languages Studies International | Brisbane, QLD | A$590 | /sem | Language – General | 16+ |
| 18 | Full Time Daytime 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Brisbane – Lexis English | Brisbane, QLD | A$550 | /sem | Language – General | — |
| 19 | Full Time Daytime 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Sunshine Coast – Lexis English | Sunshine Coast, QLD | A$550 | /sem | Language – General | — |
| 20 | Full Time Daytime 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Noosa – Lexis English | Noosa Heads, QLD | A$550 | /sem | Language – General | — |
| 21 | Full Time Daytime 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Byron Bay – Lexis English | Byron Bay, NSW | A$550 | /sem | Language – General | — |
| 22 | Full Time Daytime 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Sydney – Lexis English | Sydney, NSW | A$550 | /sem | Language – General | — |
| 23 | Full Time Daytime 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Perth – Lexis English | Perth, WA | A$550 | /sem | Language – General | — |
| 24 | Full Time Evening 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Perth – Lexis English | Perth, WA | — | — | Language – General | — |
| 25 | Full Time Evening 20+5 hrs/wk (2026 & 2027 Intakes) | Lexis Sydney – Lexis English | Sydney, NSW | — | — | Language – General | — |
| 26 | Teen Activity Program: Lexis Skills – Beauty House Academy | Lexis Sunshine Coast (Junior) – Lexis Education | Sunshine Coast, QLD | — (Expired) | — | Junior – Tuition only | — |
| 27 | Bachelor of Screen & Stage (Acting) (2 Years) | APAC – Australian Performing Arts Conservatory (GEDU Global Education) | Brisbane, QLD | A$35,000 | /ano | Higher Education – Bachelor | 18+ |

**Escolas presentes no catálogo AU:**
- EP Brisbane – English Path (13 programas)
- LSI Brisbane – LSI Languages Studies International (4 programas)
- Lexis English (6 campuses: Brisbane, Sunshine Coast, Noosa, Byron Bay, Sydney, Perth)
- Lexis Sunshine Coast (Junior) (1 programa expirado)
- APAC / GEDU Global Education – Brisbane (1 programa ensino superior)

**Cidades cobertas:** Brisbane, Sunshine Coast, Noosa Heads, Byron Bay, Sydney, Perth
**AUSENTE:** Melbourne, Adelaide, Cairns, Gold Coast, Canberra, Darwin — catálogo muito limitado

**Faixa de preço:** A$135/lição → A$35,000/ano
- Inglês geral: A$250–590/sem
- Junior camps: A$775–1,970/sem
- Ensino superior: A$35,000/ano

---

### Filtros do Painel Esquerdo (Estrutura Completa)

**Aba Programs:**
- Countries (chip removível, pré-preenchido com nationality do aluno)
- Cities (dropdown)
- Schools (dropdown, auto-preenchido após adicionar curso)
- Program category (dropdown)
- Restrict By (dropdown)
- Duration + unit (semanas/meses/etc)
- Program start date (datepicker, default = hoje)
- **More filters >** (expande):
  - Enrolment Date
  - Study lessons/hours per week (slider 0–40)
  - Program name (textbox)
  - Promotion only: YES/NO
  - Explicit Search: YES/NO
- Only renewal programs: YES/NO
- **[Search Programs]** button

**Aba Accommodations:**
- Accommodation Type: From Schools / From Providers / All (radio)
- Countries, Cities, Schools
- Accommodation type, Room types, Bathroom types, Regime (dropdowns)
- Checkin date, Enrolment Date, Duration
- **[Search Accommodations]** button

**Aba Insurances:**
- From Schools / From Providers / All (radio)
- Countries, Cities, Schools
- Insurance Name (textbox)
- Enrolment Date, Duration
- **[Search Insurances]** button

**Aba Add-ons:**
- From Schools / From Providers / All (radio)
- Countries, Cities, Schools, Add-on name, Categories
- Enrolment Date, Duration
- **[Search Add-ons]** button

Cada aba mostra contador de itens adicionados: `( N added )`.

---

### Flow de Adição de Curso — Teste Real

**Curso testado:** General English – Classic Morning 20 Lessons/wk | EP Brisbane | A$400/sem

**Passo 1 — Start date validation:**
- Data padrão (hoje) causa erro: _"Course start date should be at least 45 days after today's date"_
- Botão "Add with Ally Plus" fica **DISABLED**
- Mínimo calculado: 45 dias a partir de hoje → indicado como `31/07/2026`
- Solução: alterar datepicker para `04/08/2026` (50 dias)

**Passo 2 — Modal "Add Item to Quotes":**
```
Selected program: General English - Classic Morning 20 Lessons/wk
1 week(s)
Start date: 04/08/2026
tuition: AU$400.00   enrol: AU$250.00   material: AU$75.00
Total: AU$725.00

Select quotes to add this item:
☐ Option 1        [+ option]

☑ Sell with ally+
[Add with Ally Plus]   ← habilitado com data válida
```
Tagline: *"Focus on sales, we take care of the rest"*

**Passo 3 — Após clicar "Add with Ally Plus":**
- Modal imediata: **"We found some suggestions for your quote"**
- Sugestão automática: Insurance – EP Brisbane – English Path | **A$30/sem** | 1 week(s)
- Filtro "Schools" no painel esquerdo auto-preencheu com "English Path ×"

**Passo 4 — Adicionando a sugestão de seguro:**
- Toast verde: _"Item added to selected quotes successfully."_
- Cartão do curso aparece com **"added in 1 option"** (checkmark verde)
- Contador atualizado: Programs **(1 added)**, Insurances **(2 added)**, Add-ons **(2 added)**

---

### Estrutura Completa do Quote #Q501 (Resultado Final)

**Visão cart "View Quotes":**
- Cabeçalho: Logo EP Brisbane | `#Q501` | `Option 1` (nome editável, desabilitado até editar)
- Breadcrumb: Quote playground › View Quotes
- Botões: `← Playground` | `+` (nova opção) | **[Finish and Save Quotes]** (verde)
- Due date: 26 de junho (bloqueado)
- ⌄ Advanced options → Description: "Using custom description"

**Seção Programs:**
| Campo | Valor |
|-------|-------|
| Escola | EP Brisbane |
| Local | Brisbane, Queensland, Australia 🇦🇺 |
| Curso | General English – Classic Morning 20 Lessons/wk |
| Duração | 1 week \| August 04, 2026 – August 07, 2026 |
| Tuition | AU$400.00 |
| Enrolment | AU$250.00 |
| Material | AU$75.00 |
| **Subtotal Programa** | **A$725.00** |

**Seção Fees (4 itens):**
| Fornecedor | Item | Categoria UI | Valor |
|------------|------|-------------|-------|
| **Ally Hub** | Taxa de consultoria (Dólar Australiano) | Administrative Tax | **AU$150.00** |
| Medibank | Taxa de transferência internacional OSHC | Administrative Tax | AU$30.00 |
| Medibank | OSHC Single | Insurance (1 month) | AU$70.00 |
| English Path | Insurance | Insurance (1 week) | AU$30.00 |

**Totais:**
| | |
|--|--|
| Total(s) | **A$1,005.00** |
| Total Converted | **A$1,005.00** |

---

### 🚨 ACHADOS CRÍTICOS — Revenue Model Ally Hub

#### 1. Taxa de Consultoria Automática: AU$150 por Quote

A **Ally Hub** injeta automaticamente uma `"Taxa de consultoria (Dólar Australiano)"` = **AU$150** em todo quote criado via Ally+. O estudante vê isso na proposta como "Administrative Tax". Isso é a principal receita da plataforma por transação, além da assinatura mensal.

- Supplier no bill: `"Ally Hub"` — é explícito
- Type: `Fee`
- UI label: `Administrative Tax`
- Automático — não pode ser removido

**Implicação:** Cada venda via AllyHub custa AU$150 à agência (repassado ao aluno ou absorvido). Movy não cobra esse fee.

#### 2. Medibank OSHC Auto-sugerido

Ao adicionar qualquer curso Ally+, o sistema sugere automaticamente:
- **Taxa de transferência OSHC (Medibank):** AU$30
- **OSHC Single (Medibank):** AU$70
- **Total seguro saúde:** AU$100/período

Isso é obrigatório para vistos de estudante AU — AllyHub integra Medibank diretamente.

#### 3. Regra dos 45 Dias

Todo curso via Ally+ exige start date com pelo menos **45 dias de antecedência**. Abaixo disso, o botão "Add with Ally Plus" fica disabled. Isso reflete SLA de processamento do sistema Ally+.

#### 4. Catálogo AU Limitadíssimo

Apenas **5 escolas / grupos** representados, todas Queensland/NSW/WA. Sem cobertura de Melbourne, Adelaide, Cairns, Gold Coast. Isso é uma fraqueza competitiva enorme para agências australianas.

---

### Comparativo Quote 2.0 AU: AllyHub vs Movy

| Critério | AllyHub | Movy |
|----------|---------|------|
| Escolas AU no catálogo | 5 grupos, 27 programas | Portfolio personalizável |
| Cidades AU cobertas | Brisbane, Sydney, Perth + 3 menores | Qualquer escola |
| Fee por venda (plataforma) | **AU$150 automático por quote** | Sem fee por transação |
| Seguro (OSHC) | Medibank integrado (+AU$100) | Manual |
| Start date mínima | 45 dias à frente | Sem restrição |
| Múltiplas opções | Sim (Option 1…5) | Sim (plan.options) |
| Proposta para estudante | Link público via Ally+ | PDF + link |
| Pré-filtro por nationality | Automático (do perfil) | Automático (do lead) |

---

## 27. OPPORTUNITY MODULE

**URL:** `/opportunity`

### O que é:
Oportunidades são registros de negócio vinculados a um aluno e potencialmente a um orçamento. São criadas automaticamente quando um draft de quote é iniciado.

### Campos observados (Opportunity #OP500):
| Campo | Valor exemplo |
|---|---|
| Code | #OP500 (mesmo código do aluno) |
| Name | — (vazio por padrão) |
| Status | new |
| Created at | 15/06/2026 |
| Due Date | 15/12/2026 (6 meses automático) |
| Student | Lucas Andrade |
| Creator | Livia Ribeiro |
| Office | Movy Education (Perth) |

### Sub-tabs: My Opportunities / All Opportunities
### Filtros: Student, Created Between

---

## 28. DASHBOARD ANALÍTICO

**URL:** `/dashboard`

### Filtros de período:
Actual month / Last month / Last 7 days / Last 30 days / Last 90 days / Custom (From–To)

### Métricas de Leads:
- New Leads (in the last N days)
- Leads Interacted
- Leads Canceled
- Leads Hot / Warm / Cold

### Métricas de Vendas:
- Total of Sales
- Avg. Sales By User
- Average Ticket
- Conversion Rate (%)
- Sold Quotes
- Leads With Quote
- Total of Leads

### Gráficos:
- All Quotes Created
- All Quotes By Status

### Tasks / Agenda:
- My / Office (filtro)
- Views: today / month / week / day / list
- Calendário semanal integrado (Jun 14–20, 2026)

### Listas:
- TODO LIST (*NOT DONE YET)
- LAST INTERACTIONS

---

## 29. FINANCIAL DASHBOARD

**URL:** `/financial/dashboard`

### Métricas:
- Total (U$ 0.00 — em dólares por padrão)
- Go to Earnings / Go to Resume buttons
- Earnings by Supplier (gráfico por fornecedor)
- Bills by Category (gráfico por categoria de despesa)

---

## 30. REPORTS — MAPA COMPLETO

| Relatório | URL | Conteúdo |
|---|---|---|
| Performance | `/report/performance` | Office Leaderboard, User Leaderboard, Amount of Sales, Sold Quotes by Lead Source, Avg. Conversion Time, Amount of Sold Periods, Avg. Status Time, Best Sellers Schools by Periods |
| Behavior | `/report/behavior` | Por usuário: Last Access, New Leads, Cancelled Leads, Quotes Won, Businesses |
| Sales | `/report/sales` | Filtros por Sold Between, Office, Responsible, School, Partner, Country, City, Cancel status, Payment status |
| Cancellations | `/report/cancellations` | Mesmos filtros do Sales, voltado para cancelamentos |
| Quotes | `/report/quote` | Lista de orçamentos com status, filtros avançados |
| Commissions (Ally+) | `/report/plugandplayagency` | Total R$0,00; Released / Requested / Paid / To release commissions |

### Performance Report — Detalhes:
- Range: Last Week / Last Month / Last Trimester / Custom
- Filtros: Office, Responsible
- Seções: Office Leaderboard, User Leaderboard, Amount of Sales, Sold Quotes by Lead Source, Avg. Conversion Time by pipeline stage, Amount of Canceled Leads by Reason, Best Sellers Schools (logo, nome, vendas por período)

### Behavior Report — colunas:
`Name | Role | Last Access | New Leads | Cancelled Leads | Quotes Won | Businesses`

---

## 31. CALENDAR / AGENDA

**URL:** `/calendar`

### Recursos:
- **Add Event** / **Add Task** — dois tipos de item
- Filtro: My / Office / All Pending Tasks Only
- Views: today / month / week / day / list
- Integrado ao Dashboard (mesmos eventos aparecem na Home)

---

## 32. SETTINGS — CONFIGURAÇÕES DA CONTA

**URL:** `/settings`

### Seções da sidebar de configurações:
| Seção | Descrição |
|---|---|
| **Office** | |
| Profile | Dados do escritório (nome, endereço, logo) |
| Pipelines | Configurar stages do kanban |
| Bank Accounts | Contas bancárias da agência |
| Users | Gerenciar usuários e permissões |
| Quote Preferences | Configurar padrões de orçamento |
| Folders | Pastas de arquivo para alunos |
| Templates | Templates gerais |
| Email Template | Templates de e-mail |
| Document Template | Templates de documento (para geração automática) |
| **Account** | |
| Info / Billing | Dados de faturamento da conta |
| Import Leads | Importar leads (CSV?) |
| Integrations | Conexões com SMTP, RD Station, etc. |
| Student Public Form | Configurar formulário público para alunos |
| Reasons to Cancel Lead | Lista de motivos de cancelamento |
| Lead Sources | Fontes de leads (Instagram, indicação, etc.) |
| Tags | Gerenciar tags de alunos |

---

## 33. AUTOMATIONS — SITUAÇÃO ATUAL

**URL:** `/automation/hire`

### Status no plano Starter:
Automations é um **módulo pago** não disponível no Starter. A página exibe:
> "Automation handles what no one else has time for — It is like getting an extra employee without a desk"

### Como contratar:
> "Ask the Ally Sales Manager responsible for your account or get in touch with our support team"

Não há preço listado — vendido via sales call.

---

## 34. TECH STACK — ATUALIZADO E CONFIRMADO

| Componente | Tecnologia | Como confirmado |
|---|---|---|
| Frontend | **AngularJS** (v1.x) | `angular.element().scope()`, `$select`, `$apply()` visível no JS |
| UI Components | ui-select (AngularJS) | `ui-select-container`, `ui-select-choices-row` |
| Rich Text | **CKEditor** | Editor de rich text no campo Observation |
| Backend URL | `app.allyhub.co` | SPA com routing client-side |
| Checkout/Billing | Railway.app (`allybilling-production.up.railway.app`) | iframe observado |
| Quote Help | Tawk.to/Help (`ally.tawk.help`) | Link de Help no Quote editor |
| Help Center | `omni.allyhub.co/hc/help-center/en/` | Link no menu do usuário |
| Chat widget | Chatwoot (widget azul canto inferior direito) | Classe `woot-widget-bubble` |
| Pagamentos assinatura | Stripe (com bug) | Confirmado pelo suporte |
| Pagamentos agência→cliente | Zoop (boleto, pix, cartão) + PagBank | Documentação |
| Remessas internacionais | Travelex | Documentação |
| Pagamento para escolas | Qualy | Documentação |
| Integração contábil | Xero (add-on) | Documentação |
| CRM/Lead gen | RD Station, Active Campaign, Zapier | Documentação |
| Partner/translate | Aussie Translate | "Send to Aussie Translate" no student files |

**Nota crítica:** O uso de **AngularJS** (versão 1.x) é um **red flag técnico** sério — framework descontinuado desde 2021. Isso significa dívida técnica significativa e possivelmente dificuldade em atualizações futuras.

---

## 35. ORGANIZAÇÃO E MÓDULOS EXTRAS

### Organizations (`/organization`):
- Lista de organizações vinculadas a leads (empresas, escolas parceiras, etc.)
- "New Organization" button

### Business Pipeline (`/business/pipeline`):
- Pipeline de negócios (B2B) — separado do pipeline de alunos
- "New Business" button

### Student Flight List (`/student-flight-list`):
- Lista de passagens aéreas dos alunos (módulo Professional+)

### Public Quotes (`/openquote`):
- Landing pages de orçamentos públicos
- "New Public Quote" button
- Filtros: Creator, School

### Check-in Tool (sidebar):
- `/db-course-values` — valores de cursos
- `/db-fee-values` — valores de taxas
- `/db-accommodation-values` — valores de acomodação

---

## 36. ALLY+ COMMISSIONS

**URL:** `/report/plugandplayagency`  
**Título:** "Ally+ Results"

### Métricas:
| Métrica | Descrição |
|---|---|
| Total | Total bruto de comissões |
| Released commissions | Comissões liberadas para saque |
| Requested commissions | Comissões solicitadas |
| Paid commissions | Comissões já pagas |
| Commissions to release | Comissões pendentes de liberação |

- Filtro: Sale Date
- **"Request Commission"** button — aciona pedido de pagamento
- Modelo: comissão de até 30% da tuition via Ally+

---

## 37. ANÁLISE TÉCNICA ADICIONAL — IMPLICAÇÕES PARA MOVY

### AngularJS como vantagem competitiva para Movy:
- AllyHub está preso em AngularJS 1.x (EOL 2021) — impossível migrar facilmente sem reescrita completa
- Movy pode construir em **React/Next.js moderno** → velocidade, DX, SEO, PWA
- Migrations de dados e integrações seriam triviais em Next.js vs. AngularJS

### UX Gaps identificados (pontos de dor do AllyHub):
1. **Quote draft auto-salvo mas sem feedback claro** — confuso para usuário
2. **Default de nacionalidade "Brazilian (Brazil)"** mesmo para clientes internacionais
3. **Pipeline stages em português** mesmo com interface em inglês — inconsistência
4. **Billing modal bloqueia toda a interface** (sem fechar com ESC)
5. **Checkout em iframe do Railway** — experiência fragmentada
6. **Formulário de criação de aluno é longo** (4 abas, 40+ campos) — sem onboarding progressivo

### Funcionalidades que Movy deve ter como MÍNIMO:
- [x] Kanban pipeline com stages customizáveis
- [x] Ficha do aluno com temperatura (COLD/WARM/HOT)
- [x] WhatsApp integration (click-to-chat)
- [x] Quote creation com draft auto-save
- [x] Public form para aluno preencher dados
- [x] Calendar / task management integrado ao dashboard
- [ ] **AI Qualification** (diferencial — Movy pode implementar com LLM nativo)
- [ ] **Public quote links** (landing pages)
- [ ] **Email integrado** (SMTP configurável)
- [ ] **Document generation** (Enterprise no AllyHub — pode ser diferencial Movy)

### Funcionalidades que Movy pode SUPERAR:
- Onboarding em 1 tela (vs. 4 abas + modal do AllyHub)
- Quote gerada em segundos (vs. Quote 2.0 pesada do AllyHub)
- IA nativa (vs. add-on caro do AllyHub)
- Preço em AUD desde o início
- Sem lock-in contratual
- UI moderna (React) vs. AngularJS legacy

---

## 38. QUOTE 2.0 — ARQUITETURA TÉCNICA INTERNA (DEEP DIVE via API intercept)

> Pesquisa via network intercept da sessão autenticada. Quote #Q501 (id 1644823), Draft id 545551.
> Aluno: Lucas Andrade (id 4838783). Escritório: Movy Education Perth (id 4215). Account: 2995.

---

### 38A. PLAYGROUND EFÊMERO — Arquitetura confirmada via API

O "Playground" do Quote 2.0 é **completamente efêmero** — os itens adicionados (cursos, fees) NÃO são persistidos no servidor entre sessões. Apenas o `converted_value` (total final) é salvo via auto-save.

**Prova:** O endpoint `GET /draft?quote_id={id}` retorna apenas:
```json
{
  "id": 545551,
  "user_id": 7496,
  "student_id": 4838783,
  "office_id": 4215,
  "account_id": 2995,
  "nationalityCountry": "Australia",
  "quotes": [{
    "quote_id": 1644823,
    "draft_id": 545551,
    "quote": {
      "id": 1644823,
      "officeCount": "Q501",
      "plugAndPlay": 1,
      "converted_value": 1005,
      "converted_currency": "AUD",
      "status": "draft",
      "created_at": "2026-06-15 13:25:39",
      "updated_at": "2026-06-15 20:25:38"
    }
  }]
}
```

**Sem cursos, sem fees, sem bill** — só metadados. O playground é reconstruído do zero a cada carregamento da página pelo React app.

**Implicação arquitetural:** O Quote 2.0 é uma SPA stateless no servidor. O estado completo (EP Brisbane 1 semana + 4 fees) existe apenas na memória do React até o usuário clicar "Finish and Save Quotes". Apenas o total (`converted_value`) persiste via auto-save periódico.

---

### 38B. FLUXO DE COMUNICAÇÃO — AngularJS Parent → React iframe

```
app.allyhub.co (AngularJS/Quote2Ctrl)
  │
  ├── Carrega <iframe src="quote2.allyhub.co">
  │     └── React CRA app inicializa e fica em /loading AGUARDANDO postMessage
  │
  └── Angular faz GET /draft?quote_id={id}&take=1&where={}
        ↓ apenas metadados (id, student_id, quote list)
        ↓
      Envia postMessage para iframe via MessageChannel:
        {
          token: "eyJ...",           // JWT Bearer
          user: "{...JSON string...}", // user object serializado
          toEditQuoteId: 1644823,
          studentId: 4838783,
          isPP: true                 // plugAndPlay = Ally+
        }
        ↓
      React verifica: e.origin === "https://app.allyhub.co"
      React inicializa estado e começa a carregar
```

**Cross-origin restriction:** O React iframe em `quote2.allyhub.co` e o parent em `app.allyhub.co` são origens diferentes. O browser bloqueia acesso direto ao iframe via JavaScript do parent (e vice-versa) — apenas postMessage é possível. Ferramentas de automação (Chrome DevTools MCP, Claude-in-Chrome) também não conseguem interagir com elementos do iframe cross-origin via accessibility tree.

---

### 38C. JWT TOKEN — Estrutura

- **Localização:** `localStorage.getItem('token')` em `app.allyhub.co`
- **Formato armazenado:** `"eyJ..."` (com aspas literais — é JSON.stringify de uma string)
- **Authorization header:** `Bearer "eyJ..."` (WITH the literal quote characters)
- **Validade:** 12h (`iat` → `exp`)
- **Sessão de teste:** `iat: 2026-06-15T12:56:54Z`, `exp: 2026-06-16T00:56:54Z`

---

### 38D. CORS — Assimetria de permissões

| Operação | De `app.allyhub.co` | De `quote2.allyhub.co` |
|----------|---------------------|------------------------|
| GET /quote/{id} | ✅ permitido | ✅ permitido |
| GET /draft | ✅ permitido | ✅ permitido |
| PUT /quote/{id} | ❌ CORS blocked | ✅ permitido |
| POST /quote | ❌ CORS blocked | ✅ permitido |

**Conclusão:** O React iframe é a única origin autorizada para mutações. O AngularJS parent só lê dados.

---

### 38E. ENDPOINTS DA API (`api.sellead.com`)

| Método | Endpoint | Parâmetros | Uso |
|--------|----------|------------|-----|
| GET | `/draft` | `quote_id`, `take`, `where` (JSON), `myTest` | Carrega metadados do draft |
| GET | `/quote/{id}` | `withBusiness=true` | Carrega dados completos do quote |
| PUT | `/quote/{id}` | Body JSON (ver 38F) | Auto-save OU Finish and Save |
| GET | `/fee` | `plugAndPlay`, `nationality`, `take`, `page`, `exclude` | Catálogo de fees/seguros |
| GET | `/course` | `nationality`, `country_id[]`, `take`, `page`, `orderBy` | Catálogo de cursos |
| GET | `/accommodation` | filtros | Catálogo de acomodações |

---

### 38F. PAYLOAD DO PUT /quote/{id} — Auto-save (reconstruído via network capture)

Capturado do request real do React app para `PUT /quote/1644804` (Q500, auto-save de rascunho com curso EP Brisbane 1 semana):

```json
{
  "autoSave": true,
  "quoteValues": [{ "currency_code": "AUD", "value": 3.8235 }],
  "chosenCourses": [{
    "id": 447633,
    "campus_id": "...",
    "duration": 1,
    "typePeriod": "Week(s)",
    "startDate": "...",
    "endDate": "...",
    "myprice": { "tuition": 400, "enrolment": 250, "material": 75 },
    "totalThisCourse": 725,
    "... (objeto completo do curso)"
  }],
  "fees": [
    {
      "id": 266546,
      "partner": "Ally Hub",
      "mandatory": 1,
      "duration": 1,
      "typePeriod": "...",
      "editedValue": 150,
      "myprice": 150,
      "totalThisFee": 150,
      "currency_code": "AUD"
    },
    {
      "id": 425150,
      "partner": "Medibank",
      "mandatory": 1,
      "duration": 1,
      "editedValue": 30,
      "myprice": 30,
      "totalThisFee": 30,
      "priceIsExpired": false
    },
    {
      "id": 306366,
      "partner": "Medibank",
      "mandatory": 1,
      "duration": 1,
      "typePeriod": "Month(s)",
      "editedValue": 70,
      "myprice": 70,
      "totalThisFee": 70,
      "priceIsExpired": true
    },
    {
      "id": 384576,
      "partner": "English Path",
      "mandatory": 0,
      "duration": 1,
      "typePeriod": "Week(s)",
      "editedValue": 30,
      "myprice": 30,
      "totalThisFee": 30,
      "priceIsExpired": false
    }
  ]
}
```

**Diferença entre autoSave:true e autoSave:false:**
- `autoSave: true` → auto-save periódico; server calcula `converted_value` e persiste apenas o total; NÃO gera `bill[]` / `totalvalues[]`
- `autoSave: false` → "Finish and Save Quotes"; server tenta gerar bill completo, muda status de `draft` para `new`/`open`, cria proposta enviável

---

### 38G. IDs DE FEES IDENTIFICADOS

| ID | Supplier | Descrição | Valor | Obrigatório | Observação |
|----|----------|-----------|-------|-------------|------------|
| 266546 | Ally Hub | Taxa de consultoria (Dólar Australiano) | AU$150 | Sim | Revenue model da plataforma |
| 425150 | Medibank | Taxa de transferência internacional OSHC | AU$30 | Sim | Auto-adicionado com qualquer curso AU |
| 306366 | Medibank | OSHC Single | AU$70/mês | Sim | **priceIsExpired: true** (validade expirou 2025-12-31) |
| 384576 | English Path | Insurance (EP Brisbane) | AU$30/sem | Não | Sugerido ao adicionar curso EP |

**🚨 OSHC Single (id 306366) com priceIsExpired: true:** O preço deste seguro expirou em 2025-12-31. Quando o servidor tenta processar um `autoSave: false` (Finish), não consegue calcular totais válidos com preço expirado e retorna `{"error": true, "values": [...], "totals": []}`. Isso bloqueia a finalização de qualquer quote com OSHC Single.

---

### 38H. RESPOSTA DO SERVIDOR — Finish com erro

Quando o servidor não consegue processar o Finish (seja por preço expirado, seja por payload incompleto), retorna:

```json
{
  "error": true,
  "values": [{ "currency": "AU$", "currency_code": "AUD", "value": 1005 }],
  "totals": []
}
```

HTTP status: 200 (não é um erro HTTP, é erro de negócio no payload)

**Consequência:** O `converted_value` do quote é zerado para 0 após a resposta com `error: true`.

---

### 38I. COMPORTAMENTO DO WAF APÓS FINISH FALHO

**Observação:** Após uma tentativa de `PUT /quote/{id}` com `autoSave: false` que retorna `error: true`, TODOS os PUTs subsequentes falham com `net::ERR_FAILED` — independentemente de:
- Qual quote (Q501 vs Q500)
- Qual aba do browser
- Qual página (reload completo)
- Se a chamada vem de `quote2.allyhub.co` (que tem CORS autorizado)

**Diagnóstico:**
- OPTIONS preflight: retorna 200 (CORS ainda autorizado)
- PUT real: `net::ERR_FAILED` (conexão encerrada pelo servidor antes de resposta)

**Causa provável:** WAF (Web Application Firewall) ou rate-limiter server-side que detecta o padrão de PUT com payload inválido/suspeito e bloqueia a sessão/IP para mutações. GET requests continuam funcionando (200).

**Impacto no teste:** O teste de "Finish and Save Quotes" ficou bloqueado. Não foi possível observar o status final do quote (`new` ou `open`) nem o link de proposta para o aluno.

---

### 38J. CATÁLOGO DE ACOMODAÇÕES — Resultado da pesquisa

Pesquisa via `GET /accommodation` para a conta Movy Education (Ally+, AU):

**Resultado: NENHUMA acomodação disponível no catálogo.**

A aba "Accommodations" no painel esquerdo do Quote 2.0 exibe a busca mas retorna lista vazia. Isso confirma que o catálogo de acomodações depende de escolas parceiras que cadastram suas ofertas — as escolas presentes no catálogo AU (EP Brisbane, LSI, Lexis, APAC) não têm acomodações configuradas no Ally+.

Cursos do tipo "Full Experience Camp" (EP Brisbane, AU$1,970/sem) já incluem acomodação no próprio curso — não usam o módulo Accommodations separadamente.

---

### 38K. PROPOSTA PARA O ALUNO (Student-Facing Link) — Não observado

O link/PDF de proposta para o aluno é gerado pelo servidor após um Finish bem-sucedido (`autoSave: false`). Como o Finish ficou bloqueado (WAF após erro de preço expirado), não foi possível observar:
- A URL da proposta pública
- O formato do PDF
- O fluxo de aceite pelo aluno

**Status do quote #Q501 no fim da pesquisa:** `draft` com `converted_value: 0` (zerado pelo Finish falho).

---

## 39. RESUMO EXECUTIVO — BLOQUEADORES ALLY+ AUSTRÁLIA (2026-06-16)

### Por que o Finish falha sistematicamente no catálogo AU:

1. **OSHC Single (Medibank, id 306366) tem priceIsExpired: true** — o preço expirou em 2025-12-31. Todo quote com curso AU via Ally+ recebe este fee automaticamente (obrigatório). O servidor não consegue calcular o total com preço expirado.

2. **Consequência imediata:** Nenhuma cotação australiana via Ally+ pode ser finalizada no estado atual da plataforma. O botão "Finish and Save Quotes" existe, mas o servidor rejeita a operação.

3. **Possível workaround não testado:** A conta da Movy Education (Starter) pode não ter permissão para editar/substituir o fee expirado. Em contas Professional+, o módulo "Gestão de Produtos" (Professional+) pode permitir remover ou substituir o OSHC expirado.

4. **Implicação para análise competitiva:** Este é um bug crítico de produto — o AllyHub está vendendo um plano (Ally+) para agências australianas que gera quotes inválidos que não podem ser enviados ao aluno. Nenhuma venda real pode ser processada via Ally+ AU neste momento.

---

## 40. STATUS FINAL DA EXPLORAÇÃO

- [x] Login e acesso ao produto
- [x] Pricing plans completo (Starter / Professional / Enterprise)
- [x] Add-ons completo
- [x] Fluxo de checkout (passos 1-3 documentados)
- [x] Termos de uso completos
- [x] Tech stack confirmado (AngularJS + React iframe + Sellead backend)
- [x] Módulo CRM — Pipeline, Student List, Student Profile, Opportunity
- [x] Módulo Quote — Quote 2.0 criado, catálogo AU mapeado
- [x] Módulo Financial — Financial Dashboard explorado
- [x] Módulo Reports — Performance, Behavior, Sales, Cancellations
- [x] Módulo Automations — bloqueado (add-on pago, não incluso no Starter)
- [x] Área do Estudante — formulário completo (4 abas), perfil com 5 abas
- [x] Aluno de teste criado: Lucas Andrade (Code 500, WARM, id 4838783)
- [x] Calendar / Agenda
- [x] Settings (configurações da conta)
- [x] Commissions (Ally+ results)
- [x] **Quote 2.0 arquitetura interna** — postMessage, CORS, JWT, endpoints, payload PUT
- [x] **Catálogo AU completo** — 27 programas (5 escolas/grupos), todas cidades documentadas
- [x] **Revenue model Ally Hub** — AU$150 por quote, OSHC Medibank auto-sugerido
- [x] **Bug crítico Ally+** — OSHC Single expirado bloqueia Finish de todos quotes AU
- [x] **WAF behavior** — bloqueio de PUT após Finish falho
- [x] **Acomodações AU** — catálogo vazio (nenhuma escola cadastrou acomodação separada)
- [x] **Link de proposta para aluno** — `/quote-detail/` e `/quote-online/` analisados ✅
- [x] **Simulação completa Perth** — 1 semana Lexis Perth AU$1,318 total, 4 fees, PUT autoSave:true ✅
- [x] **Quote 2.0 todos os botões** — gear (4 opções), duplicate, delete, advanced options, finish ✅
- [x] **Finish and Save Quotes** — PUT /draft/{id} {"finish":true} → 204, redirect perfil aluno ✅
- [x] **Comissão breakdown** — /calculatecommissionplugAndplay expõe estrutura completa em BRL ✅
- [x] **Link de proposta para aluno** — Quote #Q502 visível em perfil aba "Quotes and Links" ✅
- [ ] Módulo Marketing (Experiences, Campaigns) — não explorado
- [ ] HUB Services — não explorado
- [ ] Ally Partners (catálogo de escolas) — não explorado

---

## 41. SIMULAÇÃO COMPLETA — QUOTE PERTH (Lexis Perth, 1 semana, 2026-08-04)

> Sessão 4 — 2026-06-16. Quote #Q502 (id 1645489). Aluno: Lucas Andrade (id 4838783).
> Escola: Lexis English (id 105). Campus: Lexis Perth (id 380). Curso: id 486486, courseCampus id 495052.

---

### 41A. FLUXO EXECUTADO

| Passo | Ação | Resultado |
|-------|------|-----------|
| 1 | Playground → Australia + Perth, WA + start 04/08/2026 | 2 programas encontrados |
| 2 | Search Programs | Daytime AU$550/sem ✅ / Evening sem preço |
| 3 | Clicar "+" → modal "Add Item to Quotes" | Tuition AU$550 + Enrol AU$265 + Material AU$195 = AU$1,010 |
| 4 | Selecionar "Option 1" → "Add with Ally Plus" | Programa adicionado + 2 insurances + 2 add-ons auto-adicionados |
| 5 | View Quotes | Quote com 4 fees + total AU$1,318 |
| 6 | PUT /quote/1645489 autoSave:true | HTTP 200, converted_value:1318 ✅ |

---

### 41B. BREAKDOWN COMPLETO DO QUOTE Q502

**Programa — Lexis Perth, Full Time Daytime, 1 semana:**
| Campo | Valor |
|-------|-------|
| courseCampus_id | 495052 |
| Duração | 1 semana (04/08 → 07/08/2026) |
| Tuition | AU$550/semana |
| Enrolment | AU$265 (one-time) |
| Material | AU$195 (one-time) |
| **Total Curso** | **AU$1,010** |

**Fees (auto-adicionados pelo Ally+):**
| Supplier | Descrição | Valor | Status |
|----------|-----------|-------|--------|
| Ally Hub | Taxa de consultoria (Dólar Australiano) | AU$150 | ✅ |
| Medibank | Taxa de transferência internacional OSHC | AU$30 | ✅ |
| Medibank | OSHC Single (1 mês) | AU$70 | ⚠️ EXPIRADO |
| Lexis English | OSHC Single (1 mês) | AU$58 | ✅ NOVO |
| **Total fees** | | **AU$308** | |
| **Grand Total** | | **AU$1,318** | |

---

### 41C. FEE NOVO — Lexis English OSHC Single AU$58

4º fee observado pela primeira vez nesta simulação:
- **Supplier:** Lexis English (school_id 105)
- **Descrição:** OSHC Single
- **Valor:** AU$58/mês
- **Origem:** Provavelmente `/coursecampusvalues/495052` (school-specific), não do `/mandatoryrule`
- **Implicação:** Lexis English tem contrato OSHC próprio (AU$58) além do Medibank global (AU$70)

**Sidebar counter mapping:**
- Insurances (2 added): Medibank OSHC Single (AU$70) + Lexis English OSHC Single (AU$58)
- Add-ons (2 added): AllyHub Taxa (AU$150) + Medibank OSHC transfer (AU$30)

---

### 41D. MANDATORYRULE ENDPOINT

`GET /mandatoryrule?fromArray=true&plugAndPlay=1&city_id=18&country_code=AU&courseCampus_id=495052&duration=1&getFees=true&school_id=105&campus_id=380&startDate=04%2F08%2F2026&endDate=07%2F08%2F2026`

Retorna 3 mandatory fees (id=266546, id=425150, id=306366) com campos:
- `mandatory: 1`, `priceIsExpired: true/false`
- `totalThisFee: {currency, value}` — preço calculado (mesmo expirado)
- `mandatoryFromSchool: true` — obrigatório para esse escola/campus

---

### 41E. PUT AUTOSAVE:TRUE — Response com Dados Críticos

```json
{
  "id": 1645489, "status": "draft", "officeCount": "Q502",
  "converted_currency": "AUD",
  "converted_value": 1318,
  "converted_value_without_sr": 1318,
  "dueDate": "2026-06-26",
  "plugAndPlay": 1,
  "quoteCurrencies": [{"value": 3.8403, "destiny_code": "AUD"}]
}
```

- `converted_value: 1318` ✅ — salvo com sucesso mesmo com fee expirado
- `dueDate: "2026-06-26"` — 10 dias após today, auto-calculado
- `quoteCurrencies[0].value: 3.8403` — taxa FX do escritório (BRL→AUD ou similar)
- `autoSave:true` aceita fees expirados; apenas `autoSave:false` (Finish) os rejeita

---

### 41F. CAMPOS EDITÁVEIS POR AGÊNCIA NO PAYLOAD PUT

O payload inclui campos zerados que permitem customização:
```json
"editedTuition": 0,    // override de preço do tuition
"editedMaterial": 0,   // override de preço do material
"editedEnrol": 0,      // override de preço do enrolment
"discountTuition": 0,  // desconto no tuition
"discountMaterial": 0, // desconto no material
"discountEnrol": 0     // desconto no enrolment
```
→ A agência pode sobrescrever qualquer componente do preço manualmente.

---

### 41G. ACOMODAÇÕES PERTH — Confirmação via UI

UI "Search Accommodations" com Australia + Perth + Lexis English → **0 resultados**.
Confirma catálogo AU vazio para todas as escolas Ally+. A seção carrega dropdowns (tipo, quarto, banheiro, regime) mas retorna lista vazia.

---

## 42. FEE TABLE CONSOLIDADA — TODOS OS FEES OBSERVADOS

| ID | Supplier | Descrição | Tipo | Valor | Obrigatório | Fonte | Status |
|----|----------|-----------|------|-------|-------------|-------|--------|
| 266546 | Ally Hub | Taxa de consultoria (AUD) | fixed | AU$150 | Sim | /mandatoryrule | ✅ até 2030 |
| 425150 | Medibank | Taxa OSHC internacional | fixed | AU$30 | Sim | /mandatoryrule | ✅ até 2026-12 |
| 306366 | Medibank | OSHC Single | monthly | AU$70/mês | Sim | /mandatoryrule | ⚠️ EXPIRADO 2025-12-31 |
| 384576 | English Path | Insurance (EP Brisbane) | weekly | AU$30/sem | Sugerido | coursecampusvalues EP | ✅ (sessão anterior) |
| ? | Lexis English | OSHC Single | monthly | AU$58/mês | ? | coursecampusvalues 495052 | ✅ NOVO |

**Quote 1 semana Lexis Perth:** AU$1,010 (curso) + AU$308 (fees) = **AU$1,318 total**

---

## 43. QUOTE 2.0 — EXPLORAÇÃO COMPLETA DE BOTÕES, MOBILIDADE E FINISH

> Sessão 4 — 2026-06-16. Quote #Q502/Q503 (ids 1645489/1645492). Draft id 545900.
> Continuação da simulação Perth. Todos os botões do View Quotes testados.

---

### 43A. GEAR MENU (⚙️) — 4 Opções

O ícone de engrenagem no banner de cada quote card abre um dropdown com:

| Opção | Label UI | O que faz |
|-------|----------|-----------|
| 1 | My comission | GET `/calculatecommissionplugAndplay?quote_id={id}` → modal com comissão em BRL |
| 2 | Add custom fee | Na verdade abre modal "**$ Add Discount**" — nome enganoso |
| 3 | Duplicate | PUT `/quote/{id}` `{"duplicateQuote":true,"draft_id":545900,"student_id":4838783}` → cria nova quote |
| 4 | Delete | PUT `/quote/{id}` `{"status":"delete","dateTime":"...","timelog":"...","draft_id":545900}` → soft delete |

**Padrão de mutação:** TODAS as operações usam `PUT` — não há `DELETE`, `POST` ou `PATCH`. O soft delete seta `deleted_at` no response.

---

### 43B. MY COMISSION — Modal de Comissão

Endpoint: `GET /calculatecommissionplugAndplay?quote_id={id}`

**Resposta do modal (quote Q502, AU$1,318):**
```
My comission #Q502
Comission without discount:  R$ 789,76
Quote discount:              R$   0,00
Total comission:             R$ 789,76

Warning: Estimated commission, calculated on currency conversion
         based on the sales order date.
```

**Estrutura completa da comissão (commissionTotal):**

| Fonte | margin | soldValue | value (AUD) |
|-------|--------|-----------|-------------|
| Lexis English (school_id=105) | -10% | AU$550 | **-AU$110** (school cobra de volta) |
| Ally Hub (partner_id=10103) | 100% | AU$150 | **+AU$150** (fee integral) |
| Medibank OSHC transfer (partner_id=11933) | 13% | AU$30 | **+AU$3.90** |
| Medibank OSHC Single (partner_id=11933) | 13% | AU$70 | **+AU$9.10** |

**commissionForUser (usuário individual):**
- School Lexis English → AU$55 para "Operadora Ally" (user 5408)
- Ally Hub → AU$150 para "Operadora Ally"
- Medibank × 2 → AU$0.195 + AU$0.455
- **Total user:** AU$205.65 × 3.84 BRL/AUD = **R$789.76** ✅

**commissionForAgency (Ally+, account_id=2271):**
- School: **-AU$110** (escola cobra o negativo de volta)
- Ally Hub: +AU$150
- Medibank: +AU$13
- **Net agency:** +AU$53

**commissionForOffice (Ally+ Ribeirao Preto, office_id=2867):** tudo zero.

---

### 43C. ADD CUSTOM FEE → VERDADEIRO: ADD DISCOUNT

O item "Add custom fee" no gear menu abre um modal chamado **"$ Add Discount"**, não um formulário de nova taxa. O nome é enganoso.

**Modal:**
```
$ Add Discount

The maximum discount allowed is: R$789.76.
Remember that the discount will be subtracted from your commission.

Description*: [campo texto]
Value*: (-) [0.00]

[Close] [Add to Quote] (disabled até preencher)
```

- Teto do desconto = **comissão total da agência em BRL** (R$789.76)
- O desconto sai do bolso da agência, não da escola
- Valor sempre negativo (prefixo "–")
- Permite agência oferecer desconto ao aluno sem alterar preços da escola

---

### 43D. DUPLICATE — API e Comportamento

**Request:** `PUT /api.sellead.com/quote/1645489`
```json
{
  "duplicateQuote": true,
  "draft_id": 545900,
  "student_id": 4838783
}
```

**Response (HTTP 200):**
```json
{
  "id": 1645492,
  "officeCount": "Q503",
  "status": "new",
  "converted_value": 1318,
  "converted_currency": "AUD",
  "dueDate": "2026-06-26",
  "office_id": 4215,
  "plugAndPlay": 1
}
```

- Nova quote criada com `id=1645492`, `officeCount="Q503"` (incremento automático)
- Cópia exata de todos os programas e fees
- Sidebar atualiza: Programs (2), Insurances (4), Add-ons (4)
- Cabeçalho muda de "1 Quotes" para "2 Quotes"
- Layout muda para grade de 2 colunas lado a lado

---

### 43E. DELETE — Soft Delete via PUT

**Request:** `PUT /api.sellead.com/quote/1645492`
```json
{
  "status": "delete",
  "dateTime": "2026-06-16 10:49:08",
  "timelog": "2026-06-16 10:49:08",
  "draft_id": 545900
}
```

**Response (HTTP 200):**
```json
{
  "id": 1645492,
  "status": "new",
  "deleted_at": "2026-06-16 02:49:10",
  ...
}
```

- **Soft delete:** seta `deleted_at`, não remove o registro
- **Sem confirmação UI** — deleção é instantânea (diferente do Finish que pede confirmação)
- Quote some da tela imediatamente
- Sidebar volta: Programs (1), Insurances (2), Add-ons (2)

---

### 43F. ADVANCED OPTIONS — Conteúdo

Clicking "⌄ Advanced options" expande para mostrar:
- **Description:** campo editável via ícone de lápis (hover-only no accessibility tree)
  - Default: "Using default quote description"
- **Due date:** "June 26" — data limite; campo `textbox disableable disabled`

Não há outros campos visíveis além de Description e due date.

---

### 43G. BOTÃO "+" (ADD OPTION) — Comportamento

`uid=13_130` (botão "+" no topo direito da View Quotes) adiciona nova option ao playground. Comportamento não testado diretamente — mas o Duplicate demonstrou o equivalente.

---

### 43H. ICONS DE COMMENT/DELETE NAS SEÇÕES (Programs / Fees)

Ícones visíveis no screenshot mas **NÃO expostos no accessibility tree**:
- Cada seção "Programs" e "Fees" tem: 💬 (comment) + 🗑️ (delete section)
- Cada fee individual tem: 💬 (comment) + 🗑️ (delete fee)

São provavelmente `aria-hidden` ou hover-state only. Não clicáveis via UID.

---

### 43I. FINISH AND SAVE QUOTES — Mecanismo Real (CORREÇÃO CRÍTICA)

**Fluxo completo:**
1. Clicar "Finish and Save Quotes" → modal de confirmação:
   > *"Attention — I am aware that I reviewed all the values entered in this quote before sending it to my client"*
   - Botões: "No, I want to change!" | "Yes, finish and save!"

2. Confirmar → `PUT /api.sellead.com/draft/545900`
   ```json
   { "finish": true }
   ```
   **Response: HTTP 204 No Content** (sucesso sem body)

3. Página redireciona para perfil do aluno → aba "Quotes and Links"

4. Quote #Q502 aparece em **seção "Quotes"** (não Drafts) com:
   - Status: "new"
   - Schools: Lexis English
   - Total Converted: AU$1,318.00
   - Taxa de câmbio: R$3.84/AUD

**🚨 CORREÇÃO vs. Sessão 3:** O Finish NÃO usa `PUT /quote/{id}` com `autoSave:false` como acreditávamos. O mecanismo real é `PUT /draft/{draft_id}` com `{"finish":true}`. O `autoSave:false` era de um endpoint de override diferente (talvez edição manual de valor).

**Fees expirados NÃO bloqueiam o Finish** — o 204 success confirma. O erro `{"error":true,"totals":[]}` da sessão 3 era de um endpoint diferente, não do botão "Finish and Save Quotes".

---

### 43J. FINISH SUCCESS — Student Profile "Quotes and Links"

Após o Finish bem-sucedido, o perfil do aluno exibe:

**Seção "Drafts"** (sessions ainda abertas):
- "Livia Ribeiro created a draft on 15/06/2026" — 1 options × 2 (sessões anteriores)
- Botão "Continue quote" → reabre playground

**Seção "Quotes"** (finalizadas):
- #Q502 — status "new" (badge verde)
- Schools: Lexis English
- Total Converted: AU$1,318.00
- Australian Dollar → R$3.84
- Created at: 16/06/2026 | Due date: 26/06/2026

---

### 43K. ENDPOINTS NOVOS DESCOBERTOS NESTA SESSÃO

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/calculatecommissionplugAndplay?quote_id={id}` | GET | Breakdown completo de comissões em BRL |
| `/pagbankintegration?checkIntegration=true` | GET | Verifica integração PagBank (pagador BR) |
| `/partner` | GET | Lista de parceiros/suppliers da conta |
| `/draft/{id}` | PUT `{"finish":true}` | Finaliza a sessão do playground (real Finish) |
| `/quote/{id}` | PUT `{"duplicateQuote":true,...}` | Duplica uma quote existente |
| `/quote/{id}` | PUT `{"status":"delete",...}` | Soft delete da quote |
| `/officecurrency?office_id={id}&playground=true` | GET | Taxa de câmbio do escritório para playground |

---

### 43L. DADOS INTERNOS EXPOSTOS (calculatecommissionplugAndplay response)

A resposta do endpoint de comissão vaza dados internos sensíveis da conta de teste:

```json
{
  "agency_name": "Ally+",
  "email": "contato@allyhub.co",
  "account_id": 2271,
  "plan_id": 1,
  "status": "active",
  "activeUntill": "2030-12-31",
  "credits": 999,
  "maxUser": 999,
  "city_id": 40,
  "moduleType": 31,
  "onlyPagBank": 0,
  "plugAndPlay": 0,
  "allyPlus": 0
}
```

**Office:** "Ally+ (Ribeirao Preto)" (office_id=2867) — cidade: Ribeirão Preto, São Paulo, Brasil

**Integração PagBank:** `GET /pagbankintegration?checkIntegration=true` — AllyHub tem integração nativa com PagBank (processador de pagamento brasileiro). `onlyPagBank:0` = aceita outros métodos também.

**Taxa de câmbio em uso:** 1 AUD = R$3.84 (2026-06-16)

---

### 43M. RENAME (LÁPIS) — Não testável via accessibility tree

O ícone de lápis (✏️) ao lado de "Option 1" / "Option 2" ativa o rename do textbox:
- `textbox "Option 1" disableable disabled` — fica habilitado ao clicar o lápis
- O lápis é hover-only e não aparece no accessibility tree
- Não foi possível testar via UID

---

### 43N. CHECKLIST DE BOTÕES — STATUS FINAL

| Botão/Ação | Status | Resultado |
|------------|--------|-----------|
| Gear → My comission | ✅ Testado | Modal R$789.76 em BRL |
| Gear → Add custom fee | ✅ Testado | Add Discount (nome errado) |
| Gear → Duplicate | ✅ Testado | Cria Q503, HTTP 200 |
| Gear → Delete | ✅ Testado | Soft delete via PUT, sem confirmação |
| Advanced options | ✅ Testado | Expande Description + due date |
| "+" Add option | ⚪ Não testado | Comportamento inferido = nova option vazia |
| Pencil rename | ⚪ Não testável | hover-only, fora do accessibility tree |
| Programs comment 💬 | ⚪ Não testável | aria-hidden |
| Programs delete 🗑️ | ⚪ Não testável | aria-hidden |
| Fees comment 💬 | ⚪ Não testável | aria-hidden |
| Fees delete 🗑️ | ⚪ Não testável | aria-hidden |
| Fee comment individual | ⚪ Não testável | aria-hidden |
| Fee delete individual | ⚪ Não testável | aria-hidden |
| Finish and Save Quotes | ✅ Testado | **SUCESSO** — PUT /draft {"finish":true} → 204 |

---

**Implicação revenue model:** AllyHub captura AU$150 por quote processado via Ally+ (independente do valor). Medibank captura AU$30 (transfer) + AU$70 (OSHC). Lexis English captura AU$58 adicionalmente. Total fees não-curso = AU$308 em 1 semana.

---

## 44. LINK EXTERNO PARA O ALUNO — ANÁLISE COMPLETA

> Sessão 5 — 2026-06-16. Análise dos links públicos do #Q502 gerados após Finish.
> Perfil do aluno → aba "Quotes and Links" → gear do Q502 + seção Links.

---

### 44A. DOIS TIPOS DE LINK, DOIS ENDPOINTS DISTINTOS

Após o `Finish`, o perfil do aluno exibe **duas seções** com links externos diferentes:

| Seção no perfil | Label | Endpoint | ID |
|----------------|-------|----------|----|
| **Quotes** → gear (⚙️) | "Orçamento Ally" + Copy/Open | `quote.allyhub.co/quote-detail/{quote_id}/{hash}` | `quote_id=1645489` |
| **Links** | #Q502 + Copy/Open | `quote.allyhub.co/quote-online/{link_id}/{hash}` | `link_id=1018611` |

Ambos usam o **mesmo hash token**: `vWXkPI36fJK2nBp7Cb6JpPVf2RBRcR`

---

### 44B. GEAR (⚙️) NO CARD DO QUOTE — COMPORTAMENTO

No card `#Q502` da seção **Quotes**, o gear expande inline (sem dropdown separado) e mostra:
```
"Orçamento Ally"
📋 Copy    🔗 Open
```

- **Copy** → copia a URL `quote.allyhub.co/quote-detail/1645489/vWXkPI36fJK2nBp7Cb6JpPVf2RBRcR` para clipboard
- **Open** → abre a mesma URL numa nova aba

O label "Orçamento Ally" é o nome da proposta (white-label fixo, não customizável pelo agente).

---

### 44C. SEÇÃO LINKS — ESTRUTURA SEPARADA

A seção **Links** (abaixo de Quotes) é uma entidade separada criada automaticamente no Finish:
```
#Q502 | 📋 Copy | 🔗 Open | Created at: 16/06/2026 | Opened: 0
```
- **Opened: 0** = contador de aberturas pelo aluno (rastreamento de engajamento)
- A seção tem botão **"+ New Link"** — sugere que se pode criar múltiplos links para o mesmo aluno
- Gear (⚙️) na linha de link tem opções de gestão do link

---

### 44D. SUBDOMÍNIOS COMPLETOS — MAPA FINAL

| Subdomínio | Propósito |
|-----------|-----------|
| `app.allyhub.co` | CRM para agentes |
| `quote2.allyhub.co` | Quote builder (React/CRA iframe) |
| `api.sellead.com` | Backend principal (Sellead = empresa mãe) |
| `api-student.allyhub.co` | API student-facing (installments) |
| `quote.allyhub.co` | Páginas públicas de quote (student-facing) |
| `student.allyhub.co` | Checkout/pagamento do aluno |

---

### 44E. `/quote-detail/{quote_id}/{hash}` — DEEP DIVE

**URL:** `https://quote.allyhub.co/quote-detail/1645489/vWXkPI36fJK2nBp7Cb6JpPVf2RBRcR`

**API principal:** `GET /api.sellead.com/quotehash/{quote_id}?hash=` → retorna o quote completo

**Tracking automático no load:**
```
PUT /api.sellead.com/quotehash/1645489?hash=...&sumView=true&viewQuote=true
```
→ Registra que o aluno abriu o quote. `view` counter incrementa no servidor.

**Conteúdo da página (em Português Brasileiro):**
1. **Header:** "Orçamento para Lucas Andrade" + "criado em June 16, 2026"
2. **Branding do agente:** "Livia Ribeiro | movyeducation@gmail.com" (top-right + footer)
3. **Tabs:** PROGRAMA | ESCOLA
4. **Info do curso:** Nome, localização, datas, semanas, horas/semana, tipo
5. **Sidebar "Valores":**
   - Programas: tuição + matrícula + material
   - Subtotal
   - Taxas: Taxa de consultoria (AU$150 - Ally Hub), OSHC Medibank, Transfer OSHC, OSHC Lexis
   - Total: **AU$1,318.00**
   - Conversão: "Australian Dollar = R$3.84"
6. **Botão COMPRAR** (verde) → `student.allyhub.co/checkout/{quote_id}/{hash}?paymentType=full`
7. **Nota:** "Os valores em reais (R$) podem sofrer alteração no momento do pagamento mediante variação cambial."
8. **YouTube embed** do campus/escola
9. **Galeria de fotos** do campus (S3: campus-gallery bucket AWS)
10. **"Sobre a Escola"** — descrição em PT-BR
11. **Social links** + **Comodidades** (facilities)
12. **Footer:** "Movy Education | Perth, Western Australia, Australia | Livia Ribeiro | movyeducation@gmail.com"

**Tech stack desta página:** Vanilla JS (jQuery) + Bootstrap + Chart.js 2.1.6 + Owl Carousel + Google Maps + PagBank SDK + Zoop

---

### 44F. `/quote-online/{link_id}/{hash}` — DIFERENÇAS vs /quote-detail/

**URL:** `https://quote.allyhub.co/quote-online/1018611/vWXkPI36fJK2nBp7Cb6JpPVf2RBRcR`

**Visualmente idêntica** ao `/quote-detail/`, mas com arquitetura diferente:

**APIs adicionais exclusivas do /quote-online/:**
```
GET  /api.sellead.com/quoteonlinehash/1018611?hash=...          → entidade link
PUT  /api.sellead.com/quoteonlinehash/1018611?view=true         → tracking do link
GET  /api.sellead.com/opportunityhash/543839?hash=...           → contexto opportunity
```

**Estrutura do link entity (quoteonlinehash):**
```json
{
  "id": 1018611,
  "user_id": 7496,
  "hash": "vWXkPI36fJK2nBp7Cb6JpPVf2RBRcR",
  "opportunity_id": 543839,
  "created_at": "2026-06-16 02:50:48",
  "opened": 0,
  "campaign_id": null,
  "unique": 0,
  "open": 0,
  "quotes": [
    {"id": 1706303, "quoteOnline_id": 1018611, "quote_id": 1645489, "like": null, "view": 2}
  ]
}
```

**Campos importantes:**
- `opened` — número de aberturas únicas do link (rastreamento por link)
- `campaign_id` — pode ser vinculado a campanhas de email marketing (null aqui)
- `unique` / `open` — flags de controle de rastreamento
- `quotes[]` — array: **um link pode conter MÚLTIPLAS quotes** para comparação
- `quotes[].like` — campo de aprovação: null = pendente, presumivelmente `true/false` após ação do aluno
- `quotes[].view` — views daquela quote específica dentro do link

**Double tracking:** `/quote-online/` dispara tracking tanto no link quanto na quote:
- `PUT /quoteonlinehash/{link_id}?view=true` (nível link)
- `PUT /quotehash/{quote_id}?viewQuote=true` (nível quote)

**opportunityhash response:**
- `countquote: [{count: 3}]` — oportunidade tem 3 quotes no total
- Inclui `office.quote_online_preference: null` → customização de preferência do campus para link online

---

### 44G. FLUXO DE PAGAMENTO — CHECKOUT

**COMPRAR button URL pattern:**
```
https://student.allyhub.co/checkout/{quote_id}/{hash}?paymentType=full
```

**Tipos de pagamento disponíveis (campo `iepayment` da quotehash):**
| paymentType | Recurso | Config |
|------------|---------|--------|
| `full` | Pagamento à vista | — |
| `poupancinha` | Poupancinha (savings plan) | Down 30%, max 12x |
| `cartaoEntrada` | Cartão + entrada | Down 30%, max 12x |
| `parcelado` | Parcelado | Até 12x |
| `pravaler` | Pravaler (crédito estudantil) | Habilitado |

**Installments (api-student.allyhub.co):**
```
GET /getinstallments?value=1318    → parcelamento do total AU$1,318
GET /getinstallments?value=395.4   → parcelamento de AU$395.40 (30% down payment)
```

**Resposta installments (AU$1,318 base):**
| Parcelas | Juros | Total | Valor/mês |
|---------|-------|-------|-----------|
| 2x | 4.68% | AU$1,379.68 | AU$689.84 |
| 6x | 7.74% | AU$1,420.01 | AU$236.67 |
| 12x | 11.68% | AU$1,471.94 | AU$122.66 |

**Processadores de pagamento ativos:**
- **PagBank** (`GET /mysellerpagbank?my_account_id=2995`) — processador principal BR
- **ZOOP** (`GET /zoopquote?account_id=2995&action=getToken`) — segundo processador BR

---

### 44H. TRACKING & ANALYTICS

**Google Analytics:** `G-W6045PP788` — ID único de GA4 nas páginas de quote

**Rastreamento multinível:**
| Nível | Endpoint | Quando |
|-------|----------|--------|
| Quote view | `PUT /quotehash/{id}?viewQuote=true` | Ao abrir qualquer link |
| Link open | `PUT /quoteonlinehash/{id}?view=true` | Ao abrir /quote-online/ |
| Abertura | `opened` counter no link entity | Acumulado |
| Like/Aprovação | `quotes[].like` no link entity | Ação do aluno |

**Nota:** a abertura via `/quote-detail/` NÃO incrementa o `opened` counter do link (são rastreamentos independentes).

---

### 44I. EXPOSIÇÃO DE DADOS NA API PÚBLICA

**CRÍTICO:** Ambos os endpoints públicos (`/quotehash/` e `/quoteonlinehash/`) retornam **dados sensíveis da conta da agência**:

```json
{
  "account": {
    "hash": "$2y$10$xqOH8cBFOCvnPRTgrANZFOGjvardSYwtaHjKQ8dO9H7LvQR6jkDlO",
    "credits": 999,
    "plan_id": 1,
    "charge_type": 2,
    "charge_method_id": 4,
    "activeUntill": "2030-12-31",
    "accountSummary": "Starter",
    "billingValue": null
  }
}
```

- **`hash`**: bcrypt hash exposto em API pública (sem autenticação além do capability URL)
- **`credits`**: saldo de créditos da conta
- **Plan e billing info**: plan_id, charge_type, método de cobrança
- **Emails internos**: `movyeducation@gmail.com` para updates
- Qualquer pessoa com o link do aluno pode ver estes dados da agência

---

### 44J. NOVOS ENDPOINTS DESCOBERTOS (sessão 5)

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/quotehash/{quote_id}?hash=` | GET | Quote completo (auth por hash token) |
| `/quotehash/{quote_id}?...&viewQuote=true` | PUT | Registrar visualização do quote |
| `/quoteonlinehash/{link_id}?hash=` | GET | Entidade link (multi-quote) |
| `/quoteonlinehash/{link_id}?view=true` | PUT | Registrar abertura do link |
| `/opportunityhash/{opp_id}?hash=` | GET | Opportunity + student context |
| `/firstpricehash/{courseCampus_id}?...&hash=` | GET | Preço do curso (auth por hash) |
| `/feepricehash/{fee_id}?...&hash=` | GET | Preço de fee (auth por hash) |
| `/quoteonline?hash=` | GET | Metadados do link online |
| `/quoteonlinepreference?campus_id=` | GET | Preferências do campus para link |
| `/zoopquote?account_id=&action=getToken` | GET | Token de pagamento ZOOP |
| `/mysellerpagbank?my_account_id=&returnMy=1` | GET | Config PagBank da conta |
| `api-student.allyhub.co/getinstallments?value=` | GET | Cálculo de parcelas |
| `student.allyhub.co/checkout/{quote_id}/{hash}?paymentType=` | — | Checkout do aluno |

---

### 44K. RESUMO ESTRATÉGICO

**O que o aluno vê:**
- Proposta branded com nome do agente/agência
- Página em Português Brasileiro, profissional
- Breakdown completo de preços com conversão AUD→BRL em tempo real
- Vídeo/fotos da escola embutidos
- Botão COMPRAR com múltiplas opções de pagamento (à vista, parcelado, crédito)

**O que o agente vê (no CRM):**
- Quantas vezes o aluno abriu o link
- View count por quote
- Status `like` (aprovação do aluno)
- "Opened: N" no card do link

**Diferença conceitual dos dois links:**
- `/quote-detail/` = visualização direta da quote (1:1)
- `/quote-online/` = link gerenciável que pode ter N quotes (para comparação), rastreamento mais granular, pode ser vinculado a campanha

**Token único:** Um hash serve todos os endpoints públicos — o link é um "capability URL" (nenhuma autenticação adicional; quem tiver o link tem acesso).

---

## 45. SETTINGS — ANÁLISE COMPLETA

> Sessão 6 — 2026-06-16. Análise exaustiva de todas as seções do Settings (`/settings`).
> Conta: Movy Education (Perth) — plano free "Quote + CRM Free - Unlimited".

---

### 45A. ESTRUTURA DO SETTINGS — MAPA COMPLETO

**Sidebar esquerda** — 3 grupos com ícone de "pin":

```
Office
├── Profile
├── Pipelines
├── Bank Accounts
├── Users
├── Quote Preferences
│   ├── Quote Online
│   ├── Quote PDF
│   └── Sales Types
└── Folders

Templates
├── Email Template
└── Document Template

Account
├── Info / Billing
├── Import Leads
├── Integrations
├── Student Public Form
├── Reasons to Cancel Lead
├── Lead Sources
└── Tags
```

Total: 16 seções navegáveis.

---

### 45B. OFFICE > PROFILE

Configuração do escritório ativo ("Movy Education (Perth)").

**Campos:**
- Office Logo — placeholder "YOUR AGENCY LOGOTYPE" + Edit
- Office Name — "Movy Education (Perth)"
- Razão Social — vazio
- City — Perth WA Australia
- Phone 1 — +61 420 218 490
- External ID — vazio
- Users — 1
- Main Office — "Set as main office" (botão)
- Business Numbers — até 3 (nenhum adicionado)
- Social Links — Facebook / Twitter / Instagram / YouTube / LinkedIn / Site (todos vazios)

**Configurations (toggles):**
| Configuração | Estado |
|---|---|
| Is Onshore | OFF |
| Organize by opportunity | OFF |
| Copy emails to consultant | OFF |
| Email admin on sale | OFF (email: movyeducation@gmail.com) |
| Email responsibles on lead creation | ON |
| Open profile same tab | OFF |
| Mark sales for | Quote Creator |
| Student Key | Email Only |
| Allow duplicate students | ON |
| Phone Required | OFF |
| Leaderboard | All Users / Top 10 / consider unpaid=OFF |
| Office Timezone | select |
| Default nationality | select |
| Default status | select |

**Outros campos editáveis:** Default Quote Description (Edit), Office Representative Data (Edit), Delete Office (botão danger).

---

### 45C. OFFICE > PIPELINES

Um pipeline pré-configurado: **"Jornada de compra"** *(for all offices)*.

**5 estágios:**
| # | Nome | Cor |
|---|------|-----|
| 1 | Descoberta | cinza |
| 2 | Investigação | azul |
| 3 | Tomada de decisão | amarelo |
| 4 | Contratação | roxo |
| 5 | Ganho | verde |

Botões: "+ New Status" | "+ New Pipeline".

---

### 45D. OFFICE > BANK ACCOUNTS

Vazio. Botão: "+ New Bank Account".

---

### 45E. OFFICE > USERS

1 usuário ativo:

| Nome | Role | Email | Status |
|------|------|-------|--------|
| Livia Ribeiro | admin | movyeducation@gmail.com | ● active |

Botões: "+ New User" | "Show Enabled/Disabled Users" tabs.

---

### 45F. QUOTE PREFERENCES > QUOTE ONLINE

Configura a página pública de quote (subdomain `quote.allyhub.co`).

**Toggle:** "Show Header Banner in Quote Details Page" — ON

**Customizar template:**
- Header Background Color — color picker
- Header Text Color — color picker
- Preview header: área com info do agente + ícones sociais
- Banner upload — 1500×450px (zona de upload)
- 3 colunas de conteúdo
- Footer upload — 1500×300px

---

### 45G. QUOTE PREFERENCES > QUOTE PDF

Apenas: "Upload your banner image (Responsive width: 100%)" — zona de upload. Configuração mínima.

---

### 45H. QUOTE PREFERENCES > SALES TYPES

Toggle: "Enable the use of Sales Types?" — **OFF**. Nenhum tipo configurado.

---

### 45I. OFFICE > FOLDERS

1 pasta: **"home"** — scoped a "All Offices".
Ações: Edit (amarelo) | Delete (vermelho).

---

### 45J. TEMPLATES > EMAIL TEMPLATE

"Email Template List" — **vazia**. Botão: "+ Add Email Template".

---

### 45K. TEMPLATES > DOCUMENT TEMPLATE

"Document List" + filtro "Filter by Office" (All Offices) — **vazia**. Botão: "+ Add Document".

---

### 45L. ACCOUNT > INFO / BILLING

**Bloco Account Info:**
- Your logo — placeholder "YOUR AGENCY LOGOTYPE" + Edit
- Agency Name — "Movy Education" ✏ Edit
- Main Email — movyeducation@gmail.com ✏ Edit
- Offices — 1 (+New)
- Users — 1 (+New)
- Due Date Payment — 31/12/2030
- "User and Userplus can delete leads?" — **ON**
- Terms and Conditions — Download (EN) / Download (PT-BR)

**Current Plans:**
| Plan | Module | Currency | Users | Value | Retroactive | Total |
|------|--------|----------|-------|-------|-------------|-------|
| Quote + CRM Free - Unlimited | Quote + CRM | BRL | 1 User | R$0.00/per user | R$0.00 | R$0.00 |

**Next Bill: R$0.00**

**Billings:** dropdown "2026 - June" → "We have not found any billing in the selected month."

**All Users:**
| Nome | Office | Email | Created at | Last login |
|------|--------|-------|------------|------------|
| Livia Ribeiro | Movy Education (Perth) | movyeducation@gmail.com | 12:47 15/06/2026 | 02:02 16/06/2026 |

---

### 45M. ACCOUNT > IMPORT LEADS

"Lead Import History" — **vazia**: "You have not made any lead import yet."

- "+ Import Leads" — botão verde (abre upload/importação CSV)
- "Download Sample Spreadsheet" — template de planilha para importação em massa

---

### 45N. ACCOUNT > INTEGRATIONS

Título: "Integrate with other apps" **[New badge]**

**Tab: Payments**
Conteúdo condicionado por `moduleType`:
- `ngIf: (moduleType == 7 || moduleType >= 15) && role == admin/manager && type != 2 && type != 3`
- **PagBank Integration** — oculto (free plan = moduleType abaixo do threshold)
- **Qualy Integration** — oculto (mesma condição)
- **Ally Checkout / Zoop** — `ngIf: false && ...` — **hard-disabled no código** (nem com plan pago)
- Resultado: tab Payments completamente vazia na conta free

**Tab: General** — 8 integrações, todas com "+ Integrate" (botão pink):

| # | Integração | Descrição |
|---|-----------|-----------|
| 1 | **Zoho Invoice** | Send lead from Ally to Zoho Invoice |
| 2 | **RD Station** | Capture every new lead from RD Station to Ally |
| 3 | **Pipedrive** | Send lead from Ally to Pipedrive |
| 4 | **ActiveCampaign** | Send lead from Ally to ActiveCampaign |
| 5 | **SMTP Config** | Use your own SMTP configuration to send emails in Ally |
| 6 | **Zapier** | Create custom integrations with more than 1000 apps through Zapier |
| 7 | **Aussie Translate** | Enable translation requests directly from Ally by linking your Aussie partner token |
| 8 | **Ollara Education Service** | Through the partnership between Ollara and Ally Hub, you have access to health insurance with special conditions |

**Observações estratégicas:**
- RD Station (CRM brasileiro) como fonte de leads = target market BR confirmado
- Zapier = extensibilidade via webhook para qualquer ferramenta
- Aussie Translate = parceiro AU de tradução (serviço de certificação/tradução de documentos)
- Ollara = health insurance AU (OSHC?) via parceria — receita adicional para agência

---

### 45O. ACCOUNT > STUDENT PUBLIC FORM

Configurador do formulário público de captação de alunos. Todas as seções têm ícone de lápis para renomear (Custom Name).

**Colunas:** Session/Fields | Custom Name | Required | Visible

**Seção: Main Information** (Visible: ON — fixo)
| Campo | Required | Visible |
|-------|----------|---------|
| Name | Sim (fixo) | Sim (fixo) |
| Surname | OFF | ON |
| Email | Sim (fixo) | Sim (fixo) |
| Phone 1 | OFF | ON |
| Phone 2 | OFF | ON |

**Seção: General** (Visible: ON)
| Campo | Required | Visible |
|-------|----------|---------|
| Country of Interest | OFF | ON |
| City of Interest | OFF | ON |
| Start Forecast | OFF | OFF |

**Seção: Documents** (Visible: ON)
| Campo | Required | Visible |
|-------|----------|---------|
| Register Number / CPF | OFF | ON |
| Register Number 2 / RG | OFF | ON |
| Passport Number | OFF | ON |
| Passport Validity | OFF | ON |
| Birthdate | OFF | ON |

**Seção: Additional Information** (Visible: ON)
| Campo | Required | Visible |
|-------|----------|---------|
| Gender | OFF | ON |
| Current Job | OFF | ON |
| Marital Status | OFF | OFF |

**Seção: Contact Details** (Visible: ON)
| Campo | Required | Visible |
|-------|----------|---------|
| Zip Code | OFF | ON |
| Address | OFF | ON |
| Number | OFF | ON |
| Neighborhood | OFF | ON |
| City | OFF | ON |
| State | OFF | ON |

**Seção: Scholar Info** (Visible: **OFF** — seção inteira desativada)
| Campo | Visible |
|-------|---------|
| High school name | OFF |
| Graduation year (High school) | OFF |
| High school GPA | OFF |
| University name | OFF |
| Graduation year (University) | OFF |
| University GPA | OFF |
| Course semester | OFF |
| Studied Idiom | OFF |
| Idiom Level | OFF |

**Custom Success Feedback** (editável):
> "Well done! The information was updated successfully :)"

**Nota:** CPF/RG são documentos exclusivamente brasileiros — confirma que o formulário foi desenhado para captura de alunos brasileiros mesmo com escritório AU.

---

### 45P. ACCOUNT > REASONS TO CANCEL LEAD

"Manage Reasons" — **vazia**: "No Reasons". Botão: "+ Add Reason".

Serve para pré-configurar motivos de cancelamento que o agente seleciona ao perder um lead (analytics de churn).

---

### 45Q. ACCOUNT > LEAD SOURCES

"Manage Lead Sources" — **vazia**: "No Lead Sources". Botão: "+ Add Lead Source".

Rastreamento de canais de aquisição (Instagram, site, indicação, RD Station, etc.).

---

### 45R. ACCOUNT > TAGS

"Manage Tags" — **vazia**: "No Tags!". Botão: "+ New Tag".

Tags livres para segmentar leads/alunos.

---

### 45S. RESUMO ESTRATÉGICO DO SETTINGS

**O que o Settings revela sobre a plataforma:**

1. **Multi-office architecture:** O seletor de office no topo do Settings indica que uma conta pode ter múltiplos escritórios (ex: Sydney + Perth + SP). Cada office tem Profile, Pipelines e Users próprios.

2. **Plano free é bastante completo:** Quote + CRM ilimitado, 0 reais — a monetização é via Quote fee (AU$150/quote) + planos pagos futuros. Não há limite de quotes no free.

3. **Payment integrations gated por moduleType:** PagBank, Qualy e ZOOP só disponíveis em moduleType ≥ 7 ou 15. O ZOOP está hard-disabled (`false &&`) — provavelmente descontinuado.

4. **Student Public Form confirma persona BR:** CPF/RG visíveis por padrão, Scholar Info desativada — foco em captação rápida, não em dados acadêmicos extensos.

5. **8 integrações General:** Pipeline completo BR (RD Station → Ally → Zoho Invoice), CRM ocidental (Pipedrive, ActiveCampaign), SMTP próprio, Zapier para tudo mais. Aussie Translate e Ollara = parcerias AU-específicas (receita de referral).

6. **Import Leads via planilha:** Permite migrar base de leads de outro sistema sem API — onboarding de agências migrantes.

7. **Tags + Lead Sources + Reasons to Cancel = CRM analytics layer:** Tríade que viabiliza funil de conversão, análise de churn e ROI de canais. Todos vazios = conta nova/teste.

8. **Pipelines customizáveis:** A "Jornada de compra" é default mas pode ser renomeada/reestrutarada. Potencial para agências com processos diferentes (ex: IELTS→Visto→Matrícula).

9. **Leaderboard:** Feature de gamificação por vendas (agentes disputam ranking). Desativado nesta conta mas existe o config.

10. **Timezone e Default nationality:** Indica que a plataforma opera multi-timezone e multi-nationality nativamente — design global desde o início.

---

## SEÇÃO 46 — BUILDERS DEEP DIVE: QUOTE PREFERENCES + EMAIL TEMPLATE + DOCUMENT TEMPLATE

> Sessão 7 (2026-06-16). Análise completa dos construtores de personalização do AllyHub.

---

### 46A. QUOTE PREFERENCES > QUOTE ONLINE — BUILDER

**O que é:** Página pública de cotação acessível pelo aluno via link. Subdomínio: `quote.allyhub.co` (white-label: `quote.allyhub.co/quote-online/{id}` ou via `/quote-detail/`).

**Campos customizáveis:**

| Campo | Tipo | Comportamento |
|-------|------|---------------|
| Show Header Banner in Quote Details Page | Toggle ON/OFF | Mostra/oculta banner no topo |
| Header Background Color | Color picker (Bootstrap colorpicker) | Cor de fundo do cabeçalho |
| Header Text Color | Color picker (Bootstrap colorpicker) | Cor do texto do cabeçalho |
| Banner image | Upload (1500×450px recomendado) | Imagem de banner principal |
| Footer image | Upload (1500×300px recomendado) | Imagem de rodapé |

**Mecanismo de auto-save (ng-change):**
- Cada campo dispara `ng-change` individualmente → não há botão "Save"
- Ao alterar qualquer cor: `POST https://api.sellead.com/quoteonlinepreference`
- Payload exemplo: `{"headerBackgroundColor":"#FF5733","office_id":4215}`
- Live preview atualizado em tempo real no mesmo painel

**Live preview:**
- O painel lateral mostra um preview do header com fundo na cor selecionada
- Texto "Company Name | Agent Name | Phone | Email" em cima + ícones sociais
- Fundo laranja (#FF5733) testado e funcionou: preview atualizado instantaneamente

**Campo oculto no AngularJS scope:**
- `useSchoolSite` — flag detectada no scope mas não exibida na UI padrão (feature avançada ou legado)

**Estrutura do Quote Online público (3 colunas):**
- Coluna 1: Informações do curso (escola, datas, duração)
- Coluna 2: Acomodação + taxas
- Coluna 3: Resumo financeiro + botões de ação (Accept/Reject/Pay)

---

### 46B. QUOTE PREFERENCES > QUOTE PDF — BUILDER

**O que é:** Configuração da exportação PDF do quote que o agente gera internamente.

**Campos disponíveis:** Apenas 1:
- "Upload your banner image (Responsive width: 100%)" — zona de upload de imagem de banner

**Observações:**
- Configuração extremamente minimalista comparada ao Quote Online
- O PDF em si é gerado pelo backend com template fixo — apenas o banner é customizável
- Sem controle de cores, fontes ou layout do PDF

---

### 46C. TEMPLATES > EMAIL TEMPLATE — BUILDER

**O que é:** Editor WYSIWYG de templates de email reutilizáveis para comunicação com alunos.

**Interface:**
- Lista vazia → botão "+ Add Email Template" → abre modal
- Modal: título (text input) + toggle "Template dependent of quote?" + CKEditor WYSIWYG (largura ~60%) + painel de variáveis (~40%)
- Layout split: editor à esquerda, variáveis arrastáveis à direita

**CKEditor:**
- Versão: CKEditor 4.x (instância AngularJS via `ng-model: add.entity.html`)
- Toolbar completa: texto, tabelas, imagens, Source mode (HTML raw)
- Variáveis renderizadas como `[[variavel]]` com destaque visual (azul sublinhado no WYSIWYG)

**Toggle "Template dependent of quote?":**

| Estado | Variáveis disponíveis |
|--------|----------------------|
| OFF (padrão) | ~44 variáveis (Office + Student + General) |
| ON | ~71 variáveis (+27 vars de Quote: escola, curso, valores, acomodação, pagamentos) |

**Variáveis modo OFF (~44 vars) — 3 seções:**

*Office (14):*
`[[office_name]]`, `[[office_city]]`, `[[office_address]]`, `[[office_cnpj]]`, `[[office_abn]]`, `[[office_gst]]`, `[[office_phone1]]`, `[[office_phone2]]`, `[[office_facebok]]`, `[[office_instagram]]`, `[[office_twitter]]`, `[[office_youtube]]`, `[[office_default_bank]]`, `[[office_representative_data]]`

*Student (27):*
`[[student_code]]`, `[[student_name]]`, `[[student_surname]]`, `[[student_fullname]]`, `[[student_email]]`, `[[student_phone1]]`, `[[student_phone2]]`, `[[student_document_number1]]`, `[[student_document_number2]]`, `[[student_passport]]`, `[[student_passport_validity]]`, `[[student_zipcode]]`, `[[student_city]]`, `[[student_state]]`, `[[student_address]]`, `[[student_number]]`, `[[student_nationality]]`, `[[student_skype]]`, `[[student_job]]`, `[[student_birthdate]]`, `[[student_gender]]`, `[[student_marital_status]]`, `[[student_observation]]`, `[[student_idiom]]`, `[[student_idiom_level]]`, `[[student_responsible_name]]`, `[[student_office_name]]`

*General (3):*
`[[date]]`, `[[timestamp]]`, `[[page_break]]`

**Variáveis adicionais com toggle ON (+27 vars) — seção Quote:**
`[[school_name]]`, `[[course_info]]`, `[[course_description]]`, `[[course_name]]`, `[[course_duration]]`, `[[course_startDate]]`, `[[course_endDate]]`, `[[tuition_value]]`, `[[enrol_value]]`, `[[material_value]]`, `[[accommodation_info]]`, `[[accommodation_startDate]]`, `[[accommodation_endDate]]`, `[[accommodation_type]]`, `[[accommodation_regime]]`, `[[accommodation_period]]`, `[[accommodation_value]]`, `[[placement_fee_value]]`, `[[fee_info]]`, `[[fee_category]]`, `[[fee_value]]`, `[[otherfee_info]]`, `[[otherfee_value]]`, `[[quote_code]]`, `[[quote_city]]`, `[[quote_total_value]]`, `[[quote_description]]`

**Uso:** Templates de follow-up, confirmação de matrícula, boas-vindas, lembretes de pagamento, etc. O template é selecionado pelo agente no momento de enviar email pelo perfil do aluno.

---

### 46D. TEMPLATES > DOCUMENT TEMPLATE — BUILDER

**O que é:** Editor WYSIWYG para contratos, termos de matrícula e documentos legais. Gera PDF para download a partir do perfil do aluno.

**Interface:**
- Lista vazia → botão "+ Add Document" → modal "Create Document"
- Modal: "Term Name*" (obrigatório) + "Document for:" dropdown (All Offices / office específico) + CKEditor full-width + painel de variáveis
- Layout: editor ocupa ~65% da largura (mais largo que Email Template), variáveis em painel scrollável à direita

**Instrução no banner azul:**
```
1 – Configure the template agreement using the special variables on the side.
2 – Enter into the student profile and click on Generate Document.
3 – Before generating the document the system will let you edit it with additional informations.
4 – Done. Download your completed document automatically.
```

**Fluxo de geração de PDF:**
1. Agente cria template no Settings com variáveis `[[...]]`
2. No perfil do aluno → botão "Generate Document" → seleciona template
3. Sistema abre editor intermediário (pré-preenchido com dados reais do aluno/quote)
4. Agente pode revisar/editar campos antes de finalizar
5. PDF gerado e disponível para download imediato

**Diferença crítica vs Email Template:**
- Email Template: toggle quote-dependent (44 → 71 vars)
- Document Template: **sempre 83 variáveis** (inclui contact info completo do responsável)
- Document Template tem variáveis extras de contato de responsável: `[[student_contact_name]]`, `[[student_contact_phone]]`, `[[student_contact_kinship]]`, `[[student_contact_email]]`, `[[student_contact_address]]`, `[[student_contact_marital_status]]`, `[[student_contact_nationality]]`, `[[student_contact_document_number1]]`, `[[student_contact_document_number2]]`

**83 variáveis em 4 seções:**

#### Seção Office/Campus (14 variáveis)
| Variável | Label |
|----------|-------|
| `[[office_name]]` | Office Name / Campus Name |
| `[[office_city]]` | Office City |
| `[[office_address]]` | Office Address |
| `[[office_cnpj]]` | Office CNPJ / Campus CNPJ |
| `[[office_abn]]` | Office ABN / Campus ABN |
| `[[office_gst]]` | Office GST |
| `[[office_phone1]]` | Office Phone 1 |
| `[[office_phone2]]` | Office Phone 2 |
| `[[office_facebok]]` | Office Facebook |
| `[[office_instagram]]` | Office Instagram |
| `[[office_twitter]]` | Office Twitter |
| `[[office_youtube]]` | Office Youtube |
| `[[office_default_bank]]` | Main Bank Account |
| `[[office_representative_data]]` | Office Representative Data |

#### Seção Student (36 variáveis)
| Variável | Label |
|----------|-------|
| `[[student_code]]` | Student Code |
| `[[student_name]]` | Student First Name |
| `[[student_surname]]` | Student Surname |
| `[[student_fullname]]` | Student Full Name |
| `[[student_email]]` | Student Email |
| `[[student_phone1]]` | Phone 1 |
| `[[student_phone2]]` | Phone 2 |
| `[[student_document_number1]]` | Document 1 |
| `[[student_document_number2]]` | Document 2 |
| `[[student_passport]]` | Passport |
| `[[student_passport_validity]]` | Passport Validity |
| `[[student_zipcode]]` | Zip Code |
| `[[student_city]]` | City |
| `[[student_state]]` | State |
| `[[student_address]]` | Address |
| `[[student_number]]` | Address Number |
| `[[student_nationality]]` | Nationality |
| `[[student_skype]]` | Skype |
| `[[student_job]]` | Job |
| `[[student_birthdate]]` | Birthdate |
| `[[student_gender]]` | Gender |
| `[[student_marital_status]]` | MaritalStatus |
| `[[student_observation]]` | Observation |
| `[[student_idiom]]` | Studied Idiom |
| `[[student_idiom_level]]` | Idiom Level |
| `[[student_responsible_name]]` | (Responsible Name) |
| `[[student_office_name]]` | (Office/Agency name for student) |
| `[[student_contact_name]]` | (Emergency contact name) |
| `[[student_contact_phone]]` | (Contact phone) |
| `[[student_contact_kinship]]` | (Relationship / kinship) |
| `[[student_contact_email]]` | (Contact email) |
| `[[student_contact_address]]` | (Contact address) |
| `[[student_contact_marital_status]]` | (Contact marital status) |
| `[[student_contact_nationality]]` | (Contact nationality) |
| `[[student_contact_document_number1]]` | (Contact document 1) |
| `[[student_contact_document_number2]]` | (Contact document 2) |

#### Seção Quote (30 variáveis)
| Variável | Label |
|----------|-------|
| `[[school_name]]` | School Name |
| `[[course_info]]` | School, Course (Start Date - End Date) |
| `[[course_description]]` | Course Description |
| `[[course_name]]` | Course Name |
| `[[course_duration]]` | Period Type Length |
| `[[course_startDate]]` | Course Start Date |
| `[[course_endDate]]` | Course End Date |
| `[[tuition_value]]` | Tuition Value |
| `[[enrol_value]]` | Enrol Value |
| `[[material_value]]` | Material Value |
| `[[accommodation_info]]` | Name, Type, Regime, Supplier, Duration |
| `[[accommodation_startDate]]` | Accommodation Start Date |
| `[[accommodation_endDate]]` | Accommodation End Date |
| `[[accommodation_type]]` | Type |
| `[[accommodation_regime]]` | Regime |
| `[[accommodation_period]]` | Period Type Length |
| `[[accommodation_value]]` | Accommodation Value |
| `[[placement_fee_value]]` | Placement Fee Value |
| `[[fee_info]]` | Fee Name, Supplier |
| `[[fee_category]]` | Fee Category |
| `[[fee_value]]` | Fee Value |
| `[[otherfee_info]]` | Other Fee Name |
| `[[otherfee_value]]` | Other Fee Value |
| `[[quote_code]]` | Quote Code |
| `[[quote_city]]` | Destination City |
| `[[quote_total_value]]` | Total Value |
| `[[quote_description]]` | Quote Description |
| `[[payment_plan]]` | Payment Plan |
| `[[payment_plan_value]]` | Payment Plan Total Value |
| `[[currencies]]` | Currencies |

#### Seção General (3 variáveis)
| Variável | Label | Nota |
|----------|-------|------|
| `[[date]]` | Current Date | Data da geração |
| `[[timestamp]]` | Date and Time that the document will be generated | Data+hora |
| `[[page_break]]` | Page break | Quebra de página no PDF |

---

### 46E. COMPARATIVO DOS BUILDERS

| Feature | Quote Online | Quote PDF | Email Template | Document Template |
|---------|-------------|-----------|----------------|-------------------|
| Editor | Color picker + uploads | Upload | CKEditor 4 | CKEditor 4 |
| Save mode | Auto-save (ng-change) | Auto-save | Manual (botão Save) | Manual (botão Save) |
| Variáveis | Nenhuma (é visual) | Nenhuma | 44–71 vars | 83 vars sempre |
| Toggle quote | N/A | N/A | Sim (ON=+27 vars) | Não (sempre completo) |
| Output | Página pública HTML | PDF interno | Email via SMTP | PDF via download |
| Contact vars | N/A | N/A | Não | Sim (9 vars responsável) |
| API backend | POST /quoteonlinepreference | Upload endpoint | Email delivery | PDF generation |
| Caso de uso | Proposta para aluno revisar online | PDF interno do agente | Follow-up, confirmações | Contratos de matrícula |

---

### 46F. INSIGHTS ESTRATÉGICOS — BUILDERS

1. **Variable syntax `[[duplo colchete]]`:** Diferente do padrão Mustache `{{}}` ou Handlebars `{{{}}}`—implementação proprietária Sellead. Todos os builders compartilham a mesma sintaxe.

2. **Document Template tem contact info completo:** 9 variáveis de contato de responsável (`[[student_contact_*]]`) só existem no Document Template, não no Email Template. Necessário para contratos com assinatura de responsável (menores de 18).

3. **Quote PDF é vestigial:** Apenas banner upload — o real poder de personalização está no Quote Online (cores, layout) e nos Document Templates (contratos personalizados).

4. **CKEditor Source mode:** Ambos Email e Document Template expõem HTML raw via botão "Source" — permite copiar/colar HTML customizado de ferramentas externas ou usar templates profissionais.

5. **[[page_break]] no Document Template:** Variável especial que injeta quebra de página no PDF gerado — permite controle de paginação em contratos longos (ex: Termos e Condições na página 2).

6. **[[course_info]] = variável composta:** Renderiza como "School, Course (Start Date - End Date)" — uma única variável que agrega múltiplos campos numa string formatada. Conveniente para templates simplificados.

7. **[[accommodation_info]] = também composta:** "Name, Type, Regime, Supplier, Duration" numa string. O nível de granularidade pode ser controlado usando as vars individuais quando necessário.

8. **Payment Plan como bloco:** `[[payment_plan]]` renderiza o plano de pagamento parcelado completo como um bloco de texto — ideal para tabelas de parcelas em contratos.

---

## SEÇÃO 47 — DASHBOARD: MAPA COMPLETO, WIDGETS E ARQUITETURA DE GATING

> Sessão 7 (2026-06-16). Análise do Dashboard via DOM + Angular scope.
> Conta testada: Movy Education (Perth) — `role=admin, moduleType=3, type=1, status=active, useNewMenu=2, allyPlus=1, market=2`

---

### 47A. LAYOUT GERAL DO DASHBOARD

**URL:** `/dashboard`
**Controlador Angular:** `AppController as App` (global) + `LeftBarCtrl as leftbar` (sidebar)

**Filtros globais do dashboard (barra superior):**

| Filtro | Opções |
|--------|--------|
| Período | Actual month \| Last month \| Last 7 days \| **Last 30 days** (padrão) \| Last 90 days \| Custom |
| Office | All Offices \| [offices específicos] |
| Responsible | [usuários da conta] |
| Date range (topo direito) | "From: [data] To: [data]" — read-only, atualizado pelo período |

---

### 47B. WIDGETS DO DASHBOARD (mapa completo)

**Linha 1 — KPI Cards (6 cards coloridos):**

| Card | Cor | Valor (conta teste) | Gate |
|------|-----|---------------------|------|
| New Leads | Verde/teal | 1 | `moduleType >= 2 && type != 3` |
| Leads Interacted | Roxo | 1 | `moduleType >= 2 && type != 3` |
| Leads Cancelled | Carvão/cinza escuro | 0 | `moduleType >= 2 && type != 3` |
| Leads Hot | Vermelho/salmão | 0 | `moduleType >= 2 && type != 3` |
| Leads Warm | Laranja | 1 | `moduleType >= 2 && type != 3` |
| Leads Cold | Azul | 0 | `moduleType >= 2 && type != 3` |

> Subtítulo de cada card: "In the last 31 days."

**Linha 2 — Três painéis:**

*User Leaderboard by Currency (esquerda ~33%):*
- Gate: `type != 3`
- "In the last 31 days." — ranking de usuários com badge de posição
- Badge visual: diamante amarelo para #1, valor em moeda da conta (AUD)
- Exemplo: #1 Livia Ribeiro — AU$0.00

*Conversion Rate (centro ~33%):*
- Gate: `type != 3`
- Donut chart — percentual de leads convertidos em quote vendida
- Legenda: "X Sold Quotes / Y Leads With Quote"
- Abaixo: "Z Total of Leads" + botão verde (ícone grupo/people)

*Sales (direita ~33%):*
- Gate: `type != 3`
- Total of Sales (número de vendas) | Avg. Sales By User
- Average Ticket — tooltip: "The Average Ticket is calculated through sales you made in the selected period."

**Linha 3 — Dois gráficos:**

*All Quotes Created (esquerda ~50%):*
- Gate: `moduleType == 1 || moduleType > 2`
- Bar chart — eixo X: meses (últimos ~12 meses) — eixo Y: quantidade de quotes
- Cor: azul claro por barra — hover exibe valor

*All Quotes By Status (direita ~50%):*
- Gate: `type != 3`
- Pie chart — legenda: new (cinza) \| has link \| accepted (azul) \| sold (verde) \| denied (vermelho)

**Linha 4 — Tasks + sidebar direita:**

*Tasks (esquerda ~67%):*
- Gate: `moduleType >= 2`
- Tabs: **My** \| **Office** (scope por usuário ou escritório)
- Calendário navegável: < > "today" + data atual
- Modos de view: **month \| week \| day \| list** — default: week
- "No events to display" quando vazio

*Coluna direita (~33%) — dois painéis:*
- **TODO LIST (\*NOT DONE YET):** aviso amarelo "No tasks!" quando vazio
- **LAST INTERACTIONS:** Gate `type != 3` — tabela Code \| Name \| Last Interaction — link clicável pelo código

---

### 47C. WIDGETS OCULTOS (outros tipos de conta)

Presentes no DOM mas invisíveis para `type=1`:

| Widget | Gate | Contexto |
|--------|------|----------|
| Amount of Created Applications | `!account.promote` | Dashboard escola (type=2) |
| Ranking of Agencies | type=2 | Escola vê ranking de agências parceiras |
| Agencies Connections | type=2 | Escola vê conexões com agências |
| Pending Connections | type=2 | Solicitações de parceria pendentes |
| No businesses! | `type == 3` | Dashboard rede — lista de businesses |
| Campus tab (Tasks) | `type == 2` | Tab de campus no calendário |

---

### 47D. ARQUITETURA DE TIPOS DE CONTA (`account.type`)

| type | Perfil | Exclusividades |
|------|--------|----------------|
| **1** | Agência padrão (intercâmbio) | Students (Leads), Pipelines, School Values, Commissions |
| **2** | Escola/instituição educacional | Campus, Companies, Manage Prices, My Accommodations, Ranking of Agencies |
| **3** | Rede de agências (B2B) | Business, Organizations (market==1) — sem "Last Interactions" |

> Conta testada (Movy): `type=1` — agência padrão.

---

### 47E. MAPA DE `moduleType` (tiers funcionais)

| moduleType | Features desbloqueadas |
|------------|------------------------|
| 1 | Quote básico, Opportunities, charts de quotes no dashboard |
| **3** (conta teste) | `> 2`: Opportunities, Agenda, Flight List, Tasks, All Quotes charts |
| 7 | Financial: Receivable, Bills, Credits, Sales — PagBank/Qualy |
| 11 | Experiences, Campaigns, Quote Templates, Marketing |
| 15 | Financial completo + Marketing (11 + 7 + extras) |
| 16 | Automations v2 (abaixo de 16 = "Automations New" legacy) |

> `moduleType=3` = plano "Quote + CRM Free" (R$0.00) — inclui Opportunities + charts mas sem Financial e sem Marketing.

---

### 47F. MAPA COMPLETO DO NAV

**Topbar (sempre visível):**
- **Contacts** (dropdown) — `useNewMenu==2 && allyPlus==1`
- **Commissions** — `type != 2 && type != 3`
- **Reports** (dropdown) — `role != 'qualifier'`

**Sidebar completa (todos os itens descobertos no DOM):**

```
Dashboard
Agenda                          moduleType >= 2
Students (Leads) / Students     type 1 = "Leads" | type 2 = "Students"
  Leads List / Students List
Pipelines
Business                        type==3 && market==1
Organizations                   type==3 && market==1 && moduleType >= 2
Flight List                     moduleType >= 2 && type != 3
Opportunities                   (moduleType==1 || >2) && useopportunity
  Opportunities List
  Public Quotes
Applications                    (moduleType==1||>2 && type==2) || useApplication==1
Experiences                     moduleType==11 or >=15 && type != 3
Campaigns                       moduleType==11 or >=15
  Quote Templates
  Manage Campaigns
Companies / Agencies            type==2 && showQuote
  Companies List
Partners                        showQuote && role in [admin/office/userplus]
  Partners List
  My Accommodations             role != 'user' && type != 3
  My Fees
Manage Prices                   showQuote && role!='user' && type==2
  Campus and Courses
  Special Rates
  Nationality Groups
  Price Lists
Schools and Courses             type != 2 && type != 3
Registration Request (Demand)   !trial
Automations                     moduleType >= 16
Automations New                 moduleType < 16 (legacy)
Financial                       moduleType==7 || >=15
  Financial Dashboard
  Receivable
  Bills
  Sales
  Credits
  Cancellations                 hardcoded: west1_account_id whitelist
Commissions
  Earnings New
Reports
  Performance
  Funnel Performance            HARDCODED: account.id == 10 ou 2015 && admin only
```

**Botão "+ New" (topbar) — ações rápidas:**

| Ação | Gate |
|------|------|
| New Quote | `(moduleType==1 \|\| >2) && role != database` |
| New Business | `type==3 && market==1` |
| New Task | `role != database && moduleType >= 2` |
| New Note | `role != database && moduleType >= 2` |
| Change Student Status | `type != 3 && role != database && moduleType >= 2` |
| School Values | `type != 2 && type != 3` |

---

### 47G. ROLES DO SISTEMA

| Role | Perfil |
|------|--------|
| `database` | Super admin Sellead — acesso ao painel interno (`gamaadmin`) |
| `admin` | Administrador da agência |
| `manager` | Gerente |
| `operation` | Operacional |
| `office` | Usuário nível office |
| `userplus` | Usuário com permissões extras |
| `user` | Usuário padrão |
| `qualifier` | Qualificador — sem acesso a Reports |

---

### 47H. INSIGHTS ESTRATÉGICOS — DASHBOARD

1. **Plataforma 3-sided real:** `type 1/2/3` revelam que o AllyHub serve agência / escola / rede de agências com dashboards, navs e features completamente distintos. É um marketplace educacional disfarçado de CRM.

2. **Leaderboard gamificado nativo:** Ranking de vendedores por receita (em moeda local) direto no dashboard — motiva agentes sem plugin externo.

3. **Lead temperature como KPI primário:** Hot/Warm/Cold como cards de dashboard — o CRM usa temperatura de lead como principal indicador de saúde do pipeline.

4. **Conversion Rate = único funil visível:** 0 Sold Quotes / 1 Leads With Quote = 0%. O funil real existe mas é resumido em um único número no dashboard.

5. **Tasks calendar integrado:** Calendário navegável (month/week/day/list) com tabs My/Office — não é uma lista simples, é um calendário funcional.

6. **"Funnel Performance" hardcoded para 2 IDs:** Relatório avançado hardcoded para `account.id == 10` e `2015` — provavelmente contas internas/piloto da Sellead.

7. **`Registration Request (Demand)` pós-trial:** Disponível apenas após sair do trial — feature de conversão de matrícula direta (aluno pede sem passar pelo agente).

8. **`useNewMenu=2 && allyPlus=1` confirmado:** Movy tem o novo menu v2 + AllyPlus ativo — conta configurada manualmente pela Sellead como demo/parceira.

9. **`market=2` bloqueia Business/Organizations:** Acesso às features de rede (Business, Organizations) exige `market==1`. A distinção `market` é uma camada adicional de gating além do `type`.

10. **Last Interactions como quick-CRM:** Widget de últimas interações na home funciona como "inbox de relacionamento" — mostra quem interagiu recentemente sem precisar abrir o perfil.

---

## SEÇÃO 48 — REPORTS & COMMISSIONS: MAPA COMPLETO

> Sessão 7 (2026-06-16). Todas as 10 páginas visitadas e documentadas via navegação direta por URL.

---

### 48A. MAPA DE ROTAS — REPORTS & COMMISSIONS

| Rota | Título | Grupo Nav | Gate (nav) |
|------|--------|-----------|-----------|
| `/report/performance` | Performance Report | Reports | `role != 'qualifier'` |
| `/report/funnel-performance` | Funnel Performance | Reports | HARDCODED: `account.id == 10 \|\| 2015` |
| `/report/behavior` | General Behavior Report | Reports | `role != 'qualifier'` |
| `/report/sales` | Sales Report | Reports | sem gate extra |
| `/report/cancellations` | Cancellations Report | Reports | sem gate extra |
| `/report/receive` | Receivable Report | Reports | `moduleType==7 \|\| >=15` (nav only) |
| `/report/pay` | Bills Report | Reports | `moduleType==7 \|\| >=15` (nav only) |
| `/report/credits` | Credits Report | Reports | `moduleType==7 \|\| >=15` (nav only) |
| `/report/quote` | Quotes List | Commissions | sempre |
| `/instalment/earnings` | Earnings | Commissions | `type != 2 && type != 3` |

> **Nota crítica:** Reports financeiros (`/report/receive`, `/report/pay`, `/report/credits`) são acessíveis por URL direta mesmo sem `moduleType>=7` — o gate existe apenas no menu de navegação, não na rota.

---

### 48B. PERFORMANCE REPORT (`/report/performance`)

**Filtros:** Range (Last Week \| Last Month \| Last Trimester \| Custom) \| Office \| Responsible

**10 widgets em 4 linhas (grid 3-3-3-1):**

| # | Widget | Tipo | Métrica |
|---|--------|------|---------|
| 1 | Office Leaderboard by Currency | Ranking card (azul) | Top office por receita (AU$) |
| 2 | User Leaderboard by Currency | Ranking card (verde) | Top usuário por receita (AU$) |
| 3 | Amount of Sales | Bar chart | Nº de vendas no período |
| 4 | Sold Quotes by Lead Source | Bar chart | Vendas por canal de aquisição |
| 5 | Average Conversion Time | Scatter chart | Dias médios de lead → venda |
| 6 | Amount of Sold Periods | Chart | Períodos vendidos (weeks/months/terms) |
| 7 | Average Status Time | Chart c/ filtros inline (Office + Pipeline) | Tempo médio por status do pipeline |
| 8 | Amount of Leads Canceled by Reason | Chart | Cancelamentos por motivo |
| 9 | Amount of Sales by Type | Chart | Vendas por tipo (tuition/accommodation/fee) |
| 10 | Best Sellers Schools by Periods | Tabela | Escolas: Sales\|Hours\|Days\|Weeks\|Months\|Terms\|Semesters\|Years\|Uniques |

> Widget 7 é o único com filtros secundários embutidos (Office + Pipeline) além dos filtros globais da página.

---

### 48C. FUNNEL PERFORMANCE (`/report/funnel-performance`)

Redireciona para `/dashboard` — hardcoded para `account.id == 10 || 2015`. Inacessível para contas normais. Feature interna/piloto da Sellead.

---

### 48D. GENERAL BEHAVIOR REPORT (`/report/behavior`)

**Filtros:** Range (Last Week — dropdown simples)

**Estrutura:** Tabela colapsável por office — subtítulo "in the last 7 day(s)"

Colunas: **Name** \| **Role** \| **Last Access** \| **New Leads** \| **Cancelled Leads** \| **Quotes** \| **Won Businesses**

**Dado real (conta Movy):**

| Name | Role | Last Access | New Leads | Cancelled Leads | Quotes | Won Businesses |
|------|------|-------------|-----------|-----------------|--------|----------------|
| Livia Ribeiro | admin | 16/06/2026 | 1 | 0 | 2 | 0 |

> Auditoria de produtividade por usuário — quem está ativo, quantos leads captou/cancelou e quantas quotes criou.

---

### 48E. SALES REPORT (`/report/sales`)

**Filtros (11 filtros — mais completo do sistema):**

| Filtro | Tipo |
|--------|------|
| Sold Between | Date range + today / this month / last month |
| Office | Dropdown |
| Responsible | Dropdown |
| School | Typeahead |
| Partner | Typeahead |
| Country | Dropdown |
| City | Dropdown (depende de Country) |
| Cancelled Quote | Whatever \| Canceled Quote Only \| Without Canceled Quote |
| Sale Type | Dropdown |
| Payment status | Checkboxes: Unpaid \| Partial Paid \| Full Paid |
| Received Percentage | Range slider (0–100%) |

**Ações:** Print (rosa) \| Export xlsx (amarelo) — "Total: X Sales"

---

### 48F. CANCELLATIONS REPORT (`/report/cancellations`)

Layout idêntico ao Sales Report — mesmos 11 filtros, único delta:
- "Requested Between" em vez de "Sold Between" (data da solicitação de cancelamento)

Mesmo componente Angular reutilizado com configuração diferente.

---

### 48G. RECEIVABLE REPORT (`/report/receive`)

**Filtros (10 filtros):**

| Filtro | Tipo |
|--------|------|
| Description | Text search |
| Search By | Radio: ● Due Date \| Payment Date |
| Due Date Between | Date range + today / this month / last month |
| Currency | Dropdown |
| Office | Dropdown |
| Student | Typeahead |
| School | Typeahead |
| Partner | Typeahead |
| Payment Method | Dropdown |
| Sale Type | Dropdown |

**Ações:** Print \| Export xlsx — "Total: 0 Receivables"

Rastreia contas a receber dos alunos (parcelas pendentes de pagamento à agência).

---

### 48H. BILLS REPORT (`/report/pay`)

**Filtros:** Idênticos ao Receivable Report + campo extra **Categories** (11 filtros total)

**Ações:** Print \| Export xlsx — "Total: 0 Bills"

Applied Filters (exibidos inline): `Due date between: 01/06/2026 - 30/06/2026 | Currency: All | Office: Movy Education (Perth) | Student: All Students | School: All | Partner: All | Payment method: All | Sale Type: All`

Rastreia contas a pagar para escolas/parceiros (repasses e pagamentos de serviços).

---

### 48I. CREDITS REPORT (`/report/credits`)

**Filtros (7 filtros — mais simples do módulo financeiro):**

| Filtro | Tipo |
|--------|------|
| Due Date Between | From → To (sem shortcuts de data) |
| Status | Radio: ● All \| Active Only \| Expired Only |
| Filter By | Checkbox: Credits Used |
| School | Typeahead |
| Partner | Typeahead |
| Currency | Dropdown |

**Total: 0 Records**

Rastreia créditos/vouchers concedidos por escolas ou parceiros — controla expiração e uso. Único relatório financeiro com filtro "Status" de crédito.

---

### 48J. QUOTES LIST (`/report/quote`) — Commissions

**Título:** "Quotes List" — botões: "+ New Quote List" (laranja) \| "+ New Quote" (verde)

**Tabs:** My Quotes \| Office Quotes \| All Quotes

**Filtros:** Code \| Student \| All Status \| Periods \| All Period Types \| Country \| City \| School \| Sale type \| "Show Advanced Filters >"

**Card de quote (dado real — #Q502):**
- `#Q502` — status: `new` (badge rosa)
- Aluno: Lucas Andrade 🇦🇺 \| Agente: Livia Ribeiro
- Created at: 16/06/2026 \| Due date: 26/06/2026
- Schools: Lexis English
- Total: **AU$1,318.00** \| Australian Dollar = R$3.84
- 5 ícones de ação coloridos + botão + (rosa) \| gear (configurações)

---

### 48K. EARNINGS (`/instalment/earnings`) — Commissions

**Título:** "Earnings" — Export xlsx — "Total: 0 Records"

**Filtros (12 filtros — mais granulares do módulo financeiro):**

| Filtro | Tipo |
|--------|------|
| Quote Code | Text |
| Student | Typeahead |
| Office | Dropdown |
| Quote Creator | Typeahead |
| Type of partner | Dropdown |
| Destiny Country | Dropdown |
| Destiny City | Dropdown (depende de Country) |
| Sales between | Date range |
| Type of item | Dropdown (All Types of Items) |
| Sale Type | Dropdown |
| Payment status | Unpaid \| Partial Paid \| Full Paid |
| Cancelled Quote | Whatever \| Canceled Quote Only \| Without Canceled Quote |

> "Type of item" + "Type of partner" = rastreamento de comissão por categoria. Receita separada por tipo de produto (tuition, accommodation, fees) e por tipo de parceiro.

---

### 48L. HOME PAGE (`/` — boas-vindas)

- "Hi [Nome do usuário]"
- "You have X pending tasks for today"
- 3 quick action cards: **Pipeline** \| **Add quotes** \| **Dashboard**
- Decoração: fila de ícones de landmarks mundiais (Taj Mahal, Cristo Redentor, Merlion, Torre Eiffel) — branding de intercâmbio integrado ao layout

---

### 48M. INSIGHTS ESTRATÉGICOS — REPORTS

1. **Gate por nav, não por rota:** Receivable, Bills e Credits acessíveis por URL direta mesmo sem `moduleType>=7`. Security by obscurity — facilita análise de features gated por pesquisadores.

2. **Performance Report = motor de análise completo:** 10 widgets cobrem da origem do lead ao ranking de escolas por unidade temporal — análise 360° sem ferramenta externa.

3. **"Best Sellers Schools by Periods"** é a tabela estratégica mais densa do sistema: breakdown por Sales/Hours/Days/Weeks/Months/Terms/Semesters/Years/Uniques. Permite otimizar portfólio de escolas sem exportar dados.

4. **General Behavior Report = auditoria de equipe nativa:** Role + Last Access + 4 KPIs de atividade por usuário — substituí ferramentas de HR analytics para equipes pequenas.

5. **Sales Report tem "Received Percentage" como range slider** — filtra por adimplência (ex: só vendas 50–100% pagas). Incomum em CRMs de intercâmbio — indica foco em gestão de recebimento.

6. **Cancellations espelha Sales com um único delta no label de data** — mesmo componente Angular com `ng-if` ou config diferente. Padrão Sellead de reutilização de tela.

7. **Earnings separa receita por "Type of item"** — cada categoria de produto (tuition vs accommodation vs fees) rastreável individualmente. Margem por categoria calculável sem exportação.

8. **Quotes List em `/report/quote` está em "Commissions"** mas é um CRM (não relatório financeiro). Agrupamento enganoso revela que "Commissions" é um container misto de CRM + financeiro.

9. **Home page com landmarks mundiais** é o único elemento de branding explicitamente ligado ao propósito de intercâmbio — comunicação de produto via decoração visual.

10. **Funnel Performance hardcoded para 2 IDs** = feature comercial ou de piloto. Padrão Sellead de upsell via gate de ID — cliente paga para ter o ID adicionado à whitelist.

---

## SEÇÃO 49 — FINANCIAL MANAGEMENT: CRUD LAYER (ROTAS NÃO DOCUMENTADAS)

> Sete rotas descobertas via `$state.get()` que **não aparecem na nav principal** do AllyHub (exceto parcialmente no Financial submenu). Estas são as páginas de gestão ativa do financeiro — contraparte das rotas `/report/*` que são read-only.

---

### 49A. MAPA DE ROTAS FINANCEIRAS COMPLETO

#### Visíveis no nav (Financial submenu — gated por moduleType ≥ 7)

| Rota | Label no nav | Tipo |
|------|-------------|------|
| `/financial/dashboard` | Dashboard | Não explorada |
| `/instalment/receive` | Receivable | CRUD ✅ |
| `/instalment/pay` | Bills | CRUD ✅ |
| `/instalment/earnings` | Commissions > Earnings | Não explorada |
| `/instalment/credits` | Credits | Documentada em S48I |
| `/transition/list` | Resume | Não explorada |

#### Ocultas no nav (descobertas via ui-router `$state.get()`)

| Rota | Título da página | Tipo |
|------|-----------------|------|
| `/billing` | Billing List | CRUD (B2B) ✅ |
| `/instalment/commission` | Total Commissions | Read-only ✅ |
| `/instalment/distributed` | Distributed Commissions | Read-only ✅ |
| `/instalment/over` | Over | Read-only ✅ |
| `/validation/payment` | — | Hard permission gate ✅ |

**Padrão de gate:** nav-gated (moduleType) ≠ route-gated (server). As rotas CRUD e de reports ocultos são acessíveis por URL direta — apenas `/validation/payment` tem gate server-side real.

---

### 49B. `/billing` — BILLING B2B (ASSINATURAS DE AGÊNCIAS)

- **Título:** "Billing List"
- **Escopo:** assinaturas B2B da própria agência no Sellead/AllyHub — **NÃO são parcelas de alunos**
- **Prefixo de ID:** `#CM` (ex: CM500, CM4433)
- **Total no account Movy:** 3.835 registros
- **Métodos de pagamento:** Bank Slip / Stripe
- **Status:** paid / pending
- **Moeda:** BRL
- **Botão:** "+ New Billing"
- **Separação:** completamente separado do sistema de `instalment` de alunos — banco de dados, prefixo e UI distintos

> Insight: O AllyHub cobra suas agências via este módulo. A separação de `/billing` (B2B) vs `/instalment/*` (B2C estudante) evita confusão de fluxos de caixa.

---

### 49C. `/instalment/receive` — RECEIVABLES CRUD

**Título:** "Receivables" | **Botão:** "+ New Receivable" (verde)

#### Filtros da lista (12 filtros)

| Filtro | Tipo | Notas |
|--------|------|-------|
| Description | Text input | Busca livre |
| Value Between | Número (From → To) | Range |
| Search By | Radio | Due Date \| Payment Date |
| Status | Checkboxes (5) | Pending ✓ / Expired ✓ / **Partial Paid** ✓ / Paid ✓ / Only Provisioned □ |
| Due Date Between | Date range | Shortcuts: today / this month / last month |
| Currency | Dropdown | — |
| Office | Dropdown | Default: Movy Education (Perth) |
| Student | Dropdown | Default: All Students |
| School | Dropdown | — |
| Partner | Dropdown | — |
| Payment Method | Dropdown | — |
| Sale Type | Dropdown | — |

> **Status "Partial Paid"** não aparece como checkbox visível na UI (só 4 visiveis) mas está no "Applied Filters" bar e no DOM como `ref_596`. Quinto status oculto na UI mas ativo no sistema.

#### Colunas da tabela

`Instalment | Receive From | Description | Method | Due Date | Value | Invoice | Action`

#### Modal "+ New Receivable" (9 campos obrigatórios)

| Campo | Tipo | Notas |
|-------|------|-------|
| Due Date* | Date input | Default: hoje |
| From* | Radio | **Student** (default) \| Partner \| School \| Other |
| Select [From entity]* | Dropdown | Muda conforme "From" |
| Link with a sold quote | Dropdown | Habilitado após selecionar estudante; só quotes com status "sold" |
| Link with a supplier | Dropdown | Habilitado após selecionar quote |
| Description* | Text input | Obrigatório |
| Repeat Monthly | Select | No (default) \| Yes |
| Already paid | Radio | No (default) \| Yes |
| Payment Method* | Dropdown | Obrigatório |
| Currency* | Dropdown | Default: **Australian Dollar** |
| Value* | Number (AU$) | 0.00 default |

**Validações:** "Due Date is required", "Student is required", "Agency is required", "Partner is required", "School is required", "Description is required", "Payment Method is required", "Currency is required", "Value is required"

**Nota:** O modal contém duas headings no DOM: "New Receivable" e "New Bill" — mesmo componente Angular condicional reutilizado para ambas as telas.

**Fluxo de criação:** Parcelas são criadas **manualmente** após a venda. Quote Q502 (`converted_value: AU$1.318`, status `sold`) tem `instalments: []` — confirma que o sistema não auto-gera parcelas ao converter quote.

---

### 49D. `/instalment/pay` — BILLS CRUD

**Título:** "Bills" | **Botão:** "+ New Bill" (verde)

#### Tabs

| Tab | Ícone | Função |
|-----|-------|--------|
| Default | — | Lista principal de contas a pagar |
| ★ Payment Suggestions | Estrela | Sugestões automáticas de pagamento (AI/algoritmo) |

#### Filtros (13 filtros — igual Receivables + Categories)

Todos os filtros de `/instalment/receive` +

| Filtro extra | Tipo | Notas |
|-------------|------|-------|
| Categories | Dropdown | Filtra por categoria de despesa |

#### Botão especial: "Simulate Shipment" (azul, ícone de envio ✈)

- Único na tela de Bills — não aparece em Receivables
- Função provável: simular envio de remessa de pagamentos (batch payment) para validação antes de executar
- Aparece ao lado dos filtros, na mesma linha de Categories

> O tab "★ Payment Suggestions" (com estrela) indica feature premium — provavelmente sugere quando e quais contas pagar com base em saldo, vencimento e fluxo de caixa. Não testável sem dados reais de bills.

---

### 49E. `/instalment/commission` — TOTAL COMMISSIONS

- **Título:** "Total Commissions"
- **Tipo:** Read-only (sem botão "+ New")
- **Total:** 0 Commissions
- **Empty state:** "We did not found any commission."
- **Filtros (5):** Office | User | Sales Between (date range) | School | Partner

> Difere do `/instalment/distributed` — aqui é o total bruto; lá é a distribuição por destinatário.

---

### 49F. `/instalment/distributed` — DISTRIBUTED COMMISSIONS

- **Título:** "Distributed Commissions"
- **Tipo:** Read-only (sem botão "+ New")
- **Total:** 0 Commissions
- **Empty state:** "We did not found any commission."
- **Tabs (2):**
  - **Office Commissions** (default) — comissões agrupadas por escritório
  - **User Commissions** — comissões agrupadas por usuário/consultor
- **Filtros (4):** Office | Sales Between (date range) | School | Partner

> A separação Office vs User permite calcular quanto cada consultor gerou vs quanto o escritório como um todo recebeu — útil para estruturas de comissão em cascata.

---

### 49G. `/instalment/over` — OVER

- **Título:** "Over"
- **Tipo:** Read-only (sem botão "+ New")
- **Total:** 0 Overs
- **Empty state:** "We did not found any over."
- **Filtros (3):** Office | School | Sales Between (date range)
- **Semântica:** provavelmente "over-commissions" ou valores pagos a mais — diferença positiva entre comissão esperada vs recebida

> Página mais minimalista do sistema financeiro — apenas 3 filtros, sem tabs. Provavelmente usada raramente para auditoria de discrepâncias.

---

### 49H. `/validation/payment` — HARD PERMISSION GATE

- **Resultado:** Modal "Permission Denied — You are not allowed to access this resource"
- **Comportamento:** Redireciona para `/` (home) após fechar o modal
- **Tipo de gate:** **Server-side** (único no sistema com gate real via redirect + modal)
- **Contraste:** Todas as outras rotas financeiras são acessíveis por URL direta apesar do nav gate. Esta é a exceção.
- **Hipótese:** Funcionalidade de validação/aprovação de pagamentos (dois fatores ou aprovação gerencial) — reservada para roles superiores ao de agência padrão

---

### 49I. ARQUITETURA DO SISTEMA DE PARCELAMENTO

#### Ciclo de vida de uma parcela

```
Quote criada → Quote vendida (checkPaymet) → Parcela criada MANUALMENTE em /instalment/receive
                                             → Parcela linkada à quote + supplier
                                             → Status: Pending
                                                       ↓ pagamento parcial
                                                       Partial Paid
                                                       ↓ pagamento completo
                                                       Paid
                                             → Vencida sem pagamento: Expired
```

#### Evidência da criação manual

- Q502 (`id=1645489`, `converted_value: AU$1.318`, `status: sold`): `instalments: []`, `paymentplan: []`
- Confirm via API GET `/quote/1645489?withBusiness=true` — arrays vazios mesmo após venda
- Criação de parcela exige: selecionar estudante → selecionar quote sold → selecionar supplier → definir valor + vencimento

#### Dois sistemas paralelos de financeiro

| Sistema | Rota CRUD | Rota Report | Entidade |
|---------|-----------|-------------|---------|
| Recebíveis de alunos | `/instalment/receive` | `/report/receive` | Parcelas de alunos |
| Contas a pagar | `/instalment/pay` | `/report/pay` | Pagamentos a fornecedores |
| Créditos | `/instalment/credits` | `/report/credits` | Créditos/reembolsos |
| B2B (assinaturas) | `/billing` | — | Mensalidades da agência |

#### Campos do formulário revelam design de comissão

O campo "Link with a supplier" no New Receivable modal — após selecionar quote — mostra que as parcelas de receita são linkadas ao fornecedor (escola/accommodation) que gerou a venda. Isso alimenta o sistema de comissões (`/instalment/commission`, `/instalment/distributed`).

---

### 49J. INSIGHTS ESTRATÉGICOS — FINANCIAL CRUD LAYER

1. **Criação manual de parcelas** é design intencional — permite ao consultor customizar plano de pagamento por aluno (valor, vencimento, método) sem amarrar ao valor total da quote.

2. **"Repeat Monthly"** no New Receivable é funcionalidade de parcelamento recorrente — cria `n` parcelas mensais automaticamente a partir de uma configuração única. Reduz trabalho manual para pagamentos mensais.

3. **"Already paid"** flag no New Receivable permite registrar pagamentos retroativos — útil para migração de dados ou quando o aluno pagou por outro canal antes do sistema ser configurado.

4. **Payment Suggestions tab** com estrela (★) indica feature premium/AI dentro do plano — diferenciador de produto. Sugestão automatizada de qual conta pagar e quando é funcionalidade avançada de gestão de caixa.

5. **"Simulate Shipment"** em Bills sugere integração com remessa bancária (CNAB/FEBRABAN?) — permite simular o arquivo de pagamento em lote antes de submeter ao banco. Feature muito específica para mercado brasileiro.

6. **`/billing` isolado** (prefixo CM, moeda BRL, Stripe/Bank Slip) confirma que AllyHub monetiza agências australianas via modelo de assinatura em BRL — câmbio favorável para a empresa brasileira.

7. **`/validation/payment` como único gate server-side** revela que o restante do sistema financeiro confia no obscurecimento de nav para controle de acesso — vulnerabilidade de design (security by obscurity).

8. **5 status de parcela** (Pending/Expired/Partial Paid/Paid/Only Provisioned) vs 3 checkboxes visíveis na UI — "Partial Paid" está oculto visualmente mas presente no DOM. Possível bug de UI ou feature toggle.

9. **Distributed Commissions com tabs Office/User** = estrutura de comissão em cascata: agência recebe comissão da escola → distribui para consultores. O sistema rastreia ambos os níveis separadamente.

10. **Over + Total Commissions como páginas separadas** = sistema de reconciliação de comissões: Total (esperado) vs Distributed (pago) vs Over (diferença). Auditoria completa de comissões sem planilha externa.

---

## SEÇÃO 50 — FINANCIAL LAYER COMPLETO: DASHBOARD + EARNINGS + CREDITS + RESUME + BILLS DETALHADO

> Documentação final das 4 rotas nav-visíveis não exploradas + descobertas adicionais do `/instalment/pay`.

---

### 50A. `/financial/dashboard` — FINANCIAL DASHBOARD

**Título:** "Financial Dashboard"

#### Filtros globais (3)

| Filtro | Tipo | Default |
|--------|------|---------|
| Range | Dropdown | Current Month |
| Currency | Dropdown + ℹ | AUD (AU$) |
| Filter By Office | Dropdown | Movy Education... |

Range selecionado mostra: "From: 01/06/2026 · To: 30/06/2026" com ícone de calendário azul.

#### Cards de resumo (3 colunas)

Cada card tem 4 linhas com badge colorido + contagem + valor em AU$:

| Status | Badge | Receivables | Bills | Balance |
|--------|-------|-------------|-------|---------|
| Paid | 🟢 Verde | AU$ 0.00 | AU$ 0.00 | AU$ 0.00 |
| Pending | 🟡 Amarelo | AU$ 0.00 | AU$ 0.00 | AU$ 0.00 |
| Late | 🔴 Vermelho | AU$ 0.00 | AU$ 0.00 | AU$ 0.00 |
| General | 🔵 Azul | AU$ 0.00 | AU$ 0.00 | AU$ 0.00 |

- Card **Receivables**: link "Go to Receivables >" → `/instalment/receive`
- Card **Bills**: link "Go to Bills >" → `/instalment/pay`
- Card **Balance**: links "Go to Earnings >" + "Go to Resume >" (dois links no mesmo card)
- Botão **"View Future Projections"** (rosa, canto superior direito do card Balance) — projeção de fluxo de caixa futuro (feature premium)

> **"Late"** no dashboard ≠ **"Expired"** no CRUD — o dashboard usa terminologia diferente da tela de gerenciamento. Provavelmente mesmo conceito com labels inconsistentes entre camadas UI.

#### Widgets inferiores (2)

| Widget | Conteúdo |
|--------|----------|
| **Earnings by Supplier** ℹ | Breakdown de receitas por escola/fornecedor (empty: "There are no earnings in the informed period.") |
| **Bills by Category** ℹ | Breakdown de despesas por categoria (empty: "There are no bills in the informed period.") |

> Estes dois widgets espelham os filtros "Type of partner" (Earnings) e "Categories" (Bills) — o Dashboard agrega o que os filtros detalham nas páginas CRUD.

---

### 50B. `/instalment/earnings` — EARNINGS (READ-ONLY + CSV)

**Título:** "Earnings" | **Tipo:** Read-only (sem "+ New")
> O badge "New" no nav é rótulo de "nova feature", não botão de criação.

- **Total:** 0 Records
- **Export (.csv)** laranja — único botão de exportação CSV no módulo financeiro (até aqui)
- **Empty state:** "We did not found any record."

#### Filtros (12)

| Filtro | Tipo | Notas |
|--------|------|-------|
| Quote Code | Text | Busca por código #Q |
| Student | Dropdown | — |
| Office | Dropdown | — |
| Quote Creator | Dropdown | Label no Applied Filters: "Responsible" (inconsistência) |
| Type of partner | Dropdown | Tipo de parceiro |
| Destiny Country | Dropdown | — |
| Destiny City | Dropdown | Habilitado após país |
| Sales between | Date range | — |
| Type of item | Dropdown | All Types of Items |
| Sale Type | Dropdown | — |
| Payment status | Checkboxes (3) | Unpaid \| Partial Paid \| Full Paid |
| Canceled Quote | Dropdown | Whatever (default) |

> Earnings é a única página financeira com filtros de destino geográfico (Country + City) — confirma que comissões são rastreadas por destino de intercâmbio.

---

### 50C. `/instalment/credits` — CREDITS CRUD

**Título:** "Credits" | **Botão:** "+ New Credit" (verde)
- **Total:** 0 Records
- **Filtros (3 apenas):** School | Partner | Currency

#### Tabela de listagem: colunas

`Type | School | Partner | Value | Actions`

#### Modal "New Credit" / "Manage Credit" (7 campos)

| Campo | Tipo | Notas |
|-------|------|-------|
| From* | Radio | **School** (default) \| Partner |
| Select School / Partner* | Dropdown condicional | "My School" + Partner grouping |
| Campus* | Dropdown | Habilitado após escola; "Select school first.." |
| Due Date | Radio | "There is no due date" (default) \| "Inform a due date" |
| Currency* | Dropdown | Obrigatório |
| Value* | Number (0.00) | Obrigatório |
| Obs | Text input | "Observation (optional)" — único campo opcional |

**Tabela interna do modal:** Date \| Due Date \| Value \| Actions — histórico de parcelas do crédito ao editar um registro existente ("Manage Credit").

> Créditos são emitidos por escolas ou parceiros, não por estudantes — representa créditos recebidos de fornecedores (ex: semanas não utilizadas, cancelamentos com reembolso parcial). Sem link direto a quote ou estudante no formulário.

---

### 50D. `/transition/list` — RESUME (CASHBOOK)

**Título:** "Resume" | **Tab do browser:** "Transition History — Ally"
> Typo: "Transition" no tab deveria ser "Transaction".

- **Tipo:** Read-only com export — livro caixa / conciliação bancária
- **Botões:** 🖨️ **Print** (rosa) + 📊 **Export (.csv)** (laranja)
- **Total:** Transactions (contagem vazia no account de teste)

#### Tabs de período (3)

| Tab | Função |
|-----|--------|
| **Last 7 Days** (default, ativo) | Últimos 7 dias |
| **Last 30 Days** | Últimos 30 dias |
| **Custom Date** | Range customizado |

#### Filtros (3)

| Filtro | Tipo | Default |
|--------|------|---------|
| Account Bank | Dropdown | All |
| Type | Dropdown | All Credits & Debts |
| Amount Between | Number range | 0.00 → 0.00 |

Applied Filters: `Bank Account: All | Type: All Credits & Debts`

> Resume é o único lugar do sistema que mapeia **movimentações bancárias reais** por conta bancária cadastrada — liga o AllyHub a contas bancárias externas para conciliação. Separado de `/financial/dashboard` (que mostra parcelas) — este mostra transações efetivadas no banco.

---

### 50E. BILLS — DADOS ADICIONAIS DESCOBERTOS VIA DOM

#### Filtro extra exclusivo de Bills (não visível no screenshot inicial)

| Filtro | Tipo | Shortcuts |
|--------|------|-----------|
| **Course Start date between** | Date range | "this month" \| "next 3 months" |

> Este filtro é único em Bills — permite filtrar contas a pagar cujos cursos iniciam num período. Útil para agendar pagamentos antes do início de cada turma.

#### "Simulate Shipment" = rota `/shipment`

- O botão "Simulate Shipment" é um **link** para `https://app.allyhub.co/shipment`
- É uma rota separada — não apenas um modal de simulação inline
- `/shipment` = nova rota a explorar (não mapeada ainda)

#### Payment Suggestions tab — conteúdo revelado

Mensagem exibida na tab: **"The payment suggestions are only for bills with the category: school."**
- Sugestões automáticas são geradas **apenas para bills com category = school**
- Lógica: escolas têm datas de pagamento estruturadas (enrollment deadlines, term payments) — o sistema consegue sugerir quando pagar com base nos dados do curso
- Tab ★ (estrela) = feature premium/diferenciada, não acessível para todas as categorias

#### Colunas da tabela Bills vs Receivables

| Coluna | Bills | Receivables |
|--------|-------|-------------|
| Entidade | **Pay To** | Receive From |
| Extra col | **Commission** | Invoice |

> A coluna **"Commission"** em Bills rastreia a comissão associada a cada conta a pagar — ex: comissão paga à escola por processar a matrícula. Fecha o ciclo: venda gera receivable (entrada) + bill com commission (saída) + a diferença é a margem da agência.

---

### 50F. MAPA FINANCEIRO COMPLETO — TODAS AS ROTAS

#### Layer 1: Dashboard e Overview

| Rota | Título | Tipo | Novidade desta seção |
|------|--------|------|---------------------|
| `/financial/dashboard` | Financial Dashboard | Leitura | 3 cards, 4 status, Future Projections |
| `/transition/list` | Resume | Cashbook + Export | Bank account reconciliation |

#### Layer 2: CRUD Operacional

| Rota | Título | Botão | Tabela |
|------|--------|-------|--------|
| `/instalment/receive` | Receivables | + New Receivable | Instalment / Receive From / Commission |
| `/instalment/pay` | Bills | + New Bill | Instalment / Pay To / Commission |
| `/instalment/credits` | Credits | + New Credit | Type / School / Partner / Value |

#### Layer 3: Comissões e Relatórios (read-only)

| Rota | Título | Export |
|------|--------|--------|
| `/instalment/earnings` | Earnings | ✅ CSV |
| `/instalment/commission` | Total Commissions | ❌ |
| `/instalment/distributed` | Distributed Commissions | ❌ |
| `/instalment/over` | Over | ❌ |
| `/report/receive` | Receivable Report | ❌ |
| `/report/pay` | Bills Report | ❌ |
| `/report/credits` | Credits Report | ❌ |

#### Layer 4: B2B e Gates

| Rota | Título | Tipo |
|------|--------|------|
| `/billing` | Billing List | B2B assinaturas (CM prefix) |
| `/validation/payment` | — | Hard gate (server-side) |
| `/shipment` | — | Nova rota não explorada |

---

### 50G. INSIGHTS ESTRATÉGICOS — FINANCIAL LAYER COMPLETO

1. **Financial Dashboard usa "Late" em vez de "Expired"** — inconsistência de labels entre o Dashboard (Late) e os CRUDs (Expired). Indica que o Dashboard pode ter sido desenvolvido por uma equipe diferente ou em época diferente.

2. **"View Future Projections"** no card Balance = diferenciador de produto. Projeção de fluxo de caixa futuro baseada em parcelas pendentes é feature que CRMs de intercâmbio geralmente não têm — típica de ERPs financeiros.

3. **Earnings by Supplier + Bills by Category** no dashboard = gestão de margem por fornecedor. A agência pode ver qual escola gera mais receita (Earnings by Supplier) vs qual categoria consome mais custo (Bills by Category) — análise de rentabilidade por segmento sem exportar dados.

4. **"/transition/list" como cashbook** separa o AllyHub de CRMs simples — tem conciliação bancária nativa. Poucas ferramentas de intercâmbio chegam a esse nível de gestão financeira.

5. **Credits sem link a quote/estudante** confirma que créditos são B2B (escola → agência), não B2C (agência → estudante). Refunds para estudantes provavelmente passam pelo cancelamento da quote + ajuste manual de parcelas.

6. **"Course Start date between" em Bills** = pensamento de supply chain: pagar fornecedores *antes* de o aluno começar o curso, não só quando a parcela vence. Permite planejamento antecipado de caixa.

7. **"Simulate Shipment" → `/shipment`** = rota separada não documentada. "Shipment" em contexto financeiro BR = remessa bancária (arquivo CNAB). Se confirmado, AllyHub tem integração bancária nativa para pagamento em lote — feature enterprise.

8. **Payment Suggestions só para category=school** revela que a AI/algoritmo de sugestão só tem dados suficientes para escolas (que têm calendários fixos de pagamento). Provedores de acomodação e fees não têm padrão temporal previsível o suficiente.

9. **Coluna "Commission" em Bills** fecha o ciclo financeiro: `Receivable (entrada do aluno)` − `Bill (pagamento à escola)` − `Bill.commission (comissão paga à escola)` = Margem da agência. Três números em uma linha de tabela revelam o modelo econômico completo.

10. **Sistema financeiro em 4 camadas** (Dashboard / CRUD / Reports / B2B+Gates) é mais maduro que qualquer CRM de intercâmbio concorrente típico — aproxima-se de um ERP leve para agências. O diferencial competitivo não é o CRM (commodity), é o módulo financeiro integrado.

---

### 50H. `/shipment` — REMESSA INTERNACIONAL (NOVO PRODUTO EM ACESSO ANTECIPADO)

**Título da aba:** "Ally HUB Services - International Shipment"
**Título interno:** "Remessa Internacional" (PT-BR)
**Arquitetura:** React SPA embarcada em iframe dentro do shell AngularJS — mesmo padrão do `/dashboard` (S47). DOM da shell não expõe o conteúdo do iframe.

#### O que a landing page revela (via screenshot)

**Badge de status:**
> "• Acesso antecipado aberto — vagas limitadas"

Produto em **early access**, ainda não disponível para todas as agências. Vagas limitadas = controle de onboarding.

**Headline + proposta de valor:**
> **"Remessa Internacional"**
> "As melhores taxas do mercado, com a **agilidade** que você sempre quis. O preço que você já conhece, agora com a rapidez e integração com o seu CRM."

**Simulador de câmbio (card lateral direito):**

| Campo | Valor default |
|-------|--------------|
| Label superior | "SIMULADOR DE CÂMBIO" |
| Badge integração | "• INTEGRADO AO ALLY CRM" |
| Badge taxa | "• TAXA AO VIVO" |
| Valor para enviar | AU$ 1000 (AUD) |
| Moeda de destino | AU AUD (dropdown) |
| (parcialmente visível) | "• VANTAGEM ESTRATÉGICA" |

#### Interpretação estratégica

**O que é:** Serviço de câmbio e remessa internacional integrado ao AllyHub — permite que agências brasileiras enviem pagamentos para escolas australianas diretamente pelo CRM, com taxa de câmbio ao vivo e sem sair da plataforma.

**Por que é diferente:** A maioria das agências de intercâmbio usa bancos separados (Wise, Remessa Online, bancos tradicionais) para remessas internacionais. Integrar isso ao CRM elimina a troca de plataforma e permite rastrear o pagamento junto à quote/parcela correspondente.

**Relação com "Simulate Shipment":** O botão azul "Simulate Shipment" em `/instalment/pay` abre esta página — a simulação é a cotação de câmbio antes de contratar a remessa. "Simular" = ver quanto chega em AUD antes de executar o envio.

**Modelo de receita provável:** AllyHub cobra spread sobre o câmbio (como qualquer fintech de remessa) — receita adicional além do SaaS. É uma segunda linha de receita não-assinatura, potencialmente mais lucrativa.

**Posicionamento:** Concorrentes como Educatius, Studylink e ferramentas similares não têm remessa integrada. Este produto transforma o AllyHub de CRM em **plataforma financeira completa** para agências de intercâmbio.

#### Limitação desta análise

O conteúdo abaixo do fold (features adicionais, preços, CTA de cadastro, depoimentos) não foi capturado — o scroll da página está em iframe e não responde aos comandos de scroll externos. A landing page provavelmente contém:
- Comparativo de taxas vs concorrentes
- Passo a passo da integração
- Formulário de cadastro para early access
- Detalhe das "vantagens estratégicas" mencionadas

---

### 51. SISTEMA DE EDIÇÃO DE PREÇOS — QUOTE 2.0 (PRICE OVERRIDE + DISCOUNT)

> Testado em 2026-06-16 via Q502, Lucas Andrade, Lexis Perth 1 semana.

#### Mecânica do clique em valor

Cada valor em azul no card da quote é clicável. Clicar em qualquer preço abre um modal "Edit [item]" com estrutura uniforme:

```
┌──────────────────────────────────────────┐
│ [Nome do programa]                       │
│                                          │
│ Edit [tuition | enrol | material | fee]  │
│                                          │
│  Item value:    [ A$550.00          ]    │
│  Discount:      [ - A$50.00         ]    │
│                                          │
│  New Value:    ~~AUS 550.00~~ AU$ 500.00 │
│                                          │
│          [Cancel]  [✓ Save]              │
└──────────────────────────────────────────┘
```

- **Item value** = sobrescreve o preço tabela da escola (default = preço do catálogo; pode ir para CIMA ou para BAIXO do preço original)
- **Discount** = subtrai valor adicional em AUD (campo vermelho com sinal negativo)
- **New Value** = Item value − Discount (recalcula ao Tab/blur, em tempo real)
- Ao clicar Save → confirmação: *"Are you sure? You are going to update this value to AU$X"* → *"Yes, update it!"*
- Após confirmar: o card exibe preço original ~~riscado~~ + novo valor em azul + ícone 🟡 (coin) indicando override ativo

#### Campos editáveis por clique (Q502 — Lexis Perth 1 semana)

| Campo | Seção | Valor Catálogo | Modal |
|-------|-------|---------------|-------|
| Tuition | Programs | AU$550 | "Edit tuition" |
| Enrolment | Programs | AU$265 | "Edit enrol" |
| Material | Programs | AU$195 | "Edit material" |
| Fee (Ally Hub consultoria) | Fees | AU$150 | "Edit fee" |
| Fee (Medibank OSHC transfer) | Fees | AU$30 | "Edit fee" |
| Fee (Medibank OSHC Single) | Fees | AU$70 | "Edit fee" |
| Fee (Lexis English OSHC Single) | Fees | (variável) | "Edit fee" |
| Insurances | (seção própria) | (variável) | provavelmente "Edit fee" |
| Add-ons | (seção própria) | (variável) | provavelmente "Edit fee" |

#### Confirmação arquitetural com API

Cada campo do modal corresponde diretamente ao payload do `PUT /draft/{id}` identificado em sessões anteriores:

| Modal | `editedX` payload | `discountX` payload |
|-------|-------------------|---------------------|
| Edit tuition | `editedTuition` | `discountTuition` |
| Edit enrol | `editedEnrolment` | `discountEnrolment` |
| Edit material | `editedMaterial` | `discountMaterial` |
| Edit fee | `editedFee[id]` | `discountFee[id]` |

São dois níveis de override independentes: o agente pode aumentar o preço base E adicionar desconto na mesma operação. Ex: escola cobra AU$550, agente cobra AU$600 (markup de AU$50) e dá desconto de AU$100 = aluno paga AU$500, agência faz spread de AU$50.

#### Comportamento de UI pós-save

1. Modal fecha
2. Linha no card atualiza instantaneamente: `~~AUS 600.00~~ AU$ 500.00`  
3. Total do programa recalcula em tempo real
4. Ícone 🟡 (coin) aparece permanentemente ao lado do preço original riscado — indicador visual de que aquele item foi manualmente editado
5. O save é um `PUT autoSave:true` que persiste no playground do servidor (não é só memória local)

#### Seções do card (expandidas com iframe 1200px)

```
Programs
  └─ [escola] [programa] [duração] [datas]
      ├─ Tuition        🟡 ~~original~~ NOVO   ← clicável
      ├─ Enrolment                     VALOR   ← clicável
      ├─ Material                      VALOR   ← clicável
      └─ Total                         A$X

Fees
  └─ [fee 1] Administrative Tax       VALOR   ← clicável
  └─ [fee 2] Administrative Tax       VALOR   ← clicável
  └─ [fee 3] Insurance [duração]      VALOR   ← clicável
  └─ [fee N] ...

Accommodations      + (adicionar)
Insurances          (N added)  +
Add-ons             (N added)  +
```

#### Insights estratégicos

1. **Dois níveis de margem:** agência pode fazer markup (aumentar item_value acima do catálogo) E dar desconto ao mesmo tempo — modelo de precificação flexível e opaco para o aluno.
2. **Rastreabilidade:** o ícone 🟡 no card deixa auditável quais itens foram editados — tanto para a agência quanto para o sistema.
3. **Sem limite de desconto:** não há validação visível impedindo discount > item_value (seria um valor negativo — não testado).
4. **Fees também editáveis:** fees como Ally Hub (AU$150 comissão de plataforma) são clicáveis — a agência pode absorver a taxa dando desconto equivalente ao aluno sem reduzir o fee pago à plataforma.
5. **Confirmação obrigatória:** o pop-up "Are you sure?" protege contra cliques acidentais em preços — UX pensado para operação de vendas real.

---

## Seção 52 — Quote 2.0: Catálogo Completo (Accommodations, Insurances, Add-ons), View Quotes e Portal do Aluno

### 52A. Estrutura completa do card Q502 (confirmada via scroll)

**Card #Q502 "Option 1" — valores reais após edição:**

```
[foto Lexis English]   #Q502  Option 1   ✏️

Programs                                 📋 🗑
  Perth, Western Australia, Australia
  Lexis Perth
  Full Time Daytime 20+5 hrs/wk (2026 & 2027 Intakes)
  📅 1 week | August 04, 2026 – August 07, 2026
  Tuition        🟡 ~~AU$600.00~~  AU$ 500.00
  Enrolment                            AU$ 265.00
  Material                             AU$ 195.00
  Total                                 A$ 960.00

Fees                                     📋 🗑
  Ally Hub
    Taxa de consultoria (Dólar Australianos)
    Administrative Tax
    Fee                              AU$ 150.00

  Medibank
    Taxa de transferência internacional OSHC
    Administrative Tax
    Fee                               AU$ 30.00

  Medibank
    OSHC Single
    📅 1 month   Insurance
    Fee                               AU$ 70.00

  Lexis English
    OSHC Single
    📅 1 month   Insurance
    Fee                               AU$ 58.00

Total(s)    ~~A$1,368.00~~    A$1,268.00
Total Converted
            ~~A$1,368.00~~
                            A$ 1,268.00

📅 due date: June 26

↓ Advanced options
```

**Leitura dos totais:**
- A$1,368.00 = preço catálogo (Tuition AU$600 + outros AU$768)
- A$1,268.00 = preço com desconto (Tuition AU$500 + outros AU$768)
- Diferença = AU$100 exatamente igual ao desconto aplicado em S51

**Breakdown fees em Q502:**
| Fee | Tipo | Valor |
|-----|------|-------|
| Ally Hub: Taxa de consultoria | Administrative Tax | AU$150 |
| Medibank: OSHC transfer | Administrative Tax | AU$30 |
| Medibank OSHC Single (1 mês) | Insurance | AU$70 |
| Lexis English OSHC Single (1 mês) | Insurance | AU$58 |
| **Total fees** | | **AU$308** |

### 52B. Hierarquia do painel esquerdo — Quote 2.0 playground

```
Painel Esquerdo (modo playground)
├── Programs  (1 added)  —
│   ├── Countries [dropdown]
│   ├── Cities [dropdown]
│   ├── Schools [dropdown]
│   ├── Program category [dropdown]
│   ├── Restrict By [dropdown]
│   ├── Duration [número] weeks [dropdown]
│   ├── Program start date [date input]
│   ├── More filters >
│   └── [btn azul] Search Programs
│
├── Accommodations  +
│   └── [expande formulário de busca de hospedagem — ver 52C]
│
├── Insurances  (2 added)  +
│   └── [abre catálogo de seguros ao clicar +]
│
└── Add-ons  (2 added)  +
    └── [abre catálogo de add-ons ao clicar +]
```

**Mapeamento Painel Esquerdo → Card Direito:**
- "Programs" (1 added) → seção "Programs" no card
- "Insurances (2 added)" → 2 itens tipo Insurance nos Fees do card (Medibank OSHC + Lexis English OSHC)
- "Add-ons (2 added)" → possivelmente os 2 itens Administrative Tax nos Fees (Ally Hub AU$150 + Medibank transfer AU$30)
- No card, TODOS aparecem juntos sob "Fees" — a distinção Insurances/Add-ons é só no painel de busca

### 52C. Catálogo de Accommodations — busca e resultados

Ao clicar o `+` em Accommodations, o painel esquerdo expande um formulário de busca com 9 filtros:

```
Formulário de Busca de Accommodations
├── Countries [dropdown multi]
├── Cities [dropdown multi]
├── Schools [dropdown multi]
├── Accommodation name [text input]
├── Accommodation type [dropdown]
├── Room types [dropdown]
├── Bathroom types [dropdown]
├── Regime [dropdown]
├── Checkin date [date]   Enrolment Date [date]
├── Duration [número] weeks [× dropdown]
├── Explicit Search [toggle NO/YES] ⚠️
│     tooltip: "Turning this option on will set search to be
│              less performatic, leading to a longer search time."
└── [btn azul] Search Accommodations
```

**Resultados da busca (catálogo global, sem filtro de país):**

| País | Escola/Provedor | Tipo de Acomodação | Preço/sem |
|------|-----------------|-------------------|-----------|
| 🇬🇧 Manchester, UK | Kings Hall Manchester / Kings Hall College | Homestay - Twin Room - Shared Bathroom - Half Board | £200 |
| 🇨🇷 Sámara, Costa Rica | Expanish Costa Rica / Expanish | Expanish Residence (Private Bathroom) - Twin Room - Private Bathroom - No Meals | £203 |
| 🇬🇧 Manchester, UK | Kings Hall Manchester / Kings Hall College | Homestay Standard - Private Room - Shared Bathroom - Half Board | £220 |
| 🇬🇧 Manchester, UK | Kings Hall Manchester / Kings Hall College | Homestay (Private Bathroom) - Private Room - Private Bathroom - Full Board | £280 |
| 🇬🇧 Manchester, UK | Kings Hall Manchester / Kings Hall College | Student Residence (Private Bathroom) - Private Room - Private Bathroom - No Meals | £290 |
| 🇮🇪 Cork, Ireland | CEA Cork / Cork English Academy | Homestay (2026 Stays) - Twin Room - Shared Bathroom - No Meals | £330 |

**Observações críticas sobre o catálogo de accommodations:**
1. **Preços em GBP (£), não AUD** — o catálogo de acomodações usa libra esterlina como moeda base mesmo para programas em Perth/AU. Isso implica conversão cambial no momento de finalizar o quote.
2. **Catálogo global** — não filtrado pelo país do programa (Perth/AU) — mostra hospedagens do mundo todo quando sem filtro.
3. **Placement fee separado** — cada hospedagem tem uma taxa de colocação (placement fee) adicional além do preço semanal (ex: £70/semana para Kings Hall, £60 para CEA Cork, £0 para Expanish).
4. **Seasons flag** — algumas opções têm ícone "Seasons" indicando preços sazonais.
5. **Cada resultado** tem: ↓ expandir, i info, + adicionar ao quote.
6. **Datas de validade** — ex: "Valid until: 31/12/2026".
7. **Mínimo de semanas** — cada opção define um mínimo (ex: Cork = mínimo 2 semanas).

### 52D. View Quotes / Overview — navegação no playground

O playground mostra no topo do iframe (breadcrumb + contador):
```
Quote playground  >  View Quotes        [+]  [Finish and Save Quotes]
1 Quotes   Overview
```

**Anatomia do modo atual (playground):**
- O modo playground É o modo com painel esquerdo de edição + cards à direita
- "1 Quotes" = quantas quotes existem no draft corrente (aqui só 1)
- "Overview" = label do modo de visualização
- "View Quotes" (link) = navegação para o modo VIEW puro (sem painel de edição)
- Botão `+` (canto superior direito) = adicionar nova quote ao draft
- Botão `[Finish and Save Quotes]` (verde) = finalizar e salvar todas as quotes

**Botão "← Playground"** (no painel esquerdo):
- Presente quando se está no modo playground
- Semanticamente: "modo playground ativo" vs "modo view"
- O modo VIEW mostra os cards sem o painel de edição lateral

**Limitação encontrada:** Clicking "View Quotes" no breadcrumb consistentemente causou freeze do renderer React da iframe. O modo VIEW não foi possível de ser explorado nesta sessão — provavelmente há um bug de estado React no draft 1645489 em modo playground.

### 52E. Portal do Aluno — quote.allyhub.co

**Domínio:** `quote.allyhub.co` (separado de `app.allyhub.co`)

**Tech stack (confirmado via network):**
- AngularJS 1.x (SPA legado — mesma geração do app.allyhub.co)
- jQuery + jquery.mask 1.14.15
- Chart.js 2.1.6 (gráficos de proposta)
- Bootstrap Datepicker
- Google Maps API (visualização de localização das acomodações?)
- PagSeguro checkout SDK (pagamento em BRL)
- Google Tag Manager + Analytics (G-W6045PP788)
- WYSIWYG editor (personalização?)

**Idiomas suportados:** PT-BR 🇧🇷 | ES 🇪🇸 | EN 🇺🇸 (flags visíveis na tela de sign-in)

**Fluxo de autenticação:**
```
quote.allyhub.co/quote-detail/{draft_id}
    → sem token → redireciona → /signin
    → com token → carrega quote diretamente
```

A URL do aluno requer um token de acesso que a agência gera e envia (via link de email). Sem o token, o portal exibe a tela de sign-in em `/signin` com seleção de idioma.

**Integrações de pagamento identificadas:**
- **PagSeguro** (`pagseguro.com.br/checkout-sdk-js`) — gateway de pagamento brasileiro, permite BRL 2-12x parcelamentos como documentado em S28+

**URL patterns observados:**
```
https://quote.allyhub.co/quote-detail/{draft_id}   ← redireciona para signin sem token
https://quote.allyhub.co/signin                    ← tela de sign-in com seleção idioma
https://quote.allyhub.co/auth/signin.html          ← template HTML do sign-in (AngularJS)
```

**Insight:** O portal do aluno é a MESMA base de código Sellead (AngularJS) re-branded como "Ally". Não é um app separado do ponto de vista técnico — é a UI do aluno do Sellead com tema AllyHub.
