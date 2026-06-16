# HR & Time Management Module — Design Spec

**Date:** 2026-06-16  
**Module:** HR & Time Management (Agency Hub › Operations)  
**Status:** Approved for implementation

---

## 1. Context & Goals

This module adds employee time-tracking and Australian Tax Invoice generation to the Agency Hub. It serves agencies (starting with Movy) that have PJ/contractor employees paid by the hour under Australian labour arrangements (ABN-basis, penalty rates for weekends/public holidays).

**Scope of this spec:**
- Employee clock-in / clock-out
- Admin timesheet approval
- Rate calculation with day-type multipliers
- Tax Invoice (ABN format) generation via `window.print()`

**Out of scope (separate module):** NAATI translations, financial commissions.

### Design Rules (from cerebrum)

All decisions must honour:
- **WHITE-LABEL FIRST** — `org_id` on every table, per-org RLS, no hardcoded Movy brand
- **WOOFED-SHAPED FIRST** — money in `*_in_cents`, `metadata` jsonb, `external_id`, per-org uniqueness
- **PDF engine** — reuse `window.print()` + `@media print` from `StudyPlanProposal.tsx`; zero new PDF dependencies
- **Shared user entity** — `employee_profiles` is a FK extension of the existing `profiles` table; no parallel auth system

---

## 2. Navigation Architecture

Module lives at `app/[locale]/(protected)/hr/`:

```
app/[locale]/(protected)/
  hr/
    page.tsx                        ← HR dashboard (recent clock-ins, pending approvals)
    clock/
      page.tsx                      ← employee clock-in/out self-service
    timesheets/
      page.tsx                      ← admin timesheet list + approval actions
    invoices/
      page.tsx                      ← invoice list (draft/issued/paid)
      [id]/
        print/
          page.tsx                  ← Tax Invoice print view (window.print())

components/hr/
  ClockWidget.tsx                   ← pulsing timer, Clock In / Clock Out button
  TimesheetTable.tsx                ← sortable table with approve/reject row actions
  TaxInvoice.tsx                    ← ABN-format invoice (mirrors StudyPlanProposal.tsx)
  WeekSummary.tsx                   ← 7-day progress bars + approval status dots

lib/hr/
  calculations.ts                   ← hours × rate × multiplier logic (pure functions)
  queries.ts                        ← org-scoped Supabase queries
```

### Sidebar placement (woofed UI shell)

The HR module appears in the existing sidebar under **Operations**:

```
Core          Dashboard / Contacts / Proposals / Portfolio
Operations    HR & Time [this module] / Financial / Translations
Agency        Settings
```

Topbar breadcrumb: `Operations › HR & Time Management`

---

## 3. Data Schema

Four new tables, all with `org_id` FK + Supabase RLS policies (`org_id = auth.jwt()->>'org_id'`).

### 3.1 `employee_profiles`

Extension of the existing `profiles` table — not a parallel user system.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `org_id` | `uuid` FK | required; RLS anchor |
| `profile_id` | `uuid` FK → `profiles` | links to existing auth user |
| `abn` | `text` | Australian Business Number |
| `bank_name` | `text` | e.g. "Commonwealth Bank" |
| `bsb` | `text` | 6-digit branch code |
| `account_number` | `text` | |
| `account_name` | `text` | account holder name |
| `hourly_rate_in_cents` | `bigint` | base rate; money always in cents |
| `currency_code` | `text` | default `'AUD'` |
| `metadata` | `jsonb` | system/integration data |
| `external_id` | `text` | woofed-shaped: for future sync |
| `deleted_at` | `timestamptz` | soft-delete |

### 3.2 `time_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `org_id` | `uuid` FK | RLS anchor |
| `employee_id` | `uuid` FK → `employee_profiles` | |
| `clock_in` | `timestamptz` NOT NULL | |
| `clock_out` | `timestamptz` | NULL while live |
| `description` | `text` | optional task note |
| `day_type` | `text` | `weekday` / `saturday` / `sunday` / `public_holiday` |
| `status` | `text` | `pending` / `approved` / `rejected` |
| `approved_by` | `uuid` FK → `profiles` | |
| `invoice_id` | `uuid` FK → `hr_invoices` | NULL until invoiced |
| `metadata` | `jsonb` | |
| `deleted_at` | `timestamptz` | soft-delete |

`day_type` is set automatically on `clock_in` based on the date; admin can override.

