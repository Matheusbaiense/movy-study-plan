'use client'

import { t, ink } from '@/lib/ui/theme'

interface DateInputPTProps {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  style?: React.CSSProperties
}

export function DateInputPT({ value, onChange, min, max, style }: DateInputPTProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
      className="movy-field-control"
      style={{
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: `1px solid ${ink(0.14)}`,
        background: 'var(--bg)',
        color: t.text, fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
        colorScheme: 'light dark',
        ...style,
      }}
    />
  )
}
