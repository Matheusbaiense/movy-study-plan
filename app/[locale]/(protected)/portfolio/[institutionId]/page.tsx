import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { listCourses } from '@/lib/portfolio/queries'
import { InstitutionDetail } from '@/components/portfolio/InstitutionDetail'
import type { Institution, Course, CoursePriceVersion, PricingRuleRow } from '@/lib/portfolio/types'

interface Props {
  params: Promise<{ locale: string; institutionId: string }>
}

interface InstitutionData {
  institution: Institution | null
  courses: Course[]
  priceVersionsByCourse: Record<string, CoursePriceVersion[]>
  rules: PricingRuleRow[]
}

async function fetchInstitutionData(institutionId: string): Promise<InstitutionData> {
  let institution: Institution | null = null
  let courses: Course[] = []
  const priceVersionsByCourse: Record<string, CoursePriceVersion[]> = {}
  let rules: PricingRuleRow[] = []

  try {
    const db = await createClient()

    // The org-wide pricing rules are independent of this institution, so fetch
    // them in parallel with the institution lookup.
    const [{ data: instData }, { data: rulesData }] = await Promise.all([
      db.from('institutions').select('*').eq('id', institutionId).is('deleted_at', null).maybeSingle(),
      db.from('pricing_rules').select('*').is('deleted_at', null).order('priority', { ascending: false }),
    ])
    institution = instData
    rules = rulesData ?? []

    if (!institution) return { institution: null, courses, priceVersionsByCourse, rules }

    courses = await listCourses(db, { institutionId, activeOnly: false })

    if (courses.length > 0) {
      const today = new Date().toISOString().slice(0, 10)
      const courseIds = courses.map((c) => c.id)
      const { data: allVersions } = await db
        .from('course_price_versions')
        .select('*')
        .in('course_id', courseIds)
        .lte('valid_from', today)
        .or(`valid_until.is.null,valid_until.gte.${today}`)
        .order('valid_from', { ascending: false })

      for (const v of allVersions ?? []) {
        const cid = (v as CoursePriceVersion).course_id
        if (!priceVersionsByCourse[cid]) priceVersionsByCourse[cid] = []
        priceVersionsByCourse[cid].push(v as CoursePriceVersion)
      }
    }
  } catch {
    // institution stays null → caller renders notFound()
  }

  return { institution, courses, priceVersionsByCourse, rules }
}

export default async function InstitutionPage({ params }: Props) {
  const { locale, institutionId } = await params

  // RLS scopes the reads, so the data fetch overlaps with auth validation.
  const [, data] = await Promise.all([
    getUser(locale),
    fetchInstitutionData(institutionId),
  ])

  const { institution, courses, priceVersionsByCourse, rules } = data
  if (!institution) return notFound()

  return (
    <InstitutionDetail
      institution={institution}
      courses={courses}
      priceVersionsByCourse={priceVersionsByCourse}
      rules={rules}
    />
  )
}
