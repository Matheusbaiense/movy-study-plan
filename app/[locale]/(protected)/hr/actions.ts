'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getEmployeeByProfileId, getActiveClockEntry,
  clockIn as insertEntry, clockOut, updateEntryStatus, listRateRules,
  createInvoice, linkEntriesToInvoice, updateInvoiceStatus,
  listTimeEntries,
} from '@/lib/hr'
import { isHrAdmin } from '@/lib/hr'
import {
  detectDayType, calculateHours, getMultiplier,
  calculateLineItemCents, computeTotalCents,
} from '@/lib/hr/calculations'

async function getActor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, org_id, role, email')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Unauthenticated')
  return { supabase, profile }
}

export async function clockInAction(description?: string) {
  const { supabase, profile } = await getActor()

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (!employee) throw new Error('Employee profile not found for this account')

  const existing = await getActiveClockEntry(supabase, employee.id)
  if (existing) throw new Error('Already clocked in')

  const now = new Date()
  const publicHolidays: string[] = (employee.metadata as Record<string, unknown> | null)?.public_holidays as string[] ?? []
  const dayType = detectDayType(now, publicHolidays)

  const entry = await insertEntry(supabase, {
    org_id: profile.org_id,
    employee_id: employee.id,
    clock_in: now.toISOString(),
    day_type: dayType,
    description: description ?? null,
    status: isHrAdmin(profile.role) ? 'approved' : 'pending',
  })

  revalidatePath('/hr')
  return entry
}

export async function clockOutAction(entryId: string) {
  const { supabase } = await getActor()
  const entry = await clockOut(supabase, entryId, new Date().toISOString())
  revalidatePath('/hr')
  return entry
}

/** Log hours manually (full clock_in + clock_out at once). */
export async function logHoursAction(
  date: string,       // 'YYYY-MM-DD'
  startTime: string,  // 'HH:MM'
  endTime: string,    // 'HH:MM'
  description?: string,
) {
  const { supabase, profile } = await getActor()

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (!employee) throw new Error('Employee profile not found for this account')

  const clockInTime = new Date(`${date}T${startTime}:00`)
  const clockOutTime = new Date(`${date}T${endTime}:00`)
  if (isNaN(clockInTime.getTime()) || isNaN(clockOutTime.getTime())) throw new Error('Invalid date or time')
  if (clockOutTime <= clockInTime) throw new Error('End time must be after start time')

  const publicHolidays: string[] = (employee.metadata as Record<string, unknown> | null)?.public_holidays as string[] ?? []
  const dayType = detectDayType(clockInTime, publicHolidays)

  const entry = await insertEntry(supabase, {
    org_id: profile.org_id,
    employee_id: employee.id,
    clock_in: clockInTime.toISOString(),
    clock_out: clockOutTime.toISOString(),
    day_type: dayType,
    description: description ?? null,
    status: isHrAdmin(profile.role) ? 'approved' : 'pending',
  })

  revalidatePath('/hr')
  return entry
}

export async function approveEntryAction(entryId: string) {
  const { supabase, profile } = await getActor()
  const entry = await updateEntryStatus(supabase, entryId, 'approved', profile.id)
  revalidatePath('/hr')
  return entry
}

export async function rejectEntryAction(entryId: string) {
  const { supabase, profile } = await getActor()
  const entry = await updateEntryStatus(supabase, entryId, 'rejected', profile.id)
  revalidatePath('/hr')
  return entry
}

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
    const multiplier = getMultiplier(e.day_type as Parameters<typeof getMultiplier>[0], rules, dateIso)
    return calculateLineItemCents(hours, emp.hourly_rate_in_cents, multiplier)
  })
  const totalCents = computeTotalCents(centValues)

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

  revalidatePath('/hr/invoices')
  return invoice
}

export async function issueInvoiceAction(invoiceId: string) {
  const { supabase } = await getActor()
  const invoice = await updateInvoiceStatus(supabase, invoiceId, 'issued')
  revalidatePath('/hr/invoices')
  return invoice
}

export async function markInvoicePaidAction(invoiceId: string) {
  const { supabase } = await getActor()
  const invoice = await updateInvoiceStatus(supabase, invoiceId, 'paid')
  revalidatePath('/hr/invoices')
  return invoice
}
