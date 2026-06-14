# DocuSeal — assinatura eletrônica / aceite forte para a proposta da Movy

> **Status:** pesquisa + avaliação de compatibilidade — **não** altera código, schema ou migrations.
> Diferente do Lago (deferido para a **v3**), o DocuSeal **encosta no fluxo de proposta/aceite que
> já está escopado no SPLIT 5** (rota pública + aceite). Por isso este documento avalia, com
> seriedade, **uma versão leve antes da v3**: primeiro um **aceite in-house** (já no SPLIT 5, sem
> dependência) e, depois, **DocuSeal** quando houver necessidade de assinatura juridicamente mais forte.
>
> **Repo do DocuSeal:** https://github.com/docusealco/docuseal · Site: https://www.docuseal.com ·
> Docs/API: https://www.docuseal.com/docs/api · Demo: https://demo.docuseal.tech
> **Documentos irmãos:** `docs/FUTURE-LAGO-V3.md` e `docs/LAGO-WOOFED-CONVERGENCE.md` (mesmo estilo
> de avaliação) · `docs/PRODUCT-ROADMAP.md` (arquitetura mestre, SPLITS, P1–P10).
> Última atualização: 2026-06-15

---

## 0. TL;DR / Veredito ("o que acho")

- **Sim, vale — mas em dois tempos.** O DocuSeal é um bom produto, open-source, API-first e
  **mapeia quase 1:1** no que o SPLIT 5 chama de **"aceite"** (link público + aceitar a proposta).
  O erro seria adotá-lo **cedo demais** como dependência para resolver algo que, na maioria dos
  casos da agência, um **aceite in-house simples** já resolve.
- **Tempo 1 — agora, no SPLIT 5 (sem DocuSeal):** implementar o **MVP-aceite in-house** — botão
  "Aceitar proposta" na rota pública que grava **nome + timestamp + IP + user-agent (+ checkbox de
  termos)** em **`proposal_events`** e **`audit_logs`**, e seta `study_plans.accepted_at`/`status`.
  É uma **assinatura eletrônica simples (aceite registrado)**, suficiente para "o aluno concordou
  com esta cotação". **Zero serviço novo, zero licença, zero conta externa.**
- **Tempo 2 — depois (v2, antes da v3/Lago):** integrar **DocuSeal como serviço externo** quando
  aparecer a necessidade de **assinatura forte em documentos formais** (contrato de prestação de
  serviço, termo de responsabilidade financeira, procuração/mandato, formulário de matrícula da
  escola) — onde se quer **trilha de auditoria assinada + certificado/PDF carimbado** e múltiplos
  signatários. Aí o DocuSeal entrega muito mais do que um aceite caseiro deveria tentar reimplementar.
- **Modelo de integração:** **igual ao Lago** — DocuSeal **por API + webhooks + assinatura embutida
  (embedded)**, **chaveado por `org_id` + `study_plan_id`** (`external_id` = id da proposta,
  `metadata` = `{ org_id, study_plan_id }`), **idempotência** no envio, **nunca absorver o schema**
  do DocuSeal no Postgres da Movy. Reusa os campos `external_id` / `metadata jsonb` / idempotência
  já reservados no **§3.7** do roadmap (convergência Lago × woofed).
- **Cuidado conceitual (a mesma fronteira do Lago):** **aceite de proposta** (aluno concorda com a
  cotação) **≠** **assinatura de contrato** (documento jurídico vinculante). O MVP-aceite cobre o
  primeiro; o DocuSeal entra para o segundo. Não conflar.
- **Riscos a registrar:** **AGPLv3 com Section 7(b) Additional Terms** (copyleft forte + termos
  adicionais de atribuição/branding — ver §8) e **validade jurídica** (ESIGN/UETA/eIDAS são alegações
  do fornecedor; no Brasil a régua é outra — **reportar com cautela, não exagerar**, §8).

---

## 1. O que é o DocuSeal

DocuSeal se descreve como a **alternativa open-source ao DocuSign/PandaDoc/Adobe Sign**: uma
plataforma para **criar formulários em PDF, preenchê-los e assiná-los online** em qualquer
dispositivo. É **API-first**, com **webhooks**, **componentes embutidos** e **self-host**.

- **Licença:** **AGPLv3 com Section 7(b) Additional Terms** (copyleft forte + termos adicionais —
  ver §8 Riscos). Existe **DocuSeal Cloud** (incl. `docuseal.eu` com servidores em Dublin) e
  **on-premises/self-host**.
- **Deploy:** **Docker** (`docker run … docuseal/docuseal`) e **Docker Compose** (Caddy emite SSL
  automático sob domínio próprio). Banco padrão **SQLite**; suporta **PostgreSQL/MySQL** via
  `DATABASE_URL`. Botões 1-clique para Heroku/Railway/DigitalOcean/Render.
- **Stack:** aplicação Ruby on Rails (relevante para a nota de licença: roda como **serviço
  separado**, não como biblioteca embutida no Next.js).
- **SDKs oficiais:** Node.js/JS, TypeScript, Python, Ruby, PHP, Java, C#, Go (+ cURL/CLI).
  Componentes embutidos para **React, Vue, Angular, JavaScript** e WebView mobile (Android/iOS/RN/Flutter).
