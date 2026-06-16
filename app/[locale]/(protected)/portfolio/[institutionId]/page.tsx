import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getUser } from '@/lib/auth/get-user'
import { listCourses } from '@/lib/portfolio/queries'
import { InstitutionDetail } from '@/components/portfolio/InstitutionDetail'
import type { Institution, Course, CoursePriceVersion, PricingRuleRow } from '@/lib/portfolio/types'

interface Props {
  params: Promise<{ locale: string; institutionId: string }>
}

export default async function InstitutionPage({ params }: Props) {
  const { locale, institutionId } = await params
  await getUser(locale)

  let institution: Institution | null = null
  let courses: Course[] = []
  let priceVersionsByCourse: Record<string, CoursePriceVersion[]> = {}
  let rules: PricingRuleRow[] = []

  try {
    const db = createServiceClient()

    const { data } = await db
      .from('institutions')
      .select('*')
      .eq('id', institutionId)
      .is('deleted_at', null)
      .maybeSingle()
    institution = data

    if (!institution) return notFound()

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

    const { data: rulesData } = await db
      .from('pricing_rules')
      .select('*')
      .is('deleted_at', null)
      .order('priority', { ascending: false })
    rules = rulesData ?? []
  } catch {
    if (!institution) return notFound()
  }

  return (
    <InstitutionDetail
      institution={institution}
      courses={courses}
      priceVersionsByCourse={priceVersionsByCourse}
      rules={rules}
    />
  )
}
