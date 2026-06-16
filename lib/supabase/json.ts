import type { Json } from '@/types/supabase'

/**
 * Casts a JSON-serialisable value to Supabase's Json type.
 * Prefer this over the noisy `value as unknown as Json` pattern.
 */
export function toJson(value: unknown): Json {
  return value as unknown as Json
}
