'use client'

import { color, font, t } from '@/lib/ui/theme'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  pending?: boolean
}

/**
 * Danger-confirm dialog shared across destructive flows (delete user, delete
 * preset, etc.). Built on the `Modal` primitive; the confirm button uses the
 * brand danger red. Extracted to remove the duplicated copies that lived in
 * UsersManager and PresetsManager.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  pending,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: t.textMuted, lineHeight: 1.55 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          style={{
            padding: '9px 16px',
            borderRadius: 10,
            border: 'none',
            background: color.red,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: font.ui,
            cursor: pending ? 'wait' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Aguarde…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