- **Integrações no-code:** Zapier, Make.com, n8n, Power Automate. Há também AI Plugin/**MCP**.

### Capacidades centrais (objetos do domínio DocuSeal)

| Capacidade | O que faz | Objetos / conceitos |
|---|---|---|
| **Builder de formulário PDF (WYSIWYG)** | Marca campos em cima de um PDF/DOCX existente; **12+ tipos de campo** (signature, initials, date, text, number, image, checkbox, radio, select, file, stamp, phone, payment…) | `templates`, `fields` |
| **Submissões / pedido de assinatura** | Inicia um pedido com **um ou vários submitters** (signatários), por **e-mail ou telefone**; pré-preenche valores | `submissions`, `submitters`, `values` |
| **Fluxo de assinatura** | Assinatura online mobile-otimizada; **14 idiomas** de assinatura, 7 de UI; ordem de assinatura entre partes | signing form |
| **Documento concluído + auditoria** | Gera o **PDF assinado** automaticamente e uma **trilha de auditoria** (`audit_log_url`); verificação de assinatura do PDF | `audit_log_url`, `documents`, `completed_at` |
| **E-mails automáticos (SMTP)** | Convites e notificações por SMTP; e-mail/branding próprio (Pro) | SMTP |
| **Armazenamento** | Disco local ou **S3 / Google Storage / Azure** | storage backends |
| **API + Webhooks** | REST API (`X-Auth-Token`), webhooks de eventos de formulário/submissão | `/submissions`, webhooks |
| **Embedding / white-label** | Form de assinatura e builder embutidos no seu app; logo/white-label (Pro) | componentes embedded |

**Pro (pagos / não-core):** company logo & **white-label**, **roles**, **lembretes automáticos**,
verificação de identidade por **SMS**, **conditional fields/fórmulas**, **bulk send** (CSV/XLSX),
**SSO/SAML**, criação de template por **HTML API** e por **field tags** em PDF/DOCX.

### API — forma real (lida da referência)

- **Auth:** header `X-Auth-Token: API_KEY`. Base Cloud: `https://api.docuseal.com`.
- **Submissions:** `POST /submissions` (a partir de um `template_id`), `POST /submissions/pdf`,
  `POST /submissions/docx`, `POST /submissions/html`; `GET /submissions`, `GET /submissions/{id}`,
  `GET /submissions/{id}/documents` (PDFs parciais ou finais), `DELETE /submissions/{id}`.
- **Status de submissão:** `pending | completed | declined | expired`.
- **Campos que nos importam diretamente** (presentes no payload de submission/submitter):
  - **`external_id`** (na submission **e** no submitter) — id que **nós** controlamos → casa com
    o padrão **§3.7** do roadmap (espelha `customers.external_id` do Lago).
  - **`metadata`** (objeto livre por submitter) → casa com nosso **`metadata jsonb`**.
  - **`values`** (pré-preenchimento por nome de campo), **`send_email`/`send_sms`**, **`expire_at`**,
    **`completed_at`**, **`audit_log_url`**, e eventos do submitter (ex.: `event_type: "view_form"`).
- **Webhooks:** eventos de formulário/submissão (ex.: *form viewed/started/completed/declined* e
  *submission created/completed/expired/archived*).
  > **Nota de precisão (como no doc do Lago):** os nomes exatos dos eventos de webhook e de alguns
  > campos podem variar por versão. O que é **certo e relevante** para nós: existe `external_id`
  > controlado por nós, `metadata` livre, status de conclusão e `audit_log_url`. **Conferir a API
  > reference vigente ao implementar** — não inventar campo.

---

## 2. Features candidatas (mapeadas ao fluxo de proposta/aceite da Movy)

Ordenadas do **mais provável de fazer sentido** ao **menos**.

### 2.1 Aceite forte da proposta (candidata nº 1) — *mas só depois do MVP-aceite*
- **Movy hoje/alvo:** o **SPLIT 5** já prevê **rota pública sem login + aceite** e
  `study_plans.accepted_at` (SPLIT 2). Hoje o "aceite" pode ser um clique registrado.
- **Mapeamento DocuSeal:** a **proposta** vira um **template** (ou um PDF gerado server-side no
  próprio SPLIT 5), o **aluno** vira um **submitter**, e o aceite vira uma **submission completed**
  com **PDF assinado + `audit_log_url`**. `external_id = study_plan_id`, `metadata = {org_id, study_plan_id}`.
- **Quando faz sentido:** quando "concordo com a cotação" precisar virar **assinatura formal** (com
  carimbo de tempo, trilha assinada e documento imutável) — tipicamente em **contrato/termo**, não
  na cotação exploratória do dia a dia.

### 2.2 Assinatura de documentos formais multi-parte (candidata nº 2)
- **Caso de uso:** **contrato de prestação de serviço** da agência, **termo de responsabilidade
  financeira**, **procuração/mandato**, **formulário de matrícula** exigido pela escola — documentos
  que pedem **múltiplos signatários** (aluno + responsável + consultor/agência) e **trilha de auditoria**.
- **Mapeamento DocuSeal:** `submission` com **vários submitters** e **ordem de assinatura**; cada
  documento é um `template`. É exatamente o que um aceite caseiro **não** deveria reimplementar.
- **Por que encaixa:** é o ponto forte do produto (builder de campos, múltiplas partes, certificado).

### 2.3 Assinatura embutida (embedded) na própria UI da Movy (candidata nº 3)
- **Caso de uso:** assinar **dentro** da página de proposta/portal do cliente, sem "sair para outro
  site". DocuSeal oferece **componentes embedded** (React/JS) e **WebView** mobile.
- **Mapeamento Movy:** a rota pública do SPLIT 5 hospeda o `<docuseal-form>` apontando para a
  submission daquele `study_plan`; o evento `completed` dispara atualização de estado na Movy.
- **Interação com branding:** combina com o **white-label por org** já planejado no **SPLIT 8**
  (logo/cores/cabeçalho) — porém **white-label do DocuSeal é Pro** (ver §8).

### 2.4 Lembretes / verificação de identidade (candidata nº 4 — Pro)
- Lembretes automáticos de assinatura e **verificação por SMS** são **features Pro**. Úteis, mas
  **não** essenciais para v1/v2 e **não** devem virar dependência cedo.

### 2.5 Geração do PDF da proposta (NÃO delegar ao DocuSeal)
- O SPLIT 5 já prevê **PDF server-side** da proposta (apresentação/branding). **O DocuSeal não deve
  ser a fonte do PDF de apresentação** — ele assina/coleta sobre um documento; a Movy continua dona
  do **layout da proposta**. Misturar isso seria acoplar apresentação a um serviço de assinatura.

---

## 3. Avaliação de compatibilidade (o que encaixa / o que é over-engineering)

### ✅ O que encaixa bem
- **Mapa direto proposta↔submission, aluno↔submitter, aceite↔completed.** A semântica do DocuSeal
  cai exatamente sobre o que o SPLIT 5 já chama de aceite — sem violentar o domínio.
- **`external_id` + `metadata` nativos.** A API expõe **`external_id`** (controlado por nós) e
  **`metadata`** livre, casando 1:1 com os campos **§3.7** (`external_id`/`metadata jsonb`) e com a
  chave de junção determinística **`org_id` + `study_plan_id`** (espelha a fronteira Movy↔Lago).
- **Integração por API/webhooks/embedded** combina com a Movy (Next.js/Supabase: server actions +
  route handlers, como já fazemos com `/api/fx`). Webhook → atualiza estado/`proposal_events`.
- **Self-host sob nosso controle** (Docker/Compose, Postgres) alinha à postura "1 stack que
  controlamos" — DocuSeal como **serviço dedicado**, igual ao racional do Lago.
- **Documento concluído + `audit_log_url`** dá uma **trilha de auditoria assinada** que um aceite
  caseiro não produz — exatamente o que justifica o DocuSeal **quando** o documento é jurídico.

### ⚠️ O que é over-engineering / fricção
- **Adotar DocuSeal para o aceite simples do dia a dia.** Para "o aluno concordou com a cotação",
  rodar (ou pagar) um serviço de assinatura inteiro é **peso morto**. O **MVP-aceite in-house**
  (nome+timestamp+IP+UA em `proposal_events`/`audit_logs`) resolve, sem dependência. **Comece por aí.**
- **Absorver o schema do DocuSeal no Supabase.** **Não fazer.** Reimplementar templates/fields/
  submitters/audit nativamente seria reescrever o produto. Diferente do woofed (Caminho B, porque
  CRM é núcleo), **assinatura não é o núcleo da Movy** — é infra. Use o produto pronto via API.
- **Delegar o PDF de apresentação** ao DocuSeal (ver §2.5) — acopla layout a assinatura.
- **White-label/lembretes/SMS são Pro.** Desenhar a v2 dependendo de features pagas engessa custo;
  manter o caminho **core/self-host** funcionando primeiro.
- **AGPLv3 + Section 7(b):** copyleft forte **e** termos adicionais. Rodar **como serviço isolado**
  (container/processo próprio, comunicação por rede) mantém o app Next.js **não-derivado**; **não**
  linkar/embutir código AGPL no app. Avaliar juridicamente; Cloud evita a questão de licença do
  self-host (ver §8).
- **Operar mais um serviço** (Rails + Postgres + storage). Custo operacional real para v1; só se
  paga quando há documentos formais de verdade. Cloud reduz isso, mas é custo $ recorrente.

---

## 4. MVP-aceite in-house vs. DocuSeal (a decisão central)

| Eixo | **MVP-aceite in-house** (SPLIT 5, agora) | **DocuSeal** (v2, depois) |
|---|---|---|
| **O que prova** | "O aluno clicou em aceitar esta cotação" (assinatura eletrônica **simples**/aceite registrado) | "As partes **assinaram** este documento" (campos, múltiplas partes, **certificado/auditoria assinada**) |
| **Captura** | nome + `accepted_at` + **IP** + **user-agent** (+ checkbox de termos/versão da proposta) | desenho/imagem de assinatura, iniciais, data, campos, verificação (SMS/identidade — Pro) |
| **Onde grava** | `proposal_events` (timeline) + `audit_logs` (imutável) + `study_plans.accepted_at`/`status` | DocuSeal (dono); Movy guarda **referência** (`external_id`, status, `audit_log_url`) em `metadata jsonb` |
| **Documento final** | a própria proposta (PDF server-side do SPLIT 5) + registro do aceite | **PDF assinado** + trilha de auditoria do DocuSeal |
| **Múltiplos signatários** | não (1 aceite) | **sim** (aluno + responsável + agência, com ordem) |
| **Dependência externa** | **nenhuma** | serviço DocuSeal (self-host ou Cloud) + licença |
| **Custo** | ~zero | infra (self-host) **ou** $ (Cloud); features fortes são Pro |
| **Esforço** | baixo (cabe no SPLIT 5) | médio (serviço + webhooks + estado + jurídico) |
| **Força jurídica** | aceite registrado (suficiente para cotação; ver §8 — cautela) | assinatura mais forte, com trilha — **ainda** sujeita à régua local (§8) |

**Regra prática:** o aceite in-house é o **default** do produto. **Só introduzir DocuSeal quando o
aceite caseiro começar a doer** — isto é, quando o documento deixa de ser "cotação aceita" e passa a
ser **contrato/termo que precisa de assinatura formal, múltiplas partes e certificado**. Antes disso,
DocuSeal é peso. (Mesmo espírito do "só introduzir Lago quando o metering caseiro doer".)

---

## 5. Modelo de integração recomendado (quando entrar)

**DocuSeal como serviço externo, integrado por API + webhooks + assinatura embutida.** Nunca
absorver o schema. **Chave de junção:** `org_id` + `study_plan_id`.

```
                Movy (Next.js + Supabase, RLS por org_id)
                  │
                  │  (1) consultor clica "Enviar para assinatura" numa proposta
                  ▼
        server action / route handler  ──(2) POST /submissions──▶   DocuSeal (self-host ou Cloud)
        external_id = study_plan_id                                  - template (proposta/contrato)
        metadata = { org_id, study_plan_id }                         - submitters (aluno/responsável)
        idempotência (id+versão)                                     - signing form (e-mail/embedded)
                  ▲                                                  - PDF assinado + audit_log_url
                  │  (4) webhook: submission completed/declined/
                  └──── expired (+ external_id de volta) ───────────┘
                  │
                  ▼
        Movy reage: grava proposal_events (kind=signed/declined),
        seta study_plans.accepted_at, guarda referência (submission id,
        status, audit_log_url) em metadata jsonb — SEM virar dona do documento.
```

