'use client'

// ConvertToProposalModal — the "Transformar em proposta" bridge for the standalone Simulador.
// Mirrors NewProposalModal's lead-pick flow (search existing / create new), but instead of
// creating a blank proposal it seeds the new study_plans row with the calculator's course mix
// via createProposalFromCalculator. The server action redirects to the editor on success.

import { useCallback, useRef, useState, useTransition } from 'react'
import { countryOptions } from '@/lib/constants/countries'
import {
  createProposalFromCalculator,
  searchContactsAction,
  type ContactPick,
} from '@/app/[locale]/(protected)/study-plans/actions'
import type { StudyPlanData } from '@/lib/study-plans/types'
import { Modal, Button, Field, Input, Select } from '@/components/ui'

interface ConvertToProposalModalProps {
  locale: string
  /** Live calculator plan to seed the proposal with. */
  data: StudyPlanData
  /** Nationality picked in the calculator header (alpha-2), prefills the new-lead form. */
  nationality: string
}

const COUNTRIES = countryOptions()

export function ConvertToProposalModal({ locale, data, nationality }: ConvertToProposalModalProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'new'>('search')
  const [results, setResults] = useState<ContactPick[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    setMode('search')
    setResults([])
    setError(null)
  }, [])

  function handleClose() {
    reset()
    setOpen(false)
  }

  const onSearch = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!q.trim()) {
      setResults([])
      return
    }
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        try {
          setResults(await searchContactsAction(q))
        } catch {
          setResults([])
        }
      })
    }, 250)
  }

  const pickContact = (id: string) => {
    startTransition(async () => {
      try {
        await createProposalFromCalculator(data, { contactId: id }, locale)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao criar proposta')
      }
    })
  }

  const createLead = (form: FormData) => {
    const fullName = String(form.get('fullName') ?? '').trim()
    if (!fullName) {
      setError('Nome é obrigatório')
      return
    }
    startTransition(async () => {
      try {
        await createProposalFromCalculator(
          data,
          {
            newLead: {
              fullName,
              email: String(form.get('email') ?? '') || null,
              phone: String(form.get('phone') ?? '') || null,
              nationality: String(form.get('nationality') ?? '') || null,
            },
          },
          locale,
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao criar lead')
      }
    })
  }

  return (
    <>
      <Button variant="primary" type="button" onClick={() => setOpen(true)}>
        Transformar em proposta
      </Button>

      <Modal open={open} onClose={handleClose} title="Para quem é essa proposta?">
        <div role="tablist" aria-label="Modo de seleção de lead" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'search'}
            aria-controls="conv-tabpanel-search"
            id="conv-tab-search"
            onClick={() => { reset(); setMode('search') }}
            style={tabStyle(mode === 'search')}
          >
            Lead existente
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'new'}
            aria-controls="conv-tabpanel-new"
            id="conv-tab-new"
            onClick={() => { reset(); setMode('new') }}
            style={tabStyle(mode === 'new')}
          >
            Novo lead
          </button>
        </div>

        {error && <p role="alert" style={{ color: '#b00020', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

        <div role="tabpanel" id="conv-tabpanel-search" aria-labelledby="conv-tab-search" hidden={mode !== 'search'}>
          <Input
            type="text"
            placeholder="Buscar por nome, email ou telefone…"
            onChange={(e) => onSearch(e.target.value)}
            autoFocus={mode === 'search'}
          />
          <div style={{ marginTop: 10, maxHeight: 260, overflowY: 'auto' }}>
            {results.map((c) => (
              <button key={c.id} type="button" disabled={pending} onClick={() => pickContact(c.id)} style={rowStyle}>
                <span style={{ fontWeight: 500 }}>{c.fullName}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {[c.email, c.nationality].filter(Boolean).join(' · ') || 'sem contato'}
                </span>
              </button>
            ))}
            {!pending && results.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 4px' }}>Digite para buscar um lead.</p>
            )}
          </div>
        </div>

        <div role="tabpanel" id="conv-tabpanel-new" aria-labelledby="conv-tab-new" hidden={mode !== 'new'}>
          <form action={createLead}>
            <Field label="Nome completo *">
              <Input name="fullName" type="text" required autoFocus={mode === 'new'} />
            </Field>
            <div style={{ marginTop: 10 }}>
              <Field label="Email">
                <Input name="email" type="email" />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <Field label="Telefone">
                  <Input name="phone" type="tel" />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Nacionalidade">
                  <Select name="nationality" defaultValue={nationality}>
                    <option value="">—</option>
                    {COUNTRIES.map((o) => (
                      <option key={o.code} value={o.code}>{o.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="primary" loading={pending}>
                {pending ? 'Criando…' : 'Criar e abrir proposta'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

const rowStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%', textAlign: 'left', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', marginBottom: 6 }

function tabStyle(active: boolean): React.CSSProperties {
  return { flex: 1, padding: '9px 11px', borderRadius: 9, border: active ? '1.5px solid var(--movy-purple, #4B1A77)' : '1px solid var(--border)', background: active ? 'color-mix(in srgb, var(--movy-purple, #4B1A77) 8%, var(--surface))' : 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: 'Outfit, sans-serif' }
}
