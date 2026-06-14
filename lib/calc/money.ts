// Money primitives for the Movy calc engine (SPLIT 1 / P9).
//
// Rule R1 (docs/LAGO-WOOFED-CONVERGENCE.md): every persisted monetary value is an
// INTEGER in the smallest unit (cents) and a `currency_code` (ISO 4217) travels WITH
// the value — not only on the org. The engine computes in integer cents; the UI formats
// at the border with `Intl`. The Movy↔Lago boundary is integer→integer.
//
// This module is a leaf (no domain imports) so it can be reused by the engine, the
// financial calculator, future portfolio/proposal code, and the node test runner.

/** ISO 4217 currency code that travels alongside an integer-cents amount. */
export type CurrencyCode = string

/** A monetary value: an integer amount in the smallest unit + the currency it is in. */
export interface Money {
  amountInCents: number
  currencyCode: CurrencyCode
}

/** Default school/course currency until per-course currency lands (SPLIT 6). */
export const DEFAULT_CURRENCY: CurrencyCode = 'AUD'

function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0))
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * LEGACY-FLOAT BORDER COERCION. Convert a float/number/string DOLLAR amount (as still
 * stored in `study_plans.data` jsonb) into integer cents. Rounds half away from zero and
 * guards binary floating-point drift (e.g. 0.1 + 0.2, 10.005). Use this whenever reading
 * a money value that may still be a legacy float — never persist the float onward.
 *
 * NOTE: assumes 2-decimal (minor-unit = 1/100) currencies; the 1e-6 bias is calibrated for
 * that cents scale to absorb IEEE-754 drift. Zero-decimal/3-decimal currencies (e.g. JPY,
 * BHD) would need a per-currency exponent — out of scope until per-currency minor units land.
 */
export function toCents(value: unknown): number {
  const scaled = toNumber(value) * 100
  const rounded = Math.sign(scaled) * Math.round(Math.abs(scaled) + 1e-6)
  return Object.is(rounded, -0) ? 0 : rounded
}

/** Normalize a value that should already be integer cents (defensive, never fractional). */
export function asCents(value: unknown): number {
  const n = toNumber(value)
  return Number.isFinite(n) ? Math.round(n) : 0
}

/** Integer cents → float dollars. Border helper for the legacy float UI (untouched here). */
export function centsToNumber(cents: number): number {
  return asCents(cents) / 100
}

/**
 * Split an integer-cents total into `parts` installments. The LAST installment absorbs the
 * rounding remainder (matches the existing `datedInstallments` behavior). Pure integer math.
 */
export function splitCents(totalCents: number, parts: number): number[] {
  const count = Math.max(1, Math.round(toNumber(parts)))
  const total = asCents(totalCents)
  const base = Math.trunc(total / count)
  const out = new Array<number>(count).fill(base)
  out[count - 1] = total - base * (count - 1)
  return out
}

/** Format integer cents for display using Intl (currency travels WITH the value). */
export function formatMoney(cents: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(asCents(cents) / 100)
}

/** Format a `Money` value (amount + its own currency). */
export function formatMoneyValue(value: Money, locale = 'pt-BR'): string {
  return formatMoney(value.amountInCents, value.currencyCode, locale)
}

/**
 * Parse a user-entered display string into integer cents. Handles pt-BR ("1.234,56"),
 * plain ("1234.56") and number inputs. Strips currency symbols/spaces.
 */
export function parseMoneyToCents(input: string | number): number {
  if (typeof input === 'number') return toCents(input)
  const cleaned = String(input).replace(/[^\d,.-]/g, '').trim()
  if (!cleaned) return 0

  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')
  let normalized = cleaned
  if (hasComma && hasDot) {
    // The right-most separator is the decimal one; the other groups thousands.
    normalized =
      cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '')
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.')
  }
  return toCents(normalized)
}

/** Build a `Money` value from integer cents. */
export function money(amountInCents: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): Money {
  return { amountInCents: asCents(amountInCents), currencyCode }
}
