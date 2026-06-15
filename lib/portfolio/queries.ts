// lib/portfolio/queries.ts — Org-scoped READ queries for the portfolio catalog (SPLIT 6A).
//
// Mirrors `lib/crm/contacts.ts`: every function takes a Database-typed client and
// relies on per-org RLS (`current_org_id()`) to scope rows; soft-deleted rows are
// excluded with `.is('deleted_at', null)`. Price resolution goes through the
// `current_course_price` RPC so the "country > market > default" precedence stays
// in the database (one source of truth, RLS-respecting).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { CourseType } from '../study-plans/types'
import type { Campus, Course, CoursePriceVersion, Institution } from './types'

type Client = SupabaseClient<Database>

/** List non-deleted institutions for the current org, alphabetical. */
export async function listInstitutions(supabase: Client): Promise<Institution[]> {
  const { data } = await supabase
    .from('institutions')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  return data ?? []
}

/** List non-deleted campuses (optionally for one institution), alphabetical. */
export async function listCampuses(supabase: Client, institutionId?: string): Promise<Campus[]> {
  let query = supabase.from('campuses').select('*').is('deleted_at', null)
  if (institutionId) query = query.eq('institution_id', institutionId)
  const { data } = await query.order('name', { ascending: true })
  return data ?? []
}

export interface CourseFilter {
  institutionId?: string
  campusId?: string
  type?: CourseType
  /** Free-text match on course name (case-insensitive). */
  q?: string
  /** Only `is_active` courses. Defaults to true. */
  activeOnly?: boolean
}

/** List non-deleted catalog courses for the current org, filtered, alphabetical. */
export async function listCourses(supabase: Client, filter: CourseFilter = {}): Promise<Course[]> {
  let query = supabase.from('courses').select('*').is('deleted_at', null)
  if (filter.activeOnly !== false) query = query.eq('is_active', true)
  if (filter.institutionId) query = query.eq('institution_id', filter.institutionId)
  if (filter.campusId) query = query.eq('campus_id', filter.campusId)
  if (filter.type) query = query.eq('type', filter.type)
  if (filter.q && filter.q.trim()) query = query.ilike('name', `%${filter.q.trim()}%`)
  const { data } = await query.order('name', { ascending: true })
  return data ?? []
}

/** A course row with its institution/campus names resolved (for the picker + provider). */
export interface CourseWithRefs extends Course {
  institutions: { name: string } | null
  campuses: { name: string } | null
}

/** Fetch a single course (with institution/campus names) by id, or null. */
export async function getCourseWithRefs(supabase: Client, courseId: string): Promise<CourseWithRefs | null> {
  const { data } = await supabase
    .from('courses')
    .select('*, institutions(name), campuses(name)')
    .eq('id', courseId)
    .is('deleted_at', null)
    .maybeSingle()
  return (data as CourseWithRefs | null) ?? null
}

/** All in-force price versions for a course (valid window honored), newest valid_from first. */
export async function listActivePriceVersions(
  supabase: Client,
  courseId: string,
  onDate?: string,
): Promise<CoursePriceVersion[]> {
  const today = onDate ?? new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('course_price_versions')
    .select('*')
    .eq('course_id', courseId)
    .lte('valid_from', today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order('valid_from', { ascending: false })
  return data ?? []
}

/**
 * Resolve the price for a course as of `onDate` (default today), honoring the
 * student's `nationality` precedence, via the `current_course_price` RPC. Returns
 * the winning price version row, or null when no version applies.
 */
export async function currentCoursePrice(
  supabase: Client,
  courseId: string,
  nationality?: string | null,
  onDate?: string,
): Promise<CoursePriceVersion | null> {
  const args: { p_course: string; p_nationality?: string; p_on?: string } = { p_course: courseId }
  if (nationality) args.p_nationality = nationality
  if (onDate) args.p_on = onDate

  const { data, error } = await supabase.rpc('current_course_price', args)
  if (error || !data) return null
  // `current_course_price` is a one-row setof; supabase-js may surface it as a
  // single object or a one-element array depending on typegen — handle both.
  const row = Array.isArray(data) ? data[0] : data
  return (row as CoursePriceVersion | undefined) ?? null
}
