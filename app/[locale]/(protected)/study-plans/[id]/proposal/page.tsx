import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { StudyPlanProposal } from '@/components/study-plans/StudyPlanProposal'
import type { StudyPlanData, StudyPlanRow } from '@/lib/study-plans/types'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function StudyPlanProposalPage({ params }: Props) {
  const { locale, id } = await params
  await getUser(locale)
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('study_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (!plan) notFound()

  const row = plan as unknown as StudyPlanRow
  const reference = `MV-${row.id.slice(0, 8).toUpperCase()}`

  return (
    <StudyPlanProposal
      data={row.data as StudyPlanData}
      reference={reference}
      updatedAt={row.updated_at}
      backHref={`/${locale}/study-plans/${row.id}`}
    />
  )
}
