# SPLIT 4 (slice 1): portfolio course picker + auto-price + override — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** In the proposal editor, let the consultant pick a course from the portfolio catalog so its price fills automatically by the lead's nationality (país›mercado›normal), with a selector to switch the applied price (Normal/Mercado/País). Manual entry stays as fallback.

**Architecture:** A new `CoursePortfolioPicker` client subcomponent encapsulates search + resolve + price-version select, so `StudyPlanEditor.tsx` (852 lines, hot file) changes minimally. Server actions wrap the existing `createPortfolioCourseSource`. The picker fills identity+price fields only; the editor's existing controls keep owning schedule/segments/installments. The full wizard refactor remains a later slice.

**Tech Stack:** Next.js 14 server actions, React 18 client component, Supabase RLS, TS strict.

**Key decisions:**
- The picker overlays only identity+price onto the existing course (preserves start/segments/modules) when the type is unchanged; on a type change it rebuilds from the resolved course.
- Switching the applied price overlays only the float price fields from the chosen `PriceSnapshot`.
- Store the chosen `priceVersionId` on the course (new optional field) for future reverse-impact ("which proposals use this price").

**Conventions:** No `(supabase as any)`. `'use server'` files export only async funcs + types. Relative `.ts` runtime imports need the extension. PowerShell shell. Validate: `npm run type-check`, `npm run build` (touches money → build required).

---

## Task A: Add `priceVersionId` to `StudyCourse`

**Files:** Modify `lib/study-plans/types.ts`

- [ ] **Step 1:** In `interface StudyCourse`, add after `paymentCadenceDays?: number`:

```ts
  /** Portfolio price version this course's price came from (SPLIT 4 picker); for reverse-impact. */
  priceVersionId?: string
```

- [ ] **Step 2:** `npm run type-check` → no errors.
- [ ] **Step 3:** Commit:
```
git add lib/study-plans/types.ts
git commit -m "feat(study-plans): optional priceVersionId on StudyCourse (portfolio price provenance)"
```

---

## Task B: Server actions wrapping CourseSource

**Files:** Modify `app/[locale]/(protected)/study-plans/actions.ts`

- [ ] **Step 1:** Add imports near the top (after existing imports):

```ts
import { createPortfolioCourseSource } from '@/lib/portfolio/course-source'
import type { CourseOption, PortfolioCourseRef, PricedOption } from '@/lib/portfolio/types'
import type { StudentLocation } from '@/lib/study-plans/types'
```

- [ ] **Step 2:** Add three async actions (all read-only; `getActor()` enforces editor+ and gives `supabase`):

```ts
/** Search the portfolio catalog for courses (picker typeahead). Editor+ only. */
export async function searchCoursesAction(query: string): Promise<CourseOption[]> {
  const { supabase } = await getActor()
  if (!query.trim()) return []
  return createPortfolioCourseSource(supabase).search(query)
}

/** Resolve a catalog course to a price snapshot + editor-ready course, by nationality. Editor+ only. */
export async function resolveCourseAction(
  courseId: string,
  opts: { nationality?: string | null; location?: StudentLocation } = {},
): Promise<PortfolioCourseRef | null> {
  const { supabase } = await getActor()
  return createPortfolioCourseSource(supabase).resolve(courseId, {
    nationality: opts.nationality ?? undefined,
    location: opts.location,
  })
}

/** List the available prices for a catalog course (Normal/Mercado/País) for the override selector. */
export async function listCoursePricesAction(courseId: string): Promise<PricedOption[]> {
  const { supabase } = await getActor()
  return createPortfolioCourseSource(supabase).listPrices(courseId)
}
```

- [ ] **Step 3:** `npm run type-check` → no errors. `npm run build` → succeeds.
- [ ] **Step 4:** Commit:
```
git add "app/[locale]/(protected)/study-plans/actions.ts"
git commit -m "feat(proposals): server actions for portfolio course search/resolve/listPrices"
```

---

## Task C: `CoursePortfolioPicker` client subcomponent

**Files:** Create `components/study-plans/CoursePortfolioPicker.tsx`

- [ ] **Step 1:** Create the file:

