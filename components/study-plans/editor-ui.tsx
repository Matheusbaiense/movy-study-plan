'use client'

// Shared editor primitives (SPLIT 4 · fatia B extraction). These were inlined in
// StudyPlanEditor.tsx; extracted so both the main editor and CourseListEditor reuse the exact
// same Section/Field/NumberInput/MiniStat + style tokens (DRY). Behavior is unchanged.

import { number } from '@/lib/study-plans/calculations'
import { color, font, ink, t } from '@/lib/ui/theme'

export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="movy-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 className="movy-kicker" style={{ margin: 0, fontSize: 12 }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      {children}
    </label>
  )
}

export function NumberInput({ value, onChange, 'aria-label': ariaLabel }: { value: number; onChange: (value: number) => void; 'aria-label'?: string }) {
  return <input style={{ ...input, textAlign: 'right' }} type="number" step="0.01" value={value} aria-label={ariaLabel} onChange={(e) => onChange(number(e.target.value))} />
}

export function MiniStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
      <span style={{ color: ink(0.52), fontSize: 12 }}>{label}</span>
      <strong style={{ fontFamily: font.display, color: strong ? color.purple : t.text, fontSize: strong ? 16 : 13, letterSpacing: strong ? '-0.01em' : 0 }}>{value}</strong>
    </div>
  )
}

export const HAIR = 'var(--border)'
export const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }
export const input: React.CSSProperties = { width: '100%', border: `1px solid ${HAIR}`, borderRadius: 9, padding: '10px 11px', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--text)', background: 'var(--surface)', outline: 'none' }
export const ghostButton: React.CSSProperties = { border: `1px solid ${HAIR}`, borderRadius: 9, padding: '8px 12px', background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12 }
export const dangerButton: React.CSSProperties = { ...ghostButton, color: '#D23B2B' }
export const pill: React.CSSProperties = { borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }
