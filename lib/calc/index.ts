// Barrel for the Movy calc engine (SPLIT 1).
//
// Import money primitives and computed-snapshot types from one place:
//   import { toCents, formatMoney, computeProposal, type ComputedTotals } from '@/lib/calc'
//
// The engine entrypoints (`computeProposal`, `COMPUTED_VERSION`) are re-exported by name
// rather than via `export *` to avoid colliding with the legacy float `money()` formatter
// that still lives in `lib/study-plans/calculations.ts` for the (untouched) UI.

export * from './money'
export * from './types'
export { computeProposal, COMPUTED_VERSION } from '../study-plans/calculations'
