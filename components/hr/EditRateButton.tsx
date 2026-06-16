'use client'

import { useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'
import { updateEmployeeRateAction } from '@/app/[locale]/(protected)/hr/actions'
import { ink } from '@/lib/ui/theme'

interface Props {
  employeeId: string
  currentRateCents: number
}

export function EditRateButton({ employeeId, currentRateCents }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState((currentRateCents / 100).toFixed(2))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const rate = parseFloat(value)
    if (isNaN(rate) || rate < 0) { setError('Invalid rate'); return }
    setError(null)
    startTransition(async () => {
      try {
        await updateEmployeeRateAction(employeeId, rate)
        setEditing(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setEditing(false); setValue((currentRateCents / 100).toFixed(2)) }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title="Edit rate"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', padding: '2px 4px', borderRadius: 4,
        }}
      >
        <Pencil size={11} style={{ opacity: 0.5 }} />
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AU$</span>
      <input
        autoFocus
        type="number"
        min="0"
        step="0.50"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: 70, padding: '4px 8px', borderRadius: 6,
          border: `1px solid ${error ? '#dc2626' : ink(0.25)}`,
          background: 'var(--surface)', color: 'var(--text)',
          fontSize: 13, fontWeight: 700,
        }}
      />
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/hr</span>
      <button
        onClick={handleSave}
        disabled={isPending}
        style={{
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
          background: '#7C3AED', color: '#fff', border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? '…' : 'OK'}
      </button>
      <button
        onClick={() => { setEditing(false); setValue((currentRateCents / 100).toFixed(2)) }}
        style={{
          padding: '4px 8px', borderRadius: 6, fontSize: 11,
          background: 'none', border: `1px solid ${ink(0.15)}`,
          color: 'var(--text-muted)', cursor: 'pointer',
        }}
      >
        ✕
      </button>
      {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}
