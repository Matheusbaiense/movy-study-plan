'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea, Select } from '@/components/ui/form'
import { t, ink, font, color } from '@/lib/ui/theme'
import {
  CONTACT_ROLES,
  DOC_TAGS,
  STREAMS,
  type AdmissionContact,
  type AdmissionDocument,
  type ContactRole,
  type DocTag,
  type SchoolAdmissionView,
  type Stream,
} from '@/lib/admissions/types'
import { upsertAdmissionAction, upsertCredentialAction } from '@/app/[locale]/(protected)/admissions/actions'

const STREAM_LABEL: Record<Stream, string> = { english: 'English', vet: 'VET', he: 'Higher Ed' }

interface Props {
  locale: string
  admission: SchoolAdmissionView
  onClose: () => void
}

export function AdmissionEditor({ locale, admission, onClose }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [enrolmentType, setEnrolmentType] = useState(admission.enrolment_type ?? '')
  const [portalUrl, setPortalUrl] = useState(admission.portal_url ?? '')
  const [streams, setStreams] = useState<Stream[]>(admission.streamsTyped)
  const [documents, setDocuments] = useState<AdmissionDocument[]>(admission.documentsParsed)
  const [contacts, setContacts] = useState<AdmissionContact[]>(admission.contactsParsed)
  const [notes, setNotes] = useState(admission.notes ?? '')

  const [login, setLogin] = useState(admission.credentialLogin ?? '')
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)

  function toggleStream(s: Stream) {
    setStreams((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function save() {
    setError(null)
    startTransition(async () => {
      try {
        await upsertAdmissionAction({
          id: admission.id,
          institution_id: admission.institution_id,
          enrolment_type: enrolmentType,
          portal_url: portalUrl,
          streams,
          documents: documents.filter((d) => d.label.trim()),
          contacts: contacts.filter((c) => c.name || c.email || c.phone),
          notes,
        })
        if (login.trim() || (passwordTouched && password)) {
          await upsertCredentialAction({
            admission_id: admission.id,
            login,
            ...(passwordTouched ? { password } : {}),
          })
        }
        onClose()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar')
      }
    })
  }

  return (
    <Drawer open onClose={onClose} title={`${locale === 'pt' ? 'Editar' : 'Edit'} · ${admission.institution?.name ?? ''}`} width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label={locale === 'pt' ? 'Tipo de matrícula' : 'Enrolment type'}>
          <Input value={enrolmentType} onChange={(e) => setEnrolmentType(e.target.value)} placeholder="Direct entry (no package)" />
        </Field>

        <div>
          <span style={legend}>Streams</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STREAMS.map((s) => (
              <button key={s} type="button" onClick={() => toggleStream(s)} style={toggle(streams.includes(s))}>
                {STREAM_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div>
          <span style={legend}>{locale === 'pt' ? 'Documentos' : 'Documents'}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {documents.map((d, i) => (
              <div key={i} style={rowBox}>
                <Input
                  value={d.label}
                  onChange={(e) => setDocuments((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder={locale === 'pt' ? 'Documento…' : 'Document…'}
                />
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>
                  {DOC_TAGS.map((tag) => {
                    const on = d.tags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setDocuments((p) =>
                            p.map((x, j) =>
                              j === i ? { ...x, tags: on ? x.tags.filter((y) => y !== tag) : [...x.tags, tag as DocTag] } : x,
                            ),
                          )
                        }
                        style={miniToggle(on)}
                      >
                        {tag}
                      </button>
                    )
                  })}
                  <button type="button" onClick={() => setDocuments((p) => p.filter((_, j) => j !== i))} style={iconBtn} aria-label="Remover">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setDocuments((p) => [...p, { label: '', tags: [] }])}>
              <Plus size={14} /> {locale === 'pt' ? 'Documento' : 'Document'}
            </Button>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <span style={legend}>{locale === 'pt' ? 'Contatos' : 'Contacts'}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contacts.map((c, i) => (
              <div key={i} style={rowBox}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input value={c.name ?? ''} onChange={(e) => setContacts((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={locale === 'pt' ? 'Nome' : 'Name'} />
                  <Select value={c.role ?? ''} onChange={(e) => setContacts((p) => p.map((x, j) => (j === i ? { ...x, role: (e.target.value || undefined) as ContactRole | undefined } : x)))}>
                    <option value="">—</option>
                    {CONTACT_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 7, alignItems: 'center' }}>
                  <Input value={c.email ?? ''} onChange={(e) => setContacts((p) => p.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} placeholder="email" />
                  <Input value={c.phone ?? ''} onChange={(e) => setContacts((p) => p.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} placeholder={locale === 'pt' ? 'telefone' : 'phone'} />
                  <button type="button" onClick={() => setContacts((p) => p.filter((_, j) => j !== i))} style={iconBtn} aria-label="Remover">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setContacts((p) => [...p, {}])}>
              <Plus size={14} /> {locale === 'pt' ? 'Contato' : 'Contact'}
            </Button>
          </div>
        </div>

        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
        </Field>

        {/* Credential */}
        <div style={{ borderTop: `1px solid ${ink(0.08)}`, paddingTop: 14 }}>
          <span style={legend}>{locale === 'pt' ? 'Credencial do portal' : 'Portal credential'}</span>
          <Field label="Login">
            <Input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="off" />
          </Field>
          <div style={{ marginTop: 10 }}>
            <Field label={locale === 'pt' ? 'Senha' : 'Password'}>
              <Input
                type="text"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true) }}
                placeholder={admission.hasCredential ? (locale === 'pt' ? '•••• (deixe em branco p/ manter)' : '•••• (leave blank to keep)') : ''}
                autoComplete="off"
              />
            </Field>
          </div>
        </div>

        {error && <p style={{ color: color.red, fontSize: 13, margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, position: 'sticky', bottom: 0, background: t.surface, paddingTop: 12 }}>
          <Button variant="secondary" onClick={onClose}>{locale === 'pt' ? 'Cancelar' : 'Cancel'}</Button>
          <Button variant="primary" onClick={save} loading={pending}>{locale === 'pt' ? 'Salvar' : 'Save'}</Button>
        </div>
      </div>
    </Drawer>
  )
}

const legend: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textMuted, fontFamily: font.body, marginBottom: 8 }
const rowBox: React.CSSProperties = { border: `1px solid ${ink(0.08)}`, borderRadius: 10, padding: 10, background: ink(0.015) }
const iconBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: color.red, padding: 4 }
function toggle(on: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontFamily: font.body, fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${on ? color.purple : ink(0.14)}`, color: on ? '#fff' : t.text, background: on ? color.purple : 'transparent',
  }
}
function miniToggle(on: boolean): React.CSSProperties {
  return {
    padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontFamily: font.body, fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${on ? color.purple : ink(0.12)}`, color: on ? '#fff' : t.textMuted, background: on ? color.purple : 'transparent',
  }
}
