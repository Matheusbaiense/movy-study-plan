# HR Module Improvements — Design Spec

> 3 independent splits: A (Employee Self-Service), B (UX & Bug Polish), C (Admin Cost Intelligence)

---

## Context

The HR module (`/hr`) currently works for admins but leaves employees with almost no self-service capability. This spec covers three focused sprints to fix that, polish existing flows, and add financial visibility for admins.

**Stack:** Next.js 14 App Router · Supabase SSR · `employee_profiles` + `hr_time_entries` + `hr_invoices` tables · server actions.

**Permission model (enforced across all splits):**

| Action | Employee | Admin / Super Admin |
|--------|----------|---------------------|
| View own timesheets | ✓ | ✓ |
| View all timesheets | ✗ | ✓ |
| Log hours for self | ✓ | ✓ |
| Approve / reject entries | ✗ | ✓ |
| Generate own invoice | ✓ | ✓ |
| Generate invoice for others | ✗ | ✓ |
| View own rate (read-only) | ✓ | ✓ |
| Edit anyone's rate | ✗ | ✓ |
| View team cost summary | ✗ | ✓ |

All server actions already gate on `isHrAdmin(profile.role)`. Split A extends gating to data queries (timesheets list must filter by `employee_id` for non-admin).

---

## Split A — Employee Self-Service

**Goal:** Employees can manage their own HR data without needing an admin for every action.

### A1 — Timesheet: personal view for employees

**Current:** `/hr/timesheets` fetches all entries for the org. Employees see the full team list or are blocked entirely.

**Change:** When the actor is not an HR admin, `listTimeEntries` is called with `employeeId = actor.employee_id`. The page renders the same `TimesheetTable` but scoped to the employee's own data. No approval buttons shown.

- Query helper: `listTimeEntries(supabase, orgId, { employeeId: myEmployeeId })` already supports this — just need to pass it.
- Page: `app/[locale]/(protected)/hr/timesheets/page.tsx` — check role, pass own `employeeId` if not admin.
- No new DB migration needed.

### A2 — Rate visibility on employee dashboard

**Current:** Rate is only visible on the admin Team page.

**Change:** Add a `RateCard` component on `/hr` (the main dashboard) that shows the employee's own `hourly_rate_in_cents` as read-only. If rate is $0.00, show a soft warning: "Your rate is not set — contact your admin."

- Fetch: `getEmployeeByProfileId(supabase, orgId, profileId)` — already exists.
- Component: inline in `HrDashboard.tsx` or new `RateCard.tsx` in `components/hr/`.
- Read-only, no edit for employees.

### A3 — Employee self-invoice

**Current:** Invoice generation is only available at `/hr/invoices` which is admin-only.

**Change:** Add an "Emitir minha invoice" button on the employee's HR dashboard (`/hr`). Opens a modal (same `GenerateInvoiceForm` pattern) but:
- `employeeId` is pre-filled with the actor's own employee ID — no dropdown to select employee.
- Period presets (Semanal / Quinzenal / Mensal / Personalizado) remain.
- Calls same `generateInvoiceAction(employeeId, start, end)` — action already checks the employee exists; no admin check on that action (intentional: employee can invoice themselves).
- After generation, redirects to print page as today.

New server action: `generateOwnInvoiceAction(start, end)` — resolves `employeeId` from the actor's profile server-side (no client-supplied ID), calls the existing invoice generation logic.

### A4 — Guard: block $0 rate invoice

**Current:** Invoice generates with total AU$0.00 silently if rate is not set.

**Change:** In `generateInvoiceAction` and new `generateOwnInvoiceAction`, before computing line items: if `emp.hourly_rate_in_cents === 0`, throw `Error('Rate not set. Ask your admin to configure your hourly rate before generating an invoice.')`. UI surfaces this as an error in the modal.

---

## Split B — UX & Bug Polish

**Goal:** Fix friction in existing flows. No new features, no DB changes.

### B1 — Date input in "Lançar Horas"

**Current:** Three separate `<input type="number">` for DD, MM, YYYY. Confusing and UX poor.

**Change:** Replace with a single `<input type="date">` but control the display format by wrapping it in a `DateInputPT` component:
- Uses `input[type=date]` natively (reliable cross-browser value in YYYY-MM-DD).
- Shows a visible label "DD/MM/YYYY" as placeholder text via `::before` CSS or a sibling `<span>`.
- On Windows Chrome the native picker still opens in the locale's format — we just ensure the submitted value is always `YYYY-MM-DD` (which `input[type=date]` always returns regardless of display).
- Simpler than 3 fields, avoids invalid date combinations.

### B2 — Clock-out success toast

**Current:** After clock-out, the page reloads silently. No feedback.

