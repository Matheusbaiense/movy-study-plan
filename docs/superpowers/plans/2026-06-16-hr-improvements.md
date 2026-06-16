# HR Module Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement three independent HR improvement splits: A (Employee Self-Service), B (UX & Bug Polish), C (Admin Cost Intelligence) as specified in `docs/superpowers/specs/2026-06-16-hr-improvements-design.md`.

**Architecture:** All changes are within the existing Next.js 14 App Router + Supabase SSR structure. No DB migrations needed — all data is already available. Server actions in `app/[locale]/(protected)/hr/actions.ts` are the mutation layer; `lib/hr/queries.ts` is the data layer; React components in `components/hr/` are the UI layer.

**Tech Stack:** Next.js 14 App Router · TypeScript · Supabase SSR · `isHrAdmin()` for role checks · inline React style objects (no Tailwind, no CSS files) · `t`, `ink`, `color`, `font` from `@/lib/ui/theme`

---

## File Structure

### New files to create
- `components/hr/DateInputPT.tsx` — thin wrapper around `<input type="date">` that displays DD/MM/YYYY hint
- `components/hr/RateCard.tsx` — read-only rate display for employees on their own dashboard
- `components/hr/SelfInvoiceButton.tsx` — modal-based self-invoice for employees (no employee selector)

### Files to modify
- `lib/hr/queries.ts` — add `estimated_cost_cents` to `EmployeeWithStats`, add `listInvoicesWithEmployeeName()`
- `app/[locale]/(protected)/hr/actions.ts` — add `generateOwnInvoiceAction`, add $0 guard
- `app/[locale]/(protected)/hr/timesheets/page.tsx` — scope entries by own employeeId for non-admin
- `app/[locale]/(protected)/hr/page.tsx` — add RateCard + SelfInvoiceButton to left column
- `app/[locale]/(protected)/hr/invoices/page.tsx` — add isAdmin check, employee filter, draft banner, employee name column
- `app/[locale]/(protected)/hr/team/page.tsx` — add estimated cost per employee + payroll total card
- `components/hr/HrDashboard.tsx` — replace 3-field date input with DateInputPT, better empty state
- `components/hr/ClockWidget.tsx` — clock-out success toast

---

## ── SPLIT A: Employee Self-Service ──

---

### Task A1 — Scope timesheets page for non-admin employees

**Files:**
- Modify: `app/[locale]/(protected)/hr/timesheets/page.tsx`

The timesheets page currently fetches all org entries regardless of role. Non-admin users must see only their own entries. Admin users see all entries (unchanged).

The page already imports `createClient`, fetches `profile`, but it does NOT check role or scope by employee. The HR dashboard page (`app/[locale]/(protected)/hr/page.tsx:61`) already does this correctly for the weekly view — replicate that pattern here.

- [ ] **Step 1: Add role check and employee fetch**

Replace the imports section (lines 1-7) and the data-fetching block (lines 30-38). The page currently imports `listEmployees` (no names) — after this change, non-admin sees only own entries (no employee list), admin sees all entries with full employee list for filtering.

```typescript
// app/[locale]/(protected)/hr/timesheets/page.tsx
// Add these to existing imports:
import { listTimeEntries, listEmployees, getEmployeeByProfileId, isHrAdmin } from '@/lib/hr'

// Replace the data-fetching block (lines 30-38):
const isAdmin = isHrAdmin(profile.role)

const employee = isAdmin ? null : await getEmployeeByProfileId(supabase, profile.org_id, profile.id)

const [entries, employees] = await Promise.all([
  listTimeEntries(supabase, profile.org_id, {
    status: status || undefined,
    employeeId: isAdmin ? (employeeId || undefined) : (employee?.id ?? '__none__'),
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }),
  isAdmin ? listEmployees(supabase, profile.org_id) : Promise.resolve([]),
])
```

Note: `'__none__'` for a non-existing employee causes zero results (safe fallback if employee profile missing). More readable than a conditional render abort.

- [ ] **Step 2: Update the page title and subtitle to reflect employee vs admin view**

Replace the subtitle block (lines 51-53):

```typescript
<div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
  {isAdmin
    ? `${employees.length} ${locale === 'pt' ? 'funcionário(s)' : 'employee(s)'} · ${entries.length} ${locale === 'pt' ? 'registro(s)' : 'entr(ies)'}`
    : `${entries.length} ${locale === 'pt' ? 'registro(s) pessoais' : 'personal entr(ies)'}`}
</div>
```

- [ ] **Step 3: Show better empty state for non-admin**

In the table-rendering block, find the `<div style={{ background: 'var(--surface)', ...}}>` wrapping `<TimesheetTable>` and add an empty-state before the `<TimesheetTable>`:

```typescript
{entries.length === 0 ? (
  <div style={{
    background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 24,
    textAlign: 'center', color: t.textMuted, fontSize: 14,
  }}>
    <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>○</div>
    {isAdmin
      ? (locale === 'pt' ? 'Nenhuma entrada ainda. Aguarde seus funcionários lançarem horas.' : 'No entries yet. Wait for employees to log hours.')
      : (locale === 'pt' ? 'Você ainda não lançou horas. Use o botão \'Lançar Horas\' no dashboard para começar.' : 'No entries yet. Use the \'Add Entry\' button on the dashboard to get started.')}
  </div>
) : (
  <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 24 }}>
    <TimesheetTable
      entries={entries}
      hourlyRateCents={0}
      locale={locale}
      showEmployeeName={isAdmin}
    />
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(protected)/hr/timesheets/page.tsx"
git commit -m "feat(hr): scope timesheets page to own entries for non-admin employees"
```

---

### Task A2 — RateCard component on employee HR dashboard

**Files:**
- Create: `components/hr/RateCard.tsx`
- Modify: `app/[locale]/(protected)/hr/page.tsx`

