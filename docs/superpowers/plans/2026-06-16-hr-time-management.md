# HR & Time Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add employee clock-in/out, timesheet approval, and Australian Tax Invoice (ABN format) PDF generation to the Agency Hub.

**Architecture:** Four new Supabase tables (all `org_id` scoped with RLS) extend the existing `profiles` table via `employee_profiles`. Pure calculation logic lives in `lib/hr/calculations.ts`, org-scoped queries in `lib/hr/queries.ts`, and server actions in `app/[locale]/(protected)/hr/actions.ts`. PDF generation reuses `window.print()` + `@media print` exactly as `StudyPlanProposal.tsx` — zero new PDF dependencies.

**Tech Stack:** Next.js App Router, Supabase (RLS + server client), TypeScript strict, Lucide icons, shadcn/ui vars, Tailwind `@layer components`, `node:test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-06-16-hr-time-management-design.md`

---

## File Map

**Create:**
- `supabase/migrations/013_hr_module.sql` — 4 tables + RLS
- `lib/hr/types.ts` — TypeScript domain types for HR
- `lib/hr/calculations.ts` — pure rate calculation functions
- `lib/hr/queries.ts` — org-scoped Supabase query helpers
- `lib/hr/index.ts` — barrel export
- `tests/hr-calculations.test.mjs` — unit tests for calculations
- `app/[locale]/(protected)/hr/actions.ts` — server actions (clock, approve, invoice)
- `components/hr/ClockWidget.tsx` — pulsing live timer + Clock In/Out button
- `components/hr/WeekSummary.tsx` — 7-day progress bars + approval dots
- `components/hr/TimesheetTable.tsx` — sortable timesheet rows + approve/reject
- `components/hr/TaxInvoice.tsx` — ABN-format invoice, `window.print()` engine
- `app/[locale]/(protected)/hr/page.tsx` — HR dashboard
- `app/[locale]/(protected)/hr/clock/page.tsx` — employee self-service clock page
- `app/[locale]/(protected)/hr/timesheets/page.tsx` — admin timesheet list
- `app/[locale]/(protected)/hr/invoices/page.tsx` — invoice list + generate modal
- `app/[locale]/(protected)/hr/invoices/[id]/print/page.tsx` — print page

**Modify:**
- `components/layout/AppShell.tsx` — add HR entry under Operations section in sidebar
- `types/supabase.ts` — regenerated via MCP after migration (do not hand-edit)

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/013_hr_module.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/013_hr_module.sql
-- ============================================================================
-- 013 — HR & Time Management (Agency Hub › Operations)
-- ============================================================================
-- 4 new tables, all org_id scoped + RLS via current_org_id().
-- Conventions from 010/011: gen_random_uuid(), now(), soft-delete via
-- deleted_at, money in *_in_cents, metadata jsonb, external_id, IF NOT EXISTS.
-- ============================================================================

-- 1) employee_profiles — extends profiles (no parallel auth)
create table if not exists public.employee_profiles (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null default '11111111-1111-4111-8111-111111111111'
                          references public.organizations(id) on delete restrict,
  profile_id            uuid references public.profiles(id) on delete set null,
  abn                   text,
  bank_name             text,
  bsb                   text,
  account_number        text,
  account_name          text,
  hourly_rate_in_cents  bigint not null default 0,
  currency_code         text not null default 'AUD',
  metadata              jsonb not null default '{}'::jsonb,
  external_id           text,
  deleted_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists employee_profiles_org_idx on public.employee_profiles(org_id);
create index if not exists employee_profiles_profile_idx on public.employee_profiles(profile_id);

-- RLS
alter table public.employee_profiles enable row level security;

drop policy if exists "employee_profiles: org members read" on public.employee_profiles;
create policy "employee_profiles: org members read"
  on public.employee_profiles for select
  using (org_id = current_org_id() and is_active_user() and deleted_at is null);

drop policy if exists "employee_profiles: admins write" on public.employee_profiles;
create policy "employee_profiles: admins write"
  on public.employee_profiles for insert
  with check (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'owner'));

drop policy if exists "employee_profiles: admins update" on public.employee_profiles;
create policy "employee_profiles: admins update"
  on public.employee_profiles for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'owner'));

-- 2) hr_rate_rules — day_type multipliers per org
create table if not exists public.hr_rate_rules (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null default '11111111-1111-4111-8111-111111111111'
                   references public.organizations(id) on delete restrict,
  name           text not null,
  day_type       text not null check (day_type in ('weekday','saturday','sunday','public_holiday')),
  multiplier     numeric(6,4) not null default 1.0,
  applies_from   date not null,
  applies_until  date,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists hr_rate_rules_org_idx on public.hr_rate_rules(org_id);

alter table public.hr_rate_rules enable row level security;

drop policy if exists "hr_rate_rules: org members read" on public.hr_rate_rules;
create policy "hr_rate_rules: org members read"
  on public.hr_rate_rules for select
  using (org_id = current_org_id() and is_active_user());

drop policy if exists "hr_rate_rules: admins write" on public.hr_rate_rules;
create policy "hr_rate_rules: admins write"
  on public.hr_rate_rules for insert
  with check (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'owner'));

drop policy if exists "hr_rate_rules: admins update" on public.hr_rate_rules;
create policy "hr_rate_rules: admins update"
  on public.hr_rate_rules for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'owner'));

-- 3) hr_invoices — snapshot at issue time
create table if not exists public.hr_invoices (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null default '11111111-1111-4111-8111-111111111111'
                    references public.organizations(id) on delete restrict,
  employee_id     uuid not null references public.employee_profiles(id) on delete restrict,
  invoice_number  text not null,
  period_start    date not null,
  period_end      date not null,
  total_cents     bigint not null default 0,
  currency_code   text not null default 'AUD',
  status          text not null default 'draft' check (status in ('draft','issued','paid')),
  issued_at       timestamptz,
  paid_at         timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  external_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists hr_invoices_org_idx on public.hr_invoices(org_id);
create index if not exists hr_invoices_employee_idx on public.hr_invoices(employee_id);
create unique index if not exists hr_invoices_number_org_uniq on public.hr_invoices(org_id, invoice_number);

alter table public.hr_invoices enable row level security;

drop policy if exists "hr_invoices: org members read" on public.hr_invoices;
create policy "hr_invoices: org members read"
  on public.hr_invoices for select
  using (org_id = current_org_id() and is_active_user());

drop policy if exists "hr_invoices: admins write" on public.hr_invoices;
create policy "hr_invoices: admins write"
  on public.hr_invoices for insert
  with check (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'owner'));

drop policy if exists "hr_invoices: admins update" on public.hr_invoices;
create policy "hr_invoices: admins update"
  on public.hr_invoices for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'owner'));

