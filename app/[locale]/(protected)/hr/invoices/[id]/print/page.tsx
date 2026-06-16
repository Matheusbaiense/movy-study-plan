import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TaxInvoice } from '@/components/hr/TaxInvoice'
import { getInvoicePrintData, listRateRules } from '@/lib/hr'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function InvoicePrintPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect(`/${locale}/login`)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('id', user.id)
    .single()
  if (profileError || !profile) redirect(`/${locale}/login`)

  const rules = await listRateRules(supabase, profile.org_id)
  const data = await getInvoicePrintData(supabase, id, rules)
  if (!data) notFound()

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', background: 'var(--bg)' }}>
      <TaxInvoice data={data} locale={locale} />
    </div>
  )
}
