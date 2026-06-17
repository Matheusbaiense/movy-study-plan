'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteContent } from '@/app/[locale]/(protected)/wiki/actions'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface DeleteContentButtonProps {
  id: string
  locale: string
}

export function DeleteContentButton({ id, locale }: DeleteContentButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(() => {
      deleteContent(id, locale)
    })
    setOpen(false)
  }

  const label = locale === 'pt' ? 'Excluir' : locale === 'es' ? 'Eliminar' : 'Delete'
  const deletingLabel = locale === 'pt' ? 'Excluindo…' : locale === 'es' ? 'Eliminando…' : 'Deleting…'
  const modalTitle = locale === 'pt' ? 'Excluir artigo' : locale === 'es' ? 'Eliminar artículo' : 'Delete article'
  const modalBody = locale === 'pt'
    ? 'Tem certeza que quer excluir este artigo? Esta ação não pode ser desfeita.'
    : locale === 'es'
    ? '¿Seguro que quieres eliminar este artículo? Esta acción no se puede deshacer.'
    : 'Are you sure you want to delete this article? This action cannot be undone.'
  const cancelLabel = locale === 'pt' ? 'Cancelar' : locale === 'es' ? 'Cancelar' : 'Cancel'

  return (
    <>
      <Button
        variant="secondary"
        aria-label={label}
        disabled={isPending}
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-danger, #c0392b)', borderColor: 'rgba(192,57,43,0.25)', background: 'rgba(192,57,43,0.06)' }}
      >
        <Trash2 size={14} strokeWidth={1.8} aria-hidden />
        {isPending ? deletingLabel : label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={modalTitle} width={420}>
        <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          {modalBody}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            style={{ background: 'var(--color-danger, #c0392b)', borderColor: 'var(--color-danger, #c0392b)' }}
          >
            {label}
          </Button>
        </div>
      </Modal>
    </>
  )
}
