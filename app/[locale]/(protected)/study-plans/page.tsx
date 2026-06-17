import { Suspense } from 'react'
import { getUser } from '@/lib/auth/get-user'
import NewProposalModal from './NewProposalModal'
import { PageHeader } from '@/components/ui'
import { ProposalsData } from './ProposalsData'
import { ProposalsListSkeleton } from './ProposalsListSkeleton'
import { Constants } from '@/types/supabase'

const APPLICANT_TYPES = ['Individual', 'Casal', 'Familia', 'Single Parent']
const VALID_STATUS = Constants.public.Enums.study_plan_status as readonly string[]

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function pick(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value ?? '').trim()
}

export default async function StudyPlansPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams

  const view = pick(sp.view) === 'trash' ? 'trash' : 'active'
  const query = pick(sp.q)
  const statusFilter = VALID_STATUS.includes(pick(sp.status)) ? pick(sp.status) : ''
  const typeFilter = APPLICANT_TYPES.includes(pick(sp.type)) ? pick(sp.type) : ''
  const sort = ['updated', 'created', 'student'].includes(pick(sp.sort)) ? pick(sp.sort) : 'updated'
  const page = Math.max(1, Number.parseInt(pick(sp.page) || '1', 10) || 1)

  // Auth must happen before the Suspense boundary — a redirect from getUser
  // can only fire in the server-rendering phase, not inside a suspended child.
  const { profile } = await getUser(locale)

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 22 }}>
      {/* [A-H2] PageHeader primitive */}
      <PageHeader
        eyebrow={locale === 'en' ? 'Proposals' : 'Propostas'}
        title="Cotações & Study Plans"
        description="Crie, simule e acompanhe propostas — filtre, selecione em lote e restaure da lixeira."
        actions={<NewProposalModal locale={locale} />}
      />

      {/* [A-H1] Suspense wraps the DB round-trip; ProposalsListSkeleton mirrors the table shape */}
      <Suspense fallback={<ProposalsListSkeleton />}>
        <ProposalsData
          locale={locale}
          view={view}
          query={query}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          sort={sort}
          page={page}
          userRole={profile.role}
        />
      </Suspense>
    </div>
  )
}
