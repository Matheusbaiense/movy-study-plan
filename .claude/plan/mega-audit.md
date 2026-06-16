# Movy Study Plan — Mega Auditoria Pré-Produção

**Data:** 2026-06-16  
**Auditores:** 4 agentes especializados em paralelo  
**Dimensões:** 21 (segurança, qualidade, testes, observabilidade, performance, deps, infra, DR, repo, prod readiness)  
**Stack:** Next.js 14 App Router · TypeScript · Supabase SSR · React 18 · Vercel

---

## Resumo Executivo

| Fase | Dimensão | CRITICAL | HIGH | MEDIUM | LOW |
|------|----------|----------|------|--------|-----|
| Segurança | 7, 9, 10, 13, 14, 17 | 0 | 5 | 5 | 2 |
| Qualidade de código | 1, 3, 4, 5, 6, 8, 11 | 0 | 6 | 9 | 7 |
| Performance | 2 | 0 | 1 | 1 | 1 |
| Testes | 12 | 3 | 3 | 2 | 0 |
| Observabilidade | 15 | 2 | 2 | 3 | 1 |
| Dependências | 16 | 2 | 1 | 2 | 2 |
| Infra/Deploy | 19 | 1 | 3 | 3 | 1 |
| Backups/DR | 18 | 0 | 2 | 3 | 1 |
| Repo/Migração | 20 | 0 | 0 | 3 | 4 |
| Prod Readiness | 21 | 3 | 4 | 5 | 2 |
| **TOTAL** | | **11** | **27** | **36** | **21** |

**Veredicto:** ⚠️ **Não produção-pronto** — 11 issues CRITICAL e 27 HIGH precisam ser resolvidos antes de onboarding de clientes reais.

---

## PHASE 1 — CRITICAL (bloqueantes absolutos)

> Não lançar com clientes reais até estes estarem resolvidos.

### C1 — XSS: HTML não sanitizado em componentes Wiki

**Dimensão:** 10 (OWASP — XSS), 12 (sanitize-html sem teste)  
**Severidade:** CRITICAL

**Problema:** Três componentes renderizam HTML do banco via `dangerouslySetInnerHTML` **sem passar por `sanitizeHtml`**:
- `components/wiki/BlockRenderer.tsx:26` — `block.content`
- `components/wiki/blocks/StepsBlock.tsx:42` — `step.body`
- `components/wiki/blocks/InfoBox.tsx:22` — `block.content`

`WikiContent.tsx` sanitiza corretamente; os sub-componentes do `BlockRenderer` não.

**Fix:**
```tsx
// BlockRenderer.tsx — antes:
dangerouslySetInnerHTML={{ __html: block.content }}

// depois:
import { sanitizeHtml } from '@/lib/security/sanitize-html'
dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
```
Aplicar o mesmo em `StepsBlock.tsx:42` e `InfoBox.tsx:22`.

**Também:** adicionar testes em `tests/sanitize-html.test.mjs` com payloads XSS comuns (`<script>`, `onerror=`, `javascript:`, etc.).

---

### C2 — DOMPurify com 7 CVEs de XSS

**Dimensão:** 16 (dependências)  
**Severidade:** CRITICAL

**Problema:** `isomorphic-dompurify@2.23.0` usa `dompurify@3.4.8`, que tem **7 CVEs de XSS** (modo IN_PLACE, hook pollution, cross-realm escapes). Este pacote é o backbone do `lib/security/sanitize-html.ts`.

**Fix:**
```bash
npm install isomorphic-dompurify@latest
# ou migrar para dompurify direto (remove a camada de abstração):
npm remove isomorphic-dompurify
npm install dompurify@latest
npm install --save-dev @types/dompurify
```

Atualizar `lib/security/sanitize-html.ts` para importar `dompurify` diretamente se remover o wrapper isomorphic.

---

### C3 — Rate limiting ausente em endpoints públicos

**Dimensão:** 10 (OWASP), 19 (infra), 21 (prod readiness)  
**Severidade:** CRITICAL

**Problema 1:** `app/[locale]/p/[token]/actions.ts` — `acceptProposalAction` é acessível por qualquer usuário não autenticado sem throttle. O guard atômico `is('accepted_at', null)` previne double-accept mas não previne flood de requisições.

**Problema 2:** `app/api/fx/route.ts` — endpoint público sem rate limit. Cache in-memory reset a cada cold start. Attacker pode triggerar N calls para as APIs externas (Wise, er-api, frankfurter) causando DoS ou esgotar cota.

