// components/ui/Drawer.tsx
'use client'

import { useEffect, useId, useRef, useState } from 'react'
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

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function Drawer({ open, onClose, title, children, width = 420, side = 'right' }: DrawerProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)
  const titleId = useId()

  useEffect(() => setMounted(true), [])

  // FIX 1 — focus management: capture trigger, focus first focusable, trap Tab
  useEffect(() => {
    if (!open) return

    // Capture the element that opened this drawer
    triggerRef.current = document.activeElement

    // Move focus into the panel after the portal renders
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const first = panel.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    })

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.closest('[disabled]') && el.tabIndex !== -1,
      )
      if (focusable.length === 0) { e.preventDefault(); return }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      // FIX 1 — restore focus to trigger on close
      ;(triggerRef.current as HTMLElement | null)?.focus()
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
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
        {/* FIX 2 — header always renders so close button is always present;
            h2 only when title exists so aria-labelledby is valid when set */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
          {title && (
            <h2 id={titleId} style={{ margin: 0, fontFamily: font.display, fontSize: 16, color: t.text }}>{title}</h2>
          )}
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
