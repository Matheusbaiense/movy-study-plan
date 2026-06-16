'use client'

import { t, ink, color, font } from '@/lib/ui/theme'

interface RateCardProps {
  rateCents: number
  locale: string
}

export function RateCard({ rateCents, locale }: RateCardProps) {
  const pt = locale === 'pt'
  const rate = (rateCents / 100).toFixed(2)
  const isUnset = rateCents === 0

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${isUnset ? 'rgba(245,158,11,0.3)' : ink(0.1)}`,
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: t.textMuted, marginBottom: 6,
      }}>
        {pt ? 'Seu rate / hora' : 'Your rate / hour'}
      </div>
      {isUnset ? (
        <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 10px', marginTop: 4 }}>
          {pt
            ? 'Rate não configurado — fale com o administrador.'
            : 'Rate not set — contact your admin.'}
        </div>
      ) : (
        <div style={{
          fontSize: 24, fontWeight: 800, color: color.purple,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          fontFamily: font.display,
        }}>
          AU${rate}<span style={{ fontSize: 12, fontWeight: 400, color: t.textMuted }}>/hr</span>
        </div>
      )}
    </div>
  )
}
