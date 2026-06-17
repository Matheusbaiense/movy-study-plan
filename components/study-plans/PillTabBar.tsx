'use client'

// PillTabBar — shared pill-shaped tab bar used by OptionsManager and EditorWizardNav.
// Controlled: pass value + onValueChange. Items carry a required `value` and `label`;
// optional `dot` renders a small colored indicator (used for "recommended" option).

import { color, t } from '@/lib/ui/theme'

export interface PillTabItem {
  value: string
  label: string
  dot?: boolean
}

interface PillTabBarProps {
  value: string
  onValueChange: (value: string) => void
  items: PillTabItem[]
  /** Optional extra element rendered after the last tab (e.g. "+ Opção" button). */
  trailing?: React.ReactNode
}

const dotStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  background: color.purple,
  display: 'inline-block',
  flexShrink: 0,
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    border: `1px solid ${active ? color.purple : t.border}`,
    borderRadius: 999,
    padding: '7px 14px',
    background: active ? `color-mix(in srgb, ${color.purple} 8%, var(--surface))` : 'var(--surface)',
    color: active ? t.text : 'var(--text-muted)',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
  }
}

export function PillTabBar({ value, onValueChange, items, trailing }: PillTabBarProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onValueChange(item.value)}
          style={pillStyle(value === item.value)}
          aria-current={value === item.value ? 'true' : undefined}
        >
          {item.label}
          {item.dot && <span style={dotStyle} title="Recomendada" />}
        </button>
      ))}
      {trailing}
    </div>
  )
}