Employees need to see their own hourly rate (read-only). If rate is $0, show a soft warning. The employee data is already loaded in `HrPage` (`employee?.hourly_rate_in_cents`).

- [ ] **Step 1: Create RateCard component**

```typescript
// components/hr/RateCard.tsx
'use client'

import { t, ink, color, font } from '@/lib/ui/theme'

interface RateCardProps {
  rateCents: number
  locale: string
}

export function RateCard({ rateCents, locale }: RateCardProps) {
  const pt = locale === 'pt'
  const rate = (rateCents / 100).toFixed(2)
  const isUnset = rateCents === 0

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isUnset ? 'rgba(245,158,11,0.3)' : ink(0.1)}`,
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: t.textMuted, marginBottom: 6,
      }}>
        {pt ? 'Seu rate / hora' : 'Your rate / hour'}
      </div>
      {isUnset ? (
        <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 10px', marginTop: 4 }}>
          {pt
            ? 'Rate não configurado — fale com o administrador.'
            : 'Rate not set — contact your admin.'}
        </div>
      ) : (
        <div style={{
          fontSize: 24, fontWeight: 800, color: color.purple,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          fontFamily: font.display,
        }}>
          AU${rate}<span style={{ fontSize: 12, fontWeight: 400, color: t.textMuted }}>/hr</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add RateCard to HrPage left column (non-admin only)**

In `app/[locale]/(protected)/hr/page.tsx`, import RateCard and render it in the left column below `WeekSummary`, but only for non-admin employees:

```typescript
// Add import at top:
import { RateCard } from '@/components/hr/RateCard'

// In the left column JSX, after the WeekSummary block (after line 98):
{employee && !isAdmin && (
  <RateCard rateCents={employee.hourly_rate_in_cents} locale={locale} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add components/hr/RateCard.tsx "app/[locale]/(protected)/hr/page.tsx"
git commit -m "feat(hr): add read-only rate card for employees on HR dashboard"
```

---

### Task A3 — Employee self-invoice action + button

**Files:**
- Modify: `app/[locale]/(protected)/hr/actions.ts`
- Create: `components/hr/SelfInvoiceButton.tsx`
- Modify: `app/[locale]/(protected)/hr/page.tsx`

Employees need to generate their own invoice without an admin dropdown. New server action resolves `employeeId` server-side from the actor's profile. UI reuses the period-preset pattern from `GenerateInvoiceForm`.

- [ ] **Step 1: Add generateOwnInvoiceAction to actions.ts**

Add this action after `generateInvoiceAction` in `app/[locale]/(protected)/hr/actions.ts`:

```typescript
export async function generateOwnInvoiceAction(
  periodStart: string,
  periodEnd: string,
) {
  const { supabase, profile } = await getActor()

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (!employee) throw new Error('Você não tem um perfil de funcionário. Fale com o administrador.')

  if (employee.hourly_rate_in_cents === 0) {
    throw new Error('Seu rate não está configurado. Fale com o administrador para definir seu rate antes de gerar uma invoice.')
  }

  const rules = await listRateRules(supabase, profile.org_id)
  const entries = await listTimeEntries(supabase, profile.org_id, {
    employeeId: employee.id,
    status: 'approved',
    from: periodStart,
    to: periodEnd + 'T23:59:59Z',
    uninvoicedOnly: true,
  })

  if (entries.length === 0) throw new Error('Nenhuma entrada aprovada e não faturada para este período.')

  const centValues = entries.map((e) => {
    if (!e.clock_out) return 0
    const hours = calculateHours(new Date(e.clock_in), new Date(e.clock_out))
    const dateIso = e.clock_in.slice(0, 10)
    const multiplier = getMultiplier(e.day_type as Parameters<typeof getMultiplier>[0], rules, dateIso)
    return calculateLineItemCents(hours, employee.hourly_rate_in_cents, multiplier)
  })
  const totalCents = computeTotalCents(centValues)

  const { count } = await supabase
    .from('hr_invoices')
    .select('*', { count: 'exact', head: true })
    .eq('employee_id', employee.id)
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  const yyyymm = periodStart.slice(0, 7).replace('-', '')
  const invoiceNumber = `INV-${employee.id.slice(0, 6).toUpperCase()}-${yyyymm}-${seq}`

  const invoice = await createInvoice(supabase, {
    org_id: profile.org_id,
    employee_id: employee.id,
    invoice_number: invoiceNumber,
    period_start: periodStart,
    period_end: periodEnd,
    total_cents: totalCents,
    status: 'draft',
  })

  await linkEntriesToInvoice(supabase, invoice.id, entries.map((e) => e.id))
  await logAudit({
    actorId: profile.id, actorEmail: profile.email,
    action: 'hr.invoice.generate_own', entityType: 'hr_invoices', entityId: invoice.id,
    metadata: { periodStart, periodEnd },
  })

  revalidatePath('/', 'layout')
  return invoice
}
```

- [ ] **Step 2: Create SelfInvoiceButton component**

The component mirrors `GenerateInvoiceForm` (period presets) but without the employee selector. It calls `generateOwnInvoiceAction` and redirects to the print page on success using `router.push`.

```typescript
// components/hr/SelfInvoiceButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, X } from 'lucide-react'
import { generateOwnInvoiceAction } from '@/app/[locale]/(protected)/hr/actions'
import { t, ink, color, font } from '@/lib/ui/theme'

type Preset = 'weekly' | 'fortnightly' | 'monthly' | 'custom'

function computePeriod(preset: Preset): { start: string; end: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (preset === 'weekly') {
    const end = new Date(now)
    end.setDate(now.getDate() - now.getDay() - 1) // last Sunday
    const start = new Date(end)
    start.setDate(end.getDate() - 6) // prev Monday
    return { start: iso(start), end: iso(end) }
  }
  if (preset === 'fortnightly') {
    const end = new Date(now)
    end.setDate(now.getDate() - 1)
    const start = new Date(end)
    start.setDate(end.getDate() - 13)
    return { start: iso(start), end: iso(end) }
  }
  if (preset === 'monthly') {
    const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const m = now.getMonth() === 0 ? 12 : now.getMonth()
    const lastDay = new Date(y, m, 0).getDate()
    return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(lastDay)}` }
  }
  // custom — return empty (user fills in)
  return { start: '', end: '' }
}

