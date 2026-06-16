import { createServiceClient } from '@/lib/supabase/service'
import { getUser } from '@/lib/auth/get-user'
import { listInstitutions } from '@/lib/portfolio/queries'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import type { Institution } from '@/lib/portfolio/types'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function PortfolioIndexPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)

  let institutions: Institution[] = []
  let courseCountMap: Record<string, number> = {}

  try {
    const db = createServiceClient()
    institutions = await listInstitutions(db)

    if (institutions.length > 0) {
      const ids = institutions.map((i) => i.id)
      const { data } = await db
        .from('courses')
        .select('institution_id')
        .in('institution_id', ids)
        .is('deleted_at', null)
        .eq('is_active', true)
      if (data) {
        for (const row of data) {
          courseCountMap[row.institution_id] = (courseCountMap[row.institution_id] ?? 0) + 1
        }
      }
    }
  } catch {
    // service key not configured — page renders empty
  }

  return <PortfolioPage institutions={institutions} courseCountMap={courseCountMap} />
}