Princípios da fronteira (espelham `FUTURE-LAGO-V3.md` §4):
- **Movy = dona do dado/negócio e do acesso** (proposta, RLS por `org_id`, roles). **DocuSeal = dono
  do ato de assinatura** (coleta → PDF assinado → trilha). Uma direção de verdade para cada coisa.
- **Chave de junção:** `org_id` + `study_plan_id` ↔ `external_id` da submission. Determinístico.
- **Idempotência:** enviar a submission com chave determinística (derivada de `study_plan_id`+versão)
  para reenvio seguro — reusa **R8/§3.7**. Webhook tratado de forma idempotente (mesmo evento 2× = no-op).
- **Persistência mínima na Movy:** **não** criar espelho do schema do DocuSeal. Guardar só a
  **referência** em `study_plans.metadata jsonb` (ou, se virar volume, uma tabela fina
  `proposal_signatures(org_id, study_plan_id, provider, external_id, status, audit_log_url,
  metadata jsonb, …)` — **org-scoped + RLS**, woofed-shaped, sem copiar campos do DocuSeal).
- **Eventos (R10):** assinatura entra em **`proposal_events`** (timeline de negócio, ex.:
  `kind = "signature_sent" | "signed" | "declined"`) e gera `audit_logs` (sistema). **Não** conflar
  com `events` do Lago (metering, v3).