interface SelfInvoiceButtonProps {
  locale: string
}

export function SelfInvoiceButton({ locale }: SelfInvoiceButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<Preset>('monthly')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const pt = locale === 'pt'

  const period = preset === 'custom'
    ? { start: customStart, end: customEnd }
    : computePeriod(preset)

  function submit() {
    setError(null)
    if (!period.start || !period.end) {
      setError(pt ? 'Selecione o período.' : 'Please select a period.')
      return
    }
    startTransition(async () => {
      try {
        const invoice = await generateOwnInvoiceAction(period.start, period.end)
        router.push(`/${locale}/hr/invoices/${invoice.id}/print`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao gerar invoice.')
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: `1px solid ${ink(0.14)}`, background: 'var(--bg)',
    color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '9px 14px', borderRadius: 9,
          background: `${color.purple}12`, border: `1px solid ${color.purple}30`,
          color: color.purple, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          justifyContent: 'center',
        }}
      >
        <FileText size={13} />
        {pt ? 'Emitir minha Invoice' : 'Generate My Invoice'}
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: 18, padding: 28,
            width: 420, maxWidth: '90vw',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
            border: `1px solid ${ink(0.1)}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>
                  {pt ? 'Emitir minha Invoice' : 'Generate My Invoice'}
                </h2>
                <p style={{ fontSize: 12, color: t.textMuted, margin: '3px 0 0' }}>
                  {pt ? 'Somente entradas aprovadas serão incluídas.' : 'Only approved entries will be included.'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, padding: 6, lineHeight: 0 }}>
                <X size={16} />
              </button>
            </div>

            {/* Period preset selector */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                {pt ? 'Período' : 'Period'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['weekly', 'fortnightly', 'monthly', 'custom'] as Preset[]).map((p) => {
                  const labels: Record<Preset, string> = {
                    weekly: pt ? 'Semanal' : 'Weekly',
                    fortnightly: pt ? 'Quinzenal' : 'Fortnightly',
                    monthly: pt ? 'Mensal' : 'Monthly',
                    custom: pt ? 'Personalizado' : 'Custom',
                  }
                  return (
                    <button key={p} onClick={() => setPreset(p)} style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: preset === p ? color.purple : 'var(--bg)',
                      color: preset === p ? '#fff' : t.textMuted,
                      border: `1px solid ${preset === p ? color.purple : ink(0.14)}`,
                      cursor: 'pointer',
                    }}>
                      {labels[p]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom date inputs */}
            {preset === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
                    {pt ? 'Data Início' : 'Start Date'}
                  </div>
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
                    {pt ? 'Data Fim' : 'End Date'}
                  </div>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}

            {/* Preview of computed period */}
            {preset !== 'custom' && period.start && period.end && (
              <div style={{ marginBottom: 14, padding: '8px 12px', background: `${color.purple}08`, border: `1px solid ${color.purple}20`, borderRadius: 8, fontSize: 12, color: t.textMuted }}>
                {period.start} → {period.end}
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 14, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${ink(0.14)}`, background: 'none', color: t.text, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
              >
                {pt ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={submit}
                disabled={isPending}
                style={{
                  padding: '9px 22px', borderRadius: 9, border: 'none',
                  background: color.purple, color: '#fff',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 600, opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? '...' : (pt ? 'Gerar Invoice' : 'Generate Invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: Add SelfInvoiceButton to HrPage left column (non-admin only)**

In `app/[locale]/(protected)/hr/page.tsx`:

```typescript
// Add import:
import { SelfInvoiceButton } from '@/components/hr/SelfInvoiceButton'

// In left column, after RateCard:
{employee && !isAdmin && (
  <SelfInvoiceButton locale={locale} />
)}
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(protected)/hr/actions.ts" components/hr/SelfInvoiceButton.tsx "app/[locale]/(protected)/hr/page.tsx"
git commit -m "feat(hr): employee self-invoice — generateOwnInvoiceAction + SelfInvoiceButton"
```

---

### Task A4 — Guard: block invoice generation when rate = $0

**Files:**
- Modify: `app/[locale]/(protected)/hr/actions.ts`

`generateInvoiceAction` (admin-generated) should also block $0-rate invoices. Add the guard after the employee fetch (lines 159-163 currently).

- [ ] **Step 1: Add $0 guard to generateInvoiceAction**

After the `if (!emp) throw new Error('Employee not found')` line in `generateInvoiceAction`, add:

```typescript
if (emp.hourly_rate_in_cents === 0) {
  throw new Error('Rate not configured. Set the employee\'s hourly rate before generating an invoice.')
}
```

- [ ] **Step 2: Verify generateOwnInvoiceAction already has guard**

The guard is included in Task A3 Step 1 above — confirm it's present in the file before committing.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(protected)/hr/actions.ts"
git commit -m "fix(hr): block invoice generation when employee hourly rate is \$0"
```

---

## ── SPLIT B: UX & Bug Polish ──

---

### Task B1 — Replace 3-field date input with single DateInputPT

**Files:**
- Create: `components/hr/DateInputPT.tsx`
- Modify: `components/hr/HrDashboard.tsx`

The current `AddEntryModal` in `HrDashboard.tsx` has three separate `<input type="number">` fields for DD/MM/YYYY (lines 83-168). Replace with a single `<input type="date">`.

The `input[type=date]` always returns value as `YYYY-MM-DD` regardless of browser display locale. This is exactly what `logHoursAction` expects for its `date` parameter.

- [ ] **Step 1: Create DateInputPT component**

```typescript
// components/hr/DateInputPT.tsx
'use client'

import { t, ink } from '@/lib/ui/theme'

interface DateInputPTProps {
  value: string         // YYYY-MM-DD
  onChange: (value: string) => void
  min?: string          // YYYY-MM-DD
  max?: string          // YYYY-MM-DD
  style?: React.CSSProperties
}

export function DateInputPT({ value, onChange, min, max, style }: DateInputPTProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: `1px solid ${ink(0.14)}`,
        background: 'var(--bg)',
        color: t.text, fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
        colorScheme: 'light dark',
        ...style,
      }}
    />
  )
}
```

- [ ] **Step 2: Replace date fields in AddEntryModal**

In `components/hr/HrDashboard.tsx`:

1. Add import at top of file:
```typescript
import { DateInputPT } from '@/components/hr/DateInputPT'
```

2. In `AddEntryModal`, remove the `dd`/`mm`/`yyyy` state variables and the computed `date` string. Replace them with a single `date` state:

Old state (lines 83-87):
```typescript
const _today = new Date()
const [dd, setDd] = useState(String(_today.getDate()).padStart(2, '0'))
const [mm, setMm] = useState(String(_today.getMonth() + 1).padStart(2, '0'))
const [yyyy, setYyyy] = useState(String(_today.getFullYear()))
const date = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
```

New state:
```typescript
const [date, setDate] = useState(todayISO())
```

3. Replace the 3-column date grid JSX (lines 148-169) with:
```tsx
<div>
  <label style={labelStyle}>{pt ? 'Data' : 'Date'}</label>
  <DateInputPT
    value={date}
    onChange={setDate}
    min={minDateISO()}
    max={todayISO()}
  />
</div>
```

4. Remove the `numInputStyle` constant (line 101-104) if no longer used.

- [ ] **Step 3: Verify the submit function still works**

The `submit` function calls `logHoursAction(date, startTime, endTime, desc)` — `date` is now `YYYY-MM-DD` from `DateInputPT`, which matches the `logHoursSchema` regex `/^\d{4}-\d{2}-\d{2}$/`. No changes needed there.

- [ ] **Step 4: Commit**

```bash
git add components/hr/DateInputPT.tsx components/hr/HrDashboard.tsx
git commit -m "feat(hr): replace 3-field date input with single DateInputPT in Log Hours modal"
```

---

### Task B2 — Clock-out success toast

**Files:**
- Modify: `components/hr/ClockWidget.tsx`

After `clockOutAction` resolves, compute the session duration from `activeEntry.clock_in` to now and show a brief inline success message for 4 seconds.

- [ ] **Step 1: Add clockOutMsg state and compute duration on success**

In `components/hr/ClockWidget.tsx`, add state and update `handleClockOut`:

```typescript
// Add state (after existing state declarations):
const [clockOutMsg, setClockOutMsg] = useState<string | null>(null)

// Replace handleClockOut:
function handleClockOut() {
  if (!activeEntry) return
  setError(null)
  const sessionStart = new Date(activeEntry.clock_in).getTime()
  startTransition(async () => {
    try {
      await clockOutAction(activeEntry.id)
      const durationMs = Date.now() - sessionStart
      const totalMin = Math.round(durationMs / 60000)
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      const durationStr = h > 0 ? `${h}h ${m}min` : `${m}min`
      const msg = pt
        ? `Sessão encerrada · ${durationStr} registrados`
        : `Session ended · ${durationStr} logged`
      setClockOutMsg(msg)
      setTimeout(() => setClockOutMsg(null), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  })
}
```

- [ ] **Step 2: Render the success message**

Add the success message display after the `{error && ...}` block at the bottom of the ClockWidget JSX:

```tsx
{clockOutMsg && (
  <div style={{
    marginTop: 12, padding: '8px 12px', borderRadius: 8,
    background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
    fontSize: 12, color: '#4ade80', textAlign: 'center', fontWeight: 600,
  }}>
    {clockOutMsg}
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add components/hr/ClockWidget.tsx
git commit -m "feat(hr): show clock-out success toast with session duration"
```

---

### Task B3 — Empty states with actionable messages

**Files:**
- Modify: `components/hr/HrDashboard.tsx` (already improved in A1 — this task improves the dashboard inline empty state)
- Modify: `app/[locale]/(protected)/hr/invoices/page.tsx`

The dashboard's inline timesheet empty state (lines 344-348 in HrDashboard.tsx) currently says "Nenhum registro esta semana." Update it with an actionable message. The invoices page empty state (lines 46-50) also needs improvement.

- [ ] **Step 1: Improve HrDashboard empty state**

In `components/hr/HrDashboard.tsx`, replace the empty state block (inside the table section, around line 344):

```tsx
{entries.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '52px 0', color: t.textMuted, fontSize: 14 }}>
    <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>○</div>
    {isAdmin
      ? (pt ? 'Nenhuma entrada esta semana. Aguarde seus funcionários lançarem horas.' : 'No entries this week. Wait for employees to log hours.')
      : (
        <div>
          <div style={{ marginBottom: 10 }}>
            {pt ? 'Você ainda não lançou horas esta semana.' : 'No entries logged this week.'}
          </div>
          {employee && (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: color.purple, color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              {pt ? '+ Lançar Horas' : '+ Add Entry'}
            </button>
          )}
        </div>
      )
    }
  </div>
) : (
```

- [ ] **Step 2: Improve invoices page empty state**

In `app/[locale]/(protected)/hr/invoices/page.tsx`, replace the empty state (lines 46-50):

```tsx
{invoices.length === 0 ? (
  <div style={{ padding: '56px 32px', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🧾</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 6 }}>
      {locale === 'pt' ? 'Nenhuma invoice gerada ainda' : 'No invoices yet'}
    </div>
    <div style={{ fontSize: 13 }}>
      {locale === 'pt'
        ? 'Clique em "Gerar Invoice" acima para criar a primeira.'
        : 'Click "Generate Invoice" above to create the first one.'}
    </div>
  </div>
) : (
```

- [ ] **Step 3: Commit**

```bash
git add components/hr/HrDashboard.tsx "app/[locale]/(protected)/hr/invoices/page.tsx"
git commit -m "feat(hr): improve empty states with actionable messages on dashboard and invoices"
```

---

### Task B4 — Invoice list with employee name column

**Files:**
- Modify: `lib/hr/queries.ts`
- Modify: `app/[locale]/(protected)/hr/invoices/page.tsx`

`listInvoices` currently returns `HrInvoice[]` with no employee name. We need a new function `listInvoicesWithEmployeeName` that enriches each invoice with `full_name` and `email` by joining through `employee_profiles → profiles`.

- [ ] **Step 1: Add InvoiceWithEmployee type and listInvoicesWithEmployeeName to queries.ts**

Add to `lib/hr/queries.ts` after the existing `listInvoices` function:

```typescript
export interface InvoiceWithEmployee extends HrInvoice {
  full_name: string
  email: string
}

export async function listInvoicesWithEmployeeName(
  supabase: HrClient,
  orgId: string,
  options: { employeeId?: string; status?: string } = {},
): Promise<InvoiceWithEmployee[]> {
  let q = supabase
    .from('hr_invoices')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (options.employeeId) q = q.eq('employee_id', options.employeeId)
  if (options.status) q = q.eq('status', options.status)

  const { data: invoices, error } = await q
  if (error) throw new Error(error.message)
  if (!invoices || invoices.length === 0) return []

  const employeeIds = [...new Set(invoices.map(i => i.employee_id))]
  const { data: employees } = await supabase
    .from('employee_profiles')
    .select('id, profile_id')
    .in('id', employeeIds)

  const profileIds = (employees ?? []).map(e => e.profile_id).filter(Boolean) as string[]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', profileIds)

  const empMap = Object.fromEntries((employees ?? []).map(e => [e.id, e.profile_id]))
  const profMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  return invoices.map(inv => {
    const profileId = empMap[inv.employee_id]
    const prof = profileId ? profMap[profileId] : null
    return {
      ...inv,
      full_name: prof?.full_name ?? '',
      email: prof?.email ?? '',
    }
  })
}
```

- [ ] **Step 2: Update invoices page to use new function and show employee name column**

In `app/[locale]/(protected)/hr/invoices/page.tsx`:

1. Update import from `listInvoices` to `listInvoicesWithEmployeeName`:
```typescript
import { listInvoicesWithEmployeeName, listEmployeesWithNames } from '@/lib/hr'
```

2. Update the data fetch in the page:
```typescript
const [invoices, employees] = await Promise.all([
  listInvoicesWithEmployeeName(supabase, profile.org_id),
  listEmployeesWithNames(supabase, profile.org_id),
])
```

3. Update the table headers to include "Employee" column. Replace the `['Invoice #', 'Period', 'Total', 'Status', 'Issued', '']` header array with:
```typescript
['Invoice #', locale === 'pt' ? 'Funcionário' : 'Employee', 'Period', 'Total', 'Status', 'Issued', '']
```

4. In the table row, add the employee name cell after the invoice number cell:
```tsx
<td style={{ padding: '12px 16px', fontWeight: 600, color: t.text, fontFamily: 'monospace' }}>{inv.invoice_number}</td>
<td style={{ padding: '12px 16px', color: t.text }}>{inv.full_name || inv.email || '—'}</td>
```

- [ ] **Step 3: Export new function from lib/hr barrel**

Check `lib/hr/index.ts` (or wherever the barrel export is) and add:
```typescript
export { listInvoicesWithEmployeeName } from './queries'
export type { InvoiceWithEmployee } from './queries'
```

Run: `grep -n "listInvoices" lib/hr/index.ts` to find where existing export is.

- [ ] **Step 4: Commit**

```bash
git add lib/hr/queries.ts "app/[locale]/(protected)/hr/invoices/page.tsx"
git commit -m "feat(hr): add employee name column to invoice list"
```

---

## ── SPLIT C: Admin Cost Intelligence ──

---

### Task C1 — Add estimated_cost_cents to listEmployeesWithStats

**Files:**
- Modify: `lib/hr/queries.ts`

`listEmployeesWithStats` computes `hours_this_month` (approved hours). Add `estimated_cost_cents = Math.round(hours_this_month * hourly_rate_in_cents)`.

- [ ] **Step 1: Add field to EmployeeWithStats interface**

In `lib/hr/queries.ts`, update the `EmployeeWithStats` interface (line 186-200) to add:

```typescript
estimated_cost_cents: number
```

The full updated interface:
```typescript
export interface EmployeeWithStats {
  id: string
  org_id: string
  profile_id: string | null
  hourly_rate_in_cents: number
  metadata: unknown
  created_at: string
  full_name: string
  email: string
  role: string
  hours_this_month: number
  pending_count: number
  approved_count: number
  is_clocked_in: boolean
  estimated_cost_cents: number
}
```

- [ ] **Step 2: Compute estimated_cost_cents in the map**

In the `return (employees.data ?? []).map(emp => {` block (line 249), update the returned object to include:

```typescript
estimated_cost_cents: Math.round(s.hours * emp.hourly_rate_in_cents),
```

The hours used is `s.hours` (the raw approved hours sum, before rounding), and `emp.hourly_rate_in_cents` is already on the employee. Note: `s.hours` is the unrounded version (computed as the sum), so we must compute `estimated_cost_cents` from it before the rounding on `hours_this_month`.

Update the computation slightly — store raw hours separately:
```typescript
return (employees.data ?? []).map(emp => {
  const p = emp.profile_id ? (profileMap[emp.profile_id] ?? null) : null
  const s = entriesByEmployee[emp.id] ?? { hours: 0, pending: 0, approved: 0, hasClockedIn: false }
  const rawHours = s.hours  // unrounded
  return {
    ...emp,
    full_name: p?.full_name ?? '',
    email: p?.email ?? '',
    role: p?.role ?? 'employee',
    hours_this_month: Math.round(rawHours * 10) / 10,
    pending_count: s.pending,
    approved_count: s.approved,
    is_clocked_in: s.hasClockedIn,
    estimated_cost_cents: Math.round(rawHours * emp.hourly_rate_in_cents),
  }
})
```

- [ ] **Step 3: Build check**

Run: `npx tsc --noEmit`

Expected: No errors. The `EmployeeWithStats` type update should flow cleanly since we're adding a field, not removing one.

- [ ] **Step 4: Commit**

```bash
git add lib/hr/queries.ts
git commit -m "feat(hr): add estimated_cost_cents to EmployeeWithStats"
```

---

### Task C2 — Show cost column per employee + payroll total card

**Files:**
- Modify: `app/[locale]/(protected)/hr/team/page.tsx`

Add payroll total (sum of `estimated_cost_cents`) and replace the "Pending" summary card with "Folha Estimada". Also show AU$ cost in each employee card.

- [ ] **Step 1: Add formatAUD import and compute payroll total**

In `app/[locale]/(protected)/hr/team/page.tsx`, add import:
```typescript
import { formatAUD } from '@/lib/hr/calculations'
```

After the existing summary variables (lines 67-70), add:
```typescript
const totalEstimatedCents = employees.reduce((s, e) => s + e.estimated_cost_cents, 0)
```

- [ ] **Step 2: Replace "Pending" summary card with "Folha Estimada"**

In the summary cards array (lines 91-96), replace the last card object:

```typescript
{ label: pt ? 'Folha Estimada' : 'Est. Payroll', value: formatAUD(totalEstimatedCents), sub: monthName, accent: '#16a34a' },
```

(Replace the existing `{ label: pt ? 'Pendentes' : 'Pending', ... }` entry.)

- [ ] **Step 3: Add estimated cost to each employee card**

In the employee card's stats section (after `hours_this_month` stat pill, before the divider block), add a cost line:

```tsx
{emp.estimated_cost_cents > 0 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
      {formatAUD(emp.estimated_cost_cents)}
    </span>
    <span style={{ fontSize: 11, color: t.textMuted }}>{pt ? 'este mês' : 'this month'}</span>
  </div>
)}
```

Place this inside the stats `<div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>` after the `StatPill` for hours:

```tsx
<StatPill
  icon={Clock}
  value={emp.hours_this_month.toFixed(1) + 'h'}
  label={pt ? 'este mês (aprovado)' : 'this month (approved)'}
  color={color.gold}
/>
{emp.estimated_cost_cents > 0 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
      {formatAUD(emp.estimated_cost_cents)}
    </span>
    <span style={{ fontSize: 11, color: t.textMuted }}>{pt ? 'estimado este mês' : 'est. this month'}</span>
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(protected)/hr/team/page.tsx"
git commit -m "feat(hr): add payroll total card and per-employee cost estimate on team page"
```

---

### Task C3 — Invoice list with employee filter (admin only)

**Files:**
- Modify: `app/[locale]/(protected)/hr/invoices/page.tsx`

Add a `?employee=<id>` URL param support. Admin gets a `<select>` filter dropdown. Non-admin does not see the filter (their invoices are always their own).

The page must also fetch `isAdmin` status and the profile role.

- [ ] **Step 1: Add isAdmin check and searchParams to invoices page**

Update the page signature and add role check:

```typescript
interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ employee?: string }>
}

export default async function InvoicesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { employee: employeeFilter } = await searchParams
  // ... existing auth ...
  
  const isAdmin = isHrAdmin(profile.role)
```

Add `isHrAdmin` import at top:
```typescript
import { listInvoicesWithEmployeeName, listEmployeesWithNames, isHrAdmin } from '@/lib/hr'
```

- [ ] **Step 2: Apply employee filter to invoice query**

Update the data fetch to pass `employeeFilter` (for admins) or the user's own employee ID (for non-admins — handled by RLS, so just pass the filter for admin):

```typescript
const [invoices, employees] = await Promise.all([
  listInvoicesWithEmployeeName(supabase, profile.org_id, {
    employeeId: isAdmin ? (employeeFilter || undefined) : undefined,
  }),
  isAdmin ? listEmployeesWithNames(supabase, profile.org_id) : Promise.resolve([]),
])
```

Note: Non-admin sees all their own invoices (RLS handles this — the query is not scoped by employeeId for non-admin because `listInvoicesWithEmployeeName` only uses `eq('org_id', orgId)` which combined with RLS already filters their data). Actually for safety, let's look at what RLS does — since we cannot verify RLS policy here, it's safer to add explicit scoping for non-admin. 

For non-admin, we need to find their own `employee_id`. The invoice page doesn't currently fetch the employee profile. Since we already have `profile.id`, we can pass `profile.id` context to the query, but that requires fetching the employee profile. Simplest approach: add a check for non-admin to fetch employee, then filter by that employee's ID:

```typescript
let myEmployeeId: string | undefined
if (!isAdmin) {
  const { data: myEmp } = await supabase
    .from('employee_profiles')
    .select('id')
    .eq('org_id', profile.org_id)
    .eq('profile_id', profile.id)
    .is('deleted_at', null)
    .maybeSingle()
  myEmployeeId = myEmp?.id
}

const [invoices, employees] = await Promise.all([
  listInvoicesWithEmployeeName(supabase, profile.org_id, {
    employeeId: isAdmin ? (employeeFilter || undefined) : myEmployeeId,
  }),
  isAdmin ? listEmployeesWithNames(supabase, profile.org_id) : Promise.resolve([]),
])
```

- [ ] **Step 3: Add employee filter UI for admin**

In the page JSX, add a filter bar between the header and the table, but only for admin:

```tsx
{isAdmin && employees.length > 0 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, whiteSpace: 'nowrap' }}>
      {locale === 'pt' ? 'Funcionário:' : 'Employee:'}
    </label>
    <select
      defaultValue={employeeFilter ?? ''}
      onChange={(e) => {
        const url = new URL(window.location.href)
        if (e.target.value) {
          url.searchParams.set('employee', e.target.value)
        } else {
          url.searchParams.delete('employee')
        }
        window.location.href = url.toString()
      }}
      style={{
        padding: '6px 10px', borderRadius: 8, fontSize: 13,
        border: `1px solid ${ink(0.14)}`, background: 'var(--surface)',
        color: t.text, cursor: 'pointer', outline: 'none',
      }}
    >
      <option value="">{locale === 'pt' ? 'Todos os funcionários' : 'All employees'}</option>
      {employees.map(emp => (
        <option key={emp.id} value={emp.id}>
          {emp.full_name || emp.email || emp.id.slice(0, 8)}
        </option>
      ))}
    </select>
    {employeeFilter && (
      <a
        href={`/${locale}/hr/invoices`}
        style={{ fontSize: 12, color: t.textMuted, textDecoration: 'none' }}
      >
        {locale === 'pt' ? '× Limpar' : '× Clear'}
      </a>
    )}
  </div>
)}
```

This filter uses `window.location.href` for simplicity — no `useRouter` needed since the invoices page is a server component. The `onChange` must be in a client component if desired, but since the whole page is server-rendered, we can make this filter a simple HTML `<form>` with GET method instead:

Replace the `<select onChange...>` with a client-safe form:
```tsx
{isAdmin && employees.length > 0 && (
  <form method="GET" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, whiteSpace: 'nowrap' }}>
      {locale === 'pt' ? 'Funcionário:' : 'Employee:'}
    </label>
    <select
      name="employee"
      defaultValue={employeeFilter ?? ''}
      style={{
        padding: '6px 10px', borderRadius: 8, fontSize: 13,
        border: `1px solid ${ink(0.14)}`, background: 'var(--surface)',
        color: t.text, cursor: 'pointer', outline: 'none',
      }}
      onChange="this.form.submit()"
    >
      <option value="">{locale === 'pt' ? 'Todos os funcionários' : 'All employees'}</option>
      {employees.map(emp => (
        <option key={emp.id} value={emp.id}>
          {emp.full_name || emp.email || emp.id.slice(0, 8)}
        </option>
      ))}
    </select>
    {employeeFilter && (
      <a
        href={`/${locale}/hr/invoices`}
        style={{ fontSize: 12, color: t.textMuted, textDecoration: 'none' }}
      >
        × {locale === 'pt' ? 'Limpar' : 'Clear'}
      </a>
    )}
  </form>
)}
```

Note: HTML `onChange="this.form.submit()"` is a string attribute, not a React handler. This will cause a TypeScript error. The correct approach for a server component is to make only the filter a small client component. Create a minimal `InvoiceEmployeeFilter.tsx`:

```typescript
// components/hr/InvoiceEmployeeFilter.tsx
'use client'
import { useRouter } from 'next/navigation'
import type { EmployeeWithName } from '@/lib/hr/queries'
import { t, ink } from '@/lib/ui/theme'

interface InvoiceEmployeeFilterProps {
  employees: Array<{ id: string; full_name: string; email: string }>
  currentEmployeeId?: string
  locale: string
}

export function InvoiceEmployeeFilter({ employees, currentEmployeeId, locale }: InvoiceEmployeeFilterProps) {
  const router = useRouter()
  const pt = locale === 'pt'

  function handleChange(id: string) {
    const url = new URL(window.location.href)
    if (id) {
      url.searchParams.set('employee', id)
    } else {
      url.searchParams.delete('employee')
    }
    router.push(url.pathname + (url.search || ''))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, whiteSpace: 'nowrap' }}>
        {pt ? 'Funcionário:' : 'Employee:'}
      </label>
      <select
        value={currentEmployeeId ?? ''}
        onChange={e => handleChange(e.target.value)}
        style={{
          padding: '6px 10px', borderRadius: 8, fontSize: 13,
          border: `1px solid ${ink(0.14)}`, background: 'var(--surface)',
          color: t.text, cursor: 'pointer', outline: 'none',
        }}
      >
        <option value="">{pt ? 'Todos os funcionários' : 'All employees'}</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>
            {emp.full_name || emp.email || emp.id.slice(0, 8)}
          </option>
        ))}
      </select>
      {currentEmployeeId && (
        <button
          onClick={() => handleChange('')}
          style={{ background: 'none', border: 'none', fontSize: 12, color: t.textMuted, cursor: 'pointer' }}
        >
          × {pt ? 'Limpar' : 'Clear'}
        </button>
      )}
    </div>
  )
}
```

Then in the invoices page:
```tsx
import { InvoiceEmployeeFilter } from '@/components/hr/InvoiceEmployeeFilter'