```tsx
'use client'

import { useState, useTransition, useRef } from 'react'
import { searchCoursesAction, resolveCourseAction, listCoursePricesAction } from '@/app/[locale]/(protected)/study-plans/actions'
import type { CourseOption, PriceSnapshot, PricedOption } from '@/lib/portfolio/types'
import type { StudentLocation, StudyCourse } from '@/lib/study-plans/types'

interface AppliedCourse {
  course: StudyCourse
  priceVersionId: string
  catalogCourseId: string
}

interface CoursePortfolioPickerProps {
  nationality?: string | null
  location?: StudentLocation
  /** Apply a resolved portfolio course (identity + price) to the editor's course. */
  onApply: (applied: AppliedCourse) => void
  /** Apply a different price version (float price fields only) to the editor's course. */
  onPriceVersion: (snapshot: PriceSnapshot) => void
}

const box: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid var(--border, rgba(0,0,0,0.2))', fontSize: 13 }

export function CoursePortfolioPicker({ nationality, location, onApply, onPriceVersion }: CoursePortfolioPickerProps) {
  const [results, setResults] = useState<CourseOption[]>([])
  const [prices, setPrices] = useState<PricedOption[]>([])
  const [selectedPriceId, setSelectedPriceId] = useState('')
  const [openList, setOpenList] = useState(false)
  const [pending, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onSearch = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!q.trim()) {
      setResults([])
      setOpenList(false)
      return
    }
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        try {
          setResults(await searchCoursesAction(q))
          setOpenList(true)
        } catch {
          setResults([])
        }
      })
    }, 250)
  }

  const pick = (option: CourseOption) => {
    setOpenList(false)
    startTransition(async () => {
      const ref = await resolveCourseAction(option.id, { nationality, location })
      if (!ref) return
      onApply({ course: ref.course, priceVersionId: ref.priceVersionId, catalogCourseId: option.id })
      setSelectedPriceId(ref.priceVersionId)
      try {
        setPrices(await listCoursePricesAction(option.id))
      } catch {
        setPrices([])
      }
    })
  }

  const changePrice = (priceVersionId: string) => {
    setSelectedPriceId(priceVersionId)
    const found = prices.find((p) => p.priceVersionId === priceVersionId)
    if (found) onPriceVersion(found.snapshot)
  }

  return (
    <div style={{ display: 'grid', gap: 8, position: 'relative' }}>
      <input
        type="text"
        placeholder="Buscar curso do portfólio…"
        style={box}
        onChange={(e) => onSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpenList(true)}
      />
      {openList && results.length > 0 && (
        <div style={{ position: 'absolute', top: 38, left: 0, right: 0, zIndex: 20, background: 'var(--surface, #fff)', border: '0.5px solid var(--border, rgba(0,0,0,0.2))', borderRadius: 8, maxHeight: 220, overflowY: 'auto' }}>
          {results.map((option) => (
            <button key={option.id} type="button" disabled={pending} onClick={() => pick(option)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: 'none', cursor: 'pointer', fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{option.provider}</span> — {option.name}
            </button>
          ))}
        </div>
      )}
      {prices.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted, #666)' }}>
          Preço aplicado:
          <select style={{ ...box, width: 'auto', flex: 1 }} value={selectedPriceId} onChange={(e) => changePrice(e.target.value)}>
            {prices.map((p) => (
              <option key={p.priceVersionId} value={p.priceVersionId}>{p.label}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
```

