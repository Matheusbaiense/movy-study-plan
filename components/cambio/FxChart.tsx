'use client'

import { useEffect, useMemo, useState } from 'react'
import { color, ink, font } from '@/lib/ui/theme'

interface Point { date: string; rate: number }
interface History { points: Point[]; source: string }
interface Current { rate: number; asOf: string | null; source: string | null; mid: number | null; feePct: number | null }

const RANGES = [
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
  { days: 365, label: '12 meses' },
]

const W = 760
const H = 240

function fmtDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
function fmtRate(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 4 })
}

export function FxChart() {
  const [days, setDays] = useState(90)
  const [hist, setHist] = useState<History | null>(null)
  const [current, setCurrent] = useState<Current | null>(null)
  const [loading, setLoading] = useState(true)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/fx', { cache: 'no-store' }).then((r) => r.json()).then(setCurrent).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setHover(null)
    fetch(`/api/fx/history?days=${days}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => { if (active) setHist(j) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [days])

  const pts = hist?.points ?? []
  const n = pts.length

  const geo = useMemo(() => {
    if (n < 2) return null
    const rates = pts.map((p) => p.rate)
    const min = Math.min(...rates)
    const max = Math.max(...rates)
    const pad = (max - min) * 0.14 || 0.05
    const lo = min - pad
    const hi = max + pad
    const x = (i: number) => (i / (n - 1)) * W
    const y = (r: number) => H - ((r - lo) / (hi - lo)) * H
    const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join(' ')
    const area = `0,${H} ${line} ${W},${H}`
    return { x, y, line, area, min, max }
  }, [pts, n])

  const first = pts[0]?.rate
  const last = pts[n - 1]?.rate
  const changePct = first && last ? ((last - first) / first) * 100 : 0
  const up = changePct >= 0
  const hi = hover != null ? pts[hover] : null

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 18 }}>
      {/* Current rate header */}
      <div className="movy-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <span className="movy-kicker">1 AUD em Real</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
            <span style={{ fontFamily: font.display, fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: color.purpleDeep, lineHeight: 1 }}>
              R$ {current ? fmtRate(current.rate) : '—'}
            </span>
            {current?.feePct != null && current.mid != null && (
              <span style={{ fontFamily: font.mono, fontSize: 12, color: ink(0.5) }}>mid {fmtRate(current.mid)} + {current.feePct}% Wise</span>
            )}
          </div>
          <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 11, color: ink(0.45) }}>
            {current?.source ? `Fonte ${current.source}` : 'Cotação'}
            {current?.asOf ? ` · ${new Date(current.asOf).toLocaleString('pt-BR', { timeZone: 'Australia/Perth', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (Perth)` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="movy-kicker" style={{ color: ink(0.4) }}>Variação · {RANGES.find((r) => r.days === days)?.label}</div>
          <div style={{ marginTop: 6, fontFamily: font.display, fontSize: 24, fontWeight: 800, color: up ? '#1F8A4C' : color.red }}>
            {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="movy-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="movy-kicker">Cotação AUD → BRL</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: font.ui, cursor: 'pointer',
                  border: `1px solid ${days === r.days ? color.purpleDeep : color.line}`,
                  background: days === r.days ? color.purpleDeep : '#fff',
                  color: days === r.days ? '#fff' : ink(0.6),
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ height: H, display: 'grid', placeItems: 'center', color: ink(0.4), fontSize: 13 }}>Carregando cotação…</div>
        ) : !geo ? (
          <div style={{ height: H, display: 'grid', placeItems: 'center', color: ink(0.4), fontSize: 13 }}>Sem dados de cotação para este período.</div>
        ) : (
          <div style={{ position: 'relative' }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              height={H}
              preserveAspectRatio="none"
              style={{ display: 'block', overflow: 'visible' }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const vx = ((e.clientX - rect.left) / rect.width) * W
                const idx = Math.max(0, Math.min(n - 1, Math.round((vx / W) * (n - 1))))
                setHover(idx)
              }}
              onMouseLeave={() => setHover(null)}
            >
              <defs>
                <linearGradient id="fxArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color.purple} stopOpacity="0.18" />
                  <stop offset="1" stopColor={color.purple} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={geo.area} fill="url(#fxArea)" />
              <polyline points={geo.line} fill="none" stroke={color.purple} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {/* last point */}
              <circle cx={geo.x(n - 1)} cy={geo.y(last)} r="3.5" fill={color.gold} stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              {/* hover */}
              {hi && hover != null && (
                <>
                  <line x1={geo.x(hover)} y1={0} x2={geo.x(hover)} y2={H} stroke={ink(0.18)} strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                  <circle cx={geo.x(hover)} cy={geo.y(hi.rate)} r="4" fill={color.purpleDeep} stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </>
              )}
            </svg>

            {/* hover tooltip */}
            {hi && hover != null && (
              <div style={{ position: 'absolute', top: -6, left: `${(geo.x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? '-105%' : '8px'})`, pointerEvents: 'none', background: color.purpleDeep, color: '#fff', borderRadius: 8, padding: '6px 9px', fontFamily: font.mono, fontSize: 11, whiteSpace: 'nowrap', boxShadow: '0 8px 20px -8px rgba(42,17,83,0.5)' }}>
                <div style={{ color: color.gold, fontWeight: 700 }}>R$ {fmtRate(hi.rate)}</div>
                <div style={{ opacity: 0.7 }}>{fmtDay(hi.date)}</div>
              </div>
            )}

            {/* x labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: font.mono, fontSize: 10.5, color: ink(0.42) }}>
              <span>{fmtDay(pts[0].date)}</span>
              <span>{fmtDay(pts[Math.floor(n / 2)].date)}</span>
              <span>{fmtDay(pts[n - 1].date)}</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, fontFamily: font.mono, fontSize: 10.5, color: ink(0.4), lineHeight: 1.5 }}>
          Série mid-market{hist?.source ? ` · fonte ${hist.source}` : ''}. A taxa usada nas cotações/calculadora inclui a taxa da Wise.
        </div>
      </div>
    </div>
  )
}