### 3.3 `hr_rate_rules`

Defines multipliers per day type, scoped per org. Allows agencies to configure Australian Fair Work penalty rates.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `org_id` | `uuid` FK | |
| `name` | `text` | e.g. "Saturday Penalty" |
| `day_type` | `text` | matches `time_entries.day_type` |
| `multiplier` | `numeric` | e.g. `1.5`, `2.0` |
| `applies_from` | `date` | |
| `applies_until` | `date` | NULL = open-ended |
| `metadata` | `jsonb` | |

### 3.4 `hr_invoices`

Snapshot at the time of issue — immutable once `status = 'issued'`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `org_id` | `uuid` FK | |
| `employee_id` | `uuid` FK → `employee_profiles` | |
| `invoice_number` | `text` | auto-generated: `INV-{employee_abbr}-{seq}` |
| `period_start` | `date` | |
| `period_end` | `date` | |
| `total_cents` | `bigint` | snapshot total — never recalculated after issue |
| `currency_code` | `text` | default `'AUD'` |
| `status` | `text` | `draft` / `issued` / `paid` |
| `issued_at` | `timestamptz` | |
| `paid_at` | `timestamptz` | |
| `metadata` | `jsonb` | |
| `external_id` | `text` | |

---

## 4. Business Logic

### 4.1 Rate Calculation (`lib/hr/calculations.ts`)

```
gross_cents = hours × employee.hourly_rate_in_cents × multiplier
```

Where `multiplier` comes from `hr_rate_rules` for the matching `day_type` and date. If no rule exists, `multiplier = 1.0`.

All arithmetic uses integer cents. Hours are computed as:

```
hours = (clock_out - clock_in) / 3600   ← float, rounded to 2 decimal places
```

### 4.2 `day_type` auto-detection

On `clock_in`, the system checks the date against:
1. Australian public holidays (configurable list in `metadata` or a `hr_public_holidays` table — v1 uses a static list per org in metadata)
2. `DayOfWeek === 6` → `saturday`
3. `DayOfWeek === 0` → `sunday`
4. Otherwise → `weekday`

### 4.3 Invoice periods

Supported: `weekly` | `fortnightly` | `monthly` | `custom`

On invoice creation:
1. Admin selects employee + period
2. System queries `time_entries` where `status = 'approved'` AND `invoice_id IS NULL` within the period
3. Calculates line items: one row per `time_entry` with `(date, description, hours, rate, multiplier, total)`
4. Snapshots `total_cents` on the `hr_invoices` row
5. Sets `invoice_id` on all included `time_entries`

---

## 5. UI Design

### 5.1 Design language

Follows the woofed UI shell:
- Collapsible sidebar: 72px icon-only ↔ 200px full (light surface, not dark rail)
- Per-page topbar with breadcrumb
- shadcn/ui component primitives
- Tailwind `@layer components` for DS tokens
- Lucide SVG icons — no emojis
- Brand: `#4B1A77` purple primary, `#FBB615` gold accent
- Fonts: Clash Display (headings) + Satoshi (body)

### 5.2 HR Dashboard (`hr/page.tsx`)

Two-panel layout:

**Left panel (320px fixed):**
- `ClockWidget` — large pulsing live timer when clocked in (purple gradient card), gold elapsed time, single Clock In / Clock Out CTA
- `WeekSummary` — 7-day grid with per-day hours progress bars, approval status dots (green approved / amber pending / red rejected)

**Main panel:**
- Tabs: Timesheet | Invoices | Employees | Rate Rules
- **Timesheet tab:** sortable table with columns: Date, Employee, Hours, Day Type, Status, Actions (approve / reject / edit). Live rows show pulse indicator.
- **Invoices tab:** table with invoice number, employee, period, total AUD, status badge (draft/issued/paid), print link
- **Employees tab:** list of `employee_profiles` with edit/invite actions
- **Rate Rules tab:** list of `hr_rate_rules` with multiplier chips

### 5.3 Clock page (`hr/clock/page.tsx`)

Employee self-service. Large centred clock widget. If clocked in: shows elapsed time, description textarea, Clock Out button. If clocked out: Clock In button with description (optional).

### 5.4 Timesheets page (`hr/timesheets/page.tsx`)

Admin view. Filters: employee, date range, status. Bulk approve action. Same `TimesheetTable` component as dashboard.

### 5.5 Invoice list (`hr/invoices/page.tsx`)

