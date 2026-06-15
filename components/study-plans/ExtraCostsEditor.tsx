'use client'

// ExtraCostsEditor (SPLIT 4 · fatia B) — the "Custos adicionais" list, extracted from
// StudyPlanEditor so the primary mix and each option reuse it. Operates on the passed slice only.

import { uid } from '@/lib/study-plans/defaults'
import type { ExtraCost } from '@/lib/study-plans/types'
import { dangerButton, ghostButton, input } from './editor-ui'

type ExtraCostCategory = ExtraCost['category']

interface ExtraCostsEditorProps {
  extraCosts: ExtraCost[]
  onChange: (extraCosts: ExtraCost[]) => void
}

export function ExtraCostsEditor({ extraCosts, onChange }: ExtraCostsEditorProps) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {extraCosts.map((extra) => (
        <div key={extra.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 130px auto', gap: 10 }}>
          <input style={input} value={extra.item} onChange={(e) => onChange(extraCosts.map((item) => (item.id === extra.id ? { ...item, item: e.target.value } : item)))} />
          <select style={input} value={extra.category} onChange={(e) => onChange(extraCosts.map((item) => (item.id === extra.id ? { ...item, category: e.target.value as ExtraCostCategory } : item)))}>
            <option value="oshc">OSHC</option>
            <option value="visa">Visto</option>
            <option value="admin">Admin</option>
            <option value="medical">Médico</option>
            <option value="other">Outro</option>
          </select>
          <input style={{ ...input, textAlign: 'right' }} type="number" step="0.01" value={extra.amount} onChange={(e) => onChange(extraCosts.map((item) => (item.id === extra.id ? { ...item, amount: Number(e.target.value) || 0 } : item)))} />
          <button style={dangerButton} onClick={() => onChange(extraCosts.filter((item) => item.id !== extra.id))}>Remover</button>
        </div>
      ))}
      <button style={ghostButton} onClick={() => onChange([...extraCosts, { id: uid('extra'), item: 'Novo custo', category: 'other', amount: 0 }])}>+ Adicionar custo</button>
    </div>
  )
}
