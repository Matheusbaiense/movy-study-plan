import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { listInstitutions } from '@/lib/portfolio/queries'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'
import type { Institution } from '@/lib/portfolio/types'

interface Props {
  params: Promise<{ locale: string }>
}

async function fetchPortfolio(): Promise<{ institutions: Institution[]; courseCountMap: Record<string, number> }> {
  const institutions: Institution[] = []
  const courseCountMap: Record<string, number> = {}

  try {
    const db = await createClient()
    const list = await listInstitutions(db)
    institutions.push(...list)

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
    // renders empty on error
  }

  return { institutions, courseCountMap }
}

export default async function PortfolioIndexPage({ params }: Props) {
  const { locale } = await params

  // RLS scopes the portfolio reads, so they overlap with auth validation.
  const [, { institutions, courseCountMap }] = await Promise.all([
    getUser(locale),
    fetchPortfolio(),
  ])

  return <PortfolioPage institutions={institutions} courseCountMap={courseCountMap} />
}
