// lib/portfolio/course-source.ts — Portfolio-backed `CourseSource` provider (SPLIT 6A).
//
// Implements the editor↔portfolio seam (roadmap §4). The editor (SPLIT 4) codes
// against the `CourseSource` interface; this provider plugs the real catalog in
// WITHOUT the editor reopening `StudyPlanEditor.tsx`.
//
//   search(q)   → catalog courses as pickable options
//   resolve(id) → a `PortfolioCourseRef`: the locked float price snapshot + an
//                 editor-ready `StudyCourse` with the agency rule layer applied.
//
// Money crosses to FLOAT at the snapshot border (`priceVersionToSnapshot`). The
// agency layer is `applyRulesToPlan` (the SPLIT 6A pure engine) run over a single-
// course plan, so promotions/discounts/fees are baked in and explainable.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { StudyPlanData } from '../study-plans/types'
import { applyRulesToPlan } from '../calc/rules.ts'
import { getActiveRules } from './pricing-rules.ts'
import { currentCoursePrice, getCourseWithRefs, listCourses } from './queries.ts'
import { listInstitutions } from './queries.ts'
import {
  asCourseType,
  buildStudyCourse,
  priceVersionToSnapshot,
} from './types.ts'
import type { CourseOption, CourseSource, PortfolioCourseRef, ResolveOptions } from './types'

type Client = SupabaseClient<Database>

/** Minimal plan wrapping a single course so `applyRulesToPlan` can run over it. */
function singleCoursePlan(plan: StudyPlanData['courses'][number], location?: StudyPlanData['studentLocation']): StudyPlanData {
  return {
    student: '',
    applicantType: 'Individual',
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses: [plan],
    extraCosts: [],
    payments: [],
    notes: '',
    studentLocation: location,
  }
}

/**
 * Build a `CourseSource` backed by the portfolio catalog for the current org. The
 * passed `supabase` client carries the user's session, so every read is RLS-scoped.
 */
export function createPortfolioCourseSource(supabase: Client): CourseSource {
  return {
    async search(query: string): Promise<CourseOption[]> {
      const [courses, institutions] = await Promise.all([
        listCourses(supabase, { q: query, activeOnly: true }),
        listInstitutions(supabase),
      ])
      const institutionName = new Map(institutions.map((institution) => [institution.id, institution.name]))
      // Campus names are resolved lazily in `resolve`; the picker shows the institution.
      return courses.map((course) => ({
        id: course.id,
        type: asCourseType(course.type),
        name: course.name,
        provider: institutionName.get(course.institution_id) ?? '',
        institutionId: course.institution_id,
        campusId: course.campus_id,
        campusName: null,
        cricos: course.cricos,
        englishLevel: course.english_level,
        timetable: course.timetable,
      }))
    },

    async resolve(courseId: string, options: ResolveOptions = {}): Promise<PortfolioCourseRef | null> {
      const course = await getCourseWithRefs(supabase, courseId)
      if (!course) return null

      const version = await currentCoursePrice(supabase, courseId, options.nationality, options.onDate)
      if (!version) return null

      const snapshot = priceVersionToSnapshot(version)
      const baseCourse = buildStudyCourse(
        {
          type: asCourseType(course.type),
          name: course.name,
          provider: course.institutions?.name ?? '',
          timetable: course.timetable,
        },
        snapshot,
      )

      const ruleDate = options.onDate ? new Date(options.onDate) : new Date()
      const rules = await getActiveRules(supabase, ruleDate)

      const plan = singleCoursePlan(baseCourse, options.location)
      const { plan: adjustedPlan, adjustments } = applyRulesToPlan(plan, rules, {
        nationality: options.nationality ?? undefined,
        resolveScopeIds: () => ({
          institutionId: course.institution_id,
          campusId: course.campus_id ?? undefined,
          courseId: course.id,
        }),
      })

      return {
        courseId,
        priceVersionId: version.id,
        snapshot,
        takenAt: new Date().toISOString(),
        course: adjustedPlan.courses[0] ?? baseCourse,
        // `applyRulesToPlan` appends only the rule-produced extras to an empty list.
        extras: adjustedPlan.extraCosts,
        adjustments,
      }
    },
  }
}