**Fix — Opção A (simples, sem Redis):** Rate limit via Middleware com `@vercel/edge-rate-limiter` ou lógica baseada em IP no próprio action.

**Fix — Opção B (recomendada):** Usar `next.config.mjs` para configurar `revalidate: 3600` na rota FX (substitui cache in-memory). Para `acceptProposalAction`, usar header `X-Forwarded-For` + sliding window in-memory ou Upstash Redis:

```ts
// app/[locale]/p/[token]/actions.ts
import { headers } from 'next/headers'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export async function acceptProposalAction(token: string, signerName: string) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(`accept:${ip}`, 5, 15 * 60 * 1000)) {
    return { ok: false, error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
  }
  // ... resto do action
}
```

> ⚠️ Em serverless/Vercel, `Map` in-memory não persiste entre instâncias. Para produção real com múltiplas instâncias, usar Upstash Redis (`@upstash/ratelimit`).

---

### C4 — Risco cross-tenant no portfolio (service-role sem org_id)

**Dimensão:** 9 (API exposure), 17 (Supabase/RLS)  
**Severidade:** CRITICAL (latente — impacta quando houver ≥2 orgs)

**Problema:** Duas páginas server-side usam `createServiceClient()` (que bypassa RLS) para ler dados do portfolio **sem filtrar por `org_id`**:
- `app/[locale]/(protected)/portfolio/page.tsx:19` — `listInstitutions(db)`
- `app/[locale]/(protected)/portfolio/[institutionId]/page.tsx:22-58` — queries diretas

`listInstitutions` em `lib/portfolio/queries.ts:17-24` não adiciona filtro de org. Com uma segunda organização, todas as instituições de todos os orgs seriam visíveis.

**Fix:** Nas duas páginas, substituir o service client pelo client autenticado (que tem RLS):
```ts
// portfolio/page.tsx — antes:
const db = createServiceClient()
const institutions = await listInstitutions(db)

// depois:
const supabase = await createClient()  // client com RLS
const institutions = await listInstitutions(supabase)
// OU: adicionar param org_id explícito em listInstitutions e usar service client
```

**Alternativa mais segura (se service client for necessário para algo):** adicionar `.eq('org_id', profile.org_id)` em `listInstitutions` quando receber service client, via param explícito.

---

### C5 — Nenhum CI/CD pipeline

**Dimensão:** 19 (infra), 21 (prod readiness)  
**Severidade:** CRITICAL

**Problema:** Não existe `.github/workflows/`. Cada push para `main` vai direto ao Vercel sem passar por lint, type-check ou testes. Uma regressão de tipo ou build error só é descoberta no deploy.

**Fix:** Criar `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci --no-audit --no-fund
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
      - run: node --experimental-strip-types --test tests/*.mjs
```

---

### C6 — Audit log silencioso (`catch {}`)

**Dimensão:** 15 (observabilidade)  
**Severidade:** CRITICAL

**Problema:** `lib/api/audit.ts:25-27` tem `catch {}` que silenciosamente engole falhas de inserção no DB. Se o Supabase estiver down, **nenhum log de auditoria é escrito** e o usuário/sistema não sabe.

**Fix:**
```ts
// lib/api/audit.ts
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('audit_logs').insert({ ... })
    if (error) {
      console.error('[AUDIT_FAILED]', params.action, params.entityType, error.message)
    }
  } catch (err) {
    console.error('[AUDIT_FAILED]', params.action, params.entityType, err)
  }
}
```

---

### C7 — HR mutations sem audit logging

**Dimensão:** 15 (observabilidade)  
**Severidade:** CRITICAL

**Problema:** `app/[locale]/(protected)/hr/actions.ts` não chama `logAudit` em nenhuma mutação. Clock in/out, aprovação de timesheet e geração de invoice são operações financeiras e de compliance — devem ter trilha de auditoria.

**Fix:** Adicionar `logAudit` após cada mutação bem-sucedida em `hr/actions.ts`:
```ts
// após clockOut bem-sucedido:
await logAudit({
  actorId: profile.id, actorEmail: profile.email,
  action: 'timeentry.clocked_out',
  entityType: 'time_entry', entityId: entryId,
  metadata: { durationMs } as unknown as Json
})
```

---

### C8 — `lib/permissions/can.ts` sem testes

**Dimensão:** 12 (testes)  
**Severidade:** CRITICAL

**Problema:** `lib/permissions/can.ts` contém `isAdminOrAbove`, `isEditorOrAbove`, `isSuperAdmin` — funções usadas em todas as guards de server action. Zero testes. Se a lógica de hierarquia estiver errada, autorização pode ser bypassada.

