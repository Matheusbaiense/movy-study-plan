import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { listInvoices, listEmployees } from '@/lib/hr'
import { GenerateInvoiceForm } from './GenerateInvoiceForm'
import { formatAUD } from '@/lib/hr/calculations'
import { t, font, ink } from '@/lib/ui/theme'

interface Props { params: Promise<{ locale: string }> }

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  draft:  { label: 'Draft',  color: '#374151', bg: '#f3f4f6' },
  issued: { label: 'Issued', color: '#1d4ed8', bg: '#dbeafe' },
  paid:   { label: 'Paid',   color: '#166534', bg: '#dcfce7' },
}

export default async function InvoicesPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect(`/${locale}/login`)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('id', user.id)
    .single()
  if (profileError || !profile) redirect(`/${locale}/login`)

  const [invoices, employees] = await Promise.all([
    listInvoices(supabase, profile.org_id),
    listEmployees(supabase, profile.org_id),
  ])

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, margin: 0 }}>
          Tax Invoices
        </h1>
        <GenerateInvoiceForm employees={employees} locale={locale} orgId={profile.org_id} />
      </div>

      <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, overflow: 'hidden' }}>
        {invoices.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
            {locale === 'pt' ? 'Nenhuma invoice gerada ainda.' : 'No invoices generated yet.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${ink(0.1)}` }}>
                {['Invoice #', 'Period', 'Total', 'Status', 'Issued', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: t.textMuted, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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
                        fontSize: 12, color: '#4B1A77', fontWeight: 600, textDecoration: 'none',
                      }}>
                        View / Print →
                      </Link>
                    </td>
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
