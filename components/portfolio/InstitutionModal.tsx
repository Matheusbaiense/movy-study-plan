'use client'

import { useState } from 'react'
import type { Institution } from '@/lib/portfolio/types'
import type { InstitutionInput } from '@/app/[locale]/(protected)/portfolio/actions'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/form'

interface InstitutionModalProps {
  open: boolean
  initial: Institution | null
  isPending: boolean
  onSave: (input: InstitutionInput) => void
  onClose: () => void
}

// Create/edit form for an institution. Shared by the portfolio list and the
// institution detail page so editing is available from both places.
export function InstitutionModal({ open, initial, isPending, onSave, onClose }: InstitutionModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [country, setCountry] = useState(initial?.country ?? 'AU')
  const [city, setCity] = useState(initial?.city ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [partnership, setPartnership] = useState(initial?.partnership_status ?? 'active')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ name, country, city, website, notes, partnership_status: partnership })
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar escola' : 'Nova escola'} width={440}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <Field label="Nome *">
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="English Path Brisbane" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="País (alpha-2)">
            <Input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} placeholder="AU" maxLength={2} />
          </Field>
          <Field label="Cidade">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Brisbane" />
          </Field>
        </div>
        <Field label="Site">
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" placeholder="https://..." />
        </Field>
        <Field label="Parceria">
          <Select value={partnership} onChange={(e) => setPartnership(e.target.value)}>
            <option value="active">Ativo</option>
            <option value="negotiating">Negociando</option>
            <option value="inactive">Inativo</option>
          </Select>
        </Field>
        <Field label="Notas">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observações internas…" />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={isPending}>
            {initial ? 'Salvar' : 'Criar escola'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