-- 4) time_entries — clock in/out records
create table if not exists public.time_entries (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null default '11111111-1111-4111-8111-111111111111'
                 references public.organizations(id) on delete restrict,
  employee_id  uuid not null references public.employee_profiles(id) on delete restrict,
  clock_in     timestamptz not null,
  clock_out    timestamptz,
  description  text,
  day_type     text not null default 'weekday' check (day_type in ('weekday','saturday','sunday','public_holiday')),
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_by  uuid references public.profiles(id) on delete set null,
  invoice_id   uuid references public.hr_invoices(id) on delete set null,
  metadata     jsonb not null default '{}'::jsonb,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists time_entries_org_idx on public.time_entries(org_id);
create index if not exists time_entries_employee_idx on public.time_entries(employee_id);
create index if not exists time_entries_clock_in_idx on public.time_entries(clock_in desc);

alter table public.time_entries enable row level security;

-- Employees read their own entries; admins read all in org
drop policy if exists "time_entries: read own or admin" on public.time_entries;
create policy "time_entries: read own or admin"
  on public.time_entries for select
  using (
    org_id = current_org_id()
    and is_active_user()
    and deleted_at is null
    and (
      employee_id in (select id from public.employee_profiles where profile_id = auth.uid())
      or current_user_role() in ('admin', 'owner')
    )
  );

-- Employees insert for their own profile
drop policy if exists "time_entries: employees insert own" on public.time_entries;
create policy "time_entries: employees insert own"
  on public.time_entries for insert
  with check (
    org_id = current_org_id()
    and is_active_user()
    and employee_id in (select id from public.employee_profiles where profile_id = auth.uid() and org_id = current_org_id())
  );

-- Admins update (approve/reject/set clock_out)
drop policy if exists "time_entries: admins update" on public.time_entries;
create policy "time_entries: admins update"
  on public.time_entries for update
  using (org_id = current_org_id() and is_active_user() and current_user_role() in ('admin', 'owner'));

-- Employees can update their own pending entries (to set clock_out)
drop policy if exists "time_entries: employees update own pending" on public.time_entries;
create policy "time_entries: employees update own pending"
  on public.time_entries for update
  using (
    org_id = current_org_id()
    and is_active_user()
    and status = 'pending'
    and employee_id in (select id from public.employee_profiles where profile_id = auth.uid())
  );
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the `mcp__2521841a-f63f-4f25-bccb-c187a75b3b03__apply_migration` tool with:
- `name`: `013_hr_module`
- `query`: (full SQL from Step 1)

Then run `mcp__2521841a-f63f-4f25-bccb-c187a75b3b03__get_advisors` to verify 0 new ERRORs.

- [ ] **Step 3: Regenerate TypeScript types**

Use `mcp__2521841a-f63f-4f25-bccb-c187a75b3b03__generate_typescript_types` and write the output to `types/supabase.ts`. This auto-adds `employee_profiles`, `time_entries`, `hr_rate_rules`, `hr_invoices` to the `Database` type.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/013_hr_module.sql types/supabase.ts
git commit -m "feat(hr): migration 013 — employee_profiles, time_entries, hr_rate_rules, hr_invoices + RLS"
```

---

## Task 2: TypeScript Domain Types

**Files:**
- Create: `lib/hr/types.ts`

These are domain types for the HR module. They re-export from the auto-generated Supabase types and add computed/input shapes.

- [ ] **Step 1: Write `lib/hr/types.ts`**

```typescript
// lib/hr/types.ts
import type { Tables, TablesInsert } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type EmployeeProfile = Tables<'employee_profiles'>
export type EmployeeProfileInsert = TablesInsert<'employee_profiles'>
export type TimeEntry = Tables<'time_entries'>
export type TimeEntryInsert = TablesInsert<'time_entries'>
export type HrRateRule = Tables<'hr_rate_rules'>
export type HrRateRuleInsert = TablesInsert<'hr_rate_rules'>
export type HrInvoice = Tables<'hr_invoices'>
export type HrInvoiceInsert = TablesInsert<'hr_invoices'>

export type DayType = 'weekday' | 'saturday' | 'sunday' | 'public_holiday'
export type TimeEntryStatus = 'pending' | 'approved' | 'rejected'
export type InvoiceStatus = 'draft' | 'issued' | 'paid'

/** Any Supabase client typed against our Database (server client in practice). */
export type HrClient = SupabaseClient<Database>

/** A time_entries row joined with hours and gross_cents for display/invoice. */
export interface TimeEntryComputed extends TimeEntry {
  hours: number
  multiplier: number
  gross_cents: number
}

/** One line on a Tax Invoice, built from a TimeEntryComputed. */
export interface InvoiceLine {
  date: string          // 'DD/MM/YYYY'
  description: string
  hours: number
  rate_cents: number
  multiplier: number
  amount_cents: number
}

/** Full data needed to render a TaxInvoice (fetched server-side for print). */
export interface InvoicePrintData {
  invoice: HrInvoice
  employee: EmployeeProfile & { full_name: string; email: string }
  lines: InvoiceLine[]
  org: { name: string; abn?: string; address?: string }
}

export type InvoicePeriod = 'weekly' | 'fortnightly' | 'monthly' | 'custom'
```

- [ ] **Step 2: Create barrel `lib/hr/index.ts`**

```typescript
// lib/hr/index.ts
export * from './types'
export * from './calculations'
export * from './queries'
```

- [ ] **Step 3: Commit**

```bash
git add lib/hr/types.ts lib/hr/index.ts
git commit -m "feat(hr): domain types for employee_profiles, time_entries, hr_invoices"
```

---

## Task 3: Rate Calculation Functions (TDD)

**Files:**
- Create: `lib/hr/calculations.ts`
- Create: `tests/hr-calculations.test.mjs`

Pure functions; no Supabase dependency. All money stays in integer cents.

- [ ] **Step 1: Write the failing tests first**

```javascript
// tests/hr-calculations.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'

const calc = await import('../lib/hr/calculations.ts')

// ─── detectDayType ───────────────────────────────────────────────────────────

test('detectDayType: returns weekday for a Monday', () => {
  const result = calc.detectDayType(new Date('2026-06-15'), []) // Monday
  assert.equal(result, 'weekday')
})

test('detectDayType: returns saturday for Saturday', () => {
  const result = calc.detectDayType(new Date('2026-06-14'), []) // Saturday
  assert.equal(result, 'saturday')
})

test('detectDayType: returns sunday for Sunday', () => {
  const result = calc.detectDayType(new Date('2026-06-13'), []) // Sunday
  assert.equal(result, 'sunday')
})

test('detectDayType: returns public_holiday when date is in list', () => {
  const result = calc.detectDayType(new Date('2026-01-26'), ['2026-01-26']) // Australia Day
  assert.equal(result, 'public_holiday')
})

// ─── calculateHours ──────────────────────────────────────────────────────────

test('calculateHours: 2 hours exactly', () => {
  const clockIn = new Date('2026-06-15T09:00:00Z')
  const clockOut = new Date('2026-06-15T11:00:00Z')
  assert.equal(calc.calculateHours(clockIn, clockOut), 2)
})

test('calculateHours: 7.5 hours', () => {
  const clockIn = new Date('2026-06-15T09:00:00Z')
  const clockOut = new Date('2026-06-15T16:30:00Z')
  assert.equal(calc.calculateHours(clockIn, clockOut), 7.5)
})

test('calculateHours: rounds to 2 decimal places', () => {
  const clockIn = new Date('2026-06-15T09:00:00Z')
  const clockOut = new Date('2026-06-15T10:00:20Z') // 1 hour 20 seconds
  assert.equal(calc.calculateHours(clockIn, clockOut), 1.01)
})

// ─── getMultiplier ────────────────────────────────────────────────────────────

const makeRule = (dayType, multiplier, from = '2026-01-01', until = null) => ({
  id: 'r1', org_id: 'o1', name: 'test', day_type: dayType,
  multiplier, applies_from: from, applies_until: until,
  metadata: {}, created_at: '', updated_at: '',
})

test('getMultiplier: returns 1.0 when no rules exist', () => {
  assert.equal(calc.getMultiplier('weekday', [], '2026-06-15'), 1.0)
})

test('getMultiplier: returns rule multiplier for matching day_type', () => {
  const rules = [makeRule('saturday', 1.5)]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 1.5)
})

test('getMultiplier: ignores rule if date is before applies_from', () => {
  const rules = [makeRule('saturday', 1.5, '2026-07-01')]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 1.0)
})

test('getMultiplier: ignores rule if date is after applies_until', () => {
  const rules = [makeRule('saturday', 1.5, '2026-01-01', '2026-06-01')]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 1.0)
})

test('getMultiplier: returns highest multiplier when multiple rules match', () => {
  const rules = [makeRule('saturday', 1.5), makeRule('saturday', 2.0)]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 2.0)
})

// ─── calculateLineItemCents ───────────────────────────────────────────────────

test('calculateLineItemCents: 8 hours at $25/hr weekday = 2000 cents', () => {
  assert.equal(calc.calculateLineItemCents(8, 2500, 1.0), 20000)
})

