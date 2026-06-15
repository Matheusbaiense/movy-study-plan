# Proposal lead-flow + nationality pricing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Criar proposta → escolher/criar lead" flow and the woofed-shaped lead fields + portfolio pricing seam that make a course's price resolve by the lead's nationality (país › mercado › normal).

**Architecture:** Pure helpers first (TDD, `node --test`), then the org-scoped queries/provider extensions, then the server action, then the client modal that replaces the current one-click "create" button. Lead fields live in `contacts.custom_attributes` (woofed-shaped, no migration). The in-editor price-override picker is DEFERRED to the full SPLIT 4 editor (it would reopen `StudyPlanEditor.tsx`); this plan ships the `listPrices` seam it will consume.

**Tech Stack:** Next.js 14 (App Router, server actions), Supabase SSR (RLS per org), TypeScript strict, `node --test` for pure units.

**Spec:** `docs/superpowers/specs/2026-06-15-proposal-lead-flow-pricing-design.md`

**Conventions (from the repo):**
- Money is float only at the editor border; cents elsewhere (`lib/calc/money`).
- Runtime relative `.ts` imports need an explicit `.ts` extension (node --test requirement).
- No `(supabase as any)`; narrow `as unknown as X` only at jsonb seams.
- WOOFED-SHAPED FIRST: lead business fields go in `custom_attributes`, not new columns.
- Validation commands (repo has them): `npm run type-check`, `node --test tests\<file>.mjs`, `npm run build`.

---

## File structure

**Create:**
- `lib/constants/countries.ts` — ISO-3166 alpha-2 code list + `countryOptions(locale)` / `countryName(code)`.
- `app/[locale]/(protected)/study-plans/NewProposalModal.tsx` — client "passo 0" (search/create lead).
- `tests/crm-contacts.test.mjs` — pure tests for contact attr helpers + country helpers.

**Modify:**
- `lib/crm/contacts.ts` — `CONTACT_ATTR`, `getContactNationality`, `buildContactAttributes`, `searchContacts`.
- `lib/portfolio/types.ts` — `priceVersionLabel`, `PriceVersionKind`, `PricedOption`, `toPricedOptions`; add `listPrices` to the `CourseSource` interface.
- `lib/portfolio/queries.ts` — `listActivePriceVersions`.
- `lib/portfolio/course-source.ts` — implement `listPrices`.
- `app/[locale]/(protected)/study-plans/actions.ts` — `createProposalForContact`, `searchContactsAction`.
- `app/[locale]/(protected)/study-plans/page.tsx` — swap the inline create `<form>` for `NewProposalModal`.
- `tests/portfolio.test.mjs` — add `priceVersionLabel` + `toPricedOptions` tests.

---

## Phase A — Backend seam (pure-first, TDD)

### Task 1: Contact custom-attribute helpers (woofed-shaped)

**Files:**
- Modify: `lib/crm/contacts.ts`
- Test: `tests/crm-contacts.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/crm-contacts.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'

const crm = await import('../lib/crm/contacts.ts')

test('CONTACT_ATTR exposes the woofed-shaped keys', () => {
  assert.equal(crm.CONTACT_ATTR.NATIONALITY, 'nationality')
  assert.equal(crm.CONTACT_ATTR.LEAD_SOURCE, 'lead_source')
  assert.equal(crm.CONTACT_ATTR.PREFERRED_LANGUAGE, 'preferred_language')
})

test('getContactNationality reads custom_attributes.nationality (or null)', () => {
  assert.equal(crm.getContactNationality({ custom_attributes: { nationality: 'BR' } }), 'BR')
  assert.equal(crm.getContactNationality({ custom_attributes: {} }), null)
  assert.equal(crm.getContactNationality({ custom_attributes: null }), null)
})

test('buildContactAttributes normalizes, uppercases nationality, merges base, drops empty', () => {
  const out = crm.buildContactAttributes(
    { nationality: 'br', leadSource: ' Instagram ', preferredLanguage: '' },
    { existing: 'keep' },
  )
  assert.deepEqual(out, { existing: 'keep', nationality: 'BR', lead_source: 'Instagram' })
})

test('buildContactAttributes removes a key when set to empty', () => {
  const out = crm.buildContactAttributes({ nationality: '' }, { nationality: 'BR' })
  assert.equal('nationality' in out, false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests\crm-contacts.test.mjs`