Filters: employee, period, status. "Generate Invoice" button opens a date-range picker modal → creates draft → redirects to print preview.

---

## 6. PDF / Tax Invoice

### 6.1 Engine

Reuses `window.print()` + `@media print` CSS exactly as `StudyPlanProposal.tsx`. The print page at `hr/invoices/[id]/print/page.tsx` renders `<TaxInvoice>` component inside a white `paper` container. Surrounding UI (sidebar, topbar) is hidden via `@media print { .no-print { display: none } }`.

### 6.2 `TaxInvoice.tsx` layout (ABN format)

Mirrors the Australian Tax Invoice PDFs provided:

```
┌─────────────────────────────────────────────────┐
│ [Agency Logo]              TAX INVOICE           │
│ ABN: XX XXX XXX XXX        Invoice #: INV-XXX-01 │
│                            Date: DD/MM/YYYY       │
├────────────────────┬────────────────────────────┤
│ TO:                │ FROM:                       │
│ {agency name}      │ {employee name}             │
│ {agency address}   │ ABN: {employee ABN}         │
│ {agency ABN}       │ {employee address}          │
├────────────────────┴────────────────────────────┤
│ SERVICES                                         │
│ Date      | Description       | Payment (AU$)   │
│ DD/MM     | {description}     | $XX.XX          │
│ ...                                              │
├─────────────────────────────────────────────────┤
│                        TOTAL DUE:  AU$ {total}  │
│ *No GST has been charged. GST free supply.       │
├─────────────────────────────────────────────────┤
│ PAY INTO ACCOUNT                                 │
│ Bank: {bank_name}                                │
│ BSB:  {bsb}    Account: {account_number}         │
│ Name: {account_name}                             │
└─────────────────────────────────────────────────┘
```

All values are rendered from the `hr_invoices` snapshot + `time_entries` line items. The component accepts props only — no internal data fetching.

---

## 7. Access Control

| Action | Role |
|---|---|
| Clock in/out (own entries) | `member` |
| View own timesheets | `member` |
| Approve / reject entries | `admin` |
| Create / issue invoices | `admin` |
| Manage employees & rate rules | `admin` |
| Print any invoice | `admin` |

RLS enforces `org_id` on every table. Row-level approval check: `approved_by` must be an `admin` of the same org.

---

## 8. Main Data Flow

```
Employee: Clock In  →  time_entry created (status: pending, clock_out: NULL)
Employee: Clock Out →  time_entry.clock_out set; hours calculated
Admin: Approve      →  time_entry.status = 'approved'; approved_by set
Admin: Generate Invoice →  pick period; query approved + un-invoiced entries
                           →  hr_invoice created (draft, total snapshot)
                           →  time_entries.invoice_id set
Admin: Issue        →  hr_invoice.status = 'issued'; issued_at set
Admin: Print        →  window.print() → TaxInvoice rendered → PDF
Admin: Mark Paid    →  hr_invoice.status = 'paid'; paid_at set
```

---

## 9. Open Questions (resolved)

| Question | Decision |
|---|---|
| Clock-in model | Hybrid: employee self-clocks, admin can edit/override |
| Rate model | Base rate per employee + multipliers from `hr_rate_rules` per day_type |
| Invoice periods | Weekly / fortnightly / monthly / custom date range |
| PDF engine | `window.print()` — reuse existing mechanism, zero new deps |
| User entity | `employee_profiles` extends `profiles` — shared auth, no parallel system |
| Money type | `bigint *_in_cents` per woofed convention |
| GST | GST-free supply note on invoice (standard for ABN contractors) |

---

## 10. Implementation Order

1. **Database** — migrations for 4 tables + RLS policies
2. **`lib/hr/calculations.ts`** — pure rate calculation functions + tests
3. **`lib/hr/queries.ts`** — org-scoped Supabase query helpers
4. **`ClockWidget.tsx`** — real-time elapsed timer, clock in/out mutation
5. **`TimesheetTable.tsx`** — sortable table + approve/reject actions
6. **`TaxInvoice.tsx`** — print component (mirrors StudyPlanProposal structure)
7. **`WeekSummary.tsx`** — 7-day summary panel
8. **Routes** — `hr/page`, `hr/clock/page`, `hr/timesheets/page`, `hr/invoices/page`, `hr/invoices/[id]/print/page`
9. **Sidebar** — add HR entry under Operations section
10. **E2E** — clock in → approve → generate invoice → print flow