**Change:** After `clockOutAction` resolves in `ClockWidget`, compute session duration (clock_out − clock_in) and show a success message: "Sessão encerrada · Xh Ymin registrados" for 4 seconds. Use a simple inline state (no external toast library).

### B3 — Empty states with actionable messages

**Current:** Empty timesheet and invoice pages show a generic text.

**Change:** 
- Timesheets empty (employee): "Você ainda não lançou horas. Use o botão 'Lançar Horas' acima para começar." + button.
- Timesheets empty (admin): "Nenhuma entrada ainda. Aguarde seus funcionários lançarem horas."
- Invoices empty: "Nenhuma invoice gerada. Clique em 'Gerar Invoice' para criar a primeira."

### B4 — Invoice list employee name column

**Current:** Invoice list shows `invoice_number`, period, total, status — but no employee name.

**Change:** `listInvoices` query in `queries.ts` joins `employee_profiles → profiles` to fetch `full_name`. Invoice list renders a "Funcionário" column. For admin view, shows the employee name. For self-service view (Split A), column is hidden (redundant — it's always them).

**Query change:** `listInvoices` currently selects from `hr_invoices` only. Add a joined query:
```sql
SELECT hi.*, ep.profile_id, p.full_name, p.email
FROM hr_invoices hi
JOIN employee_profiles ep ON ep.id = hi.employee_id
JOIN profiles p ON p.id = ep.profile_id
WHERE hi.org_id = $orgId
ORDER BY hi.created_at DESC
```
Implement via Supabase chained `.select()` with embedded foreign keys or a raw join via `.rpc()` / multiple queries.

---

## Split C — Admin Cost Intelligence

**Goal:** Give admins a financial overview so they can understand payroll at a glance.

### C1 — Cost column on team page

**Current:** Team page shows hours and pending count, but no AU$ cost.

**Change:** `listEmployeesWithStats` adds a computed field: `estimated_cost_cents = hours_this_month_approved * hourly_rate_in_cents`. Displayed on each employee card as "AU$X.XX este mês".

**Calculation:** Already have `hours_this_month` (approved). Multiply by `hourly_rate_in_cents / 100`. No DB change — computed in TypeScript.

### C2 — Total payroll card on team page

**Current:** 4 summary cards: employees, working now, total hours, pending.

**Change:** Replace "Pending" summary card with "Folha Estimada" card: sum of all `estimated_cost_cents` across the team for the current month. Format as AU$X,XXX.

### C3 — Invoice list with employee filter

**Current:** Invoice list shows all invoices flat.

**Change:** Add a `<select>` filter dropdown above the table (only for admins) to filter by employee. Pre-populated with `listEmployeesWithNames`. Filtering is client-side (no re-fetch) if the invoice list is small; server-side via search param if large.

Implementation: URL search param `?employee=<id>`. Page reads it and passes to `listInvoices` as an optional filter.

### C4 — Draft invoice alert

**Current:** Draft invoices sit silently.

**Change:** At the top of `/hr/invoices` (admin view only), if there are any `status = 'draft'` invoices, show a yellow banner: "X draft invoice(s) aguardando emissão — marque como Issued após o pagamento ser acordado." Each draft row gets an "Issue →" inline button (already have `issueInvoiceAction`).

---

## File Changes Summary

### Split A
- `app/[locale]/(protected)/hr/timesheets/page.tsx` — filter by own employeeId for non-admin
- `app/[locale]/(protected)/hr/page.tsx` — add RateCard + self-invoice button
- `app/[locale]/(protected)/hr/actions.ts` — add `generateOwnInvoiceAction`, add $0 guard to both invoice actions
- `components/hr/SelfInvoiceButton.tsx` — new modal component (reuses GenerateInvoiceForm pattern, no employee selector)
- `components/hr/RateCard.tsx` — new read-only rate display

### Split B
- `components/hr/HrDashboard.tsx` — replace 3-field date with single `DateInputPT`
- `components/hr/DateInputPT.tsx` — new thin wrapper around `input[type=date]`
- `components/hr/ClockWidget.tsx` — add post-clockout success feedback
- `app/[locale]/(protected)/hr/timesheets/page.tsx` — empty state
- `app/[locale]/(protected)/hr/invoices/page.tsx` — empty state + employee name column
- `lib/hr/queries.ts` — `listInvoices` joins employee name

### Split C
- `lib/hr/queries.ts` — `listEmployeesWithStats` adds `estimated_cost_cents`
- `app/[locale]/(protected)/hr/team/page.tsx` — cost column + payroll total card
- `app/[locale]/(protected)/hr/invoices/page.tsx` — employee filter + draft alert

---

## Out of Scope (future)

- Leave management (vacation, sick days) — separate spec
- Push notifications for approvals — separate spec
- Overtime calculation — requires leave/schedule data first
- Multi-org support — no change needed
