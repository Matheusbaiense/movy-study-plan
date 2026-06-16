import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'
import { TaxInvoice } from '@/components/hr/TaxInvoice'
import { getInvoicePrintData, listRateRules } from '@/lib/hr'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function InvoicePrintPage({ params }: Props) {
  const { locale, id } = await params
  const [{ profile }, supabase] = await Promise.all([
    getUser(locale),
    createClient(),
  ])

  const rules = await listRateRules(supabase, profile.org_id)
  const data = await getInvoicePrintData(supabase, id, rules)
  if (!data) notFound()

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', background: 'var(--bg)' }}>
      <TaxInvoice data={data} locale={locale} />
    </div>
  )
}
