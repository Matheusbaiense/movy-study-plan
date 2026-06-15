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
 * Parse a user-entered display string into integer cents. **pt-BR is the primary locale**, with
 * en-US tolerated. Handles thousands and decimal separators without `parseFloat` ambiguity:
 *
 * - Both separators present → the RIGHT-MOST is the decimal; the other groups thousands
 *   ("1.234,56"→123456 pt-BR, "1,234.56"→123456 en-US).
 * - Lone comma → DECIMAL ("1,50"→150); repeated commas → en-US thousands ("1,234,567"→123456700).
 * - Lone dot → DECIMAL when it has 1–2 trailing digits ("12.34"→1234); pt-BR THOUSANDS when there
 *   are multiple dots OR exactly 3 trailing digits ("1.234"→123400, "1.234.567"→123456700).
 *
 * Calibrated for 2-decimal currencies (see `toCents`). A lone comma is treated as decimal by
 * design (pt-BR), so en-US "1,234" without a decimal is read as 1.234 — type "1,234.00" or "1234"
 * to mean one thousand. Currency symbols/spaces are stripped. Returns 0 on empty.
 */
export function parseMoneyToCents(input: string | number): number {
  if (typeof input === 'number') return toCents(input)
  const cleaned = String(input).replace(/[^\d,.-]/g, '').trim()
  if (!cleaned || cleaned === '-') return 0

  const negative = cleaned.startsWith('-')
  const digits = cleaned.replace(/-/g, '')
  const hasComma = digits.includes(',')
  const hasDot = digits.includes('.')

  let normalized: string
  if (hasComma && hasDot) {
    normalized =
      digits.lastIndexOf(',') > digits.lastIndexOf('.')
        ? digits.replace(/\./g, '').replace(',', '.')
        : digits.replace(/,/g, '')
  } else if (hasComma) {
    // Lone comma = decimal (pt-BR); repeated commas = en-US thousands grouping.
    normalized = (digits.match(/,/g) || []).length > 1 ? digits.replace(/,/g, '') : digits.replace(',', '.')
  } else if (hasDot) {
    // Lone dot: thousands when there are multiple dots or exactly 3 trailing digits; else decimal.
    const dots = (digits.match(/\./g) || []).length
    const trailing = digits.length - digits.lastIndexOf('.') - 1
    normalized = dots > 1 || trailing === 3 ? digits.replace(/\./g, '') : digits
  } else {
    normalized = digits
  }

  const cents = toCents(normalized)
  return negative ? -cents : cents
}

/** Build a `Money` value from integer cents. */
export function money(amountInCents: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): Money {
  return { amountInCents: asCents(amountInCents), currencyCode }
}
