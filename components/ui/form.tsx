// components/ui/form.tsx
'use client'

import { forwardRef } from 'react'
import { t } from '@/lib/ui/theme'

const controlStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${t.border}`,
  borderRadius: 9,
  padding: '10px 11px',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: t.text,
  background: t.surface,
  outline: 'none',
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: t.textSubtle }}>{hint}</span>}
    </label>
  )
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ style, ...rest }, ref) {
    return <input ref={ref} style={{ ...controlStyle, ...style }} {...rest} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ style, ...rest }, ref) {
    return <textarea ref={ref} style={{ ...controlStyle, resize: 'vertical', minHeight: 80, ...style }} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ style, children, ...rest }, ref) {
    return (
      <select ref={ref} style={{ ...controlStyle, cursor: 'pointer', ...style }} {...rest}>
        {children}
      </select>
    )
  },
)
