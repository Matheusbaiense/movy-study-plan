// types/database.ts — Convenience aliases used throughout the app
import type { Tables, Enums } from './supabase'

export type Profile    = Tables<'profiles'>
export type Content    = Tables<'contents'>
export type Campaign   = Tables<'campaigns'>
export type Department = Tables<'departments'>
export type AuditLog   = Tables<'audit_logs'>
export type AllowedDomain = Tables<'allowed_domains'>
export type ChecklistProgress = Tables<'checklist_progress'>

export type AppRole      = Enums<'app_role'>
export type ContentStatus = Enums<'content_status'>

// Locale type used for i18n routing
export type Locale = 'pt' | 'en' | 'es'

// Helper to get the localised field name for multilingual columns
export function localeField<T extends string>(
  base: T,
  locale: Locale
): `${T}_${Locale}` {
  return `${base}_${locale}`
}