// In JSX:
{isAdmin && employees.length > 0 && (
  <InvoiceEmployeeFilter
    employees={employees}
    currentEmployeeId={employeeFilter}
    locale={locale}
  />
)}
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(protected)/hr/invoices/page.tsx" components/hr/InvoiceEmployeeFilter.tsx
git commit -m "feat(hr): add employee filter dropdown to invoice list for admins"
```

---

### Task C4 — Draft invoice alert banner

**Files:**
- Modify: `app/[locale]/(protected)/hr/invoices/page.tsx`

If there are draft invoices, show a yellow banner for admins only. Each draft row in the table gets an "Issue →" button (calls existing `issueInvoiceAction`).

- [ ] **Step 1: Create IssueInvoiceButton client component**

```typescript
// components/hr/IssueInvoiceButton.tsx
'use client'

import { useTransition } from 'react'
import { issueInvoiceAction } from '@/app/[locale]/(protected)/hr/actions'

interface IssueInvoiceButtonProps {
  invoiceId: string
  locale: string
}

export function IssueInvoiceButton({ invoiceId, locale }: IssueInvoiceButtonProps) {
  const [isPending, startTransition] = useTransition()
  const pt = locale === 'pt'

  function handleIssue() {
    startTransition(async () => {
      await issueInvoiceAction(invoiceId)
    })
  }

  return (
    <button
      onClick={handleIssue}
      disabled={isPending}
      style={{
        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
        background: '#1d4ed8', color: '#fff', border: 'none',
        cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {isPending ? '...' : (pt ? 'Emitir →' : 'Issue →')}
    </button>
  )
}
```

- [ ] **Step 2: Add draft alert banner and Issue button in invoices page**

In `app/[locale]/(protected)/hr/invoices/page.tsx`:

1. Import:
```typescript
import { IssueInvoiceButton } from '@/components/hr/IssueInvoiceButton'
```

2. Compute draft count:
```typescript
const draftCount = isAdmin ? invoices.filter(inv => inv.status === 'draft').length : 0
```

3. Add banner just below the page header:
```tsx
{isAdmin && draftCount > 0 && (
  <div style={{
    marginBottom: 16, padding: '12px 16px', borderRadius: 10,
    background: '#fffbeb', border: '1px solid #fde68a',
    color: '#92400e', fontSize: 13, fontWeight: 500,
  }}>
    <span style={{ fontWeight: 700 }}>
      {draftCount} {locale === 'pt' ? 'invoice(s) em rascunho' : 'draft invoice(s)'}
    </span>
    {' '}
    {locale === 'pt'
      ? 'aguardando emissão — marque como "Emitida" após o pagamento ser acordado.'
      : 'awaiting issuance — mark as "Issued" once payment is agreed.'}
  </div>
)}
```

4. In the table rows, add the Issue button in the actions cell for draft invoices:

Replace the last `<td>` in the table row (`View / Print →`) with two cells:

```tsx
<td style={{ padding: '12px 16px' }}>
  {inv.status === 'draft' && isAdmin && (
    <IssueInvoiceButton invoiceId={inv.id} locale={locale} />
  )}
</td>
<td style={{ padding: '12px 16px' }}>
  <Link href={`/${locale}/hr/invoices/${inv.id}/print`} prefetch={false} style={{
    fontSize: 12, color: '#4B1A77', fontWeight: 600, textDecoration: 'none',
  }}>
    {locale === 'pt' ? 'Ver / Imprimir →' : 'View / Print →'}
  </Link>
</td>
```

Also update the table header to add the extra column:
```typescript
['Invoice #', locale === 'pt' ? 'Funcionário' : 'Employee', 'Period', 'Total', 'Status', 'Issued', '', '']
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(protected)/hr/invoices/page.tsx" components/hr/IssueInvoiceButton.tsx
git commit -m "feat(hr): draft invoice alert banner and inline Issue button for admins"
```

---

## Final: Build Verification

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds, all routes compile. Watch for any missing exports from the `lib/hr` barrel.

- [ ] **Step 3: Update OpenWolf files**

Update `.wolf/anatomy.md` with new files:
- `components/hr/DateInputPT.tsx` — thin date input wrapper displaying DD/MM/YYYY, wraps `<input type="date">`
- `components/hr/RateCard.tsx` — read-only rate display for non-admin employees (shows $0 warning)
- `components/hr/SelfInvoiceButton.tsx` — modal for employee self-invoice with period presets
- `components/hr/InvoiceEmployeeFilter.tsx` — admin-only dropdown to filter invoice list by employee
- `components/hr/IssueInvoiceButton.tsx` — inline "Issue" button for draft invoices

Append to `.wolf/memory.md`:
```
| HH:MM | HR improvements splits A+B+C | components/hr/*, lib/hr/queries.ts, app/.../hr/* | All 3 splits implemented | ~8000 tokens |
```

- [ ] **Step 4: Final commit if any lingering changes**

```bash
git status
git add .wolf/anatomy.md .wolf/memory.md
git commit -m "chore: update openwolf files for HR improvements splits A+B+C"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| A1 — Timesheets scoped to own entries for non-admin | Task A1 |
| A2 — Rate visible on employee dashboard | Task A2 |
| A3 — Employee self-invoice (generateOwnInvoiceAction) | Task A3 |
| A4 — $0 rate guard blocks invoice generation | Task A4 |
| B1 — Single date input (DateInputPT) replaces 3 fields | Task B1 |
| B2 — Clock-out success toast with duration | Task B2 |
| B3 — Empty states with actionable messages | Task B3 |
| B4 — Invoice list with employee name column | Task B4 |
| C1 — estimated_cost_cents in listEmployeesWithStats | Task C1 |
| C2 — Payroll total card + per-employee cost on team page | Task C2 |
| C3 — Employee filter on invoice list (admin only) | Task C3 |
| C4 — Draft invoice alert + Issue button | Task C4 |

All spec sections covered. No gaps.

**Type consistency check:**
- `InvoiceWithEmployee` extends `HrInvoice` — consistent with existing `HrInvoice` type in `lib/hr/types.ts`
- `EmployeeWithStats.estimated_cost_cents: number` — added to interface and computed in the same function
- `generateOwnInvoiceAction` returns same `HrInvoice` shape as `generateInvoiceAction` — consistent
- `SelfInvoiceButton` imports `generateOwnInvoiceAction` from `actions.ts` — the import path matches
- `InvoiceEmployeeFilter` uses `router.push` from `next/navigation` — correct for client component

**Placeholder check:** All code blocks are complete. No TBD or TODO in implementation steps.
