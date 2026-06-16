// components/ui/Modal.tsx
'use client'

import { useEffect, useId, useRef, useState } from 'react'
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

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)
  const titleId = useId()

  useEffect(() => setMounted(true), [])

  // FIX 3 — scroll-lock counter so stacked overlays don't clobber each other
  useEffect(() => {
    if (!open) return
    const count = parseInt(document.body.dataset.scrollLocked ?? '0', 10)
    document.body.dataset.scrollLocked = String(count + 1)
    if (count === 0) document.body.style.overflow = 'hidden'
    return () => {
      const next = parseInt(document.body.dataset.scrollLocked ?? '1', 10) - 1
      if (next <= 0) {
        document.body.style.overflow = ''
        delete document.body.dataset.scrollLocked
      } else {
        document.body.dataset.scrollLocked = String(next)
      }
    }
  }, [open])

  // FIX 1 — focus management: capture trigger, focus first focusable, trap Tab
  useEffect(() => {
    if (!open) return

    // Capture the element that opened this modal
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
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(20,11,48,0.5)' }}
    >
      <div
        ref={panelRef}
        style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 16, boxShadow: 'var(--shadow-lift)' }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
            {/* FIX 2 — id on h2 so aria-labelledby resolves */}
            <h2 id={titleId} style={{ margin: 0, fontFamily: font.display, fontSize: 16, color: t.text }}>{title}</h2>
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
