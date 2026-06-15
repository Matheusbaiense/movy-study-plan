// lib/portfolio/index.ts — Portfolio module barrel (SPLIT 6A).
//
// The normalized course catalog (migration 011) + the editor↔portfolio seam.
// Types/mappers are pure; queries/CRUD/provider take a Database-typed Supabase
// client and rely on per-org RLS.

export * from './types'
export * from './queries'
export * from './pricing-rules'
export * from './markets'
export * from './course-source'
