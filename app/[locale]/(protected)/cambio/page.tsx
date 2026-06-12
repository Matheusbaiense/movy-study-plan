import { getUser } from '@/lib/auth/get-user'
import { FxChart } from '@/components/cambio/FxChart'
import { color, ink, font } from '@/lib/ui/theme'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CambioPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)
  const isEn = locale === 'en'

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <header>
        <div className="movy-kicker">Movy Internal Hub</div>
        <h1 style={{ margin: '8px 0 6px', fontFamily: font.display, fontSize: 'clamp(28px, 3.6vw, 40px)', fontWeight: 800, letterSpacing: '-0.04em', color: color.purpleDeep }}>
          {isEn ? 'Exchange rate' : 'Câmbio'}
        </h1>
        <p style={{ margin: 0, fontSize: 14.5, color: ink(0.62), maxWidth: 600, lineHeight: 1.55 }}>
          {isEn
            ? 'Live and historical AUD→BRL rate, using the real Wise rate (with fees) in proposals and the calculator.'
            : 'Cotação AUD→BRL ao vivo e histórica, com a taxa real da Wise (com taxas) usada nas propostas e na calculadora.'}
        </p>
      </header>
      <FxChart />
    </div>
  )
}
