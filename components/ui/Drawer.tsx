// components/ui/Drawer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { font, t } from '@/lib/ui/theme'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: number
  side?: 'right' | 'left'
}

export function Drawer({ open, onClose, title, children, width = 420, side = 'right' }: DrawerProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (!panelRef.current?.contains(e.target as Node)) onClose()
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(20,11,48,0.5)' }}
    >
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [side]: 0,
          width: '100%',
          maxWidth: width,
          background: t.surfaceRaised,
          borderLeft: side === 'right' ? `1px solid ${t.border}` : undefined,
          borderRight: side === 'left' ? `1px solid ${t.border}` : undefined,
          boxShadow: 'var(--shadow-lift)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
          {title && <h2 style={{ margin: 0, fontFamily: font.display, fontSize: 16, color: t.text }}>{title}</h2>}
          <button onClick={onClose} aria-label="Close" className="button-blank-secondary-icon" style={{ marginLeft: 'auto' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
