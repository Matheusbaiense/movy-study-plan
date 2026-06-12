'use client'

import { useEffect, useMemo, useState } from 'react'
import { color, ink, font } from '@/lib/ui/theme'

interface Point { date: string; rate: number }

const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })

function summarize(points: Point[]) {
  const rates = points.map((p) => p.rate)
  if (rates.length < 2) return null
  const high = Math.max(...rates)
  const low = Math.min(...rates)
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length
  const change = ((rates[rates.length - 1]! - rates[0]!) / rates[0]!) * 100
  return { high, low, avg, change }
}

export function FxStats() {
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fx/history?days=90', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setPoints(Array.isArray(j.points) ? j.points : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const s90 = useMemo(() => summarize(points), [points])
  const s30 = useMemo(() => summarize(points.slice(-30)), [points])

  return (
    <div className="movy-card" style={{ padding: '20px 22px' }}>
      <span className="movy-kicker">1 AUD para BRL · estatísticas</span>

      {loading ? (
        <div style={{ padding: '28px 0', color: ink(0.4), fontSize: 13 }}>Carregando estatísticas…</div>
      ) : !s30 || !s90 ? (
        <div style={{ padding: '28px 0', color: ink(0.4), fontSize: 13 }}>Sem dados suficientes.</div>
      ) : (
        <div className="grid-cols-1 lg:grid-cols-2" style={{ display: 'grid', gap: 22, marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th className="movy-kicker" style={{ ...thS }} />
                <th className="movy-kicker" style={{ ...thS, textAlign: 'right' }}>30 dias</th>
                <th className="movy-kicker" style={{ ...thS, textAlign: 'right' }}>90 dias</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Máxima" a={fmt(s30.high)} b={fmt(s90.high)} />
              <Row label="Mínima" a={fmt(s30.low)} b={fmt(s90.low)} />
              <Row label="Média" a={fmt(s30.avg)} b={fmt(s90.avg)} />
              <Row
                label="Variação"
                a={`${s30.change >= 0 ? '+' : ''}${s30.change.toFixed(2)}%`}
                b={`${s90.change >= 0 ? '+' : ''}${s90.change.toFixed(2)}%`}
                colorA={s30.change >= 0 ? '#1F8A4C' : color.red}
                colorB={s90.change >= 0 ? '#1F8A4C' : color.red}
              />
            </tbody>
          </table>

          <div style={{ display: 'grid', gap: 12, fontSize: 13.5, color: ink(0.62), lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>
              Nos <strong style={{ color: color.purpleDeep }}>últimos 30 dias</strong>, o AUD→BRL teve máxima de <strong style={{ color: color.purpleDeep }}>{fmt(s30.high)}</strong> e mínima de <strong style={{ color: color.purpleDeep }}>{fmt(s30.low)}</strong>, com média de {fmt(s30.avg)}. Variação de <strong style={{ color: s30.change >= 0 ? '#1F8A4C' : color.red }}>{s30.change.toFixed(2)}%</strong>.
            </p>
            <p style={{ margin: 0 }}>
              Nos <strong style={{ color: color.purpleDeep }}>últimos 90 dias</strong>, máxima de <strong style={{ color: color.purpleDeep }}>{fmt(s90.high)}</strong> e mínima de <strong style={{ color: color.purpleDeep }}>{fmt(s90.low)}</strong>, média de {fmt(s90.avg)}. Variação de <strong style={{ color: s90.change >= 0 ? '#1F8A4C' : color.red }}>{s90.change.toFixed(2)}%</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, a, b, colorA, colorB }: { label: string; a: string; b: string; colorA?: string; colorB?: string }) {
  return (
    <tr style={{ borderTop: `1px solid ${color.line}` }}>
      <td style={{ padding: '12px 0', color: ink(0.6), fontWeight: 600 }}>{label}</td>
      <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: font.display, fontWeight: 800, color: colorA ?? color.purpleDeep }}>{a}</td>
      <td style={{ padding: '12px 0', textAlign: 'right', fontFamily: font.display, fontWeight: 800, color: colorB ?? color.purpleDeep }}>{b}</td>
    </tr>
  )
}

const thS: React.CSSProperties = { padding: '0 0 8px', fontSize: 10, color: ink(0.42), textAlign: 'left', borderBottom: `1px solid ${color.line}` }
