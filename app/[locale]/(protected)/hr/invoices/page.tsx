import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { listInvoicesWithEmployeeName, listEmployeesWithNames, isHrAdmin } from '@/lib/hr'
import { GenerateInvoiceForm } from './GenerateInvoiceForm'
import { InvoiceEmployeeFilter } from '@/components/hr/InvoiceEmployeeFilter'
import { IssueInvoiceButton } from '@/components/hr/IssueInvoiceButton'
import { formatAUD } from '@/lib/hr/calculations'
import { t, ink } from '@/lib/ui/theme'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ employee?: string }>
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  draft:  { label: 'Draft',  color: '#374151', bg: '#f3f4f6' },
  issued: { label: 'Issued', color: '#1d4ed8', bg: '#dbeafe' },
  paid:   { label: 'Paid',   color: '#166534', bg: '#dcfce7' },
}

export default async function InvoicesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { employee: employeeFilter } = await searchParams
  const [{ profile }, supabase] = await Promise.all([
    getUser(locale),
    createClient(),
  ])

  const isAdmin = isHrAdmin(profile.role)

  let myEmployeeId: string | undefined
  if (!isAdmin) {
    const { data: myEmp } = await supabase
      .from('employee_profiles')
      .select('id')
      .eq('org_id', profile.org_id)
      .eq('profile_id', profile.id)
      .is('deleted_at', null)
      .maybeSingle()
    myEmployeeId = myEmp?.id
  }

  const [invoices, employees] = await Promise.all([
    listInvoicesWithEmployeeName(supabase, profile.org_id, {
      employeeId: isAdmin ? (employeeFilter || undefined) : myEmployeeId,
    }),
    isAdmin ? listEmployeesWithNames(supabase, profile.org_id) : Promise.resolve([]),
  ])

  const draftCount = invoices.filter(i => i.status === 'draft').length
  const pt = locale === 'pt'

  const tableHeaders = isAdmin
    ? ['Invoice #', pt ? 'Funcionário' : 'Employee', 'Period', 'Total', 'Status', 'Issued', '', '']
    : ['Invoice #', pt ? 'Funcionário' : 'Employee', 'Period', 'Total', 'Status', 'Issued', '']

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        eyebrow={`${pt ? 'Operações' : 'Operations'} › HR`}
        title="Tax Invoices"
        actions={isAdmin ? <GenerateInvoiceForm employees={employees} locale={locale} orgId={profile.org_id} /> : undefined}
      />

      {isAdmin && employees.length > 0 && (
        <InvoiceEmployeeFilter
          employees={employees}
          currentEmployeeId={employeeFilter}
          locale={locale}
        />
      )}

      {isAdmin && draftCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          padding: '10px 16px', borderRadius: 10,
          background: '#fffbeb', border: '1px solid #fcd34d',
        }}>
          <span style={{ fontSize: 15 }}>⚠️</span>
          <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
            {pt
              ? `${draftCount} invoice(s) em rascunho — clique em "Emitir →" para enviar ao funcionário.`
              : `${draftCount} draft invoice(s) pending — click "Issue →" to send to employees.`}
          </span>
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, overflow: 'hidden' }}>
        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={pt ? 'Nenhuma invoice gerada ainda' : 'No invoices yet'}
            description={pt
              ? 'Clique em "Gerar Invoice" acima para criar a primeira.'
              : 'Click "Generate Invoice" above to create the first one.'}
          />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${ink(0.1)}` }}>
                {tableHeaders.map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: t.textMuted, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const badge = STATUS_BADGE[inv.status] ?? STATUS_BADGE.draft
                return (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${ink(0.06)}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: t.text, fontFamily: 'monospace' }}>{inv.invoice_number}</td>
                    <td style={{ padding: '12px 16px', color: t.text }}>{inv.full_name || inv.email || '—'}</td>
                    <td style={{ padding: '12px 16px', color: t.textMuted }}>{inv.period_start} → {inv.period_end}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: t.text, fontVariantNumeric: 'tabular-nums' }}>{formatAUD(inv.total_cents)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: badge.color, background: badge.bg }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: t.textMuted }}>
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-AU') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/${locale}/hr/invoices/${inv.id}/print`} prefetch={false} style={{
                        fontSize: 12, color: t.accent, fontWeight: 600, textDecoration: 'none',
                      }}>
                        {pt ? 'Ver / Imprimir →' : 'View / Print →'}
                      </Link>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '12px 16px' }}>
                        {inv.status === 'draft' && (
                          <IssueInvoiceButton invoiceId={inv.id} locale={locale} />
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
