'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  Mail,
  Phone,
  KeyRound,
  Pencil,
  ExternalLink,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { t, ink, font, color, radius } from '@/lib/ui/theme'
import type { AdmissionContact, AdmissionDocument, SchoolAdmissionView, Stream } from '@/lib/admissions/types'
import { revealPortalPasswordAction } from '@/app/[locale]/(protected)/admissions/actions'
import { AdmissionEditor } from './AdmissionEditor'

const STREAM_LABEL: Record<Stream, string> = { english: 'English', vet: 'VET', he: 'Higher Ed' }
const TAG_LABEL: Record<string, string> = {
  all: 'All', visa: 'Visa', english: 'English', vet: 'VET', he: 'Higher Ed', package: 'Package', couple: 'Couple/Family',
}
const ROLE_LABEL: Record<string, string> = {
  admissions: 'Admissions', marketing: 'Marketing', comercial: 'Comercial', other: 'Contato',
}

interface Props {
  locale: string
  admission: SchoolAdmissionView
  canEdit: boolean
}

export function AdmissionDetail({ locale, admission, canEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const a = admission

  return (
    <div>
      <Link
        href={`/${locale}/admissions`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.textMuted, fontFamily: font.body, fontSize: 13, textDecoration: 'none', marginBottom: 14 }}
      >
        <ArrowLeft size={15} /> Admissions
      </Link>

      <PageHeader
        eyebrow={a.institution?.country ?? 'Admissions'}
        title={a.institution?.name ?? '—'}
        description={a.enrolment_type ?? undefined}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            {a.institution && (
              <Link href={`/${locale}/portfolio/${a.institution.id}`}>
                <Button variant="secondary">
                  <Building2 size={15} /> {locale === 'pt' ? 'No Portfólio' : 'In Portfolio'}
                </Button>
              </Link>
            )}
            {canEdit && (
              <Button variant="primary" onClick={() => setEditing(true)}>
                <Pencil size={15} /> {locale === 'pt' ? 'Editar' : 'Edit'}
              </Button>
            )}
          </div>
        }
      />

      {a.streamsTyped.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
          {a.streamsTyped.map((s) => (
            <span key={s} style={chip}>{STREAM_LABEL[s]}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
        <PortalSection locale={locale} admission={a} />
        <DocumentsSection locale={locale} documents={a.documentsParsed} />
        {a.notes && <NotesSection locale={locale} notes={a.notes} />}
        <ContactsSection locale={locale} contacts={a.contactsParsed} />
      </div>

      {editing && (
        <AdmissionEditor locale={locale} admission={a} onClose={() => setEditing(false)} />
      )}
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="movy-card" style={{ padding: 20, borderRadius: radius.md }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px', fontFamily: font.display, fontSize: 15, color: t.text }}>
        <span style={{ color: color.purple }}>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function PortalSection({ locale, admission }: { locale: string; admission: SchoolAdmissionView }) {
  const [pending, startTransition] = useTransition()
  const [revealed, setRevealed] = useState<{ login: string | null; password: string | null } | null>(null)
  const [shown, setShown] = useState(false)

  function reveal() {
    if (revealed) { setShown((s) => !s); return }
    startTransition(async () => {
      const res = await revealPortalPasswordAction(admission.id)
      setRevealed(res)
      setShown(true)
    })
  }

  return (
    <Card title={locale === 'pt' ? 'Matrícula & Portal' : 'Enrolment & Portal'} icon={<KeyRound size={16} />}>
      <Row label={locale === 'pt' ? 'Tipo' : 'Type'} value={admission.enrolment_type ?? '—'} />
      {admission.portal_url && (
        <Row
          label="Portal"
          value={
            <a href={admission.portal_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: color.purple, wordBreak: 'break-all' }}>
              {admission.portal_url} <ExternalLink size={13} />
            </a>
          }
        />
      )}
      <Row label="Login" value={revealed?.login ?? admission.credentialLogin ?? '—'} mono />
      {admission.hasCredential ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontFamily: font.mono, fontSize: 14, color: t.text, letterSpacing: shown ? 0 : 2 }}>
            {shown && revealed ? (revealed.password || '—') : '••••••••'}
          </span>
          <Button variant="secondary" onClick={reveal} loading={pending} aria-label={shown ? 'Esconder senha' : 'Revelar senha'}>
            {shown ? <EyeOff size={14} /> : <Eye size={14} />}
            {shown ? (locale === 'pt' ? 'Esconder' : 'Hide') : locale === 'pt' ? 'Revelar' : 'Reveal'}
          </Button>
          {shown && revealed?.password && (
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(revealed.password ?? '')}
              aria-label={locale === 'pt' ? 'Copiar senha' : 'Copy password'}
              style={{ display: 'inline-flex', background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, padding: 4 }}
            >
              <Copy size={15} />
            </button>
          )}
        </div>
      ) : (
        <p style={{ margin: '6px 0 0', fontSize: 12.5, color: t.textMuted, fontFamily: font.body }}>
          {locale === 'pt' ? 'Sem credencial de portal cadastrada.' : 'No portal credential saved.'}
        </p>
      )}
      <p style={{ margin: '12px 0 0', fontSize: 11.5, color: t.textSubtle, fontFamily: font.body }}>
        {locale === 'pt' ? 'Revelar a senha é registrado no log de auditoria.' : 'Revealing the password is recorded in the audit log.'}
      </p>
    </Card>
  )
}

function DocumentsSection({ locale, documents }: { locale: string; documents: AdmissionDocument[] }) {
  return (
    <Card title={locale === 'pt' ? 'Documentos para matrícula' : 'Documents for enrolment'} icon={<CheckCircle2 size={16} />}>
      {documents.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, fontFamily: font.body }}>—</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {documents.map((d, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} style={{ color: color.purple, flexShrink: 0, marginTop: 1 }} strokeWidth={1.8} />
              <span style={{ fontFamily: font.body, fontSize: 13.5, color: t.text, lineHeight: 1.45 }}>
                {d.label}
                {d.tags.length > 0 && (
                  <span style={{ marginLeft: 8 }}>
                    {d.tags.map((tag) => (
                      <span key={tag} style={tagPill}>{TAG_LABEL[tag] ?? tag}</span>
                    ))}
                  </span>
                )}
                {d.note && <span style={{ display: 'block', color: t.textMuted, fontSize: 12.5 }}>{d.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function NotesSection({ locale, notes }: { locale: string; notes: string }) {
  return (
    <Card title="Notes" icon={<Pencil size={15} />}>
      <div
        style={{
          fontFamily: font.body, fontSize: 13.5, color: t.text, lineHeight: 1.55, whiteSpace: 'pre-wrap',
          borderLeft: `3px solid ${color.gold}`, paddingLeft: 12, background: ink(0.02), borderRadius: 6, padding: '10px 12px',
        }}
      >
        {notes}
      </div>
    </Card>
  )
}

function ContactsSection({ locale, contacts }: { locale: string; contacts: AdmissionContact[] }) {
  return (
    <Card title={locale === 'pt' ? 'Contatos' : 'Contacts'} icon={<Mail size={15} />}>
      {contacts.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, fontFamily: font.body }}>—</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contacts.map((c, i) => (
            <li key={i} style={{ paddingBottom: 12, borderBottom: i < contacts.length - 1 ? `1px solid ${ink(0.06)}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: font.body, fontWeight: 600, fontSize: 13.5, color: t.text }}>{c.name ?? '—'}</span>
                {c.role && <span style={tagPill}>{ROLE_LABEL[c.role] ?? c.role}</span>}
              </div>
              {c.email && (
                <a href={`mailto:${c.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: 12.5, color: color.purple, fontFamily: font.body }}>
                  <Mail size={12} /> {c.email}
                </a>
              )}
              {c.phone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, marginLeft: c.email ? 12 : 0, fontSize: 12.5, color: t.textMuted, fontFamily: font.body }}>
                  <Phone size={12} /> {c.phone}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '4px 0' }}>
      <span style={{ flexShrink: 0, width: 70, fontSize: 12, color: t.textMuted, fontFamily: font.body, paddingTop: 1 }}>{label}</span>
      <span style={{ fontFamily: mono ? font.mono : font.body, fontSize: 13.5, color: t.text, minWidth: 0 }}>{value}</span>
    </div>
  )
}

const chip: React.CSSProperties = {
  display: 'inline-block', padding: '3px 11px', borderRadius: 999, fontSize: 12, fontFamily: font.body,
  fontWeight: 600, color: color.purple, background: ink(0.05), border: `1px solid ${ink(0.08)}`,
}
const tagPill: React.CSSProperties = {
  display: 'inline-block', padding: '1px 7px', borderRadius: 999, fontSize: 10.5, fontFamily: font.body,
  fontWeight: 600, color: t.textMuted, background: ink(0.05), marginRight: 4,
}
