import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { PublicProposalPage } from '@/components/study-plans/PublicProposalPage'
import { ExpiredProposal } from './ExpiredProposal'
import type { StudyPlanData, StudyPlanRow } from '@/lib/study-plans/types'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string; token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  try {
    const db = createServiceClient()
    const { data } = await db
      .from('study_plans')
      .select('student_name')
      .eq('share_token', token)
      .is('deleted_at', null)
      .maybeSingle()
    const name = data?.student_name ?? 'Aluno'
    const title = `Proposta de Estudo para ${name}`
    const description = 'Visualize sua proposta de estudo personalizada.'
    return {
      title,
      description,
      openGraph: { title, description, type: 'website' },
      twitter: { card: 'summary', title, description },
    }
  } catch {
    return { title: 'Proposta de Estudo' }
  }
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
    .select('id, data, status, student_name, updated_at, accepted_at, share_token_expires_at')
    .eq('share_token', token)
    .is('deleted_at', null)
    .single()

  if (!plan) notFound()
  const expiresAt = plan.share_token_expires_at
  // C-H2: expired link → branded dead-end, not a bare 404 (bad token still 404s above).
  if (expiresAt && new Date(expiresAt) < new Date()) return <ExpiredProposal />

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
