'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { TrendingDown } from 'lucide-react'
import { color, ink, font, t } from '@/lib/ui/theme'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

const AMOUNTS = [1, 5, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000, 10000]
const money = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const intFmt = (n: number) => n.toLocaleString('pt-BR')

export function FxRatesTable() {
  const [rate, setRate] = useState<number | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  function load() {
    setLoading(true)
    setFailed(false)
    fetch('/api/fx', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (typeof j.rate === 'number' && j.rate > 0) { setRate(j.rate); setSource(j.source ?? null) }
        else { setFailed(true) }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="movy-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="movy-kicker">Cotações de hoje</span>
        {source && <span style={{ fontFamily: font.mono, fontSize: 11, color: ink(0.45) }}>fonte {source}</span>}
      </div>

      {loading ? (
        /* Skeleton matching the two-column table layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {[0, 1].map((col) => (
            <div key={col} style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width={60} height={10} />
                <Skeleton width={60} height={10} />
              </div>
              {AMOUNTS.slice(0, 6).map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <Skeleton width={70} height={14} />
                  <Skeleton width={80} height={14} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : failed ? (
        /* Meaningful empty/error state (#9) */
        <EmptyState
          icon={TrendingDown}
          title="Cotação indisponível"
          description="Não foi possível obter a tabela de câmbio agora. Tente novamente."
          action={
            <button
              onClick={load}
              style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surface, cursor: 'pointer', fontFamily: font.ui, fontSize: 13, fontWeight: 600, color: t.text }}
            >
              Tentar novamente
            </button>
          }
        />
      ) : rate ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <Table head={['AUD', 'BRL']} rows={AMOUNTS.map((a) => [`A$ ${intFmt(a)}`, `R$ ${money(a * rate)}`])} />
          <Table head={['BRL', 'AUD']} rows={AMOUNTS.map((a) => [`R$ ${intFmt(a)}`, `A$ ${money(a / rate)}`])} />
        </div>
      ) : null}
    </div>
  )
}

function Table({ head, rows }: { head: [string, string]; rows: string[][] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          <th className="movy-kicker" style={thR}>{head[0]}</th>
          <th className="movy-kicker" style={{ ...thR, textAlign: 'right' }}>{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderTop: `1px solid ${ink(0.06)}` }}>
            <td style={{ padding: '9px 0', color: ink(0.7), fontFamily: font.ui, fontVariantNumeric: 'tabular-nums' }}>{r[0]}</td>
            <td style={{ padding: '9px 0', textAlign: 'right', fontFamily: font.display, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: t.text }}>{r[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const thR: React.CSSProperties = { padding: '0 0 8px', fontSize: 10, color: ink(0.42), textAlign: 'left', borderBottom: `1px solid ${color.line}` }
