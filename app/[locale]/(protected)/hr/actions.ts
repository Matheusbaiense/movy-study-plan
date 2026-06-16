'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/api/audit'
import { getActorSession } from '@/lib/actions/auth'

const logHoursSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:MM'),
  description: z.string().max(500).optional(),
})
import {
  getEmployeeByProfileId, getActiveClockEntry, upsertEmployee,
  clockIn as insertEntry, clockOut, updateEntryStatus, listRateRules,
  createInvoice, linkEntriesToInvoice, updateInvoiceStatus,
  listTimeEntries,
} from '@/lib/hr'
import { isHrAdmin } from '@/lib/hr'
import {
  detectDayType, calculateHours, getMultiplier,
  calculateLineItemCents, computeTotalCents,
} from '@/lib/hr/calculations'

const getActor = getActorSession

export async function createOwnEmployeeProfileAction() {
  const { supabase, profile } = await getActor()

  const existing = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (existing) {
    revalidatePath('/', 'layout')
    return existing
  }

  const employee = await upsertEmployee(supabase, {
    org_id: profile.org_id,
    profile_id: profile.id,
    hourly_rate_in_cents: 0,
  })

  revalidatePath('/', 'layout')
  return employee
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

  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.entry.clock_in', entityType: 'time_entries', entityId: entry.id, metadata: { dayType, description: description ?? null } })

  revalidatePath('/', 'layout')
  return entry
}

export async function clockOutAction(entryId: string) {
  const { supabase, profile } = await getActor()
  const entry = await clockOut(supabase, entryId, new Date().toISOString())
  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.entry.clock_out', entityType: 'time_entries', entityId: entryId })
  revalidatePath('/', 'layout')
  return entry
}

/** Log hours manually (full clock_in + clock_out at once). */
export async function logHoursAction(
  date: string,       // 'YYYY-MM-DD'
  startTime: string,  // 'HH:MM'
  endTime: string,    // 'HH:MM'
  description?: string,
) {
  logHoursSchema.parse({ date, startTime, endTime, description })
  const { supabase, profile } = await getActor()

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (!employee) throw new Error('Employee profile not found for this account')

  const clockInTime = new Date(`${date}T${startTime}:00`)
  const clockOutTime = new Date(`${date}T${endTime}:00`)
  if (isNaN(clockInTime.getTime()) || isNaN(clockOutTime.getTime())) throw new Error('Invalid date or time')
  if (clockOutTime <= clockInTime) throw new Error('End time must be after start time')

  const now = new Date()
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0)
  if (clockInTime > endOfToday) throw new Error('Cannot log hours for future dates')
  if (clockInTime < thirtyDaysAgo) throw new Error('Cannot log hours more than 30 days in the past')

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

  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.entry.log_hours', entityType: 'time_entries', entityId: entry.id, metadata: { date, startTime, endTime } })

  revalidatePath('/', 'layout')
  return entry
}

export async function approveEntryAction(entryId: string) {
  const { supabase, profile } = await getActor()
  if (!isHrAdmin(profile.role)) throw new Error('Insufficient permissions')
  const entry = await updateEntryStatus(supabase, entryId, 'approved', profile.id)
  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.entry.approve', entityType: 'hr_time_entries', entityId: entryId })
  revalidatePath('/', 'layout')
  return entry
}

export async function rejectEntryAction(entryId: string) {
  const { supabase, profile } = await getActor()
  if (!isHrAdmin(profile.role)) throw new Error('Insufficient permissions')
  const entry = await updateEntryStatus(supabase, entryId, 'rejected', profile.id)
  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.entry.reject', entityType: 'hr_time_entries', entityId: entryId })
  revalidatePath('/', 'layout')
  return entry
}

export async function generateInvoiceAction(
  employeeId: string,
  periodStart: string,
  periodEnd: string,
) {
  const { supabase, profile } = await getActor()
  if (!isHrAdmin(profile.role)) throw new Error('Insufficient permissions')

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

  if (emp.hourly_rate_in_cents === 0) {
    throw new Error("Rate not configured. Set the employee's hourly rate before generating an invoice.")
  }

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
  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.invoice.generate', entityType: 'hr_invoices', entityId: invoice.id, metadata: { employeeId, periodStart, periodEnd } })

  revalidatePath('/', 'layout')
  return invoice
}

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

export async function updateEmployeeRateAction(employeeId: string, ratePerHour: number) {
  const { supabase, profile } = await getActor()
  if (!isHrAdmin(profile.role)) throw new Error('Insufficient permissions')
  if (ratePerHour < 0) throw new Error('Rate cannot be negative')

  const { error } = await supabase
    .from('employee_profiles')
    .update({ hourly_rate_in_cents: Math.round(ratePerHour * 100) })
    .eq('id', employeeId)
    .eq('org_id', profile.org_id)
  if (error) throw new Error(error.message)

  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.employee.rate_updated', entityType: 'employee_profiles', entityId: employeeId, metadata: { ratePerHour } })

  revalidatePath('/', 'layout')
}

export async function issueInvoiceAction(invoiceId: string) {
  const { supabase, profile } = await getActor()
  if (!isHrAdmin(profile.role)) throw new Error('Insufficient permissions')
  const invoice = await updateInvoiceStatus(supabase, invoiceId, 'issued')
  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.invoice.issued', entityType: 'hr_invoices', entityId: invoiceId })
  revalidatePath('/', 'layout')
  return invoice
}

export async function markInvoicePaidAction(invoiceId: string) {
  const { supabase, profile } = await getActor()
  if (!isHrAdmin(profile.role)) throw new Error('Insufficient permissions')
  const invoice = await updateInvoiceStatus(supabase, invoiceId, 'paid')
  await logAudit({ actorId: profile.id, actorEmail: profile.email, action: 'hr.invoice.paid', entityType: 'hr_invoices', entityId: invoiceId })
  revalidatePath('/', 'layout')
  return invoice
}
