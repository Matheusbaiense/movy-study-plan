'use client'

import { useCallback, useEffect, useState } from 'react'
import { color, ink, font, t } from '@/lib/ui/theme'

const round2 = (n: number) => Math.round(n * 100) / 100
const FX_TIMEOUT_MS = 8000

export function FxConverter() {
  const [rate, setRate] = useState<number | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [asOf, setAsOf] = useState<string | null>(null)
  const [aud, setAud] = useState(1000)
  const [brl, setBrl] = useState(0)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load (or retry) the live rate. Aborts after a timeout so a hung request
  // surfaces as a retryable error instead of an indefinite "Carregando…".
  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FX_TIMEOUT_MS)
    try {
      const r = await fetch('/api/fx', { cache: 'no-store', signal: controller.signal })
      const j = await r.json()
      if (typeof j.rate === 'number' && j.rate > 0) {
        setRate(j.rate)
        setSource(j.source ?? null)
        setAsOf(j.asOf ?? null)
        setBrl((prev) => (prev === 0 ? round2(aud * j.rate) : prev))
      } else {
        setFailed(true)
      }
    } catch {
      setFailed(true)
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  function onAud(v: number) {
    setAud(v)
    if (rate) setBrl(round2(v * rate))
  }
  function onBrl(v: number) {
    setBrl(v)
    if (rate) setAud(round2(v / rate))
  }

  const stamp = asOf
    ? new Date(asOf).toLocaleString('pt-BR', { timeZone: 'Australia/Perth', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="movy-card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="movy-kicker">Conversor</span>
        {rate && <span style={{ fontFamily: font.mono, fontSize: 11, color: ink(0.62), fontVariantNumeric: 'tabular-nums' }}>1 AUD = R$ {rate.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 4 })}</span>}
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignItems: 'end' }}>
        <Money label="Tenho (AUD)" code="A$" value={aud} onChange={onAud} accent={color.purple} />
        <Money label="Equivale a (BRL)" code="R$" value={brl} onChange={onBrl} accent={color.orange} />
      </div>

      <div style={{ marginTop: 14, fontFamily: font.mono, fontSize: 10.5, color: ink(0.62), lineHeight: 1.5 }}>
        {rate
          ? <>Convertido pela taxa{source ? ` ${source}` : ''}{stamp ? ` · ${stamp} (Perth)` : ''}. É a mesma taxa usada nas propostas e na calculadora.</>
          : failed
            ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: color.red }}>Não foi possível obter a cotação agora.</span>
                <button
                  type="button"
                  onClick={load}
                  disabled={loading}
                  style={{ border: `1px solid ${ink(0.2)}`, borderRadius: 8, padding: '4px 10px', background: t.surface, color: t.text, fontFamily: font.ui, fontSize: 11, fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}
                >
                  {loading ? 'Tentando…' : 'Tentar novamente'}
                </button>
              </span>
            )
            : 'Carregando cotação…'}
      </div>
    </div>
  )
}

function Money({ label, code, value, onChange, accent }: { label: string; code: string; value: number; onChange: (v: number) => void; accent: string }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: ink(0.5), textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${ink(0.14)}`, borderRadius: 12, padding: '4px 14px', background: t.surfaceSunken }}>
        <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 18, color: accent }}>{code}</span>
        <input
          type="number"
          inputMode="decimal"
          className="movy-field-control"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const n = Number.parseFloat(e.target.value)
            onChange(Number.isFinite(n) ? n : 0)
          }}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(22px, 3.2vw, 30px)', letterSpacing: '-0.02em', color: t.text, padding: '10px 0', fontVariantNumeric: 'tabular-nums' }}
        />
      </div>
    </label>
  )
}
