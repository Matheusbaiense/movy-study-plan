# Blueprint do concorrente — Ally / AllyHub

> **Origem:** análise de UX dos vídeos públicos do AllyHub (YouTube), resumida pelo dono e
> consolidada aqui (2026-06-15). **NÃO** veio do código do concorrente — é pesquisa de UX/produto.
> **Status:** insumo de roadmap para splits futuras. Só a parte de **opções** está sendo executada
> agora (SPLIT 4 · fatia B). Tudo o mais é backlog mapeado abaixo.

## Como o AllyHub é estruturado (ecossistema de 3 camadas)

1. **CORE (backend)** — "Motor de Preços": processa moeda + nacionalidade. É a peça central.
2. **AGENT INTERFACE** — "Playground" de orçamentos: monta **múltiplas opções** dinamicamente (abas).
3. **CLIENT INTERFACE** — landing page pública: o link que o aluno acessa, com a identidade da agência.

Desafios que o próprio blueprint destaca: **sincronização de preços** (busca == config da escola) e
**RBAC** (consultor não vê documento marcado só para "Financeiro").

---

## Mapa AllyHub → Movy (o que fazer e quando)

| Módulo AllyHub | Vídeos | Status Movy | Onde entra |
|---|---|---|---|
| **Múltiplas opções na proposta** (abas Opção 1..5, independentes, duplicáveis, comparação lado a lado) | 1, 2 | **Em execução** | **SPLIT 4 · fatia B** (`data.options[]`) |
| **Render público das opções** (cliente vê opção A vs B, recomendada destacada) | 1, 2 | **Em execução (B2)** | SPLIT 4 · fatia B2 (`StudyPlanProposal`) |
| **Pricing Engine** — preço por nacionalidade, por semana ou fixo, validade, faixa de duração, **duplicar regra p/ outro grupo de nacionalidade** | 1, 6 | **Parcial feito** (portfólio + price versions + preço por nacionalidade) | Evolução do portfólio (SPLIT 6) |
| **Advanced Search** — match exato de nome, categoria (HS/HE/VET), idade do aluno, sazonalidade, fallback "remova filtros", **reportar erro de preço** | 4 | **Futuro** | Evolução do `CoursePortfolioPicker` |
| **Smart Search / Sugestões** — "mais vendidos / mais lucrativos" no topo dos resultados; badge de parceiro | 3 | **Futuro** | Evolução do `CoursePortfolioPicker` |
| **Reporte de erro de preço** (modal estruturado: tipo de erro + descrição + anexo da price list → admin/suporte) | 3, 4 | **Futuro** | Portfólio/suporte |
| **DMS — gestão documental** — pastas com **visibilidade por departamento (RBAC)**, upload, download, anexar a e-mail, mover, deletar | 7 | **Futuro** | Split própria (temos departments/wiki, não DMS de aluno) |
| **Account / Branding / Billing** — logo, banner, descrições multi-idioma (pt/en/es), plano/assinatura, usuários ativos, histórico de faturas | 8 | **Futuro + casa com white-label** | SPLIT 8 (branding por org) |
| **LeadGen** — form Google com lógica condicional, mapeamento de funil (Lead→Perfil→Onboarding→Treino financeiro→Fechamento) | 5, 9 | **Território woofed/CRM** | Fora do escopo study-plan |
| **Comissão** (bruta − desconto = líquida, no menu `...` da opção) | 3 | **Futuro** | Fatia de finanças |
| **Tipo de venda Ally+ / marketplace / dashboard Ally+ "lite"** | 3 | **N/A** | Conceito de marketplace; não se aplica à Movy white-label (1 agência) |

---

## Detalhe do que está sendo executado agora (SPLIT 4 · fatia B)

**Modelo de opções (AllyHub `QuotePlayground` / `TabSystem`):**
- Abas "Opção 1, Opção 2..." até **5** opções comparáveis.
- Cada opção: **nome editável** (default "Opção N"), itens próprios, total próprio.
- Ações por opção (menu `...`): **duplicar** (clonar e ajustar), editar, remover, marcar recomendada.
- Resumo em tempo real por opção (subtotal + custo extra/desconto + total).

**Tradução pro nosso código (sem migration):** `plan.courses`+`plan.extraCosts` = **Opção 1 (principal)**;
`plan.options[]` (já existe em `StudyPlanData`) = opções 2..5, cada uma `{ label, courses[], extraCosts[],
recommended?, computed }`. Tudo em `study_plans.data` jsonb. Valores em **AUD/centavos** (sem câmbio aqui).

**Fora do escopo da fatia B de propósito:** itens de acomodação/seguro/add-on (tipos novos); conversão de
moeda / IOF / câmbio (domínio da Calculadora Financeira); landing page pública rica (mídia, vídeo,
like/dislike, WhatsApp CTA, branding por consultor).

---

## Entidades do AllyHub (quase-código, para referência futura)

Capturadas como o dono trouxe; **não** são o nosso schema — são alvo de UX a destilar por split.

```ts
// Pricing Engine (SPLIT 6 — já parcialmente coberto por portfólio/price versions)
interface ProgramPriceRule {
  validity: { from: Date; to: Date }
  durationRange: { minWeeks: number; maxWeeks: number }
  tuition: { value: number; isFixed: boolean }     // por semana OU fixo
  materials: { value: number; isFixed: boolean }
  enrollmentFee: number
  targetGroups: string[]                            // ex.: ["Brazilians", "Latin Americans"]
}

// Opções de orçamento (SPLIT 4 · fatia B — em execução)
interface QuoteOption {
  optionId: number                                  // Opção 1..5
  items: Array<Course /* | Accommodation | Insurance | AddOn — fora do escopo B */>
  financials: { totalForeign: number; totalLocal: number; paymentPlanId?: string }
}

// DMS (split futura)
interface DocumentFolder { id: string; name: string; parentFolderId?: string; visibility: Department[] }
interface StudentFile { id: string; fileName: string; uploader: { userId: string; timestamp: string }
  actions: ['Download', 'Email', 'Move', 'Delete'] }

// Branding/Billing (SPLIT 8 — white-label por org)
interface AgencyProfile {
  branding: { logo: string; banner: string; descriptions: { pt: string; en: string; es: string } }
  subscription: { currentPlan: string; activeUsers: number; billingHistory: unknown[] }
}
```

**Regras de negócio recorrentes no AllyHub:** (1) **travar nacionalidade antes da busca** (preço de
"General English" muda por nacionalidade); (2) unidade por **semanas vs horas/aulas** (aulas privadas);
(3) versionamento de orçamento por hash/UUID; (4) câmbio sincronizado diariamente; (5) branding da
**agência** (não da plataforma) na página pública.
