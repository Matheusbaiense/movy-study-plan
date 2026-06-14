import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { createStudyPlan } from './actions'
import { NewQuoteButton } from '@/components/study-plans/NewQuoteButton'
import { money, planGrandTotal } from '@/lib/study-plans/calculations'
import { color, ink, font, purpleA, t } from '@/lib/ui/theme'
import type { StudyPlanData, StudyPlanRow } from '@/lib/study-plans/types'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function StudyPlansPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from('study_plans')
    .select('id, title, student_name, applicant_type, status, data, updated_at, created_at, created_by, updated_by')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  const rows = (plans ?? []) as unknown as StudyPlanRow[]

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="movy-kicker">
            {locale === 'en' ? 'Proposals' : 'Propostas'}
          </div>
          <h1 style={{ margin: '8px 0 6px', fontFamily: font.display, fontSize: 'clamp(28px, 3.4vw, 38px)', fontWeight: 800, letterSpacing: '-0.04em', color: t.text }}>
            Cotações &amp; Study Plans
          </h1>
          <p style={{ margin: 0, color: ink(0.62), fontSize: 14 }}>
            Crie, simule e acompanhe planos de estudo com histórico de alterações.
          </p>
        </div>
        <form action={createStudyPlan.bind(null, locale)}>
          <NewQuoteButton />
        </form>
      </div>

      <div className="movy-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Estudante', 'Tipo', 'Status', 'Total estimado', 'Atualizado', ''].map((header) => (
                <th key={header} className="movy-kicker" style={{ padding: '13px 16px', textAlign: 'left', color: ink(0.45), fontSize: 10, borderBottom: `1px solid ${color.line}` }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <svg viewBox="0 0 120 120" width={52} height={52} aria-hidden style={{ color: color.purple, opacity: 0.16, margin: '0 auto' }}>
                    <use href="#movySymMono" />
                  </svg>
                  <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: t.text, marginTop: 14, letterSpacing: '-0.015em' }}>
                    Nenhuma cotação ainda
                  </div>
                  <div style={{ color: ink(0.5), fontSize: 13.5, marginTop: 4 }}>
                    Clique em <strong style={{ color: color.orange }}>+ Nova cotação</strong> para criar a primeira.
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((plan) => {
                const data = plan.data as StudyPlanData
                return (
                  <tr key={plan.id} style={{ borderBottom: `1px solid ${ink(0.06)}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/${locale}/study-plans/${plan.id}`} prefetch={false} style={{ fontFamily: font.display, color: t.text, fontWeight: 800, textDecoration: 'none' }}>
                        {plan.student_name || data.student || 'Sem estudante'}
                      </Link>
                      <div style={{ marginTop: 3, color: ink(0.48), fontSize: 12 }}>{plan.title}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: ink(0.68) }}>{plan.applicant_type}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ borderRadius: 999, padding: '3px 10px', background: purpleA(0.1), color: color.purple, fontWeight: 700, fontSize: 11, textTransform: 'capitalize' }}>
                        {plan.status === 'draft' && locale === 'pt' ? 'Rascunho' : plan.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: font.display, fontWeight: 800, color: t.text }}>{money(planGrandTotal(data))}</td>
                    <td style={{ padding: '14px 16px', fontFamily: font.mono, fontSize: 11, color: ink(0.55) }}>
                      {plan.updated_at ? new Date(plan.updated_at).toLocaleString('en-AU', { timeZone: 'Australia/Perth', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link href={`/${locale}/study-plans/${plan.id}/proposal`} prefetch={false} style={{ color: color.purple, fontWeight: 800, textDecoration: 'none', fontSize: 12, fontFamily: font.display }}>
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
