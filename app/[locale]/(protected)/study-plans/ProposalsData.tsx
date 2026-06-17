// [A-H1] Async server component — owns the DB round-trip so it can be Suspense-wrapped.
// auth/getUser stays in the parent page (must not suspend after redirect).
import { createClient } from '@/lib/supabase/server'
import { ProposalsList, type ProposalItem } from './ProposalsList'
import { money, planGrandTotal } from '@/lib/study-plans/calculations'
import { formatMoney } from '@/lib/calc/money'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { Constants } from '@/types/supabase'
import type { StudyPlanData, StudyPlanRow, StudyPlanStatus } from '@/lib/study-plans/types'
import type { Enums } from '@/types/supabase'

type Role = Enums<'app_role'>

const PAGE_SIZE = 25
const APPLICANT_TYPES = ['Individual', 'Casal', 'Familia', 'Single Parent']
const VALID_STATUS = Constants.public.Enums.study_plan_status as readonly string[]
const DAY_MS = 86_400_000

function sanitizeSearch(raw: string): string {
  return raw.replace(/[,%()*:\\]/g, '').slice(0, 80).trim()
}

function buildTotalLabel(row: StudyPlanRow, data: StudyPlanData): string {
  const cents = data.computed?.grandTotalCents
  if (typeof cents === 'number') return formatMoney(cents, row.currency_code ?? 'AUD')
  return money(planGrandTotal(data))
}

function daysToExpiry(expiresAt: string | null | undefined): { days: number | null; expired: boolean } {
  if (!expiresAt) return { days: null, expired: false }
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (Number.isNaN(diff)) return { days: null, expired: false }
  if (diff < 0) return { days: 0, expired: true }
  return { days: Math.ceil(diff / DAY_MS), expired: false }
}

interface ProposalsDataProps {
  locale: string
  view: 'active' | 'trash'
  query: string
  statusFilter: string
  typeFilter: string
  sort: string
  page: number
  userRole: Role
}

export async function ProposalsData({
  locale,
  view,
  query,
  statusFilter,
  typeFilter,
  sort,
  page,
  userRole,
}: ProposalsDataProps) {
  const supabase = await createClient()
  let q = supabase
    .from('study_plans')
    .select(
      'id, title, student_name, applicant_type, status, data, currency_code, expires_at, updated_at, created_at',
      { count: 'exact' },
    )

  q = view === 'trash' ? q.not('deleted_at', 'is', null) : q.is('deleted_at', null)
  if (VALID_STATUS.includes(statusFilter)) q = q.eq('status', statusFilter as StudyPlanStatus)
  if (APPLICANT_TYPES.includes(typeFilter)) q = q.eq('applicant_type', typeFilter)
  const safeSearch = sanitizeSearch(query)
  if (safeSearch) q = q.or(`student_name.ilike.%${safeSearch}%,title.ilike.%${safeSearch}%`)

  if (sort === 'student') q = q.order('student_name', { ascending: true })
  else if (sort === 'created') q = q.order('created_at', { ascending: false })
  else q = q.order('updated_at', { ascending: false })

  const from = (page - 1) * PAGE_SIZE
  q = q.range(from, from + PAGE_SIZE - 1)

  const { data: plans, count } = await q
  const rows = (plans ?? []) as unknown as StudyPlanRow[]

  const items: ProposalItem[] = rows.map((row) => {
    const data = row.data as StudyPlanData
    const exp = daysToExpiry(row.expires_at)
    return {
      id: row.id,
      student: row.student_name || data.student || 'Sem estudante',
      title: row.title,
      applicantType: row.applicant_type,
      status: row.status as StudyPlanStatus,
      totalLabel: buildTotalLabel(row, data),
      updatedLabel: row.updated_at
        ? new Date(row.updated_at).toLocaleString('en-AU', {
            timeZone: 'Australia/Perth',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—',
      daysToExpiry: exp.days,
      expired: exp.expired,
    }
  })

  return (
    <ProposalsList
      locale={locale}
      items={items}
      total={count ?? items.length}
      page={page}
      pageSize={PAGE_SIZE}
      view={view}
      query={query}
      statusFilter={statusFilter}
      typeFilter={typeFilter}
      sort={sort}
      isAdmin={isAdminOrAbove(userRole)}
    />
  )
}
