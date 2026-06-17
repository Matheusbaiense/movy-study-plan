'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { color, ink, font, t } from '@/lib/ui/theme'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Point { date: string; rate: number }
interface History { points: Point[]; source: string }
interface Current { rate: number; asOf: string | null; source: string | null; mid: number | null; feePct: number | null }

const RANGES = [
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
  { days: 365, label: '12 meses' },
]

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

/** Build a plain-text summary for screen readers describing the visible trend. */
function buildAriaLabel(pts: Point[], days: number, changePct: number): string {
  if (pts.length < 2) return 'Gráfico AUD→BRL sem dados suficientes.'
  const first = pts[0]
  const last = pts[pts.length - 1]
  const direction = changePct >= 0 ? 'alta' : 'baixa'
  const period = days === 30 ? '30 dias' : days === 90 ? '90 dias' : '12 meses'
  return (
    `Gráfico de cotação AUD→BRL nos últimos ${period}. ` +
    `Em ${fmtFull(first.date)} a cotação era R$ ${fmtRate(first.rate)}. ` +
    `Em ${fmtFull(last.date)} era R$ ${fmtRate(last.rate)}. ` +
    `Variação de ${Math.abs(changePct).toFixed(2)}% de ${direction}.`
  )
}

export function FxChart() {
  const [days, setDays] = useState(90)
  const [retryKey, setRetryKey] = useState(0)
  const [hist, setHist] = useState<History | null>(null)
  const [current, setCurrent] = useState<Current | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  // Respect prefers-reduced-motion for any entrance/transition effects
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Measure the real pixel width so the SVG renders 1:1 (no non-uniform scaling,
  // which was causing a raster hang / white screen).
  const wrapRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(700)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width
      if (cw && cw > 0) setW(Math.round(cw))
    })
    ro.observe(el)
    if (el.clientWidth > 0) setW(Math.round(el.clientWidth))
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    fetch('/api/fx', { cache: 'no-store' }).then((r) => r.json()).then(setCurrent).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    setHist(null)
    setHover(null)
    fetch(`/api/fx/history?days=${days}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => { if (active) setHist(j) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [days, retryKey])

  const pts = useMemo(() => hist?.points ?? [], [hist])
  const n = pts.length

  const geo = useMemo(() => {
    if (n < 2 || w < 2) return null
    const rates = pts.map((p) => p.rate)
    const min = Math.min(...rates)
    const max = Math.max(...rates)
    const pad = (max - min) * 0.16 || 0.05
    const lo = min - pad
    const hi = max + pad
    const x = (i: number) => (i / (n - 1)) * w
    const y = (r: number) => H - ((r - lo) / (hi - lo)) * H
    const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join(' ')
    const area = `0,${H} ${line} ${w},${H}`
    const ticks = niceTicks(lo, hi).filter((t) => y(t) >= 4 && y(t) <= H - 4)
    return { x, y, line, area, ticks }
  }, [pts, n, w])

  const first = pts[0]?.rate ?? 0
  const last = pts[n - 1]?.rate ?? 0
  const changePct = first && last ? ((last - first) / first) * 100 : 0
  const up = changePct >= 0
  const active = hover != null ? pts[hover] : null

  const headRate = active ? active.rate : current?.rate ?? last
  const headHint = active
    ? fmtFull(active.date)
    : current?.asOf
      ? `agora · ${new Date(current.asOf).toLocaleString('pt-BR', { timeZone: 'Australia/Perth', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (Perth)`
      : 'agora'

  function onMove(clientX: number, el: SVGSVGElement) {
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const idx = Math.max(0, Math.min(n - 1, Math.round(((clientX - rect.left) / rect.width) * (n - 1))))
    setHover(idx)
  }

  // Keyboard navigation: left/right arrows move the hover position
  function onKeyDown(e: React.KeyboardEvent) {
    if (!geo || n < 2) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setHover((h) => Math.min(n - 1, (h ?? n - 1) + 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setHover((h) => Math.max(0, (h ?? 0) - 1))
    } else if (e.key === 'Escape') {
      setHover(null)
    }
  }

  const chartAriaLabel = useMemo(
    () => buildAriaLabel(pts, days, changePct),
    [pts, days, changePct]
  )

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 18 }}>
      {/* Rate header (hover-aware) */}
      <div className="movy-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <span className="movy-kicker">1 AUD em Real {active ? '· no dia' : ''}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
            <span style={{ fontFamily: font.display, fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 600, letterSpacing: '-0.03em', color: t.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              R$ {headRate ? fmtRate(headRate) : '—'}
            </span>
            {!active && current?.feePct != null && current.mid != null && (
              <span style={{ fontFamily: font.mono, fontSize: 12, color: ink(0.5), fontVariantNumeric: 'tabular-nums' }}>mid {fmtRate(current.mid)} + {current.feePct}% Wise</span>
            )}
          </div>
          <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 11, color: ink(0.45) }}>
            {active ? '' : current?.source ? `Fonte ${current.source} · ` : ''}{headHint}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="movy-kicker" style={{ color: ink(0.4) }}>Variação · {RANGES.find((r) => r.days === days)?.label}</div>
          <div style={{ marginTop: 6, fontFamily: font.display, fontSize: 24, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: up ? '#1F8A4C' : color.red }}>
            {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="movy-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="movy-kicker">Cotação AUD → BRL</span>
          <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Selecionar período">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                aria-pressed={days === r.days}
                style={{
                  padding: '6px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: font.ui, cursor: 'pointer',
                  border: `1px solid ${days === r.days ? color.purpleDeep : t.border}`,
                  background: days === r.days ? color.purpleDeep : t.surface,
                  color: days === r.days ? '#fff' : ink(0.6),
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={wrapRef} style={{ position: 'relative' }}>
          {loading ? (
            /* Skeleton placeholder while fetching — avoids empty axis frame */
            <Skeleton height={H} style={{ borderRadius: 8 }} />
          ) : error || !geo ? (
            /* Meaningful empty/error state */
            <EmptyState
              icon={TrendingUp}
              title="Dados indisponíveis"
              description="Não foi possível carregar a cotação histórica para este período. Tente novamente."
              action={
                <button
                  onClick={() => setRetryKey((k) => k + 1)}
                  style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surface, cursor: 'pointer', fontFamily: font.ui, fontSize: 13, fontWeight: 600, color: t.text }}
                >
                  Tentar novamente
                </button>
              }
            />
          ) : (
            <>
              {/* SVG chart — role="img" with descriptive aria-label for screen readers.
                  tabIndex=0 + onKeyDown enables keyboard scrubbing (← / →). */}
              <svg
                role="img"
                aria-label={chartAriaLabel}
                tabIndex={0}
                viewBox={`0 0 ${w} ${H}`}
                width="100%"
                height={H}
                style={{
                  display: 'block',
                  touchAction: 'none',
                  cursor: 'crosshair',
                  outline: 'none',
                  /* Respect prefers-reduced-motion: disable any CSS transitions on this element */
                  transition: prefersReducedMotion.current ? 'none' : undefined,
                }}
                onPointerMove={(e) => onMove(e.clientX, e.currentTarget)}
                onPointerDown={(e) => onMove(e.clientX, e.currentTarget)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => { /* keep current hover or set to last point */ }}
                onBlur={() => setHover(null)}
                onKeyDown={onKeyDown}
              >
                <defs>
                  <linearGradient id="fxArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={color.purple} stopOpacity="0.16" />
                    <stop offset="1" stopColor={color.purple} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {geo.ticks.map((tick) => (
                  <line key={tick} x1={0} y1={geo.y(tick)} x2={w} y2={geo.y(tick)} stroke={ink(0.08)} strokeWidth="1" />
                ))}
                <polygon points={geo.area} fill="url(#fxArea)" />
                {/* Stroke width slightly increased so data line isn't conveyed by color alone */}
                <polyline points={geo.line} fill="none" stroke={color.purple} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {/* Gold dot marks the latest rate — labelled via parent aria-label */}
                <circle cx={geo.x(n - 1)} cy={geo.y(last)} r="4" fill={color.gold} stroke="#fff" strokeWidth="2" />
                {active && hover != null && (
                  <>
                    <line x1={geo.x(hover)} y1={0} x2={geo.x(hover)} y2={H} stroke={color.purple} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx={geo.x(hover)} cy={geo.y(active.rate)} r="4.5" fill={color.purpleDeep} stroke="#fff" strokeWidth="2" />
                  </>
                )}
              </svg>

              {geo.ticks.map((tick) => (
                <span key={tick} aria-hidden="true" style={{ position: 'absolute', right: 0, top: geo.y(tick), transform: 'translateY(-50%)', fontFamily: font.mono, fontSize: 10.5, fontVariantNumeric: 'tabular-nums', color: ink(0.55), background: t.surface, padding: '1px 4px', borderRadius: 3, pointerEvents: 'none' }}>
                  {fmtRate(tick)}
                </span>
              ))}

              {active && hover != null && (
                <div aria-hidden="true" style={{ position: 'absolute', top: -4, left: `${(geo.x(hover) / w) * 100}%`, transform: `translateX(${hover > n / 2 ? '-105%' : '8px'})`, pointerEvents: 'none', background: color.purpleDeep, color: '#fff', borderRadius: 8, padding: '6px 10px', fontFamily: font.mono, fontSize: 11, whiteSpace: 'nowrap', boxShadow: '0 8px 20px -8px rgba(42,17,83,0.5)', zIndex: 2 }}>
                  <div style={{ color: color.gold, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>R$ {fmtRate(active.rate)}</div>
                  <div style={{ opacity: 0.75 }}>{fmtFull(active.date)}</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: font.mono, fontSize: 10.5, color: ink(0.42) }}>
                <span>{fmtDay(pts[0]?.date ?? '')}</span>
                <span>{fmtDay(pts[Math.floor(n / 2)]?.date ?? '')}</span>
                <span>{fmtDay(pts[n - 1]?.date ?? '')}</span>
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 14, fontFamily: font.mono, fontSize: 10.5, color: ink(0.4), lineHeight: 1.5 }}>
          Série mid-market{hist?.source ? ` · fonte ${hist.source}` : ''}. Passe o mouse (ou toque) no gráfico para ver a cotação de cada dia. Use ← / → para navegar pelo teclado. A taxa usada nas propostas/calculadora inclui a taxa da Wise.
        </div>
      </div>
    </div>
  )
}