- **Fallback:** se o DocuSeal estiver indisponível, **não travar** a operação — a proposta segue
  válida; o envio para assinatura é uma ação à parte, com fila/retry no webhook.
- **Cloud vs self-host:** começar (se chegar à v2) em **Cloud** para validar o fluxo sem custo de
  infra; migrar para **self-host** se volume/licença/jurídico justificarem.

---

## 6. Em qual versão / SPLIT entra

- **Agora — SPLIT 5 (v1): MVP-aceite in-house.** Faz parte do escopo já planejado do SPLIT 5 (rota
  pública + aceite + validade visível). **Sem DocuSeal, sem dependência.** Deixa o **seam de
  assinatura** pronto (ver §7) para um provedor externo plugar depois — mesmo padrão `CourseSource`
  (editor↔portfólio) e fronteira-de-serviço do Lago.
- **Depois — "v2" (assinatura forte), **antes** da v3/Lago: DocuSeal.** Quando houver documentos
  formais a assinar. Encaixa naturalmente **após o SPLIT 5 (aceite/rota pública)** e **SPLIT 8
  (branding/white-label por org)**, porque assinatura embutida quer branding por org. Não exige a
  fundação de billing (v3); é independente do Lago.
- **Pré-condição de produto:** existir **demanda real** por assinatura formal (contrato/termo), não
  só "seria legal ter". Enquanto o aceite simples bastar, **não abrir** o tema.

Resumo de posicionamento: **MVP-aceite = v1/SPLIT 5 (in-house)** · **DocuSeal = v2 (externo, opcional,
condicionado)** · **Lago = v3**. DocuSeal é o **único** dos três que tem uma parcela **acionável já**
(o seam do aceite no SPLIT 5).

---

## 7. Pré-requisitos antes de integrar o DocuSeal

Não abrir a integração DocuSeal enquanto **todos** abaixo não forem verdade:

1. **MVP-aceite in-house no ar (SPLIT 5)** — rota pública + aceite registrado em
   `proposal_events`/`audit_logs` + `accepted_at`, funcionando e auditável. É a base e, na maioria
   dos casos, o suficiente.
2. **Seam de assinatura desenhado** — uma interface fina (ex.: `SignatureProvider` com
   `requestSignature(studyPlanId)` / `handleWebhook(payload)`), com **provider in-house como default**;
   DocuSeal vira **mais um provider**, sem reabrir a rota pública. (Espelha o contrato `CourseSource`.)
3. **`org_id`/tenancy estável em produção** — SPLIT 0 concluído, RLS por org validado (a referência
   da assinatura é **org-scoped**).
4. **Campos §3.7 disponíveis** — `external_id` + `metadata jsonb` (+ idempotência determinística) nas
   entidades de borda (`study_plans`), conforme já antecipado no roadmap.
5. **Branding por org (SPLIT 8)** — se a assinatura for embutida/white-label, o branding por org
   precisa existir (e há a questão de white-label ser **Pro** no DocuSeal).
6. **Necessidade jurídica real + clareza de licença** — demanda concreta por documento formal **e**
   decisão Cloud vs self-host (AGPLv3 + Section 7(b)) revisada com jurídico (§8).

---

## 8. Riscos e alternativas

**Riscos**
- **Licença AGPLv3 + Section 7(b) Additional Terms.** Copyleft forte **mais** termos adicionais
  (tipicamente atribuição/retenção de branding). Mitigar rodando o DocuSeal **como serviço isolado**
  (rede/API; o app Next.js **não** vira obra derivada) e **não** embutindo código AGPL no app.
  **Cloud** evita a questão de licença do self-host. **Validar com jurídico** antes da v2 — ler
  `LICENSE` e `LICENSE_ADDITIONAL_TERMS` do repo. (Mesmo cuidado registrado para o Lago.)
