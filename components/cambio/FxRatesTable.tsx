'use client'

import { useEffect, useState } from 'react'
import { color, ink, font } from '@/lib/ui/theme'

const AMOUNTS = [1, 5, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000, 10000]
const money = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const intFmt = (n: number) => n.toLocaleString('pt-BR')

export function FxRatesTable() {
  const [rate, setRate] = useState<number | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch('/api/fx', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (typeof j.rate === 'number' && j.rate > 0) { setRate(j.rate); setSource(j.source ?? null) }
        else { setFailed(true) }
      })
      .catch(() => setFailed(true))
  }, [])

  return (
    <div className="movy-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="movy-kicker">Cotações de hoje</span>
        {source && <span style={{ fontFamily: font.mono, fontSize: 11, color: ink(0.45) }}>fonte {source}</span>}
      </div>

      {!rate ? (
        <div style={{ padding: '24px 0', color: failed ? color.red : ink(0.4), fontSize: 13 }}>
          {failed ? 'Não foi possível obter a cotação agora. Tente novamente em instantes.' : 'Carregando cotação…'}
        </div>
      ) : (
        <div className="grid-cols-1 lg:grid-cols-2" style={{ display: 'grid', gap: 24 }}>
          <Table head={['AUD', 'BRL']} rows={AMOUNTS.map((a) => [`A$ ${intFmt(a)}`, `R$ ${money(a * rate)}`])} />
          <Table head={['BRL', 'AUD']} rows={AMOUNTS.map((a) => [`R$ ${intFmt(a)}`, `A$ ${money(a / rate)}`])} />
        </div>
      )}
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
            <td style={{ padding: '9px 0', color: ink(0.7), fontFamily: font.ui }}>{r[0]}</td>
            <td style={{ padding: '9px 0', textAlign: 'right', fontFamily: font.display, fontWeight: 700, color: color.purpleDeep }}>{r[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const thR: React.CSSProperties = { padding: '0 0 8px', fontSize: 10, color: ink(0.42), textAlign: 'left', borderBottom: `1px solid ${color.line}` }
