# Cotações & Study Plans

Módulo principal do Movy Internal Hub: criação, simulação e geração de propostas
(PDF) de planos de estudo para alunos que vão estudar/trabalhar na Austrália.

## Visão geral do fluxo

```
Lista de cotações ──► Editor (simulador) ──► Proposta / PDF
  /study-plans          /study-plans/[id]      /study-plans/[id]/proposal
```

1. **Lista** (`app/[locale]/(protected)/study-plans/page.tsx`): tabela com todas
   as cotações, total estimado e link para a proposta.
2. **Editor** (`components/study-plans/StudyPlanEditor.tsx`): formulário client-side
   que monta a cotação (dados do aluno, cursos, custos, parcelamento) e salva no
   Supabase via server action.
3. **Proposta** (`components/study-plans/StudyPlanProposal.tsx`): documento branded
   Movy, pronto para imprimir/salvar como PDF.

## Modelo de dados

Persistido na tabela `study_plans`; o conteúdo da cotação fica em `data` (JSONB).
Tipos em `lib/study-plans/types.ts`.

| Tipo | Campos principais |
|------|-------------------|
| `StudyPlanData` | `student`, `applicantType`, `currentVisaExpiry`, `consultant`, `email`, `phone`, `courses[]`, `extraCosts[]`, `payments[]`, `notes` |
| `StudyCourse` | `type` (`elicos`\|`vet`\|`he`), `provider`, `name`, `start`, `enrolmentFee`, `tuition`, `ratePerWeek`, `materialFee`, `hasMaterial`, `scholarship`, `depositWeeks`, `paymentParts`, `segments[]`, **`modules?`** (ELICOS), **`gapBeforeWeeks?`**, **`paymentCadenceDays?`** |
| `ElicosModule` | `name` (General English\|Cambridge\|IELTS\|EAP), `ratePerWeek`, `weeks` |
| `CourseSegment` | `label`, `kind` (`study`\|`holiday`), `weeks` |
| `ExtraCost` | `item`, `category` (`oshc`\|`visa`\|`admin`\|`medical`\|`other`), `amount` |
| `PaymentItem` | `item`, `due`, `amount` |
| `StudyPlanRow` | linha do banco: `id`, `title`, `student_name`, `applicant_type`, `status` (`draft`\|`sent`\|`accepted`\|`archived`), `data`, auditoria |

`applicantType` (`Individual`\|`Casal`\|`Família`\|`Single Parent`) define o template
de custos adicionais aplicado (ver `createExtraCosts` em `defaults.ts`).

## Cálculos financeiros

Toda a matemática vive em `lib/study-plans/calculations.ts` (fonte única, usada
tanto pelo editor quanto pela proposta — garante consistência).

**Por curso:**
- `courseTuition` = ELICOS com módulos: `Σ (módulo.weeks × módulo.ratePerWeek)`; ELICOS sem módulos: `semanas de estudo × ratePerWeek`; VET/HE: `tuition`.
- `courseMaterial` = 0 para HE; 0 para VET sem material; senão `materialFee`.
- `courseTotal` = `enrolmentFee + tuition + material − scholarship`.
- `courseDeposit` = ELICOS: `enrolment + material + min(semanas estudo, depositWeeks) × ratePerWeek`; VET/HE: `enrolment + material`.
- `coursePaymentBalance` = `max(0, courseTotal − courseDeposit)`.

**Por plano:**
- `planCoursesTotal` = Σ `courseTotal`.
- `planExtrasTotal` = Σ custos adicionais.
- `planGrandTotal` = `planCoursesTotal + planExtrasTotal`.
- `planCourseDeposits` = Σ `courseDeposit`.
- `planPaymentBalance` = Σ `coursePaymentBalance`.

**Invariante verificada:** `(planCourseDeposits + planExtrasTotal) + planPaymentBalance = planGrandTotal`
(quando nenhum saldo é zerado por bolsa). É isso que o painel de totais da proposta
mostra como *Depósito no fechamento + Saldo a parcelar = Investimento total*.

