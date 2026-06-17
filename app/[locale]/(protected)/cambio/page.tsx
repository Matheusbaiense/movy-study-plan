import { getUser } from '@/lib/auth/get-user'
import { FxChart } from '@/components/cambio/FxChart'
import { FxConverter } from '@/components/cambio/FxConverter'
import { FxStats } from '@/components/cambio/FxStats'
import { FxRatesTable } from '@/components/cambio/FxRatesTable'
import { PageHeader } from '@/components/ui/PageHeader'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CambioPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)
  const isEn = locale === 'en'

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <PageHeader
        eyebrow="Movy Internal Hub"
        title={isEn ? 'Exchange rate' : 'Câmbio'}
        description={
          isEn
            ? 'Live and historical AUD→BRL rate, converter and stats — using the real Wise rate (with fees) in proposals and the calculator.'
            : 'Cotação AUD→BRL ao vivo e histórica, conversor e estatísticas — com a taxa real da Wise (com taxas) usada nas propostas e na calculadora.'
        }
      />

      <FxConverter />
      <FxChart />
      <FxStats />
      <FxRatesTable />
    </div>
  )
}
