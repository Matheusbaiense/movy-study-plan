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