Expected: FAIL (`crm.CONTACT_ATTR` is undefined).

- [ ] **Step 3: Write minimal implementation**

Append to `lib/crm/contacts.ts` (after the existing exports):

```ts
/** Well-known keys inside `contacts.custom_attributes` (woofed-shaped; sync 1:1 to the CRM). */
export const CONTACT_ATTR = {
  NATIONALITY: 'nationality',
  LEAD_SOURCE: 'lead_source',
  PREFERRED_LANGUAGE: 'preferred_language',
} as const

function readStringAttr(custom: Json | null | undefined, key: string): string | null {
  if (custom && typeof custom === 'object' && !Array.isArray(custom)) {
    const value = (custom as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.trim() !== '') return value
  }
  return null
}

/** Read the lead's nationality (ISO-3166 alpha-2) from `custom_attributes`, or null. */
export function getContactNationality(contact: { custom_attributes?: Json | null }): string | null {
  return readStringAttr(contact.custom_attributes, CONTACT_ATTR.NATIONALITY)
}

export interface LeadAttrs {
  nationality?: string | null
  leadSource?: string | null
  preferredLanguage?: string | null
}

/**
 * Build a `custom_attributes` object for a lead, merging onto `base`. Nationality is
 * trimmed + uppercased; others trimmed. A provided-but-empty value removes the key.
 * Keys absent from `attrs` are left untouched.
 */
export function buildContactAttributes(attrs: LeadAttrs, base: Json = {}): Json {
  const out: Record<string, unknown> =
    base && typeof base === 'object' && !Array.isArray(base) ? { ...(base as Record<string, unknown>) } : {}
  const apply = (key: string, raw: string | null | undefined, upper = false) => {
    if (raw === undefined) return
    const value = (raw ?? '').trim()
    if (value === '') delete out[key]
    else out[key] = upper ? value.toUpperCase() : value
  }
  apply(CONTACT_ATTR.NATIONALITY, attrs.nationality, true)
  apply(CONTACT_ATTR.LEAD_SOURCE, attrs.leadSource)
  apply(CONTACT_ATTR.PREFERRED_LANGUAGE, attrs.preferredLanguage)
  return out as Json
}
```

Note: `Json` is already imported at the top of `contacts.ts` (`import type { ..., Json } from '@/types/supabase'`). Confirm; it is.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests\crm-contacts.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/crm/contacts.ts tests/crm-contacts.test.mjs
git commit -m "feat(crm): woofed-shaped lead custom-attribute helpers (nationality/lead_source/preferred_language)"
```

---

### Task 2: Country helpers + options list

**Files:**
- Create: `lib/constants/countries.ts`
- Test: `tests/crm-contacts.test.mjs` (extend)

- [ ] **Step 1: Write the failing test**

Append to `tests/crm-contacts.test.mjs`:

```js
const countries = await import('../lib/constants/countries.ts')

test('countryName returns a localized name and tolerates bad input', () => {
  assert.equal(countries.countryName('BR'), 'Brasil')
  assert.equal(countries.countryName('br'), 'Brasil')
  assert.equal(countries.countryName('ZZ'), 'ZZ')
})

test('countryOptions returns sorted {code,name} pairs covering common nationalities', () => {
  const opts = countries.countryOptions()
  assert.ok(opts.length > 50)
  assert.ok(opts.every((o) => typeof o.code === 'string' && o.code.length === 2))
  assert.ok(opts.some((o) => o.code === 'BR'))
  assert.ok(opts.some((o) => o.code === 'CO'))
  const names = opts.map((o) => o.name)
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'pt-BR')))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests\crm-contacts.test.mjs`
Expected: FAIL (cannot find `../lib/constants/countries.ts`).

- [ ] **Step 3: Write minimal implementation**

Create `lib/constants/countries.ts`:

```ts
// ISO-3166 alpha-2 codes; names are resolved via Intl.DisplayNames (no dependency).
// The list is the full common set so the new-lead form can offer "any country".