**Fix:** Criar `tests/permissions.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert'
import { isAdminOrAbove, isEditorOrAbove, isSuperAdmin } from '../lib/permissions/can.ts'

test('super_admin has all permissions', () => {
  assert.equal(isSuperAdmin('super_admin'), true)
  assert.equal(isAdminOrAbove('super_admin'), true)
  assert.equal(isEditorOrAbove('super_admin'), true)
})
// ... test all roles
```

---

### C9 — `lib/hr/queries.ts` (420 linhas) sem testes

**Dimensão:** 12 (testes)  
**Severidade:** CRITICAL

**Problema:** `lib/hr/queries.ts` tem 420 linhas com lógica complexa de agregação (`listEmployeesWithStats` usa `Promise.all` + agregação JS de horas/pending/clocked-in). Zero testes. Erros aqui afetam diretamente o módulo de faturamento.

**Fix:** Criar `tests/hr-queries.test.mjs` com mocks do Supabase client testando:
- `listTimeEntries()` com filtros de status/período
- `listEmployeesWithStats()` aggregation
- `listInvoices()` com filtros

---

### C10 — `next@14.2.29` com 13 CVEs (4 HIGH)

**Dimensão:** 16 (dependências)  
**Severidade:** CRITICAL

**Problema:** Next.js 14.2.29 tem 13 CVEs incluindo HTTP smuggling, cache poisoning, image optimizer DoS, RSC escapes. Next.js 15 é production-ready e corrige todos.

**Fix:** Planejar upgrade para Next.js 15:
```bash
npm install next@latest react@latest react-dom@latest
# Verificar breaking changes: https://nextjs.org/docs/app/building-your-application/upgrading/version-15
npm run build && npm run type-check
```

Principais breaking changes Next.js 15:
- `cookies()`, `headers()` são agora async (já usado corretamente neste projeto via `await headers()`)
- `params` e `searchParams` são agora async nos Page components
- Caching padrão mudou (não mais cache por default em fetch)

> Se upgrade for bloqueado no sprint atual, ao menos monitorar security advisories ativos.

---

### C11 — `deleteStudyPlan` server action morta e exportada

**Dimensão:** 8 (dead code), 3 (error handling)  
**Severidade:** HIGH (bordeline CRITICAL — server action pública não usada)

**Problema:** `app/[locale]/(protected)/study-plans/actions.ts` exporta duas funções que fazem hard-delete:
- `hardDeleteStudyPlan` (linha 348) — usada pelo UI
- `deleteStudyPlan` (linha 860) — **dead code**, não importada por nenhum componente

Como server action exportada, `deleteStudyPlan` permanece acessível via dispatch do Next.js mesmo sem uso no UI. É tech debt + surface de ataque desnecessária.

**Fix:** Remover `deleteStudyPlan` completamente (linhas 860–891).

---

## PHASE 2 — HIGH (antes do lançamento)

### H1 — Checks de role ausentes em HR actions

**Dimensão:** 13 (auth/authz)

Três actions em `hr/actions.ts` não verificam role no nível da action (dependem apenas de RLS):
- `approveEntryAction` (linha 125) — sem `isHrAdmin` check
- `rejectEntryAction` (linha 132) — sem `isHrAdmin` check  
- `generateInvoiceAction` (linha 139) — sem admin check

**Fix:**
```ts
export async function approveEntryAction(entryId: string) {
  const { profile } = await getActor()
  if (!isHrAdmin(profile.role)) throw new Error('Permissão insuficiente')
  // ...
}
```

---

### H2 — `updatePreset` sem filtro org_id (service client)

**Dimensão:** 17 (Supabase/RLS)

`settings/presets/actions.ts:112` — update via service client sem `.eq('org_id', actor.org_id)`. Qualquer admin pode sobrescrever preset de outro org se souber o UUID.

**Fix:** Adicionar `.eq('org_id', actor.org_id)` na query de update.

---

### H3 — `getShareUrlAction` sem check de role

**Dimensão:** 9 (API exposure)

`study-plans/actions.ts:833` — só checa `auth.getUser()`, não usa `getActor()` (que exige `isEditorOrAbove`). Qualquer usuário autenticado pode obter o `share_token`.

**Fix:** Substituir inline auth block por `getActor()`.

---

### H4 — FX route retorna HTTP 200 com `rate: 0` em falha total

**Dimensão:** 3 (error handling)

`app/api/fx/route.ts:145-152` — quando todos os provedores falham, retorna `{ rate: 0, source: 'indisponível' }` com HTTP 200. Clientes que renderizam com `rate: 0` exibem cálculos financeiros errados silenciosamente.

