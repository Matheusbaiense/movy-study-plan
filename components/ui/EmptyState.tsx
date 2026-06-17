// components/ui/EmptyState.tsx

import type { LucideIcon } from 'lucide-react'
import { ink, t, font } from '@/lib/ui/theme'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="movy-card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '48px 24px' }}
    >
      <span
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 999, background: ink(0.05), color: 'var(--accent)' }}
      >
        <Icon size={24} strokeWidth={1.6} />
      </span>
      <h3 style={{ margin: 0, fontFamily: font.display, fontSize: 17, color: t.text }}>{title}</h3>
      {description && <p style={{ margin: 0, maxWidth: 380, color: t.textMuted, fontFamily: font.body, fontSize: 13, lineHeight: 1.5 }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
