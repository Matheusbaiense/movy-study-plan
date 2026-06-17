// components/ui/PageHeader.tsx
'use client'

import { font, t } from '@/lib/ui/theme'

interface PageHeaderProps {
  title: string
  eyebrow?: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div className="movy-kicker" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="movy-display" style={{ margin: 0, fontSize: 'clamp(1.6rem, 1.2rem + 1.4vw, 2.2rem)', color: t.text }}>
          {title}
        </h1>
        {description && (
          <p style={{ margin: '8px 0 0', maxWidth: 560, color: t.textMuted, fontFamily: font.body, fontSize: 14, lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{actions}</div>}
    </header>
  )
}