**Fix:** Retornar HTTP 503 quando `rate === 0`:
```ts
if (data.rate === 0) {
  return NextResponse.json({ rate: 0, source: 'indisponível' }, { status: 503 })
}
```

---

### H5 — `SupabaseClient<any, any, any>` em `audit.ts`

**Dimensão:** 5 (TypeScript)

`lib/api/audit.ts:32` — parâmetro `SupabaseClient<any, any, any>` apaga toda a segurança de tipos. O insert é castado para `never` para suprimir o erro de tipo.

**Fix:**
```ts
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function logAuditWithClient(
  client: SupabaseClient<Database>,
  params: AuditParams
): Promise<void> { ... }
```

---

### H6 — `persist`/`save` não memoizado em StudyPlanEditor

**Dimensão:** 6 (React hooks)

`components/study-plans/StudyPlanEditor.tsx:86-103` — `save` não é memoizado com `useCallback`, pode capturar `persist` stale se o pai re-renderizar entre o clique e o settlement da transição.

**Fix:**
```ts
const save = useCallback(() => persist(), [persist])
```

---

### H7 — Paginação ausente no Timesheets

**Dimensão:** 2 (performance)

`app/[locale]/(protected)/hr/timesheets/page.tsx:27-31` — `listTimeEntries()` sem `limit`. Orgs com 1000+ entries carregam tudo na memória.

**Fix:** Adicionar `limit`/`offset` params em `lib/hr/queries.ts:listTimeEntries()` e paginação na page via query params `?page=`.

---

### H8 — Global error boundary e not-found ausentes

**Dimensão:** 21 (prod readiness)

`app/error.tsx` não existe (só existe dentro de `(protected)`). `app/not-found.tsx` não existe.

**Fix:**
```tsx
// app/error.tsx
'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html><body>
      <h2>Algo deu errado</h2>
      <button onClick={reset}>Tentar novamente</button>
    </body></html>
  )
}
```

```tsx
// app/not-found.tsx
export default function NotFound() {
  return <div>Página não encontrada</div>
}
```

---

### H9 — Página pública de proposta sem metadata (og:, twitter:)

**Dimensão:** 21 (prod readiness)

`app/[locale]/p/[token]/page.tsx` não exporta `generateMetadata`. Links compartilhados no WhatsApp/LinkedIn não têm preview.

