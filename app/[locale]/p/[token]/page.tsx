import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { PublicProposalPage } from '@/components/study-plans/PublicProposalPage'
import type { StudyPlanData, StudyPlanRow } from '@/lib/study-plans/types'

interface Props {
  params: Promise<{ locale: string; token: string }>
}

export default async function PublicProposalTokenPage({ params }: Props) {
  const { token } = await params

  let db: ReturnType<typeof createServiceClient>
  try {
    db = createServiceClient()
  } catch {
    return notFound()
  }

  const { data: plan } = await db
    .from('study_plans')
    .select('id, data, status, student_name, updated_at, accepted_at')
    .eq('share_token', token)
    .is('deleted_at', null)
    .single()

  if (!plan) notFound()

  const row = plan as unknown as StudyPlanRow
  const reference = `MV-${row.id.slice(0, 8).toUpperCase()}`

  return (
    <PublicProposalPage
      token={token}
      data={row.data as StudyPlanData}
      reference={reference}
      updatedAt={row.updated_at}
      acceptedAt={row.accepted_at ?? null}
      studentName={row.student_name}
    />
  )
}
