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
function fmtFull(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
}
function fmtRate(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 4 })
}

function niceTicks(lo: number, hi: number, count = 4): number[] {
  const span = hi - lo
  if (span <= 0) return [lo]
  const raw = span / (count - 1)
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(lo / step) * step
  const out: number[] = []
  for (let v = start; v <= hi + 1e-9; v += step) out.push(Math.round(v * 10000) / 10000)
  return out
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
    const pad = (max - min) * 0.16 || 0.05
    const lo = min - pad
    const hi = max + pad
    const x = (i: number) => (i / (n - 1)) * W
    const y = (r: number) => H - ((r - lo) / (hi - lo)) * H
    const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join(' ')
    const area = `0,${H} ${line} ${W},${H}`
    const ticks = niceTicks(lo, hi).filter((t) => y(t) >= 4 && y(t) <= H - 4)
    return { x, y, line, area, ticks }
  }, [pts, n])

  const first = pts[0]?.rate ?? 0
  const last = pts[n - 1]?.rate ?? 0
  const changePct = first && last ? ((last - first) / first) * 100 : 0
  const up = changePct >= 0
  const active = hover != null ? pts[hover] : null

  // Header shows the hovered day's rate when hovering; otherwise the current live rate.
  const headRate = active ? active.rate : current?.rate ?? last
  const headHint = active
    ? fmtFull(active.date)
    : current?.asOf
      ? `agora · ${new Date(current.asOf).toLocaleString('pt-BR', { timeZone: 'Australia/Perth', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (Perth)`
      : 'agora'

  function onMove(clientX: number, currentTarget: SVGSVGElement) {
    const rect = currentTarget.getBoundingClientRect()
    const vx = ((clientX - rect.left) / rect.width) * W
    const idx = Math.max(0, Math.min(n - 1, Math.round((vx / W) * (n - 1))))
    setHover(idx)
  }

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 18 }}>
      {/* Rate header (hover-aware) */}
      <div className="movy-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <span className="movy-kicker">1 AUD em Real {active ? '· no dia' : ''}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
            <span style={{ fontFamily: font.display, fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: color.purpleDeep, lineHeight: 1 }}>
              R$ {headRate ? fmtRate(headRate) : '—'}
            </span>
            {!active && current?.feePct != null && current.mid != null && (
              <span style={{ fontFamily: font.mono, fontSize: 12, color: ink(0.5) }}>mid {fmtRate(current.mid)} + {current.feePct}% Wise</span>
            )}
          </div>
          <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 11, color: ink(0.45) }}>
            {active ? '' : current?.source ? `Fonte ${current.source} · ` : ''}{headHint}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="movy-kicker">Cotação AUD → BRL</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                style={{
                  padding: '6px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: font.ui, cursor: 'pointer',
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
              style={{ display: 'block', overflow: 'hidden', touchAction: 'none', cursor: 'crosshair' }}
              onPointerMove={(e) => onMove(e.clientX, e.currentTarget)}
              onPointerDown={(e) => onMove(e.clientX, e.currentTarget)}
              onPointerLeave={() => setHover(null)}
            >
              <defs>
                <linearGradient id="fxArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color.purple} stopOpacity="0.16" />
                  <stop offset="1" stopColor={color.purple} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* gridlines */}
              {geo.ticks.map((t) => (
                <line key={t} x1={0} y1={geo.y(t)} x2={W} y2={geo.y(t)} stroke={ink(0.08)} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
              <polygon points={geo.area} fill="url(#fxArea)" />
              <polyline points={geo.line} fill="none" stroke={color.purple} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <circle cx={geo.x(n - 1)} cy={geo.y(last)} r="3.5" fill={color.gold} stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              {active && hover != null && (
                <>
                  <line x1={geo.x(hover)} y1={0} x2={geo.x(hover)} y2={H} stroke={color.purple} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                  <circle cx={geo.x(hover)} cy={geo.y(active.rate)} r="4.5" fill={color.purpleDeep} stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </>
              )}
            </svg>

            {/* y-axis labels (right gutter) */}
            {geo.ticks.map((t) => (
              <span key={t} style={{ position: 'absolute', right: 0, top: geo.y(t), transform: 'translateY(-50%)', fontFamily: font.mono, fontSize: 10.5, color: ink(0.5), background: '#fff', padding: '1px 4px', borderRadius: 3 }}>
                {fmtRate(t)}
              </span>
            ))}

            {/* hover tooltip */}
            {active && hover != null && (
              <div style={{ position: 'absolute', top: -4, left: `${(geo.x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? '-105%' : '8px'})`, pointerEvents: 'none', background: color.purpleDeep, color: '#fff', borderRadius: 8, padding: '6px 10px', fontFamily: font.mono, fontSize: 11, whiteSpace: 'nowrap', boxShadow: '0 8px 20px -8px rgba(42,17,83,0.5)', zIndex: 2 }}>
                <div style={{ color: color.gold, fontWeight: 700 }}>R$ {fmtRate(active.rate)}</div>
                <div style={{ opacity: 0.75 }}>{fmtFull(active.date)}</div>
              </div>
            )}

            {/* x labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: font.mono, fontSize: 10.5, color: ink(0.42) }}>
              <span>{fmtDay(pts[0]?.date ?? '')}</span>
              <span>{fmtDay(pts[Math.floor(n / 2)]?.date ?? '')}</span>
              <span>{fmtDay(pts[n - 1]?.date ?? '')}</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, fontFamily: font.mono, fontSize: 10.5, color: ink(0.4), lineHeight: 1.5 }}>
          Série mid-market{hist?.source ? ` · fonte ${hist.source}` : ''}. Passe o mouse (ou toque) no gráfico para ver a cotação de cada dia. A taxa usada nas propostas/calculadora inclui a taxa da Wise.
        </div>
      </div>
    </div>
  )
}
