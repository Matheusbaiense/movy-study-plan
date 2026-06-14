// Financial Capability Demonstration for the Australian student visa.
// Formula and constants are mirrored from the attached reference workbook.

import { toCents, DEFAULT_CURRENCY, type CurrencyCode } from '../calc/money.ts'

export type StudentLocation = 'onshore' | 'offshore'

// Annual amounts (AUD) used by the current workbook.
export const COST = {
  primaryApplicant: 29710,
  additionalAdult: 10394,
  dependent: 4449,
  schoolPerSchoolAge: 13502,
  travelOnshorePerApplicant: 1000,
  travelOffshorePerApplicant: 2000,
}

export interface FinancialInput {
  student: string
  applicationDate: string
  location: StudentLocation
  visaMonths: number
  adults: number
  dependents5to18: number
  dependentsUnder5: number
  exchangeRate: number
  travelCost: number
  remainingCourseFee: number
}

export interface FinancialResult {
  costOfLiving: number
  travelCost: number
  remainingCourseFee: number
  dependentSchoolFee: number
  totalAud: number
  totalBrl: number
  costOfLivingBrl: number
  travelBrl: number
  remainingCourseBrl: number
  dependentSchoolBrl: number
}

// Integer-cents view of the financial capacity result (P9). `currencyCode` travels with
// the AUD-denominated values; the BRL-denominated values are the exchanged amounts.
export interface FinancialResultCents {
  currencyCode: CurrencyCode
  costOfLivingCents: number
  travelCostCents: number
  remainingCourseFeeCents: number
  dependentSchoolFeeCents: number
  totalAudCents: number
  totalBrlCents: number
  costOfLivingBrlCents: number
  travelBrlCents: number
  remainingCourseBrlCents: number
  dependentSchoolBrlCents: number
}

function num(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0))
  return Number.isFinite(parsed) ? parsed : 0
}

function int(value: unknown): number {
  return Math.max(0, Math.round(num(value)))
}

export function applicantCount(input: Pick<FinancialInput, 'adults' | 'dependents5to18' | 'dependentsUnder5'>): number {
  return Math.max(1, int(input.adults)) + int(input.dependents5to18) + int(input.dependentsUnder5)
}

export function defaultTravelCost(input: Pick<FinancialInput, 'location' | 'adults' | 'dependents5to18' | 'dependentsUnder5'>): number {
  const perApplicant = input.location === 'onshore' ? COST.travelOnshorePerApplicant : COST.travelOffshorePerApplicant
  return perApplicant * applicantCount(input)
}

export function computeFinancialCapacity(input: FinancialInput): FinancialResult {
  const months = Math.min(12, Math.max(0, num(input.visaMonths)))
  const adults = Math.max(1, int(input.adults))
  const deps5to18 = int(input.dependents5to18)
  const depsUnder5 = int(input.dependentsUnder5)
  const rate = num(input.exchangeRate)

  const monthlyLiving =
    COST.primaryApplicant / 12 +
    (COST.additionalAdult / 12) * (adults - 1) +
    (COST.dependent / 12) * deps5to18 +
    (COST.dependent / 12) * depsUnder5

  const costOfLiving = round2(monthlyLiving * months)
  const dependentSchoolFee = round2(deps5to18 * (COST.schoolPerSchoolAge / 12) * months)
  const travelCost = round2(num(input.travelCost))
  const remainingCourseFee = round2(num(input.remainingCourseFee))
  const totalAud = round2(costOfLiving + travelCost + remainingCourseFee + dependentSchoolFee)

  return {
    costOfLiving,
    travelCost,
    remainingCourseFee,
    dependentSchoolFee,
    totalAud,
    totalBrl: round2(totalAud * rate),
    costOfLivingBrl: round2(costOfLiving * rate),
    travelBrl: round2(travelCost * rate),
    remainingCourseBrl: round2(remainingCourseFee * rate),
    dependentSchoolBrl: round2(dependentSchoolFee * rate),
  }
}

// Engine bridge: same float math, returned as integer cents at the border so the
// financial capacity can join the integer-cents snapshot. `toCents` guards FP drift.
export function computeFinancialCapacityCents(
  input: FinancialInput,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
): FinancialResultCents {
  const r = computeFinancialCapacity(input)
  return {
    currencyCode,
    costOfLivingCents: toCents(r.costOfLiving),
    travelCostCents: toCents(r.travelCost),
    remainingCourseFeeCents: toCents(r.remainingCourseFee),
    dependentSchoolFeeCents: toCents(r.dependentSchoolFee),
    totalAudCents: toCents(r.totalAud),
    totalBrlCents: toCents(r.totalBrl),
    costOfLivingBrlCents: toCents(r.costOfLivingBrl),
    travelBrlCents: toCents(r.travelBrl),
    remainingCourseBrlCents: toCents(r.remainingCourseBrl),
    dependentSchoolBrlCents: toCents(r.dependentSchoolBrl),
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function formatAud(value: number): string {
  return `AUD ${num(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatBrl(value: number): string {
  return `R$ ${num(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
