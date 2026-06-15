'use client'

import { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { countryOptions } from '@/lib/constants/countries'
import { buildContactAttributes } from '@/lib/crm/contacts'
import { createProposalForContact, searchContactsAction, upsertContact, type ContactPick } from './actions'

interface NewProposalModalProps {
  locale: string
}

const COUNTRIES = countryOptions()

export default function NewProposalModal({ locale }: NewProposalModalProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<'search' | 'new'>('search')
  const [results, setResults] = useState<ContactPick[]>([])
  const [moreFields, setMoreFields] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Portal target only exists on the client; gate the portal on mount.
  useEffect(() => setMounted(true), [])

  const reset = useCallback(() => {
    setMode('search')
    setResults([])
    setMoreFields(false)
    setError(null)
  }, [])

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
        await createProposalForContact(id, locale)
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
        const { id } = await upsertContact(
          {
            fullName,
            email: String(form.get('email') ?? '') || null,
            phone: String(form.get('phone') ?? '') || null,
            customAttributes: buildContactAttributes({
              nationality: String(form.get('nationality') ?? ''),
              leadSource: String(form.get('leadSource') ?? ''),
              preferredLanguage: String(form.get('preferredLanguage') ?? ''),
            }),
          },
          locale,
        )
        await createProposalForContact(id, locale)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao criar lead')
      }
    })
  }

  return (
    <>
      <button type="button" className="movy-btn-primary" onClick={() => setOpen(true)} style={primaryBtnStyle}>
        + Criar proposta
      </button>

      {open && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Criar proposta"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,11,48,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(480px, 100%)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 14, padding: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lift, 0 24px 70px rgba(20,11,48,0.4))' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: 16 }}>Para quem é essa proposta?</strong>
              <button type="button" aria-label="Fechar" onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>
                ×
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button type="button" onClick={() => { reset(); setMode('search') }} aria-pressed={mode === 'search'} style={tabStyle(mode === 'search')}>
                Lead existente
              </button>
              <button type="button" onClick={() => { reset(); setMode('new') }} aria-pressed={mode === 'new'} style={tabStyle(mode === 'new')}>
                Novo lead
              </button>
            </div>

            {error && <p role="alert" style={{ color: '#b00020', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

            {mode === 'search' ? (
              <div>
                <input type="text" placeholder="Buscar por nome, email ou telefone…" onChange={(e) => onSearch(e.target.value)} style={inputStyle} autoFocus />
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
            ) : (
              <form action={createLead}>
                <label style={labelStyle}>Nome completo *</label>
                <input name="fullName" type="text" required style={inputStyle} autoFocus />
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" style={inputStyle} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Telefone</label>
                    <input name="phone" type="tel" style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Nacionalidade</label>
                    <select name="nationality" defaultValue="" style={inputStyle}>
                      <option value="">—</option>
                      {COUNTRIES.map((o) => (
                        <option key={o.code} value={o.code}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="button" onClick={() => setMoreFields((v) => !v)} style={{ background: 'none', border: 'none', color: '#4B1A77', cursor: 'pointer', fontSize: 13, padding: '8px 0' }}>
                  {moreFields ? '− Menos campos' : '+ Mais campos'}
                </button>
                {moreFields && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Origem do lead</label>
                      <input name="leadSource" type="text" placeholder="Indicação, Instagram…" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Idioma preferido</label>
                      <select name="preferredLanguage" defaultValue="" style={inputStyle}>
                        <option value="">—</option>
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <button type="button" onClick={() => setOpen(false)} style={tabStyle(false)}>Cancelar</button>
                  <button type="submit" disabled={pending} className="movy-btn-primary" style={primaryBtnStyle}>
                    {pending ? 'Criando…' : 'Criar e abrir proposta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

const primaryBtnStyle: React.CSSProperties = { border: 0, borderRadius: 10, padding: '11px 16px', background: '#2A1153', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Outfit, sans-serif' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', marginBottom: 10, fontSize: 14, fontFamily: 'Outfit, sans-serif', outline: 'none' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }
const rowStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%', textAlign: 'left', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', marginBottom: 6 }
function tabStyle(active: boolean): React.CSSProperties {
  return { flex: 1, padding: '9px 11px', borderRadius: 9, border: active ? '1.5px solid var(--movy-purple, #4B1A77)' : '1px solid var(--border)', background: active ? 'color-mix(in srgb, var(--movy-purple, #4B1A77) 8%, var(--surface))' : 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: 'Outfit, sans-serif' }
}