export const COUNTRY_CODES: readonly string[] = [
  'AF','AL','DZ','AD','AO','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BO','BA',
  'BW','BR','BN','BG','BF','BI','KH','CM','CA','CV','CF','TD','CL','CN','CO','KM','CG','CD','CR','CI',
  'HR','CU','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','FR','GA','GM',
  'GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IL','IT',
  'JM','JP','JO','KZ','KE','KI','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MG','MW','MY',
  'MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG',
  'KP','MK','NO','OM','PK','PA','PG','PY','PE','PH','PL','PT','QA','RO','RU','RW','KN','LC','VC','WS',
  'SM','ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO','ZA','KR','SS','ES','LK','SD','SR','SE',
  'CH','SY','TW','TJ','TZ','TH','TL','TG','TO','TT','TN','TR','TM','TV','UG','UA','AE','GB','US','UY',
  'UZ','VU','VE','VN','YE','ZM','ZW',
]

/** Localized country name for an alpha-2 code; falls back to the upper-cased code. */
export function countryName(code: string, locale = 'pt-BR'): string {
  const upper = (code ?? '').toUpperCase()
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(upper) ?? upper
  } catch {
    return upper
  }
}

export interface CountryOption {
  code: string
  name: string
}

/** All countries as {code, name}, sorted by localized name. */
export function countryOptions(locale = 'pt-BR'): CountryOption[] {
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort((a, b) =>
    a.name.localeCompare(b.name, locale),
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests\crm-contacts.test.mjs`
Expected: PASS (6 tests total).

- [ ] **Step 5: Commit**

```bash
git add lib/constants/countries.ts tests/crm-contacts.test.mjs
git commit -m "feat: country list + localized country helpers for the lead form"
```

---

### Task 3: `priceVersionLabel` + `toPricedOptions` (portfolio, pure)

**Files:**
- Modify: `lib/portfolio/types.ts`
- Test: `tests/portfolio.test.mjs` (extend)

- [ ] **Step 1: Write the failing test**

Append to `tests/portfolio.test.mjs`:

```js
test('priceVersionLabel classifies país > mercado > normal with a human label', () => {
  const markets = [{ id: 'm1', name: 'LATAM' }]
  assert.deepEqual(portfolio.priceVersionLabel({ nationality: 'BR', market_id: null }, markets), {
    kind: 'country', label: 'País · Brasil', scopeValue: 'BR',
  })
  assert.deepEqual(portfolio.priceVersionLabel({ nationality: null, market_id: 'm1' }, markets), {
    kind: 'market', label: 'Mercado · LATAM', scopeValue: 'm1',
  })
  assert.deepEqual(portfolio.priceVersionLabel({ nationality: null, market_id: null }, markets), {
    kind: 'default', label: 'Normal · padrão', scopeValue: null,
  })
})

test('toPricedOptions orders normal → mercado → país and carries the float snapshot', () => {
  const markets = [{ id: 'm1', name: 'LATAM' }]
  const opts = portfolio.toPricedOptions(
    [
      makeVersion({ id: 'pvBR', nationality: 'BR', rate_per_week_in_cents: 24000 }),
      makeVersion({ id: 'pvDef', nationality: null, market_id: null, rate_per_week_in_cents: 26000 }),
      makeVersion({ id: 'pvLat', nationality: null, market_id: 'm1', rate_per_week_in_cents: 24500 }),
    ],
    markets,
  )
  assert.deepEqual(opts.map((o) => o.kind), ['default', 'market', 'country'])
  assert.equal(opts[0].label, 'Normal · padrão')
  assert.equal(opts[2].snapshot.ratePerWeek, 240)
})
```

(`makeVersion` already exists in this test file from SPLIT 6A.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests\portfolio.test.mjs`
Expected: FAIL (`portfolio.priceVersionLabel` is not a function).

- [ ] **Step 3: Write minimal implementation**

In `lib/portfolio/types.ts`, add the `Market` import usage and append:

```ts
export type PriceVersionKind = 'country' | 'market' | 'default'

export interface PriceVersionLabel {
  kind: PriceVersionKind
  label: string
  scopeValue: string | null
}

function regionName(code: string): string {
  const upper = (code ?? '').toUpperCase()
  try {
    return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(upper) ?? upper
  } catch {
    return upper
  }
}

/** Human label for a price version: País · X (most specific) > Mercado · Y > Normal · padrão. */
export function priceVersionLabel(
  version: Pick<CoursePriceVersion, 'nationality' | 'market_id'>,
  markets: Pick<Market, 'id' | 'name'>[] = [],
): PriceVersionLabel {
  if (version.nationality) {
    const code = version.nationality.toUpperCase()
    return { kind: 'country', label: `País · ${regionName(code)}`, scopeValue: code }
  }
  if (version.market_id) {
    const market = markets.find((m) => m.id === version.market_id)
    return { kind: 'market', label: `Mercado · ${market?.name ?? '—'}`, scopeValue: version.market_id }
  }
  return { kind: 'default', label: 'Normal · padrão', scopeValue: null }
}

export interface PricedOption {
  priceVersionId: string
  label: string
  kind: PriceVersionKind
  /** Float snapshot, ready for the editor (`buildStudyCourse`). */
  snapshot: PriceSnapshot
}

const PRICE_KIND_ORDER: Record<PriceVersionKind, number> = { default: 0, market: 1, country: 2 }

/** Map active price versions to ordered, labeled options for the editor's price picker. */
export function toPricedOptions(versions: CoursePriceVersion[], markets: Market[] = []): PricedOption[] {
  return versions
    .map((version) => {
      const labeled = priceVersionLabel(version, markets)
      return {
        priceVersionId: version.id,
        label: labeled.label,
        kind: labeled.kind,
        snapshot: priceVersionToSnapshot(version),
      }
    })
    .sort((a, b) => PRICE_KIND_ORDER[a.kind] - PRICE_KIND_ORDER[b.kind])
}
```

Note: `Market` and `CoursePriceVersion` and `PriceSnapshot`/`priceVersionToSnapshot` are already defined/imported in this file.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests\portfolio.test.mjs`
Expected: PASS (all prior + 2 new).

- [ ] **Step 5: Commit**

```bash
git add lib/portfolio/types.ts tests/portfolio.test.mjs
git commit -m "feat(portfolio): priceVersionLabel + toPricedOptions (pure, ordered normal→mercado→país)"
```

---

### Task 4: `listActivePriceVersions` query + `CourseSource.listPrices`

**Files:**
- Modify: `lib/portfolio/queries.ts`, `lib/portfolio/types.ts` (interface), `lib/portfolio/course-source.ts`

- [ ] **Step 1: Add the query** in `lib/portfolio/queries.ts`:

```ts
/** All in-force price versions for a course (valid window honored), newest valid_from first. */
export async function listActivePriceVersions(
  supabase: Client,
  courseId: string,
  onDate?: string,
): Promise<CoursePriceVersion[]> {
  const today = onDate ?? new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('course_price_versions')
    .select('*')
    .eq('course_id', courseId)
    .lte('valid_from', today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order('valid_from', { ascending: false })
  return data ?? []
}
```

- [ ] **Step 2: Extend the `CourseSource` interface** in `lib/portfolio/types.ts`:

```ts
export interface CourseSource {
  search(query: string): Promise<CourseOption[]>
  resolve(courseId: string, options?: ResolveOptions): Promise<PortfolioCourseRef | null>
  /** All available prices for a course (Normal/Mercado/País), for the editor's override picker. */
  listPrices(courseId: string): Promise<PricedOption[]>
}
```

- [ ] **Step 3: Implement it** in `lib/portfolio/course-source.ts`.

Add imports:

```ts
import { listActivePriceVersions, currentCoursePrice, getCourseWithRefs, listCourses, listInstitutions } from './queries.ts'
import { listMarkets } from './markets.ts'
import { asCourseType, buildStudyCourse, priceVersionToSnapshot, toPricedOptions } from './types.ts'
```

(Adjust the existing import lines rather than duplicating — `currentCoursePrice/getCourseWithRefs/listCourses/listInstitutions` are already imported; just add `listActivePriceVersions`, `listMarkets`, `toPricedOptions`.)

Add the method inside the returned object (after `resolve`):

```ts
    async listPrices(courseId: string): Promise<PricedOption[]> {
      const [versions, markets] = await Promise.all([
        listActivePriceVersions(supabase, courseId),
        listMarkets(supabase),
      ])
      return toPricedOptions(versions, markets)
    },
```

Add the type import for the return type at the top:

```ts
import type { CourseOption, CourseSource, PortfolioCourseRef, PricedOption, ResolveOptions } from './types'
```

- [ ] **Step 4: Verify type-check + build**

Run: `npm run type-check`
Expected: no errors.
Run: `node --test tests\portfolio.test.mjs`
Expected: PASS (unchanged — provider not unit-tested; pure mapper covered in Task 3).

- [ ] **Step 5: Commit**

```bash
git add lib/portfolio/queries.ts lib/portfolio/types.ts lib/portfolio/course-source.ts
git commit -m "feat(portfolio): CourseSource.listPrices + listActivePriceVersions query"
```

---

### Task 5: `createProposalForContact` + `searchContactsAction`

**Files:**
- Modify: `lib/crm/contacts.ts` (add `searchContacts`), `app/[locale]/(protected)/study-plans/actions.ts`

- [ ] **Step 1: Add `searchContacts`** in `lib/crm/contacts.ts`:

```ts
/**
 * Search contacts in the current org by name/email/phone (case-insensitive),
 * newest first. The term is sanitized for use inside a PostgREST `or()` filter.
 */
export async function searchContacts(supabase: Client, query: string, limit = 8): Promise<Contact[]> {
  const term = query.trim()
  if (!term) return []
  const safe = term.replace(/[,()%*]/g, ' ').trim()
  if (!safe) return []
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .is('deleted_at', null)
    .or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`)
    .order('updated_at', { ascending: false })
    .limit(limit)
  return data ?? []
}
```

- [ ] **Step 2: Add the server actions** in `app/[locale]/(protected)/study-plans/actions.ts`.

Add imports at the top (extend the existing ones):

```ts
import { upsertContact as upsertContactRecord, searchContacts } from '@/lib/crm/contacts'
import type { Contact } from '@/lib/crm/contacts'
```

Add a lightweight contact DTO + search action:

```ts
export interface ContactPick {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  nationality: string | null
}

function toContactPick(contact: Contact): ContactPick {
  const custom = contact.custom_attributes
  const nationality =
    custom && typeof custom === 'object' && !Array.isArray(custom)
      ? ((custom as Record<string, unknown>).nationality as string | undefined) ?? null
      : null
  return { id: contact.id, fullName: contact.full_name, email: contact.email, phone: contact.phone, nationality }
}

/** Typeahead for the "passo 0" modal. Editor+ only; org-scoped via RLS. */
export async function searchContactsAction(query: string): Promise<ContactPick[]> {
  const { supabase } = await getActor()
  const rows = await searchContacts(supabase, query)
  return rows.map(toContactPick)
}
```

Add the create action (mirrors `createStudyPlan` but links a contact and mirrors its identity into the plan):

```ts
/**
 * Create a draft proposal already linked to a contact (the "passo 0" flow).
 * Mirrors the contact's name/email/phone into the plan's working copy; the
 * nationality stays on the contact (read at price-resolve time). Redirects to
 * the editor. Editor+ only.
 */
export async function createProposalForContact(contactId: string, locale = 'pt') {
  const { supabase, user, profile } = await getActor()

  const { data: contact, error: contactErr } = await supabase
    .from('contacts')
    .select('id, full_name, email, phone')
    .eq('id', contactId)
    .single()
  if (contactErr) throw new Error(contactErr.message)
  if (!contact) throw new Error('Contact not found')

  const base = createBlankStudyPlan()
  base.student = contact.full_name
  base.email = contact.email ?? ''
  base.phone = contact.phone ?? ''
  base.contactRef = { id: contact.id, fullName: contact.full_name, email: contact.email, phone: contact.phone }
  const data = withComputed(base)

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({
      title: `Cotação - ${contact.full_name}`,
      student_name: contact.full_name,
      applicant_type: data.applicantType,
      status: 'draft',
      data: data as unknown as Json,
      contact_id: contact.id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  if (!plan) throw new Error('Failed to create study plan')

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: plan.id,
    actorId: user.id,
    contactId: contact.id,
    kind: 'created',
    metadata: { student: contact.full_name, from_contact: true },
  })

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.create',
    entityType: 'study_plans',
    entityId: plan.id,
    metadata: { contact_id: contact.id, student: contact.full_name },
  })

  revalidatePath(`/${locale}/study-plans`)
  redirect(`/${locale}/study-plans/${plan.id}`)
}
```

- [ ] **Step 3: Verify type-check + build**

Run: `npm run type-check`
Expected: no errors.
Run: `npm run build`
Expected: build succeeds (touches money/data → build required).

- [ ] **Step 4: Commit**

```bash
git add lib/crm/contacts.ts app/[locale]/(protected)/study-plans/actions.ts
git commit -m "feat(proposals): createProposalForContact + searchContacts action (passo-0 backend)"
```

---

## Phase B — "Passo 0" modal UI

### Task 6: `NewProposalModal` client component

**Files:**
- Create: `app/[locale]/(protected)/study-plans/NewProposalModal.tsx`

- [ ] **Step 1: Create the component**

`app/[locale]/(protected)/study-plans/NewProposalModal.tsx`:

```tsx
'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { countryOptions } from '@/lib/constants/countries'
import { buildContactAttributes } from '@/lib/crm/contacts'
import { createProposalForContact, searchContactsAction, upsertContact, type ContactPick } from './actions'

interface NewProposalModalProps {
  locale: string
}

const COUNTRIES = countryOptions()

export default function NewProposalModal({ locale }: NewProposalModalProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'new'>('search')
  const [results, setResults] = useState<ContactPick[]>([])
  const [moreFields, setMoreFields] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    setMode('search')
    setResults([])
    setMoreFields(false)
    setError(null)
  }, [])

  const onSearch = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!q.trim()) {
      setResults([])
      return
    }
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        try {
          setResults(await searchContactsAction(q))
        } catch {
          setResults([])
        }
      })
    }, 250)
  }

  const pickContact = (id: string) => {
    startTransition(async () => {
      try {
        await createProposalForContact(id, locale)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao criar proposta')
      }
    })
  }

  const createLead = (form: FormData) => {
    const fullName = String(form.get('fullName') ?? '').trim()
    if (!fullName) {
      setError('Nome é obrigatório')
      return
    }
    startTransition(async () => {
      try {
        const { id } = await upsertContact(
          {
            fullName,
            email: String(form.get('email') ?? '') || null,
            phone: String(form.get('phone') ?? '') || null,
            customAttributes: buildContactAttributes({
              nationality: String(form.get('nationality') ?? ''),
              leadSource: String(form.get('leadSource') ?? ''),
              preferredLanguage: String(form.get('preferredLanguage') ?? ''),
            }),
          },
          locale,
        )
        await createProposalForContact(id, locale)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao criar lead')
      }
    })
  }

  return (
    <>
      <button type="button" className="movy-btn movy-btn-primary" onClick={() => setOpen(true)}>
        + Criar proposta
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Criar proposta"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(480px, 100%)', background: 'var(--surface, #fff)', borderRadius: 14, padding: 20, border: '0.5px solid rgba(0,0,0,0.12)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: 16 }}>Para quem é essa proposta?</strong>
              <button type="button" aria-label="Fechar" onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>
                ×
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button type="button" onClick={() => { reset(); setMode('search') }} aria-pressed={mode === 'search'} style={tabStyle(mode === 'search')}>
                Lead existente
              </button>
              <button type="button" onClick={() => { reset(); setMode('new') }} aria-pressed={mode === 'new'} style={tabStyle(mode === 'new')}>
                Novo lead
              </button>
            </div>

            {error && <p role="alert" style={{ color: '#b00020', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

            {mode === 'search' ? (
              <div>
                <input type="text" placeholder="Buscar por nome, email ou telefone…" onChange={(e) => onSearch(e.target.value)} style={inputStyle} autoFocus />
                <div style={{ marginTop: 10, maxHeight: 260, overflowY: 'auto' }}>
                  {results.map((c) => (
                    <button key={c.id} type="button" disabled={pending} onClick={() => pickContact(c.id)} style={rowStyle}>
                      <span style={{ fontWeight: 500 }}>{c.fullName}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        {[c.email, c.nationality].filter(Boolean).join(' · ') || 'sem contato'}
                      </span>
                    </button>
                  ))}
                  {!pending && results.length === 0 && (
                    <p style={{ fontSize: 13, color: '#666', padding: '8px 4px' }}>Digite para buscar um lead.</p>
                  )}
                </div>
              </div>
            ) : (
              <form action={createLead}>
                <label style={labelStyle}>Nome completo *</label>
                <input name="fullName" type="text" required style={inputStyle} autoFocus />
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" style={inputStyle} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Telefone</label>
                    <input name="phone" type="tel" style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Nacionalidade</label>
                    <select name="nationality" defaultValue="" style={inputStyle}>
                      <option value="">—</option>
                      {COUNTRIES.map((o) => (
                        <option key={o.code} value={o.code}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="button" onClick={() => setMoreFields((v) => !v)} style={{ background: 'none', border: 'none', color: '#4B1A77', cursor: 'pointer', fontSize: 13, padding: '8px 0' }}>
                  {moreFields ? '− Menos campos' : '+ Mais campos'}
                </button>
                {moreFields && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Origem do lead</label>
                      <input name="leadSource" type="text" placeholder="Indicação, Instagram…" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Idioma preferido</label>
                      <select name="preferredLanguage" defaultValue="" style={inputStyle}>
                        <option value="">—</option>
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <button type="button" onClick={() => setOpen(false)} style={tabStyle(false)}>Cancelar</button>
                  <button type="submit" disabled={pending} className="movy-btn movy-btn-primary">
                    {pending ? 'Criando…' : 'Criar e abrir proposta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', marginBottom: 10, fontSize: 14 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }
const rowStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%', textAlign: 'left', padding: '8px 10px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 8, background: 'none', cursor: 'pointer', marginBottom: 6 }
function tabStyle(active: boolean): React.CSSProperties {
  return { flex: 1, padding: '8px 10px', borderRadius: 8, border: active ? '1.5px solid #4B1A77' : '0.5px solid rgba(0,0,0,0.2)', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: active ? 500 : 400 }
}
```

Note: the modal reuses `buildContactAttributes` from `lib/crm/contacts.ts` (a pure module, safe to import client-side) so the attribute keys/normalization stay DRY with the server. The server action still owns the canonical write.

- [ ] **Step 2: Verify type-check**

Run: `npm run type-check`
Expected: no errors. If `movy-btn` classes don't exist, the component still works (plain buttons); confirm class names against `app/globals.css` and adjust to existing button classes if needed.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(protected)/study-plans/NewProposalModal.tsx"
git commit -m "feat(proposals): passo-0 NewProposalModal (search or create lead)"
```

---

### Task 7: Wire the modal into the list page

**Files:**
- Modify: `app/[locale]/(protected)/study-plans/page.tsx`

- [ ] **Step 1: Replace the create form**

In `app/[locale]/(protected)/study-plans/page.tsx`:

Remove the import `import { createStudyPlan } from './actions'` (only if unused elsewhere in the file — verify; if the `NewQuoteButton` form is the only user, remove both it and the import). Add:

```tsx
import NewProposalModal from './NewProposalModal'
```

Replace:

```tsx
        <form action={createStudyPlan.bind(null, locale)}>
          <NewQuoteButton />
        </form>
```

with:

```tsx
        <NewProposalModal locale={locale} />
```

If `NewQuoteButton` becomes unused, remove its import too. Keep `createStudyPlan` exported in `actions.ts` (still used by tests/back-compat) even if the page no longer calls it.

- [ ] **Step 2: Verify type-check + build**

Run: `npm run type-check`
Expected: no errors.
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(protected)/study-plans/page.tsx"
git commit -m "feat(proposals): use passo-0 modal as the create-proposal entry point"
```

---

## Phase C — Verification, docs, ship

### Task 8: Full gate + docs + push

- [ ] **Step 1: Full validation**

Run: `npm run type-check`
Expected: no errors.
Run: `node --test tests\crm-contacts.test.mjs tests\portfolio.test.mjs tests\study-financial.test.mjs`
Expected: all PASS.
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 2: Update docs + .wolf**

- `docs/AI-HANDOVER.md`: new top Log entry describing the lead-flow + pricing seam shipped; note the in-editor price-override picker is deferred to the full SPLIT 4 editor.
- `.wolf/memory.md`: one-line entry. `.wolf/anatomy.md`: add `NewProposalModal.tsx`, `lib/constants/countries.ts`, and the new exports. `.wolf/cerebrum.md`: short decision note (woofed-shaped lead fields applied; listPrices seam).
- `docs/PRODUCT-ROADMAP.md`: note SPLIT 4 started (passo-0 + pricing seam) without claiming the full editor done.

- [ ] **Step 3: Commit + push**

```bash
git add docs .wolf
git commit -m "docs: handover + roadmap for proposal lead-flow + pricing seam"
git push origin main
```

---

## Deferred (NOT in this plan — full SPLIT 4 editor)

- In-editor course picker consuming `CourseSource.resolve` (auto price by nationality).
- In-editor price-override dropdown using `CourseSource.listPrices` (Normal/Mercado/País switch).
- Wizard, autosave, sticky totals bar, comparador, cenários, templates.

These reopen `StudyPlanEditor.tsx`; per the "hot file rewritten once per split" rule they belong to the dedicated SPLIT 4 editor work. Everything they depend on (seam + labels + nationality on the contact) is delivered by this plan.
