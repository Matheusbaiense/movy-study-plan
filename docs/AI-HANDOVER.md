# AI Handover - Movy Study Plan

Este documento e o ponto de passagem entre Codex, Claude e qualquer outro agente que trabalhar neste projeto. Antes de mexer no codigo, leia este arquivo inteiro e atualize o log ao final de cada sessao relevante.

## Regras de Ouro

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

### Feature 2 — Gestor de Presets das escolas (PLANEJADO, não implementado)

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

## Log de Handover

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
- PENDENTE: Feature 2 (gestor de presets) — ver "Próximo agente — COMECE AQUI" e a migration
  `008_course_presets.sql` (escrita, não aplicada). Resíduos menores: WikiForm/new/edit,
  StudyPlanProposal já com a vela, loading skeletons, acento "Manha" (turno).

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