- **Validade jurídica — reportar com cautela, não exagerar.** O DocuSeal **alega** conformidade com
  **ESIGN/UETA (EUA)** e **eIDAS (UE)** (SES/AES/QES), e cita certificações de **segurança**
  (SOC 2, ISO 27001, HIPAA, GDPR no `docuseal.eu`). **Atenção:** (a) "legalmente vinculante" depende
  de **jurisdição e tipo de documento**; (b) a Movy opera com público **Brasil × Austrália** — no
  **Brasil** a referência é a **MP 2.200-2/2001 (ICP-Brasil)**, onde assinatura **eletrônica simples**
  é válida entre as partes mas tem **peso probatório menor** que a **assinatura digital qualificada
  (certificado ICP-Brasil)**; eIDAS/ESIGN **não** se aplicam automaticamente aqui. **Não prometer
  "assinatura juridicamente válida"** de forma genérica — tratar como **aceite/assinatura eletrônica
  simples** salvo parecer jurídico em contrário. As certificações são de **segurança da plataforma**,
  não garantia de **validade jurídica** do documento.
- **Complexidade operacional** (mais um serviço: Rails + Postgres + storage/S3).
- **Sincronização eventual** (webhooks podem falhar — exige fila/retry/idempotência).
- **Dependência de features Pro** (white-label, lembretes, SMS, SSO) — risco de lock-in de custo.
- **Acoplar apresentação a assinatura** — manter o PDF da proposta (SPLIT 5) **fora** do DocuSeal.

**Alternativas a considerar na época da decisão**
- **Aceite in-house (default).** O MVP do SPLIT 5; estendível com hash do PDF + carimbo de tempo
  para reforçar a trilha sem serviço externo. Suficiente para a maioria das agências.
- **Outros e-sign open-source/SaaS** (ex.: **OpenSign**, ou serviços como DocuSign/Adobe Sign/
  Clicksign/D4Sign no contexto BR) — avaliar o cenário vigente na época, sobretudo se houver
  exigência de **ICP-Brasil**.
- **Assinatura digital ICP-Brasil** (se algum documento exigir validade qualificada no Brasil) —
  caminho à parte, possivelmente fora do DocuSeal.

Regra prática: **só introduzir DocuSeal quando o aceite in-house começar a doer** (documentos
formais, múltiplas partes, necessidade de trilha assinada/certificado). Antes disso, é peso.

---

## 9. Terminologia (consistência com o roadmap)

- `org_id` / `organizations` — fronteira de tenant (P1, §3.1). Vira a chave de escopo da assinatura;
  com `study_plan_id` forma o `external_id` da submission DocuSeal.
- `study_plans` / **proposta** — documento **cliente-final** (cotação ao aluno). `accepted_at`/
  `status` registram o aceite. **≠ contrato** (assinatura formal, DocuSeal) **≠ invoice** (Lago, v3).
- `proposal_events` (timeline woofed-shaped) ≠ `audit_logs` (sistema) ≠ `events` do Lago (metering).
  Assinatura entra em `proposal_events` (`kind = signature_sent|signed|declined`) + `audit_logs`.
- `external_id` / `metadata jsonb` / **idempotência** — padrões **§3.7** (convergência Lago × woofed);
  reusados aqui para chavear a submission DocuSeal sem absorver schema.
- **SPLITS:** **SPLIT 5** (proposta/PDF/aceite — onde mora o MVP-aceite e o seam) · **SPLIT 8**
  (branding/white-label por org) · **SPLIT 0** (tenancy) · **SPLIT 2** (`accepted_at`, `proposal_events`).
- **MVP-aceite** = aceite in-house (assinatura eletrônica simples registrada). **DocuSeal** =
  assinatura forte via serviço externo (v2). **Lago** = billing (v3).

---

## 10. PATCHES A APLICAR (após os workers de docs)

