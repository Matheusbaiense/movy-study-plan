// lib/hr/queries.ts
import type {
  HrClient, EmployeeProfile, EmployeeProfileInsert,
  TimeEntry, TimeEntryInsert, HrRateRule,
  HrInvoice, HrInvoiceInsert, HrInvoiceUpdate, InvoicePrintData, InvoiceLine,
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
  const now = new Date().toISOString()
  const patch: HrInvoiceUpdate = {
    status,
    updated_at: now,
    ...(status === 'issued' ? { issued_at: now } : {}),
    ...(status === 'paid' ? { paid_at: now } : {}),
  }

  const { data, error } = await supabase
    .from('hr_invoices')
    .update(patch)
    .eq('id', invoiceId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

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

export async function getInvoicePrintData(
  supabase: HrClient,
  invoiceId: string,
  rules: HrRateRule[],
): Promise<InvoicePrintData | null> {
  const invoice = await getInvoiceById(supabase, invoiceId)
  if (!invoice) return null

  const employee = await getEmployeeById(supabase, invoice.employee_id)
  if (!employee) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', employee.profile_id ?? '')
    .maybeSingle()

  const { data: org } = await supabase
    .from('organizations')
    .select('name, settings')
    .eq('id', invoice.org_id)
    .maybeSingle()

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
    const multiplier = getMultiplier(e.day_type as Parameters<typeof getMultiplier>[0], rules, dateIso)
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

  const orgSettings = org?.settings as Record<string, unknown> | null | undefined

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
      abn: orgSettings?.abn as string | undefined,
      address: orgSettings?.address as string | undefined,
    },
  }
}