- [ ] **Step 2:** `npm run type-check` → no errors. (If `PriceSnapshot`/`PricedOption`/`CourseOption` aren't exported from `lib/portfolio/types`, they are — verify.)
- [ ] **Step 3:** Commit:
```
git add components/study-plans/CoursePortfolioPicker.tsx
git commit -m "feat(study-plans): CoursePortfolioPicker (search catalog + price-version selector)"
```

---

## Task D: Wire the picker into the editor

**Files:** Modify `components/study-plans/StudyPlanEditor.tsx`

- [ ] **Step 1:** Add the import (near the other imports):

```ts
import { CoursePortfolioPicker } from './CoursePortfolioPicker'
import type { PriceSnapshot } from '@/lib/portfolio/types'
```

- [ ] **Step 2:** Add a prop. Change the `Props` interface to add:

```ts
  contactNationality?: string | null
```

and destructure it in the component signature:
`export function StudyPlanEditor({ id, locale, initialData, status, presets, contactNationality }: Props) {`

- [ ] **Step 3:** Add two handlers next to `applyPreset` (inside the component). PRICE_FIELDS overlay preserves schedule/segments:

```ts
  function applyPortfolioCourse(
    courseId: string,
    picked: { course: StudyCourse; priceVersionId: string },
  ) {
    const current = plan.courses.find((item) => item.id === courseId)
    if (!current) return
    if (current.type === picked.course.type) {
      // Same type: overlay identity + price, keep the consultant's schedule/segments/modules.
      updateCourse(courseId, {
        provider: picked.course.provider,
        name: picked.course.name,
        url: picked.course.url,
        ratePerWeek: picked.course.ratePerWeek,
        tuition: picked.course.tuition,
        enrolmentFee: picked.course.enrolmentFee,
        materialFee: picked.course.materialFee,
        hasMaterial: picked.course.hasMaterial,
        scholarship: picked.course.scholarship,
        depositWeeks: picked.course.depositWeeks,
        paymentParts: picked.course.paymentParts,
        paymentFrequency: picked.course.paymentFrequency,
        priceVersionId: picked.priceVersionId,
      })
    } else {
      // Type changed: take the resolved course wholesale (fresh segments/modules), keep the id.
      updateCourse(courseId, { ...picked.course, id: courseId, priceVersionId: picked.priceVersionId })
    }
  }

  function applyPriceSnapshot(courseId: string, snapshot: PriceSnapshot) {
    updateCourse(courseId, {
      ratePerWeek: snapshot.ratePerWeek,
      tuition: snapshot.tuition,
      enrolmentFee: snapshot.enrolmentFee,
      materialFee: snapshot.materialFee,
      hasMaterial: snapshot.hasMaterial,
      scholarship: snapshot.scholarship,
      depositWeeks: snapshot.depositWeeks,
      paymentParts: snapshot.paymentParts,
      paymentFrequency: snapshot.paymentFrequency,
      priceVersionId: snapshot.priceVersionId,
    })
  }
```

- [ ] **Step 4:** In the course card header, REPLACE the legacy preset `<select>` block:

```tsx
                  <select style={{ ...input, width: 260 }} onChange={(e) => applyPreset(course.id, Number(e.target.value))} value="">
                    <option value="">Aplicar preset...</option>
                    {presetList.map((preset, i) => (
                      <option key={`${preset.provider}-${preset.name}-${i}`} value={i}>{preset.provider} - {preset.name}</option>
                    ))}
                  </select>
```

with the portfolio picker (keep the manual fields below unchanged — they remain the fallback):

```tsx
                  <div style={{ width: 280 }}>
                    <CoursePortfolioPicker
                      nationality={contactNationality}
                      location={plan.studentLocation}
                      onApply={(applied) => applyPortfolioCourse(course.id, applied)}
                      onPriceVersion={(snapshot) => applyPriceSnapshot(course.id, snapshot)}
                    />
                  </div>
```

NOTE: `applyPreset`, `presetList`, and the preset import may become unused. If `applyPreset`/`presetList`/`COURSE_PRESETS`/`presets` are now unused, leave them in place ONLY if removing them is clean; otherwise remove the dead code (unused `presets` prop can stay for back-compat — the page still passes it). Prefer: keep `presets` in Props (page passes it) but if `applyPreset`/`presetList` are unused, remove them to avoid lint errors. Verify with type-check/build and report what you removed.

- [ ] **Step 5:** `npm run type-check` → no errors. `npm run build` → succeeds.
- [ ] **Step 6:** Commit:
```
git add components/study-plans/StudyPlanEditor.tsx
git commit -m "feat(study-plans): portfolio course picker + price override in the editor"
```

---

## Task E: Page passes the contact's nationality

**Files:** Modify `app/[locale]/(protected)/study-plans/[id]/page.tsx`

- [ ] **Step 1:** After loading `plan`, fetch the linked contact's nationality (when `contact_id` is set):

```tsx
  const planRow = plan as unknown as StudyPlanRow
  let contactNationality: string | null = null
  if (planRow.contact_id) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('custom_attributes')
      .eq('id', planRow.contact_id)
      .maybeSingle()
    contactNationality = getContactNationality(contact ?? { custom_attributes: null })
  }
```

Add the import:
```ts
import { getContactNationality } from '@/lib/crm/contacts'
```

Reuse `planRow` for the existing `row` usage (rename or keep both consistent — there is currently `const row = plan as unknown as StudyPlanRow`; replace that line with the `planRow` above and use `planRow` in the JSX).

- [ ] **Step 2:** Pass the prop to the editor:

```tsx
    <StudyPlanEditor
      id={planRow.id}
      locale={locale}
      initialData={planRow.data as StudyPlanData}
      status={planRow.status}
      presets={presets}
      contactNationality={contactNationality}
    />
```

- [ ] **Step 3:** `npm run type-check` → no errors. `npm run build` → succeeds.
- [ ] **Step 4:** Commit:
```
git add "app/[locale]/(protected)/study-plans/[id]/page.tsx"
git commit -m "feat(proposals): pass linked contact nationality to the editor for auto pricing"
```

---

## Task F: Gate + docs + push

- [ ] **Step 1:** `npm run type-check` ✅ · `node --test tests\crm-contacts.test.mjs tests\portfolio.test.mjs tests\study-financial.test.mjs` ✅ · `npm run build` ✅.
- [ ] **Step 2:** Update `docs/AI-HANDOVER.md` (top log entry: picker+override shipped), `.wolf/` (memory/anatomy/cerebrum), and `docs/PRODUCT-ROADMAP.md` (SPLIT 4 progress: picker done; wizard still pending).
- [ ] **Step 3:**
```
git add docs .wolf
git commit -m "docs: handover + roadmap for SPLIT 4 course picker + price override"
git push origin main
```

---

## Deferred (still later, full SPLIT 4 wizard)
Wizard step refactor, autosave, sticky totals bar, live "explain" panel, option comparator, scenarios, version history, templates, migration 012. The picker integrates additively now; the wizard reorganizes the same file later.