> **Por que aqui:** `docs/PRODUCT-ROADMAP.md`, `.wolf/cerebrum.md` e `.wolf/anatomy.md` estão sendo
> editados/commitados por **outro agente** agora. Para evitar colisão, os textos abaixo ficam
> **prontos para colar** quando os workers de docs fecharem. Todos são **aditivos** (apêndice/nova
> linha/subseção) e seguros independentemente do estado atual desses arquivos.

### PATCH 1 — `docs/PRODUCT-ROADMAP.md` · nota no **SPLIT 5** (seam de aceite/e-signature + opção DocuSeal)

Adicionar, no bloco do **SPLIT 5 — Visualização / PDF / compartilhamento da proposta**, logo após a
linha de **Recursos** (que já cita "link público + aceite"):

```markdown
- **Aceite/e-signature (seam):** o "aceite" é uma **assinatura eletrônica simples in-house** —
  registra **nome + `accepted_at` + IP + user-agent** (+ checkbox de termos/versão) em
  `proposal_events` (`kind=signed`) + `audit_logs`, e seta `study_plans.accepted_at`/`status`.
  **Sem dependência externa.** Desenhar como `SignatureProvider` (provider in-house default) para
  que uma assinatura **mais forte via terceiros** possa plugar depois **sem reabrir a rota pública**.
  Opção futura documentada (v2, antes da v3/Lago): **DocuSeal** (open-source, self-host) por
  API + webhooks + embedded, chaveado por `org_id` + `study_plan_id` (`external_id`/`metadata`/
  idempotência do §3.7). Ver `docs/FUTURE-DOCUSEAL.md`. Não delegar o PDF de apresentação ao DocuSeal.
```

### PATCH 2 — `docs/PRODUCT-ROADMAP.md` · §8 (fora de escopo) — reframe + cross-link de futuro

A §8 atual diz: *"…assinatura eletrônica via terceiros (DocuSign/Adobe)…"* fora de escopo.
**Acrescentar** ao final da §8 (não remover o texto existente):

```markdown
**Assinatura eletrônica — esclarecimento:** o **aceite** da proposta (assinatura eletrônica
**simples** in-house) está **dentro** de escopo no **SPLIT 5** (não depende de terceiros). O que fica
para o futuro é a **assinatura forte via serviço externo**. A opção open-source/self-host avaliada é o
**DocuSeal** (https://github.com/docusealco/docuseal) — ver `docs/FUTURE-DOCUSEAL.md` (avaliação,
MVP-aceite vs. DocuSeal, modelo de integração, riscos AGPL/validade jurídica). Posicionamento:
**MVP-aceite = v1/SPLIT 5** · **DocuSeal = v2 (opcional, condicionado)** · **Lago = v3**.
```

### PATCH 3 — `docs/PRODUCT-ROADMAP.md` · §3.7 (campos de integração) — reuso pelo DocuSeal (1 linha)

Adicionar ao final da subseção **§3.7** (logo após a "Armadilha de vocabulário"):

```markdown
**Reuso (assinatura):** os mesmos `external_id`/`metadata jsonb`/idempotência chaveiam uma submission
de assinatura externa (DocuSeal) por `org_id` + `study_plan_id`, sem absorver o schema do provedor —
ver `docs/FUTURE-DOCUSEAL.md`.
```

### PATCH 4 — `.wolf/anatomy.md` · registrar o novo doc (anexar à lista da seção `docs/`)

```markdown
- `docs/FUTURE-DOCUSEAL.md` — avaliação do DocuSeal (assinatura eletrônica open-source, alternativa
  ao DocuSign) para o fluxo de proposta/aceite: MVP-aceite in-house (SPLIT 5) vs. DocuSeal (v2),
  modelo de integração (API/webhooks/embedded, chaveado por `org_id`+`study_plan_id`), riscos
  (AGPLv3+Section 7(b), validade jurídica). Irmão de `docs/FUTURE-LAGO-V3.md`.
```

### PATCH 5 — `.wolf/cerebrum.md` · nova entrada de decisão (anexar ao final da seção de decisões)

```markdown
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
```
