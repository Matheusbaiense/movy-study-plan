'use client'

import { useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'
import { updateEmployeeRateAction } from '@/app/[locale]/(protected)/hr/actions'
import { ink, t } from '@/lib/ui/theme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/form'

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
        aria-label="Edit rate"
        className="button-blank-secondary-icon"
        style={{ padding: '2px 4px' }}
      >
        <Pencil size={11} style={{ opacity: 0.5 }} aria-hidden="true" />
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, color: t.textMuted }}>AU$</span>
      <Input
        autoFocus
        type="number"
        min="0"
        step="0.50"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Hourly rate in AUD"
        style={{
          width: 70, padding: '4px 8px', borderRadius: 6,
          border: `1px solid ${error ? '#dc2626' : ink(0.25)}`,
          fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        }}
      />
      <span style={{ fontSize: 11, color: t.textMuted }}>/hr</span>
      <Button variant="primary" onClick={handleSave} loading={isPending} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
        OK
      </Button>
      <Button
        variant="secondary"
        onClick={() => { setEditing(false); setValue((currentRateCents / 100).toFixed(2)) }}
        style={{ padding: '4px 8px', fontSize: 11 }}
        aria-label="Cancel rate edit"
      >
        ✕
      </Button>
      {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}
