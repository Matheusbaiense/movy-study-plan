import type { Json } from '@/types/supabase'

/**
 * The JSON serialization boundary for Supabase `jsonb` columns.
 *
 * Postgres `jsonb` is typed as `Json` in the generated types, which never
 * structurally overlaps our domain types (StudyPlanData, RuleEffect, …). That
 * forces a double cast (`x as unknown as Json`) at every read/write — noisy and
 * easy to get backwards. These two helpers are the single documented place for
 * that cast, so call sites read as intent, not as type gymnastics:
 *
 *   .insert({ data: toJson(plan) })          // domain → jsonb (write)
 *   const plan = fromJson<StudyPlanData>(row.data)  // jsonb → domain (read)
 *
 * Neither validates at runtime. `fromJson` trusts the column shape; validate
 * with Zod at a real trust boundary (external input), not here.
 */

/** Domain value → `Json` for writing to a `jsonb` column. */
export function toJson(value: unknown): Json {
  return value as Json
}

/** `jsonb` column value → a known domain shape (no runtime validation). */
export function fromJson<T>(value: unknown): T {
  return value as T
}