**Fix:**
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // fetch student_name + institution from proposal
  return {
    title: `Proposta de Estudo — ${studentName}`,
    description: 'Visualize sua proposta de estudo personalizada.',
    openGraph: { title: ..., description: ..., type: 'website' },
  }
}
```

---

### H10 — Documentação de backup e DR ausente

**Dimensão:** 18 (backups/DR)

Nenhum runbook de backup, export ou recovery documentado. Se o Supabase (`xpthmguzcbmndyyexfbt`) for comprometido ou migrado para VPS, há risco de perda de dados.

**Fix:** Criar `docs/BACKUP-RECOVERY.md`:
- Agendamento de backup no Supabase (verificar no dashboard)
- Comando de export manual: `supabase db dump --db-url <url> -f backup.sql`
- Procedimento de restore
- Plano de VPS migration (pg_dump → PostgreSQL standalone)

---

### H11 — CI/CD: devcontainer Node 20.x ≠ produção 24.x

**Dimensão:** 19 (infra)

`.devcontainer/devcontainer.json` usa Node 20, `package.json` exige Node 24.x. Dev pode funcionar localmente mas falhar em CI.

**Fix:** Atualizar `.devcontainer/devcontainer.json`:
```json
"image": "mcr.microsoft.com/devcontainers/javascript-node:24"
```

---

### H12 — Proposal events table definida mas nunca usada

**Dimensão:** 15 (observabilidade)

`proposal_events` table existe na migration 010 mas **nenhum código a usa**. Lifecycle de proposta (enviada, visualizada, aceita) não é rastreado além do campo `accepted_at` na `study_plans`.

**Fix:** Criar helper `logProposalEvent()` e chamar nos pontos chave:
- Proposta enviada (link compartilhado gerado)
- Proposta aceita (`acceptProposalAction`)
- Status changes (`changeStudyPlanStatus`)

---

### H13 — Testes para sanitize-html ausentes

**Dimensão:** 12 (testes)

`lib/security/sanitize-html.ts` wraps DOMPurify mas sem nenhum teste. Se o comportamento mudar numa atualização de pacote, XSS passa silenciosamente.

**Fix:** Criar `tests/sanitize-html.test.mjs` com payloads XSS, links `javascript:`, `data:` URIs, svg payloads, etc.

---

### H14 — `types/supabase.ts` pode estar desatualizado

**Dimensão:** 20 (repo cleanup)

18 migrations existem; types foram regenerados após migration 012 mas potencialmente não após 013–018 (HR, share_tokens, etc.).

**Fix:**
```bash
supabase gen types typescript --project-id xpthmguzcbmndyyexfbt > types/supabase.ts
```
Verificar diff e commitar.

---

## PHASE 3 — MEDIUM (hardening pós-lançamento)

### M1 — CSP `Report-Only` → CSP enforcing

**Dimensão:** 10 (OWASP)

`next.config.mjs:31` usa `Content-Security-Policy-Report-Only`. Combina com `'unsafe-inline'` + `'unsafe-eval'` → zero proteção runtime.

**Steps:**
1. Remover `'unsafe-eval'` (Next.js 14 prod não precisa)
2. Após validar que não quebra nada, trocar header para `Content-Security-Policy`

---

### M2 — `window.location.reload()` → `router.refresh()`

**Dimensão:** 3, 6

`components/study-plans/StudyPlanEditor.tsx:175` chama `window.location.reload()` no callback `onRestored`. Full reload perde estado não salvo.

**Fix:**
```ts
import { useRouter } from 'next/navigation'
const router = useRouter()
// no onRestored callback:
router.refresh()
```

---

### M3 — `InstitutionDetail.tsx`: chamar `router.refresh()` após mutações

**Dimensão:** 11 (state management)

`CoursesTab.handleSave` aplica update otimístico manual (linha 144) sem `router.refresh()` após o servidor responder. Estado local pode divergir dos defaults do servidor.

**Fix:** Após `await createCourseAction(...)` bem-sucedido:
```ts
router.refresh()  // recarrega dados do servidor
setCourses(prev => [...prev, newCourse])  // mantém otimismo para UX
```

---

### M4 — Extrair helper compartilhado `getActorSession`

**Dimensão:** 1 (DRY)

`requireAdmin()` e `requireEditor()` são reimplementados em 5 arquivos de actions. Cada implementação está correta, mas qualquer mudança (ex.: novo campo em `profiles`) precisa ser replicada em todos.

**Fix:** Criar `lib/auth/actor.ts`:
```ts
export async function getActorSession(minRole: 'editor' | 'admin' | 'super_admin' = 'editor') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/unauthorized')
  const { data: profile } = await supabase.from('profiles')
    .select('id, email, role, org_id').eq('id', user.id).single()
  if (!profile || !roleCheck(profile.role, minRole)) throw new Error('Permissão insuficiente')
  return profile as Actor
}
```

Substituir os 5 `requireAdmin`/`requireEditor` inline.

---

### M5 — Extrair `svc()` wrapper para `lib/supabase/service.ts`

**Dimensão:** 1 (DRY)

`portfolio/actions.ts:31`, `settings/users/actions.ts:31`, `settings/presets/actions.ts:37` definem local `svc()` ou `serviceClient()` com lógica idêntica.

**Fix:** Exportar de `lib/supabase/service.ts`:
```ts
export function getServiceClient() {
  try { return createServiceClient() } catch { return null }
}
```

---

### M6 — Cleanup do caminho legado `course_presets`

**Dimensão:** 8 (dead code / tech debt)

`settings/presets/` página e actions operam na tabela legada `course_presets`. `lib/study-plans/defaults.ts` exporta `COURSE_PRESETS` hardcoded com dados reais de escolas. Coexiste com o catálogo normalizado `lib/portfolio/`.

**Fix (gradual):**
1. Documentar claramente em `settings/presets/` que é legado
2. Criar redirect ou deprecation notice na UI
3. Planejar SPLIT 8 para migrar editor de presets para o portfolio

---

### M7 — Adicionar Sentry para tracking de erros em produção

**Dimensão:** 15 (observabilidade)

Sem Sentry ou equivalente, erros em produção só são descobertos quando usuário reporta.

**Fix:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Integrar com `instrumentation.ts` para capturar server-side errors automaticamente.

---

### M8 — Wizard step no URL

**Dimensão:** 11 (state management)

`StudyPlanEditor` armazena `wizardStep` em estado local. Navegação back/forward reseta o step.

**Fix:** Usar `useSearchParams` + `router.push` para `?step=1,2,3,4,5`.

---

### M9 — Input validation com Zod nos server actions

**Dimensão:** 10 (OWASP — insecure design)

Server actions aceitam dados sem validação de schema. Um cliente malicioso pode enviar strings muito longas, tipos errados, etc.

**Fix:** Instalar `zod` e criar schemas para os principais inputs:
```ts
const updateStudyPlanSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'sent', 'ready_review', 'approved_internal', 'accepted', 'rejected', 'expired']),
})
```

---

### M10 — Health check endpoint

**Dimensão:** 19 (infra)

Nenhum `/api/health`. Vercel não tem como detectar se a app está funcional além de HTTP 200 na home.

**Fix:** Criar `app/api/health/route.ts`:
```ts
export async function GET() {
  return Response.json({ ok: true, timestamp: new Date().toISOString() })
}
```

---

### M11 — `robots.txt`

**Dimensão:** 21 (prod readiness)

`public/robots.txt` não existe. Crawlers indexam `/api/`, `/auth/callback/`.

**Fix:** Criar `public/robots.txt`:
```
User-agent: *
Disallow: /api/
Disallow: /auth/
Allow: /
```

---

### M12 — Origem Supabase hardcoded em `next.config.mjs`

**Dimensão:** 7 (secrets/env), 18 (DR/VPS migration)

`next.config.mjs:5,18,52` tem `xpthmguzcbmndyyexfbt.supabase.co` hardcoded em 3 lugares (CSP, images.remotePatterns). Bloqueia VPS migration.

**Fix:**
```js
// next.config.mjs
const supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
// usar em remotePatterns e CSP
```

Adicionar `NEXT_PUBLIC_SUPABASE_URL` ao `.env.example` (provavelmente já está, verificar).

---

### M13 — Completar `.env.example`

**Dimensão:** 20 (repo cleanup)

`SUPABASE_SERVICE_ROLE_KEY` sem comentário explicando como obter. `WISE_PROFILE_ID` sem doc.

**Fix:** Adicionar comentários em `.env.example`:
```env
# Supabase Dashboard → Project → API → Service Role Key (NUNCA expor publicamente)
SUPABASE_SERVICE_ROLE_KEY=

