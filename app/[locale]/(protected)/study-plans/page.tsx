import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { createStudyPlan } from './actions'
import { NewQuoteButton } from '@/components/study-plans/NewQuoteButton'
import { money, planGrandTotal } from '@/lib/study-plans/calculations'
import type { StudyPlanData, StudyPlanRow } from '@/lib/study-plans/types'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function StudyPlansPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)
  const supabase = await createClient()

  const { data: plans } = await (supabase as any)
    .from('study_plans')
    .select('id, title, student_name, applicant_type, status, data, updated_at, created_at, created_by, updated_by')
    .order('updated_at', { ascending: false })

  const rows = (plans ?? []) as StudyPlanRow[]

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, letterSpacing: '-0.04em', color: '#2A1153' }}>Cotações & Study Plans</h1>
          <p style={{ margin: '8px 0 0', color: 'rgba(28,18,51,0.62)', fontSize: 14 }}>
            Crie, simule e acompanhe planos de estudo com histórico de alterações.
          </p>
        </div>
        <form action={createStudyPlan.bind(null, locale)}>
          <NewQuoteButton />
        </form>
      </div>

      <div style={{ overflow: 'hidden', border: '1px solid rgba(28,18,51,0.08)', borderRadius: 16, background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Estudante', 'Tipo', 'Status', 'Total estimado', 'Atualizado', ''].map((header) => (
                <th key={header} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(28,18,51,0.54)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(28,18,51,0.08)' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 42, textAlign: 'center', color: 'rgba(28,18,51,0.54)' }}>
                  Nenhuma cotação ainda. Crie a primeira para começar.
                </td>
              </tr>
            ) : (
              rows.map((plan) => {
                const data = plan.data as StudyPlanData
                return (
                  <tr key={plan.id} style={{ borderBottom: '1px solid rgba(28,18,51,0.06)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/${locale}/study-plans/${plan.id}`} style={{ color: '#2A1153', fontWeight: 700, textDecoration: 'none' }}>
                        {plan.student_name || data.student || 'Sem estudante'}
                      </Link>
                      <div style={{ marginTop: 3, color: 'rgba(28,18,51,0.48)', fontSize: 12 }}>{plan.title}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(28,18,51,0.68)' }}>{plan.applicant_type}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ borderRadius: 999, padding: '3px 9px', background: 'rgba(75,26,119,0.1)', color: '#4B1A77', fontWeight: 700, fontSize: 11 }}>
                        {plan.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{money(planGrandTotal(data))}</td>
                    <td style={{ padding: '14px 16px', color: 'rgba(28,18,51,0.55)' }}>
                      {plan.updated_at ? new Date(plan.updated_at).toLocaleString('en-AU', { timeZone: 'Australia/Perth', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link href={`/${locale}/study-plans/${plan.id}/proposal`} style={{ color: '#4B1A77', fontWeight: 700, textDecoration: 'none', fontSize: 12 }}>
                        Proposta →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