test('calculateLineItemCents: 4 hours at $30/hr saturday (1.5x) = 18000 cents', () => {
  assert.equal(calc.calculateLineItemCents(4, 3000, 1.5), 18000)
})

test('calculateLineItemCents: rounds to nearest cent', () => {
  // 1h 20s at $25/hr = 1.01 hours * 2500 = 2525 cents
  assert.equal(calc.calculateLineItemCents(1.01, 2500, 1.0), 2525)
})

// ─── computeTotalCents ────────────────────────────────────────────────────────

test('computeTotalCents: sums an array of cents values', () => {
  assert.equal(calc.computeTotalCents([20000, 18000, 2525]), 40525)
})

test('computeTotalCents: returns 0 for empty array', () => {
  assert.equal(calc.computeTotalCents([]), 0)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test tests/hr-calculations.test.mjs
```

Expected: `Error: Cannot find module '../lib/hr/calculations.ts'` or similar.

- [ ] **Step 3: Write `lib/hr/calculations.ts`**

```typescript
// lib/hr/calculations.ts
import type { DayType, HrRateRule } from './types'

/** Detect the day type for a given date. Public holidays take priority over day-of-week. */
export function detectDayType(date: Date, publicHolidays: string[]): DayType {
  const iso = date.toISOString().slice(0, 10) // 'YYYY-MM-DD'
  if (publicHolidays.includes(iso)) return 'public_holiday'
  const dow = date.getDay() // 0=Sun, 6=Sat
  if (dow === 0) return 'sunday'
  if (dow === 6) return 'saturday'
  return 'weekday'
}

/** Calculate hours worked between two timestamps, rounded to 2 decimal places. */
export function calculateHours(clockIn: Date, clockOut: Date): number {
  const ms = clockOut.getTime() - clockIn.getTime()
  return Math.round((ms / 3_600_000) * 100) / 100
}

/**
 * Return the applicable multiplier for a day_type on a given date.
 * When multiple rules match, returns the highest.
 * Falls back to 1.0 when no rule matches.
 */
export function getMultiplier(
  dayType: DayType,
  rules: HrRateRule[],
  dateIso: string,
): number {
  const matching = rules.filter((r) => {
    if (r.day_type !== dayType) return false
    if (r.applies_from > dateIso) return false
    if (r.applies_until !== null && r.applies_until < dateIso) return false
    return true
  })

  if (matching.length === 0) return 1.0
  return Math.max(...matching.map((r) => Number(r.multiplier)))
}

/**
 * Calculate the gross amount for a single time entry line item.
 * Returns integer cents, rounded to nearest cent.
 */
export function calculateLineItemCents(
  hours: number,
  hourlyRateCents: number,
  multiplier: number,
): number {
  return Math.round(hours * hourlyRateCents * multiplier)
}

/** Sum an array of cent values. */
export function computeTotalCents(centValues: number[]): number {
  return centValues.reduce((sum, v) => sum + v, 0)
}

/** Format cents as AUD string: 2050 → "AU$20.50" */
export function formatAUD(cents: number): string {
  return `AU$${(cents / 100).toFixed(2)}`
}

/** Format a date as DD/MM/YYYY for invoice display. */
export function formatDateAU(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
node --test tests/hr-calculations.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/hr/calculations.ts tests/hr-calculations.test.mjs
git commit -m "feat(hr): rate calculation pure functions + tests (TDD)"
```

---

## Task 4: Supabase Query Helpers

**Files:**
- Create: `lib/hr/queries.ts`

Org-scoped queries following the pattern in `lib/crm/contacts.ts`. Every function accepts a `HrClient` (server Supabase client) as its first argument.

- [ ] **Step 1: Write `lib/hr/queries.ts`**

```typescript
// lib/hr/queries.ts
import type {
  HrClient, EmployeeProfile, EmployeeProfileInsert,
  TimeEntry, TimeEntryInsert, HrRateRule, HrRateRuleInsert,
  HrInvoice, HrInvoiceInsert, InvoicePrintData, InvoiceLine,
} from './types'
import { calculateHours, getMultiplier, calculateLineItemCents, formatDateAU } from './calculations'

// ── Employee Profiles ─────────────────────────────────────────────────────────

export async function listEmployees(
  supabase: HrClient,
  orgId: string,
): Promise<EmployeeProfile[]> {
  const { data, error } = await supabase
    .from('employee_profiles')
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getEmployeeByProfileId(
  supabase: HrClient,
  orgId: string,
  profileId: string,
): Promise<EmployeeProfile | null> {
  const { data } = await supabase
    .from('employee_profiles')
    .select('*')
    .eq('org_id', orgId)
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .maybeSingle()
  return data ?? null
}

export async function getEmployeeById(
  supabase: HrClient,
  id: string,
): Promise<EmployeeProfile | null> {
  const { data } = await supabase
    .from('employee_profiles')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  return data ?? null
}

export async function upsertEmployee(
  supabase: HrClient,
  input: EmployeeProfileInsert,
): Promise<EmployeeProfile> {
  const { data, error } = await supabase
    .from('employee_profiles')
    .upsert(input, { onConflict: 'org_id,profile_id' })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ── Time Entries ──────────────────────────────────────────────────────────────

export async function getActiveClockEntry(
  supabase: HrClient,
  employeeId: string,
): Promise<TimeEntry | null> {
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)
    .is('clock_out', null)
    .is('deleted_at', null)
    .maybeSingle()
  return data ?? null
}

export async function clockIn(
  supabase: HrClient,
  input: TimeEntryInsert,
): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(input)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function clockOut(
  supabase: HrClient,
  entryId: string,
  clockOutAt: string,
): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .update({ clock_out: clockOutAt, updated_at: new Date().toISOString() })
    .eq('id', entryId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function listTimeEntries(
  supabase: HrClient,
  orgId: string,
  options: {
    employeeId?: string
    status?: string
    from?: string
    to?: string
    uninvoicedOnly?: boolean
  } = {},
): Promise<TimeEntry[]> {
  let q = supabase
    .from('time_entries')
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('clock_in', { ascending: false })

  if (options.employeeId) q = q.eq('employee_id', options.employeeId)
  if (options.status) q = q.eq('status', options.status)
  if (options.from) q = q.gte('clock_in', options.from)
  if (options.to) q = q.lte('clock_in', options.to)
  if (options.uninvoicedOnly) q = q.is('invoice_id', null)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateEntryStatus(
  supabase: HrClient,
  entryId: string,
  status: 'approved' | 'rejected',
  approvedBy: string,
): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .update({ status, approved_by: approvedBy, updated_at: new Date().toISOString() })
    .eq('id', entryId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ── Rate Rules ────────────────────────────────────────────────────────────────

export async function listRateRules(
  supabase: HrClient,
  orgId: string,
): Promise<HrRateRule[]> {
  const { data, error } = await supabase
    .from('hr_rate_rules')
    .select('*')
    .eq('org_id', orgId)
    .order('applies_from', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export async function listInvoices(
  supabase: HrClient,
  orgId: string,
  options: { employeeId?: string; status?: string } = {},
): Promise<HrInvoice[]> {
  let q = supabase
    .from('hr_invoices')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (options.employeeId) q = q.eq('employee_id', options.employeeId)
  if (options.status) q = q.eq('status', options.status)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getInvoiceById(
  supabase: HrClient,
  id: string,
): Promise<HrInvoice | null> {
  const { data } = await supabase
    .from('hr_invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data ?? null
}

export async function createInvoice(
  supabase: HrClient,
  input: HrInvoiceInsert,
): Promise<HrInvoice> {
  const { data, error } = await supabase
    .from('hr_invoices')
    .insert(input)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateInvoiceStatus(
  supabase: HrClient,
  invoiceId: string,
  status: 'issued' | 'paid',
): Promise<HrInvoice> {
  const patch: Partial<HrInvoiceInsert> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'issued') patch.issued_at = new Date().toISOString()
  if (status === 'paid') patch.paid_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('hr_invoices')
    .update(patch)
    .eq('id', invoiceId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Assign invoice_id to all approved entries in the period for this employee. */
export async function linkEntriesToInvoice(
  supabase: HrClient,
  invoiceId: string,
  entryIds: string[],
): Promise<void> {
  const { error } = await supabase
    .from('time_entries')
    .update({ invoice_id: invoiceId, updated_at: new Date().toISOString() })
    .in('id', entryIds)
  if (error) throw new Error(error.message)
}

/**
 * Fetch all data needed to render a TaxInvoice print view.
 * Also computes invoice lines from the linked time_entries.
 */
export async function getInvoicePrintData(
  supabase: HrClient,
  invoiceId: string,
  rules: HrRateRule[],
): Promise<InvoicePrintData | null> {
  const invoice = await getInvoiceById(supabase, invoiceId)
  if (!invoice) return null

  const employee = await getEmployeeById(supabase, invoice.employee_id)
  if (!employee) return null

  // fetch the linked profile for name/email
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', employee.profile_id ?? '')
    .maybeSingle()

  // fetch the org name
  const { data: org } = await supabase
    .from('organizations')
    .select('name, metadata')
    .eq('id', invoice.org_id)
    .maybeSingle()

  // fetch linked time entries
  const { data: entries } = await supabase
    .from('time_entries')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('clock_in', { ascending: true })

  const lines: InvoiceLine[] = (entries ?? []).map((e) => {
    const dateIso = e.clock_in.slice(0, 10)
    const hours = e.clock_out
      ? calculateHours(new Date(e.clock_in), new Date(e.clock_out))
      : 0
    const multiplier = getMultiplier(e.day_type as any, rules, dateIso)
    const amount_cents = calculateLineItemCents(hours, employee.hourly_rate_in_cents, multiplier)
    return {
      date: formatDateAU(dateIso),
      description: e.description ?? 'Services rendered',
      hours,
      rate_cents: employee.hourly_rate_in_cents,
      multiplier,
      amount_cents,
    }
  })

  return {
    invoice,
    employee: {
      ...employee,
      full_name: profile?.full_name ?? '',
      email: profile?.email ?? '',
    },
    lines,
    org: {
      name: org?.name ?? '',
      abn: (org?.metadata as any)?.abn,
      address: (org?.metadata as any)?.address,
    },
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/hr/queries.ts
git commit -m "feat(hr): org-scoped Supabase query helpers"
```

---

## Task 5: Server Actions

**Files:**
- Create: `app/[locale]/(protected)/hr/actions.ts`

Server actions that the client components will call. They get the org/user from the session, then delegate to `lib/hr/queries.ts`.

- [ ] **Step 1: Write `app/[locale]/(protected)/hr/actions.ts`**

```typescript
// app/[locale]/(protected)/hr/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import {
  getEmployeeByProfileId, getActiveClockEntry,
  clockIn, clockOut, updateEntryStatus, listRateRules,
  createInvoice, linkEntriesToInvoice, updateInvoiceStatus,
  listTimeEntries,
} from '@/lib/hr'
import { detectDayType, calculateHours, getMultiplier, calculateLineItemCents, computeTotalCents } from '@/lib/hr/calculations'

async function getActor() {
  const supabase = await createClient()
  const profile = await getUser(supabase)
  if (!profile) throw new Error('Unauthenticated')
  return { supabase, profile }
}

// ── Clock In ──────────────────────────────────────────────────────────────────

export async function clockInAction(description?: string) {
  const { supabase, profile } = await getActor()

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (!employee) throw new Error('Employee profile not found for this account')

  const existing = await getActiveClockEntry(supabase, employee.id)
  if (existing) throw new Error('Already clocked in')

  const now = new Date()
  const publicHolidays: string[] = (employee.metadata as any)?.public_holidays ?? []
  const dayType = detectDayType(now, publicHolidays)

  const entry = await clockIn(supabase, {
    org_id: profile.org_id,
    employee_id: employee.id,
    clock_in: now.toISOString(),
    day_type: dayType,
    description: description ?? null,
    status: 'pending',
  })

  revalidatePath(`/hr`)
  return entry
}

// ── Clock Out ─────────────────────────────────────────────────────────────────

export async function clockOutAction(entryId: string) {
  const { supabase } = await getActor()
  const entry = await clockOut(supabase, entryId, new Date().toISOString())
  revalidatePath(`/hr`)
  return entry
}

// ── Approve / Reject ──────────────────────────────────────────────────────────

export async function approveEntryAction(entryId: string) {
  const { supabase, profile } = await getActor()
  const entry = await updateEntryStatus(supabase, entryId, 'approved', profile.id)
  revalidatePath(`/hr`)
  return entry
}

export async function rejectEntryAction(entryId: string) {
  const { supabase, profile } = await getActor()
  const entry = await updateEntryStatus(supabase, entryId, 'rejected', profile.id)
  revalidatePath(`/hr`)
  return entry
}

// ── Generate Invoice ──────────────────────────────────────────────────────────

export async function generateInvoiceAction(
  employeeId: string,
  periodStart: string,
  periodEnd: string,
) {
  const { supabase, profile } = await getActor()

  const rules = await listRateRules(supabase, profile.org_id)
  const entries = await listTimeEntries(supabase, profile.org_id, {
    employeeId,
    status: 'approved',
    from: periodStart,
    to: periodEnd + 'T23:59:59Z',
    uninvoicedOnly: true,
  })

  if (entries.length === 0) throw new Error('No approved, uninvoiced entries for this period')

  // Build line items to compute total
  const { data: emp } = await supabase
    .from('employee_profiles')
    .select('hourly_rate_in_cents')
    .eq('id', employeeId)
    .single()
  if (!emp) throw new Error('Employee not found')

  const centValues = entries.map((e) => {
    if (!e.clock_out) return 0
    const hours = calculateHours(new Date(e.clock_in), new Date(e.clock_out))
    const dateIso = e.clock_in.slice(0, 10)
    const multiplier = getMultiplier(e.day_type as any, rules, dateIso)
    return calculateLineItemCents(hours, emp.hourly_rate_in_cents, multiplier)
  })
  const totalCents = computeTotalCents(centValues)

  // Auto-generate invoice number: INV-{first6ofEmployeeId}-{YYYYMM}-{seq}
  const { count } = await supabase
    .from('hr_invoices')
    .select('*', { count: 'exact', head: true })
    .eq('employee_id', employeeId)
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  const yyyymm = periodStart.slice(0, 7).replace('-', '')
  const invoiceNumber = `INV-${employeeId.slice(0, 6).toUpperCase()}-${yyyymm}-${seq}`

  const invoice = await createInvoice(supabase, {
    org_id: profile.org_id,
    employee_id: employeeId,
    invoice_number: invoiceNumber,
    period_start: periodStart,
    period_end: periodEnd,
    total_cents: totalCents,
    status: 'draft',
  })

  await linkEntriesToInvoice(supabase, invoice.id, entries.map((e) => e.id))

  revalidatePath(`/hr/invoices`)
  return invoice
}

// ── Issue / Mark Paid ─────────────────────────────────────────────────────────

export async function issueInvoiceAction(invoiceId: string) {
  const { supabase } = await getActor()
  const invoice = await updateInvoiceStatus(supabase, invoiceId, 'issued')
  revalidatePath(`/hr/invoices`)
  return invoice
}

export async function markInvoicePaidAction(invoiceId: string) {
  const { supabase } = await getActor()
  const invoice = await updateInvoiceStatus(supabase, invoiceId, 'paid')
  revalidatePath(`/hr/invoices`)
  return invoice
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/[locale]/(protected)/hr/actions.ts"
git commit -m "feat(hr): server actions (clockIn, clockOut, approve, reject, generateInvoice)"
```

---

## Task 6: Sidebar Navigation Update

**Files:**
- Modify: `components/layout/AppShell.tsx`

Add HR under an "Operations" section label, using the existing nav item rendering pattern. The sidebar currently has a flat `mainNav` array. We add a grouped section below the main nav.

- [ ] **Step 1: Add import for Lucide `Clock` icon**

In the existing Lucide import block near the top of `AppShell.tsx`:

```typescript
import {
  Home,
  ClipboardList,
  Calculator,
  ArrowLeftRight,
  BookText,
  LayoutGrid,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,          // ← add this
  type LucideIcon,
} from 'lucide-react'
```

- [ ] **Step 2: Add `operationsNav` array after `mainNav`**

Find the `mainNav` declaration in `AppShell.tsx`:

```typescript
const mainNav: NavEntry[] = [
  { href: `/${locale}/home`, icon: Home, label: 'Home' },
  // ...existing entries...
]
```

Add after it:

```typescript
const operationsNav: NavEntry[] = [
  { href: `/${locale}/hr`, icon: Clock, label: locale === 'pt' ? 'RH & Horas' : 'HR & Time' },
]
```

- [ ] **Step 3: Render Operations section in `SidebarContent`**

Find the `{/* Nav */}` block inside `SidebarContent`:

```tsx
{/* Nav */}
<nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
  {mainNav.map((item) => (
    <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} onClick={() => setMobileOpen(false)} />
  ))}
</nav>
```

Replace with:

```tsx
{/* Nav */}
<nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
  {mainNav.map((item) => (
    <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} onClick={() => setMobileOpen(false)} />
  ))}

  {/* Operations section */}
  {!isCollapsed && (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', padding: '12px 8px 4px', textTransform: 'uppercase' }}>
      {locale === 'pt' ? 'Operações' : 'Operations'}
    </div>
  )}
  {isCollapsed && <div style={{ height: 12 }} />}
  {operationsNav.map((item) => (
    <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} onClick={() => setMobileOpen(false)} />
  ))}
</nav>
```

- [ ] **Step 4: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/layout/AppShell.tsx
git commit -m "feat(hr): add HR & Time entry to sidebar under Operations section"
```

---

## Task 7: ClockWidget Component

**Files:**
- Create: `components/hr/ClockWidget.tsx`

Client component. Shows elapsed timer when clocked in (with purple gradient + gold pulse), or a Clock In button when clocked out. Calls server actions.

- [ ] **Step 1: Write `components/hr/ClockWidget.tsx`**

```typescript
'use client'

import { useState, useEffect, useTransition } from 'react'
import { Clock, Square } from 'lucide-react'
import type { TimeEntry } from '@/lib/hr/types'
import { clockInAction, clockOutAction } from '@/app/[locale]/(protected)/hr/actions'

interface ClockWidgetProps {
  activeEntry: TimeEntry | null
  locale: string
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ClockWidget({ activeEntry, locale }: ClockWidgetProps) {
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isClockedIn = activeEntry !== null

  useEffect(() => {
    if (!isClockedIn || !activeEntry?.clock_in) return
    const start = new Date(activeEntry.clock_in).getTime()
    const tick = () => setElapsed(Date.now() - start)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isClockedIn, activeEntry?.clock_in])

  function handleClockIn() {
    setError(null)
    startTransition(async () => {
      try {
        await clockInAction(description || undefined)
        setDescription('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleClockOut() {
    if (!activeEntry) return
    setError(null)
    startTransition(async () => {
      try {
        await clockOutAction(activeEntry.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #4B1A77 0%, #2A1153 100%)',
      borderRadius: 16,
      padding: 24,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Pulse dot when clocked in */}
      {isClockedIn && (
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
            boxShadow: '0 0 0 0 rgba(74, 222, 128, 0.4)',
            animation: 'pulse-ring 1.5s infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.85 }}>LIVE</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Clock size={20} style={{ opacity: 0.8 }} />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', opacity: 0.85 }}>
          {locale === 'pt' ? 'Controle de Ponto' : 'Time Clock'}
        </span>
      </div>

      {isClockedIn ? (
        <>
          <div style={{
            fontSize: 40, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: '#FBB615', letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            {formatElapsed(elapsed)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 20 }}>
            {locale === 'pt' ? 'tempo decorrido' : 'elapsed time'}
          </div>
          {activeEntry?.description && (
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 16, fontStyle: 'italic' }}>
              {activeEntry.description}
            </div>
          )}
          <button
            onClick={handleClockOut}
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8, padding: '10px 20px', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
              width: '100%', justifyContent: 'center',
            }}
          >
            <Square size={16} />
            {isPending ? '...' : (locale === 'pt' ? 'Bater Ponto Saída' : 'Clock Out')}
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 16 }}>
            {locale === 'pt' ? 'Nenhum registro ativo' : 'No active session'}
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={locale === 'pt' ? 'Descrição (opcional)' : 'Description (optional)'}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
              padding: '8px 12px', color: '#fff', fontSize: 13,
              marginBottom: 12, boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleClockIn}
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#FBB615', border: 'none', borderRadius: 8,
              padding: '10px 20px', color: '#000',
              fontSize: 14, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer',
              width: '100%', justifyContent: 'center',
            }}
          >
            <Clock size={16} />
            {isPending ? '...' : (locale === 'pt' ? 'Bater Ponto Entrada' : 'Clock In')}
          </button>
        </>
      )}

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#fca5a5' }}>{error}</div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); }
          70% { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
          100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hr/ClockWidget.tsx
git commit -m "feat(hr): ClockWidget — real-time elapsed timer, clock in/out"
```

---

## Task 8: WeekSummary Component

**Files:**
- Create: `components/hr/WeekSummary.tsx`

Shows the current ISO week (Mon–Sun) with per-day hours bars and approval dots.

- [ ] **Step 1: Write `components/hr/WeekSummary.tsx`**

```typescript
'use client'

import type { TimeEntry } from '@/lib/hr/types'
import { calculateHours } from '@/lib/hr/calculations'
import { t, ink } from '@/lib/ui/theme'

interface WeekSummaryProps {
  entries: TimeEntry[]
  locale: string
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_LABELS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getWeekDates(): string[] {
  const now = new Date()
  const dow = now.getDay() // 0=Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

const STATUS_COLOR: Record<string, string> = {
  approved: '#4ade80',
  pending: '#fbbf24',
  rejected: '#f87171',
}

export function WeekSummary({ entries, locale }: WeekSummaryProps) {
  const days = getWeekDates()
  const labels = locale === 'pt' ? DAY_LABELS_PT : DAY_LABELS
  const MAX_HOURS = 10

  const byDay = days.map((iso) => {
    const dayEntries = entries.filter((e) => e.clock_in.startsWith(iso))
    const totalHours = dayEntries.reduce((sum, e) => {
      if (!e.clock_out) return sum
      return sum + calculateHours(new Date(e.clock_in), new Date(e.clock_out))
    }, 0)
    return { iso, totalHours, entries: dayEntries }
  })

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: t.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>
        {locale === 'pt' ? 'Esta Semana' : 'This Week'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {byDay.map(({ iso, totalHours, entries: dayEntries }, i) => (
          <div key={iso} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, width: 28, flexShrink: 0 }}>
              {labels[i]}
            </span>
            <div style={{ flex: 1, height: 6, background: ink(0.08), borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min((totalHours / MAX_HOURS) * 100, 100)}%`,
                height: '100%',
                background: totalHours > 0 ? '#4B1A77' : 'transparent',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: 10, color: t.textMuted, width: 32, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {totalHours > 0 ? `${totalHours.toFixed(1)}h` : '—'}
            </span>
            <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
              {dayEntries.slice(0, 3).map((e) => (
                <div key={e.id} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: STATUS_COLOR[e.status] ?? '#ccc',
                }} title={e.status} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hr/WeekSummary.tsx
git commit -m "feat(hr): WeekSummary — 7-day hours bars and approval status dots"
```

---

## Task 9: TimesheetTable Component

**Files:**
- Create: `components/hr/TimesheetTable.tsx`

Client component. Shows time entries with date/employee/hours/day_type/status columns. Approve/reject buttons call server actions.

- [ ] **Step 1: Write `components/hr/TimesheetTable.tsx`**

```typescript
'use client'

import { useTransition } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import type { TimeEntry } from '@/lib/hr/types'
import { calculateHours, formatDateAU, formatAUD } from '@/lib/hr/calculations'
import { approveEntryAction, rejectEntryAction } from '@/app/[locale]/(protected)/hr/actions'
import { t, ink } from '@/lib/ui/theme'

interface TimesheetTableProps {
  entries: TimeEntry[]
  hourlyRateCents: number
  showEmployeeName?: boolean
  locale: string
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#92400e', bg: '#fef3c7' },
  approved: { label: 'Approved', color: '#166534', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
}

const DAY_TYPE_LABEL: Record<string, string> = {
  weekday:        'Weekday',
  saturday:       'Saturday',
  sunday:         'Sunday',
  public_holiday: 'Holiday',
}

export function TimesheetTable({ entries, hourlyRateCents, locale }: TimesheetTableProps) {
  const [isPending, startTransition] = useTransition()

  function approve(id: string) {
    startTransition(() => approveEntryAction(id))
  }

  function reject(id: string) {
    startTransition(() => rejectEntryAction(id))
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: t.textMuted, fontSize: 14 }}>
        {locale === 'pt' ? 'Nenhum registro encontrado.' : 'No entries found.'}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${ink(0.1)}` }}>
            {['Date', 'Clock In', 'Clock Out', 'Hours', 'Day Type', 'Amount', 'Status', 'Actions'].map((h) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: t.textMuted, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const hours = e.clock_out ? calculateHours(new Date(e.clock_in), new Date(e.clock_out)) : null
            const amount = hours !== null ? Math.round(hours * hourlyRateCents) : null
            const badge = STATUS_BADGE[e.status] ?? STATUS_BADGE.pending
            const isLive = !e.clock_out
            return (
              <tr key={e.id} style={{ borderBottom: `1px solid ${ink(0.06)}` }}>
                <td style={{ padding: '10px 12px', color: t.text }}>
                  {isLive && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 6 }}>
                      <Clock size={12} style={{ color: '#4ade80' }} />
                    </span>
                  )}
                  {formatDateAU(e.clock_in.slice(0, 10))}
                </td>
                <td style={{ padding: '10px 12px', color: t.text, fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(e.clock_in).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '10px 12px', color: t.textMuted, fontVariantNumeric: 'tabular-nums' }}>
                  {e.clock_out
                    ? new Date(e.clock_out).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
                    : <span style={{ color: '#4ade80', fontWeight: 600 }}>LIVE</span>}
                </td>
                <td style={{ padding: '10px 12px', color: t.text, fontVariantNumeric: 'tabular-nums' }}>
                  {hours !== null ? `${hours.toFixed(2)}h` : '—'}
                </td>
                <td style={{ padding: '10px 12px', color: t.textMuted }}>
                  {DAY_TYPE_LABEL[e.day_type] ?? e.day_type}
                </td>
                <td style={{ padding: '10px 12px', color: t.text, fontVariantNumeric: 'tabular-nums' }}>
                  {amount !== null ? formatAUD(amount) : '—'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                    fontSize: 11, fontWeight: 600,
                    color: badge.color, background: badge.bg,
                  }}>
                    {badge.label}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {e.status === 'pending' && !isLive && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => approve(e.id)}
                        disabled={isPending}
                        title="Approve"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#16a34a' }}
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => reject(e.id)}
                        disabled={isPending}
                        title="Reject"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#dc2626' }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hr/TimesheetTable.tsx
git commit -m "feat(hr): TimesheetTable — sortable timesheet with approve/reject actions"
```

---

## Task 10: TaxInvoice Print Component

**Files:**
- Create: `components/hr/TaxInvoice.tsx`

This is the ABN-format print component. It mirrors `StudyPlanProposal.tsx`: inline `printStyles` constant + `window.print()` button. The surrounding page layout (sidebar, topbar) is hidden via `@media print { .no-print { display: none } }`.

- [ ] **Step 1: Write `components/hr/TaxInvoice.tsx`**

```typescript
'use client'

import { Printer } from 'lucide-react'
import type { InvoicePrintData } from '@/lib/hr/types'
import { formatAUD, formatDateAU } from '@/lib/hr/calculations'
import { computeTotalCents } from '@/lib/hr/calculations'

const printStyles = `
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
  .tax-invoice-paper {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 32px !important;
  }
}
`

interface TaxInvoiceProps {
  data: InvoicePrintData
  locale?: string
}

export function TaxInvoice({ data, locale = 'en' }: TaxInvoiceProps) {
  const { invoice, employee, lines, org } = data
  const total = computeTotalCents(lines.map((l) => l.amount_cents))

  return (
    <>
      <style>{printStyles}</style>

      {/* Print button */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, gap: 12 }}>
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#4B1A77', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 20px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Printer size={16} />
          {locale === 'pt' ? 'Imprimir / Salvar PDF' : 'Print / Save as PDF'}
        </button>
      </div>

      {/* Invoice paper */}
      <div className="tax-invoice-paper" style={{
        background: '#fff', color: '#111',
        maxWidth: 800, margin: '0 auto',
        padding: 48, borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        fontFamily: 'Arial, sans-serif',
        fontSize: 13, lineHeight: 1.5,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#4B1A77', letterSpacing: '-0.02em' }}>
              {org.name}
            </div>
            {org.abn && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>ABN: {org.abn}</div>
            )}
            {org.address && (
              <div style={{ fontSize: 12, color: '#555' }}>{org.address}</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '0.04em' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
              <strong>Invoice #:</strong> {invoice.invoice_number}
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>
              <strong>Date:</strong> {invoice.issued_at
                ? formatDateAU(invoice.issued_at.slice(0, 10))
                : formatDateAU(new Date().toISOString().slice(0, 10))}
            </div>
          </div>
        </div>

        {/* TO / FROM */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>TO</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{org.name}</div>
            {org.abn && <div style={{ fontSize: 12, color: '#555' }}>ABN: {org.abn}</div>}
            {org.address && <div style={{ fontSize: 12, color: '#555' }}>{org.address}</div>}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>FROM</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{employee.full_name}</div>
            {employee.abn && <div style={{ fontSize: 12, color: '#555' }}>ABN: {employee.abn}</div>}
            <div style={{ fontSize: 12, color: '#555' }}>{employee.email}</div>
          </div>
        </div>

        {/* Services table */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>SERVICES</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Description</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Hours</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Payment AU$</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 4px', fontSize: 12, whiteSpace: 'nowrap' }}>{line.date}</td>
                  <td style={{ padding: '8px 4px', fontSize: 12 }}>
                    {line.description}
                    {line.multiplier !== 1.0 && (
                      <span style={{ fontSize: 10, color: '#888', marginLeft: 6 }}>
                        ({line.multiplier}x penalty)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px 4px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {line.hours.toFixed(2)}
                  </td>
                  <td style={{ padding: '8px 4px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatAUD(line.rate_cents)}/hr
                  </td>
                  <td style={{ padding: '8px 4px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {formatAUD(line.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ borderTop: '2px solid #111', paddingTop: 12, minWidth: 220, textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>
              TOTAL DUE: {formatAUD(total)}
            </div>
          </div>
        </div>

        {/* GST note */}
        <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 24, textAlign: 'right' }}>
          *No GST has been charged. GST free supply.
        </div>

        {/* Bank details */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 10 }}>
            PAY INTO ACCOUNT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 24px', fontSize: 13 }}>
            <span style={{ color: '#555', fontWeight: 600 }}>Bank:</span>
            <span>{employee.bank_name ?? '—'}</span>
            <span style={{ color: '#555', fontWeight: 600 }}>BSB:</span>
            <span>{employee.bsb ?? '—'}</span>
            <span style={{ color: '#555', fontWeight: 600 }}>Account:</span>
            <span>{employee.account_number ?? '—'}</span>
            <span style={{ color: '#555', fontWeight: 600 }}>Name:</span>
            <span>{employee.account_name ?? '—'}</span>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hr/TaxInvoice.tsx
git commit -m "feat(hr): TaxInvoice — ABN-format print component with window.print()"
```

---

## Task 11: HR Dashboard Page

**Files:**
- Create: `app/[locale]/(protected)/hr/page.tsx`

Server component. Fetches active clock entry + this week's entries, renders `ClockWidget` + `WeekSummary` in the left panel and `TimesheetTable` in the main panel.

- [ ] **Step 1: Write `app/[locale]/(protected)/hr/page.tsx`**

```typescript
// app/[locale]/(protected)/hr/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClockWidget } from '@/components/hr/ClockWidget'
import { WeekSummary } from '@/components/hr/WeekSummary'
import { TimesheetTable } from '@/components/hr/TimesheetTable'
import {
  getEmployeeByProfileId, getActiveClockEntry,
  listTimeEntries, listInvoices,
} from '@/lib/hr'
import { t, ink, font } from '@/lib/ui/theme'

interface Props { params: Promise<{ locale: string }> }

export default async function HrPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const profile = await getUser(supabase)
  if (!profile) redirect(`/${locale}/login`)

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  const activeEntry = employee ? await getActiveClockEntry(supabase, employee.id) : null

  // Get entries for this week
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const weekStart = monday.toISOString().slice(0, 10)

  const weekEntries = employee
    ? await listTimeEntries(supabase, profile.org_id, {
        employeeId: employee.id,
        from: weekStart,
      })
    : []

  // For dashboard: recent timesheet (last 20 entries, all statuses) for admin view
  const recentEntries = await listTimeEntries(supabase, profile.org_id, {})

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
          {locale === 'pt' ? 'RH & Controle de Horas' : 'HR & Time Management'}
        </h1>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
          {locale === 'pt' ? 'Operações' : 'Operations'} › {locale === 'pt' ? 'RH & Horas' : 'HR & Time'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ClockWidget activeEntry={activeEntry} locale={locale} />

          {employee && (
            <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 20 }}>
              <WeekSummary entries={weekEntries} locale={locale} />
            </div>
          )}

          {/* Quick links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { href: `/${locale}/hr/timesheets`, label: locale === 'pt' ? 'Ver Todos os Registros' : 'All Timesheets' },
              { href: `/${locale}/hr/invoices`, label: locale === 'pt' ? 'Invoices' : 'Invoices' },
            ].map((l) => (
              <Link key={l.href} href={l.href} prefetch={false} style={{
                display: 'block', padding: '10px 16px', borderRadius: 8,
                background: 'var(--surface)', border: `1px solid ${ink(0.1)}`,
                color: t.text, fontSize: 13, fontWeight: 500, textDecoration: 'none',
              }}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>
            {locale === 'pt' ? 'Registros Recentes' : 'Recent Entries'}
          </div>
          <TimesheetTable
            entries={recentEntries.slice(0, 20)}
            hourlyRateCents={employee?.hourly_rate_in_cents ?? 0}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(protected)/hr/page.tsx"
git commit -m "feat(hr): HR dashboard page — ClockWidget + WeekSummary + TimesheetTable"
```

---

## Task 12: Clock Self-Service Page

**Files:**
- Create: `app/[locale]/(protected)/hr/clock/page.tsx`

- [ ] **Step 1: Write `app/[locale]/(protected)/hr/clock/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { ClockWidget } from '@/components/hr/ClockWidget'
import { getEmployeeByProfileId, getActiveClockEntry } from '@/lib/hr'
import { t, font } from '@/lib/ui/theme'

interface Props { params: Promise<{ locale: string }> }

export default async function ClockPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const profile = await getUser(supabase)
  if (!profile) redirect(`/${locale}/login`)

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (!employee) {
    return (
      <div style={{ padding: '48px 32px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: t.text }}>
          {locale === 'pt'
            ? 'Você não tem um perfil de funcionário ativo. Fale com o administrador.'
            : 'You do not have an active employee profile. Contact your administrator.'}
        </div>
      </div>
    )
  }

  const activeEntry = await getActiveClockEntry(supabase, employee.id)

  return (
    <div style={{ padding: '48px 32px', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
        {locale === 'pt' ? 'Bater Ponto' : 'Time Clock'}
      </h1>
      <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 32 }}>
        {locale === 'pt' ? 'Registre sua entrada e saída do trabalho.' : 'Record your clock-in and clock-out.'}
      </p>
      <ClockWidget activeEntry={activeEntry} locale={locale} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/[locale]/(protected)/hr/clock/page.tsx"
git commit -m "feat(hr): employee clock self-service page"
```

---

## Task 13: Timesheets Admin Page

**Files:**
- Create: `app/[locale]/(protected)/hr/timesheets/page.tsx`

- [ ] **Step 1: Write `app/[locale]/(protected)/hr/timesheets/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { TimesheetTable } from '@/components/hr/TimesheetTable'
import { listTimeEntries, listEmployees } from '@/lib/hr'
import { t, font, ink } from '@/lib/ui/theme'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; employeeId?: string }>
}

export default async function TimesheetsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status, employeeId } = await searchParams
  const supabase = await createClient()
  const profile = await getUser(supabase)
  if (!profile) redirect(`/${locale}/login`)

  const [entries, employees] = await Promise.all([
    listTimeEntries(supabase, profile.org_id, {
      status: status || undefined,
      employeeId: employeeId || undefined,
    }),
    listEmployees(supabase, profile.org_id),
  ])

  const statuses = ['pending', 'approved', 'rejected']

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 20 }}>
        {locale === 'pt' ? 'Registros de Ponto' : 'Timesheets'}
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <a href={`/${locale}/hr/timesheets`} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: !status ? '#4B1A77' : 'var(--surface)',
          color: !status ? '#fff' : t.textMuted,
          border: `1px solid ${ink(0.1)}`, textDecoration: 'none',
        }}>
          All
        </a>
        {statuses.map((s) => (
          <a key={s} href={`/${locale}/hr/timesheets?status=${s}`} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: status === s ? '#4B1A77' : 'var(--surface)',
            color: status === s ? '#fff' : t.textMuted,
            border: `1px solid ${ink(0.1)}`, textDecoration: 'none', textTransform: 'capitalize',
          }}>
            {s}
          </a>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 24 }}>
        <TimesheetTable
          entries={entries}
          hourlyRateCents={0}
          locale={locale}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/[locale]/(protected)/hr/timesheets/page.tsx"
git commit -m "feat(hr): timesheets admin page with status filters"
```

---

## Task 14: Invoices Page

**Files:**
- Create: `app/[locale]/(protected)/hr/invoices/page.tsx`

Lists invoices. Includes a "Generate Invoice" form (employee + period dates) that calls `generateInvoiceAction`.

- [ ] **Step 1: Write `app/[locale]/(protected)/hr/invoices/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { listInvoices, listEmployees } from '@/lib/hr'
import { GenerateInvoiceForm } from './GenerateInvoiceForm'
import { formatAUD } from '@/lib/hr/calculations'
import { t, font, ink } from '@/lib/ui/theme'

interface Props { params: Promise<{ locale: string }> }

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  draft:  { label: 'Draft',  color: '#374151', bg: '#f3f4f6' },
  issued: { label: 'Issued', color: '#1d4ed8', bg: '#dbeafe' },
  paid:   { label: 'Paid',   color: '#166534', bg: '#dcfce7' },
}

export default async function InvoicesPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const profile = await getUser(supabase)
  if (!profile) redirect(`/${locale}/login`)

  const [invoices, employees] = await Promise.all([
    listInvoices(supabase, profile.org_id),
    listEmployees(supabase, profile.org_id),
  ])

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, margin: 0 }}>
          {locale === 'pt' ? 'Tax Invoices' : 'Tax Invoices'}
        </h1>
        <GenerateInvoiceForm employees={employees} locale={locale} orgId={profile.org_id} />
      </div>

      <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, overflow: 'hidden' }}>
        {invoices.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
            {locale === 'pt' ? 'Nenhuma invoice gerada ainda.' : 'No invoices generated yet.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${ink(0.1)}` }}>
                {['Invoice #', 'Period', 'Total', 'Status', 'Issued', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: t.textMuted, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const badge = STATUS_BADGE[inv.status] ?? STATUS_BADGE.draft
                return (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${ink(0.06)}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: t.text, fontFamily: 'monospace' }}>{inv.invoice_number}</td>
                    <td style={{ padding: '12px 16px', color: t.textMuted }}>{inv.period_start} → {inv.period_end}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: t.text, fontVariantNumeric: 'tabular-nums' }}>{formatAUD(inv.total_cents)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: badge.color, background: badge.bg }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: t.textMuted }}>
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-AU') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/${locale}/hr/invoices/${inv.id}/print`} prefetch={false} style={{
                        fontSize: 12, color: '#4B1A77', fontWeight: 600, textDecoration: 'none',
                      }}>
                        View / Print →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `GenerateInvoiceForm` client component**

Create `app/[locale]/(protected)/hr/invoices/GenerateInvoiceForm.tsx`:

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import type { EmployeeProfile } from '@/lib/hr/types'
import { generateInvoiceAction } from '../actions'
import { t, ink } from '@/lib/ui/theme'

interface Props {
  employees: EmployeeProfile[]
  locale: string
  orgId: string
}

export function GenerateInvoiceForm({ employees, locale }: Props) {
  const [open, setOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit() {
    if (!employeeId || !periodStart || !periodEnd) {
      setError('All fields are required')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const invoice = await generateInvoiceAction(employeeId, periodStart, periodEnd)
        setOpen(false)
        router.push(`../${locale}/hr/invoices/${invoice.id}/print`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error generating invoice')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#4B1A77', color: '#fff',
          border: 'none', borderRadius: 8, padding: '10px 18px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <PlusCircle size={16} />
        {locale === 'pt' ? 'Gerar Invoice' : 'Generate Invoice'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 16, padding: 32,
              width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 24 }}>
              {locale === 'pt' ? 'Gerar Tax Invoice' : 'Generate Tax Invoice'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                  Employee
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'var(--surface)', color: t.text, fontSize: 14 }}
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.id.slice(0, 8)}… (rate: AU${(emp.hourly_rate_in_cents / 100).toFixed(2)}/hr)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                    Period Start
                  </label>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'var(--surface)', color: t.text, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                    Period End
                  </label>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'var(--surface)', color: t.text, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            {error && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'none', color: t.text, cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isPending} style={{ padding: '8px 20px', borderRadius: 8, background: '#4B1A77', color: '#fff', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
                {isPending ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(protected)/hr/invoices/page.tsx" "app/[locale]/(protected)/hr/invoices/GenerateInvoiceForm.tsx"
git commit -m "feat(hr): invoices list page + generate invoice modal"
```

---

## Task 15: Invoice Print Page

**Files:**
- Create: `app/[locale]/(protected)/hr/invoices/[id]/print/page.tsx`

Server component. Fetches `InvoicePrintData` and renders `<TaxInvoice>`. The page uses `className="no-print"` on the main layout wrapper (AppShell renders the sidebar/topbar with those classes).

- [ ] **Step 1: Verify AppShell wraps content in a `main` — find where `{children}` is rendered**

In `components/layout/AppShell.tsx`, the `{children}` is rendered inside `<main>`. The print page needs `no-print` on the sidebar/header. Add `className="no-print"` to the sidebar `<aside>` and the top `<header>` elements in `AppShell.tsx`:

In `AppShell.tsx`, find:
```tsx
{/* Desktop sidebar */}
<aside
  className="hidden lg:flex color-bg-surface-default"
```

Change to:
```tsx
{/* Desktop sidebar */}
<aside
  className="hidden lg:flex color-bg-surface-default no-print"
```

And find the mobile sidebar + topbar header elements and add `no-print` to each.

- [ ] **Step 2: Write `app/[locale]/(protected)/hr/invoices/[id]/print/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { redirect, notFound } from 'next/navigation'
import { TaxInvoice } from '@/components/hr/TaxInvoice'
import { getInvoicePrintData, listRateRules } from '@/lib/hr'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function InvoicePrintPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()
  const profile = await getUser(supabase)
  if (!profile) redirect(`/${locale}/login`)

  const rules = await listRateRules(supabase, profile.org_id)
  const data = await getInvoicePrintData(supabase, id, rules)
  if (!data) notFound()

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', background: 'var(--bg)' }}>
      <TaxInvoice data={data} locale={locale} />
    </div>
  )
}
```

- [ ] **Step 3: Type-check the full module**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(protected)/hr/invoices/[id]/print/page.tsx" components/layout/AppShell.tsx
git commit -m "feat(hr): invoice print page + no-print class on sidebar/header for PDF"
```

---

## Task 16: Final Barrel Export + OpenWolf Update

**Files:**
- Finalize: `lib/hr/index.ts`

- [ ] **Step 1: Verify `lib/hr/index.ts` exports everything**

```typescript
// lib/hr/index.ts
export * from './types'
export * from './calculations'
export * from './queries'
```

- [ ] **Step 2: Run all tests**

```bash
node --test tests/hr-calculations.test.mjs
node --test tests/study-financial.test.mjs
```

Expected: all pass.

- [ ] **Step 3: Final type-check + build**

```bash
npx tsc --noEmit && npx next build
```

Expected: clean build.

- [ ] **Step 4: Update OpenWolf**

Append to `.wolf/anatomy.md`:
- `lib/hr/` — calculations, queries, types, index
- `components/hr/` — ClockWidget, WeekSummary, TimesheetTable, TaxInvoice
- `app/[locale]/(protected)/hr/` — all HR route pages

Append to `.wolf/memory.md`:
- Session summary: HR module implemented (Tasks 1–16)

- [ ] **Step 5: Final commit**

```bash
git add lib/hr/index.ts .wolf/anatomy.md .wolf/memory.md
git commit -m "feat(hr): finalize HR module — barrel export, all tests green, build clean"
```

---

## Self-Review

**Spec coverage:**
- ✅ 4 tables + RLS (Task 1)
- ✅ `employee_profiles` extends `profiles` via FK (Task 1)
- ✅ All money in `*_in_cents` (tasks 1, 2, 3)
- ✅ Pure rate calculation functions (Task 3)
- ✅ Day-type auto-detection + multipliers (Task 3)
- ✅ Clock in/out (Tasks 5, 7, 12)
- ✅ Admin approval (Tasks 5, 9, 13)
- ✅ Flexible invoice periods (Task 5 — generateInvoiceAction accepts custom date range)
- ✅ ABN Tax Invoice format (Task 10 — TO/FROM, SERVICES table, TOTAL, GST note, bank details)
- ✅ `window.print()` PDF engine (Task 10 — mirrors StudyPlanProposal.tsx)
- ✅ Sidebar update (Task 6)
- ✅ All routes (Tasks 11–15)
- ✅ RLS org_id scoped (Task 1)
- ✅ White-label safe (org_id default, no hardcoded Movy)

**Placeholder scan:** None found. All steps include complete code.

**Type consistency:**
- `TimeEntry`, `HrRateRule`, `EmployeeProfile`, `HrInvoice` — defined in Task 2, used consistently in Tasks 3, 4, 5, 7, 8, 9, 10
- `HrClient` — defined in Task 2, used in Task 4
- `InvoicePrintData` — defined in Task 2, built in Task 4 (`getInvoicePrintData`), consumed in Task 15
- `calculateHours`, `getMultiplier`, `calculateLineItemCents`, `formatAUD`, `formatDateAU` — defined in Task 3, used in Tasks 4, 5, 9, 10