# Opcional: ID do perfil na API Wise para taxa de câmbio mais precisa
# Deixar em branco para auto-detectar (faz uma chamada extra na inicialização)
WISE_PROFILE_ID=
```

---

### M14 — `allowed_emails` sem policies RLS explícitas

**Dimensão:** 17 (Supabase/RLS)

Tabela tem RLS ativado mas sem policies definidas (default deny). Funcionalmente correto, mas frágil — qualquer futura adição de policy pode quebrar o comportamento esperado.

**Fix:** Adicionar policies explícitas em nova migration:
```sql
-- Explícito: ninguém lê/escreve via cliente (só service role)
create policy "no_direct_access" on public.allowed_emails
  for all using (false) with check (false);
```

---

## PHASE 4 — LOW (technical debt, pós-launch)

### L1 — Remover extensão `.ts` explícita em imports

`lib/study-plans/options.ts:7` usa `import { computeProposal } from './calculations.ts'`. Não-standard. Remover `.ts`.

---

### L2 — Memoizar tick array no componente Timeline

`StudyPlanEditor.tsx:420-425` — ticks computados inline no render. Adicionar em `useMemo`.

---

### L3 — Substituir `key={index}` por key semântico em `HrDashboard.tsx`

`HrDashboard.tsx:362` — `headers.map((h, i) => <th key={i}>`. Usar `key={h}`.

---

### L4 — `.nvmrc`

Criar `.nvmrc` com `24.11.0` para ferramentas que leem este arquivo (nvm, fnm, asdf).

---

### L5 — CHANGELOG.md

Criar `CHANGELOG.md` com milestones das migrations e splits implementados.

---

### L6 — Migrar testes de `.mjs` para `.ts`

`tests/*.mjs` são JavaScript puro. Migrar para TypeScript com Vitest ou `tsx --test` para consistência com o resto do projeto.

---

### L7 — `toJson` helper para eliminar ruído de cast

30+ ocorrências de `as unknown as Json` em action files. Criar helper:
```ts
// lib/supabase/json.ts
import type { Json } from '@/types/supabase'
export const toJson = (v: unknown): Json => v as unknown as Json
```

---

### L8 — Docs: CONTRIBUTING.md, docs/MIGRATIONS.md, docs/DEPLOYMENT.md

Criar documentação básica para novos desenvolvedores:
- `CONTRIBUTING.md` — branches, commits, PR process
- `docs/MIGRATIONS.md` — como escrever e aplicar migrations
- `docs/DEPLOYMENT.md` — como fazer deploy, preview URLs, rollback

---

## Tabela de Issues Consolidados

| # | Phase | Sev | Dimensão | Descrição | Arquivo |
|---|-------|-----|----------|-----------|---------|
| C1 | 1 | CRITICAL | 10, 12 | XSS: dangerouslySetInnerHTML sem sanitizeHtml em wiki | `BlockRenderer.tsx:26`, `StepsBlock.tsx:42`, `InfoBox.tsx:22` |
| C2 | 1 | CRITICAL | 16 | DOMPurify 7 CVEs de XSS | `package.json`, `sanitize-html.ts` |
| C3 | 1 | CRITICAL | 10, 19 | Sem rate limiting em endpoints públicos | `p/[token]/actions.ts`, `api/fx/route.ts` |
| C4 | 1 | CRITICAL | 9, 17 | Service-role sem org_id no portfolio (cross-tenant) | `portfolio/page.tsx:19`, `[institutionId]/page.tsx:22` |
| C5 | 1 | CRITICAL | 19, 21 | Sem CI/CD pipeline | `.github/workflows/` (inexistente) |
| C6 | 1 | CRITICAL | 15 | `logAudit` engole erros com `catch {}` | `lib/api/audit.ts:25-27` |
| C7 | 1 | CRITICAL | 15 | HR mutations sem audit logging | `hr/actions.ts` |
| C8 | 1 | CRITICAL | 12 | `lib/permissions/can.ts` sem testes | `lib/permissions/can.ts` |
| C9 | 1 | CRITICAL | 12 | `lib/hr/queries.ts` (420 linhas) sem testes | `lib/hr/queries.ts` |
| C10 | 1 | CRITICAL | 16 | `next@14.2.29` com 13 CVEs (4 HIGH) | `package.json` |
| C11 | 1 | HIGH | 8 | `deleteStudyPlan` dead server action exportada | `study-plans/actions.ts:860-891` |
| H1 | 2 | HIGH | 13 | approveEntry/rejectEntry/generateInvoice sem role check | `hr/actions.ts:125,132,139` |
| H2 | 2 | HIGH | 17 | `updatePreset` sem org_id guard (service client) | `settings/presets/actions.ts:112` |
| H3 | 2 | HIGH | 9 | `getShareUrlAction` sem check de role | `study-plans/actions.ts:833` |
| H4 | 2 | HIGH | 3 | FX route retorna HTTP 200 com `rate: 0` | `api/fx/route.ts:145-152` |
| H5 | 2 | HIGH | 5 | `SupabaseClient<any,any,any>` em audit.ts | `lib/api/audit.ts:32` |
| H6 | 2 | HIGH | 6 | `save` wrapper não memoizado em StudyPlanEditor | `StudyPlanEditor.tsx:86-103` |
| H7 | 2 | HIGH | 2 | Timesheets sem paginação (load all) | `hr/timesheets/page.tsx:27-31` |
| H8 | 2 | HIGH | 21 | Sem global error boundary + not-found.tsx | `app/error.tsx` (inexistente) |
| H9 | 2 | HIGH | 21 | Página pública de proposta sem og:/twitter: metadata | `p/[token]/page.tsx` |
| H10 | 2 | HIGH | 18 | Sem documentação de backup e DR | `docs/` |
| H11 | 2 | HIGH | 19 | Devcontainer Node 20.x ≠ produção 24.x | `.devcontainer/devcontainer.json` |
| H12 | 2 | HIGH | 15 | `proposal_events` definida mas nunca usada | `hr/actions.ts`, migration 010 |
| H13 | 2 | HIGH | 12 | `sanitize-html.ts` sem testes | `lib/security/sanitize-html.ts` |
| H14 | 2 | HIGH | 20 | `types/supabase.ts` possivelmente desatualizado | `types/supabase.ts` |
| M1 | 3 | MEDIUM | 10 | CSP Report-Only nunca enforça | `next.config.mjs:31` |
| M2 | 3 | MEDIUM | 3, 6 | `window.location.reload()` → `router.refresh()` | `StudyPlanEditor.tsx:175` |
| M3 | 3 | MEDIUM | 11 | `InstitutionDetail` sem `router.refresh()` após mutações | `InstitutionDetail.tsx:136-149` |
| M4 | 3 | MEDIUM | 1 | `getActor`/`requireAdmin` duplicado em 5 arquivos | `*/actions.ts` |
| M5 | 3 | MEDIUM | 1 | `svc()` wrapper duplicado em 3 arquivos | `portfolio/actions.ts`, `settings/*/actions.ts` |
| M6 | 3 | MEDIUM | 8 | Caminho legado `course_presets` ativo junto com portfolio | `settings/presets/`, `lib/study-plans/defaults.ts` |
| M7 | 3 | MEDIUM | 15 | Sem error tracking (Sentry) | `package.json` |
| M8 | 3 | MEDIUM | 11 | Wizard step não persistido no URL | `StudyPlanEditor.tsx:61` |
| M9 | 3 | MEDIUM | 10 | Sem validação de input (zod) nos server actions | `*/actions.ts` |
| M10 | 3 | MEDIUM | 19 | Sem health check endpoint | `app/api/` |
| M11 | 3 | MEDIUM | 21 | Sem robots.txt | `public/robots.txt` (inexistente) |
| M12 | 3 | MEDIUM | 7, 18 | Origem Supabase hardcoded em next.config.mjs | `next.config.mjs:5,18,52` |
| M13 | 3 | MEDIUM | 20 | `.env.example` incompleto | `.env.example:15` |
| M14 | 3 | MEDIUM | 17 | `allowed_emails` sem RLS policies explícitas | `migrations/001` |
| L1 | 4 | LOW | 5 | Extensão `.ts` explícita em imports | `lib/study-plans/options.ts:7` |
| L2 | 4 | LOW | 6 | Timeline ticks não memoizados | `StudyPlanEditor.tsx:420-425` |
| L3 | 4 | LOW | 6 | `key={index}` em table headers | `HrDashboard.tsx:362` |
| L4 | 4 | LOW | 20 | Sem `.nvmrc` | (inexistente) |
| L5 | 4 | LOW | 20 | Sem CHANGELOG.md | (inexistente) |
| L6 | 4 | LOW | 12 | Testes em `.mjs` (não TypeScript) | `tests/*.mjs` |
| L7 | 4 | LOW | 5 | 30+ casts `as unknown as Json` sem helper | `*/actions.ts` |
| L8 | 4 | LOW | 20 | Sem CONTRIBUTING.md, MIGRATIONS.md, DEPLOYMENT.md | `docs/` |

---

## Estimativa de Esforço por Fase

| Fase | Issues | Estimativa |
|------|--------|------------|
| Phase 1 — CRITICAL | 11 | ~20–25h |
| Phase 2 — HIGH | 14 | ~18–22h |
| Phase 3 — MEDIUM | 14 | ~12–16h |
| Phase 4 — LOW | 8 | ~6–8h |
| **Total** | **47** | **~56–71h** |

---

## Ordem de Execução Recomendada

### Semana 1 (Sprint 1 — Críticos de segurança)
1. C2 — Upgrade DOMPurify
2. C1 — Sanitizar HTML em BlockRenderer/StepsBlock/InfoBox
3. C4 — Remover service-role sem org_id em portfolio pages
4. H2 — `updatePreset` sem org_id
5. H3 — `getShareUrlAction` sem role check
6. C11 — Remover `deleteStudyPlan` dead action
7. H1 — Role checks em HR actions

### Semana 1 (Sprint 1 — Críticos operacionais)
8. C3 — Rate limiting em endpoints públicos
9. C5 — CI/CD pipeline (GitHub Actions)
10. C6 — Fix `logAudit` catch {}
11. C7 — HR audit logging
12. H4 — FX route HTTP 503 em falha

### Semana 2 (Sprint 2 — Qualidade e testes)
13. C8 — Testes para permissions/can.ts
14. C9 — Testes para hr/queries.ts
15. H13 — Testes para sanitize-html.ts
16. H5 — `SupabaseClient<any>` em audit.ts
17. H6 — Memoizar `save` em StudyPlanEditor
18. H8 — Global error.tsx + not-found.tsx
19. H11 — Fix devcontainer Node 24.x
20. H14 — Regenerar types/supabase.ts

### Semana 2-3 (Sprint 2-3 — Prod readiness)
21. C10 — Planejar/iniciar upgrade Next.js 15
22. H7 — Paginação em timesheets
23. H9 — Metadata para página pública de proposta
24. H10 — Docs backup/DR
25. H12 — Usar proposal_events
26. M12 — Extrair Supabase origin para env var
27. M13 — Completar .env.example
28. M10 — Health check endpoint
29. M11 — robots.txt

### Post-launch (Sprint 4+)
- Fases 3 e 4 (MEDIUM/LOW) em ordem de impacto

---

## SESSION_ID (multi-plan metadata)

- CODEX_SESSION: N/A (codeagent-wrapper não disponível — análise feita por agentes Claude Code nativos)
- GEMINI_SESSION: N/A
- Agentes usados: `security-reviewer`, `code-reviewer`, `Explore` × 2
