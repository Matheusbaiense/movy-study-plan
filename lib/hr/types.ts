// lib/hr/types.ts
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
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
export type HrInvoiceUpdate = TablesUpdate<'hr_invoices'>

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