**Datas / cronograma:** `buildSchedule` encadeia os segmentos de cada curso a partir
de `course.start`, somando as semanas, e insere a **férias de transição** (`gapBeforeWeeks`,
máx 8) antes de um curso AQF. `addDays`/`addMonths`/`nextMonday`/`daysBetween` calculam
**em UTC** (consultores rodam em UTC+8). ELICOS inicia sempre numa **segunda-feira**
(`nextMonday`) e tem segmentos gerados pela **regra 12 estudo + 4 férias**
(`buildElicosSegments`, a partir dos módulos).

**Novo vencimento do visto** (`planNewVisaDate` → `visaExpiry`) pelas regras Home Affairs,
a partir do fim do último curso (`planCourseEnd`, CoE):
- pathway **≥10 meses** terminando **nov/dez** → **15 de março** do ano seguinte;
- pathway **≥10 meses** terminando jan–out → **+2 meses**;
- pathway **<10 meses** → **+1 mês**.

**Parcelamento com datas reais** (`datedInstallments`): depósito + extras "no fechamento",
depois cada curso divide o saldo em `paymentParts` parcelas espaçadas por
`paymentCadenceDays` (**7 / 30 / 45 / 90 / 120** dias) a partir do início do curso, com
vencimentos calculados. A última parcela absorve o resto do arredondamento (soma exata).

**Linha do tempo:** o editor renderiza um Gantt com eixo de meses, blocos estudo/férias
e marcadores de **CoE** e **vencimento do visto** (componente `Timeline`).

## Geração de PDF

Não há dependência de servidor para PDF. A rota `/study-plans/[id]/proposal` renderiza
um documento branded e usa `window.print()`:

- **Isolamento de impressão** (`printStyles` em `StudyPlanProposal.tsx`): ao imprimir,
  tudo fica `visibility: hidden` exceto `#movy-proposal`, que é reposicionado para
  ocupar a página inteira. O `AppShell` (sidebar) some no PDF.
- **`print-color-adjust: exact`**: força o navegador a imprimir os fundos/cores da
  marca (sem isso, o card de destaque roxo sairia branco no PDF).
- **`@page { size: A4; margin: 12mm }`** e `break-inside: avoid` nos blocos de curso.

O consultor abre a proposta, confere e clica em **Salvar PDF / Imprimir** → "Salvar
como PDF" do navegador. Funciona no serverless da Vercel sem libs pesadas.

> ⚠️ A proposta lê o registro **salvo** no banco. Editou no editor? Salve antes de
> abrir a proposta. (Guard de "salvar antes" está na Fase 1 do roadmap.)

## Permissões & auditoria

Server actions em `app/[locale]/(protected)/study-plans/actions.ts`:

- `createStudyPlan` / `updateStudyPlan`: exigem papel **editor ou acima**.
- `deleteStudyPlan`: exige **admin ou acima**.
- Toda ação grava em `audit_logs` via `logAuditWithClient`
  (`study_plan.create` / `.update` / `.delete`).
- RLS no Supabase reforça o acesso no nível do banco.

## Marca

O documento segue o Movy Brand Guide 2026 — ver [BRAND.md](BRAND.md).
Resumo: roxo `#4B1A77`/`#2A1153`, dourado `#FBB615`, fontes Outfit (display) +
Manrope (corpo) + Space Mono (labels).

## Preview local

`docs/` não embute o app, mas há um preview estático fiel do layout em
`Downloads/movy-cotacao-preview.html` (gerado para inspeção rápida do design e teste
de impressão sem precisar logar).

## Roadmap

**Fase 1 — documento enviável**
- Bloco de contato/legal da Movy + contato do aluno e do consultor.
- Guard de "salvar antes de gerar proposta" (ou auto-save).

**Fase 2 — distribuição**
- Link público read-only da proposta (sem login) para o aluno revisar/aceitar.
- Envio por e-mail / anexo do PDF.

**Fase 3 — polimento e escala**
- Proposta localizada (PT/EN/ES).
- Referência em BRL / câmbio.
- Capa, logos dos provedores, calendário visual de intakes.
- Status enviada/aceita ligado ao campo `status` + audit log.
