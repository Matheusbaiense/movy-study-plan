// components/ui/Modal.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { font, t } from '@/lib/ui/theme'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: number
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
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
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(20,11,48,0.5)' }}
    >
      <div
        ref={panelRef}
        style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 16, boxShadow: 'var(--shadow-lift)' }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
            <h2 style={{ margin: 0, fontFamily: font.display, fontSize: 16, color: t.text }}>{title}</h2>
            <button onClick={onClose} aria-label="Close" className="button-blank-secondary-icon">
              <X size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
