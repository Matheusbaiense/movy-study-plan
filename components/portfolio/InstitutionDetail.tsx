'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, DollarSign, Zap, Plus, Archive, ToggleLeft, ToggleRight, Globe, MapPin } from 'lucide-react'
import { ink, t } from '@/lib/ui/theme'
import { toJson } from '@/lib/db/json'
import type { Institution, Course, CoursePriceVersion, PricingRuleRow } from '@/lib/portfolio/types'
import {
  createCourseAction, updateCourseAction, toggleCourseActiveAction, archiveCourseAction,
  createPriceVersionAction, createPricingRuleAction, togglePricingRuleAction, deletePricingRuleAction,
  type CourseInput, type PriceVersionInput, type PricingRuleInput,
} from '@/app/[locale]/(protected)/portfolio/actions'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/form'

interface Props {
  institution: Institution
  courses: Course[]
  priceVersionsByCourse: Record<string, CoursePriceVersion[]>
  rules: PricingRuleRow[]
}

type Tab = 'courses' | 'prices' | 'rules'

const COURSE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  elicos: { bg: '#dbeafe', text: '#1d4ed8' },
  vet:    { bg: '#fef9c3', text: '#92400e' },
  he:     { bg: '#f3e8ff', text: '#7c3aed' },
}

function aud(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function InstitutionDetail({ institution, courses: initialCourses, priceVersionsByCourse: initialPrices, rules: initialRules }: Props) {
  const params = useParams()
  const locale = (params.locale as string) || 'pt'

  const [tab, setTab] = useState<Tab>('courses')
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1040, margin: '0 auto' }}>
      {/* Back breadcrumb */}
      <Link href={`/${locale}/portfolio`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: ink(0.55), textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={13} /> Portfólio
      </Link>

      <PageHeader
        title={institution.name}
        description={[
          institution.city ? `${institution.city}, ${institution.country}` : institution.country,
          institution.website ? institution.website.replace(/^https?:\/\//, '') : null,
          institution.prices_valid_until ? (() => {
            const d = Math.ceil((new Date(institution.prices_valid_until!).getTime() - Date.now()) / 86400000)
            return d <= 0 ? `Preços vencidos` : `Preços vencem em ${d}d`
          })() : null,
        ].filter(Boolean).join(' · ') || undefined}
      />

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16, padding: '8px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          {error}
          <button type="button" onClick={() => setError(null)} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <TabBtn active={tab === 'courses'} onClick={() => setTab('courses')} icon={<BookOpen size={13} />}>
          Cursos <CountBadge n={initialCourses.length} />
        </TabBtn>
        <TabBtn active={tab === 'prices'} onClick={() => setTab('prices')} icon={<DollarSign size={13} />}>
          Vigências
        </TabBtn>
        <TabBtn active={tab === 'rules'} onClick={() => setTab('rules')} icon={<Zap size={13} />}>
          Regras <CountBadge n={initialRules.length} />
        </TabBtn>
      </div>

      {tab === 'courses' && (
        <CoursesTab
          institution={institution}
          courses={initialCourses}
          onError={setError}
        />
      )}
      {tab === 'prices' && (
        <PricesTab
          institution={institution}
          courses={initialCourses}
          priceVersionsByCourse={initialPrices}
          onError={setError}
        />
      )}
      {tab === 'rules' && (
        <RulesTab
          institution={institution}
          rules={initialRules}
          onError={setError}
        />
      )}
    </div>
  )
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────

function CoursesTab({ institution, courses: initial, onError }: {
  institution: Institution
  courses: Course[]
  onError: (e: string) => void
}) {
  const router = useRouter()
  const [courses, setCourses] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(input: Omit<CourseInput, 'institution_id'>) {
    startTransition(async () => {
      try {
        if (editing) {
          await updateCourseAction(editing.id, institution.id, input)
          setCourses((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...input } : c))
        } else {
          const r = await createCourseAction({ ...input, institution_id: institution.id })
          setCourses((prev) => [...prev, { ...input, id: r.id, institution_id: institution.id, is_active: true, org_id: institution.org_id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), campus_id: null, confidence: 0, currency_code: 'AUD', default_intake: null, deleted_at: null, external_id: null, metadata: {}, source: 'manual', updated_by: null, created_by: null } as Course])
        }
        setShowModal(false); setEditing(null)
        router.refresh()
      } catch (e) { onError(e instanceof Error ? e.message : 'Erro ao salvar curso') }
    })
  }

  function handleToggle(course: Course) {
    startTransition(async () => {
      try {
        await toggleCourseActiveAction(course.id, institution.id, !course.is_active)
        setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_active: !c.is_active } : c))
        router.refresh()
      } catch (e) { onError(e instanceof Error ? e.message : 'Erro') }
    })
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveCourseAction(id, institution.id)
        setCourses((prev) => prev.filter((c) => c.id !== id))
        router.refresh()
      } catch (e) { onError(e instanceof Error ? e.message : 'Erro ao arquivar') }
    })
  }

  const active = courses.filter((c) => c.is_active)
  const inactive = courses.filter((c) => !c.is_active)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="button" variant="primary" onClick={() => { setEditing(null); setShowModal(true) }} disabled={isPending}>
          <Plus size={14} strokeWidth={2.5} /> Novo curso
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nenhum curso cadastrado." description="Adicione o primeiro curso desta instituição." action={<Button variant="primary" type="button" onClick={() => { setEditing(null); setShowModal(true) }}><Plus size={14} />Novo curso</Button>} />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {[...active, ...inactive].map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              isPending={isPending}
              onEdit={() => { setEditing(course); setShowModal(true) }}
              onToggle={() => handleToggle(course)}
              onArchive={() => handleArchive(course.id)}
            />
          ))}
        </div>
      )}

      <CourseModal
        open={showModal}
        initial={editing}
        isPending={isPending}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditing(null) }}
      />
    </div>
  )
}

function CourseRow({ course, isPending, onEdit, onToggle, onArchive }: {
  course: Course
  isPending: boolean
  onEdit: () => void
  onToggle: () => void
  onArchive: () => void
}) {
  const [confirmArchive, setConfirmArchive] = useState(false)
  const tc = COURSE_TYPE_COLORS[course.type] ?? COURSE_TYPE_COLORS.elicos

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)', opacity: course.is_active ? 1 : 0.55 }}>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: tc.bg, color: tc.text, textTransform: 'uppercase', flexShrink: 0 }}>
        {course.type}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.name}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          {course.cricos && <span style={{ fontSize: 11, color: ink(0.45) }}>CRICOS: {course.cricos}</span>}
          {course.english_level && <span style={{ fontSize: 11, color: ink(0.45) }}>{course.english_level}</span>}
          {course.timetable && <span style={{ fontSize: 11, color: ink(0.45) }}>{course.timetable}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        <Button type="button" variant="secondary" onClick={onEdit} disabled={isPending}>Editar</Button>
        <button
          type="button"
          onClick={onToggle}
          disabled={isPending}
          aria-label={course.is_active ? 'Desativar curso' : 'Ativar curso'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}
        >
          {course.is_active ? <ToggleRight size={15} style={{ color: '#16a34a' }} /> : <ToggleLeft size={15} style={{ color: ink(0.4) }} />}
        </button>
        {confirmArchive ? (
          <Button type="button" variant="secondary" onClick={() => { onArchive(); setConfirmArchive(false) }} disabled={isPending} style={{ color: '#dc2626', borderColor: '#dc2626' }}>
            Confirmar?
          </Button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmArchive(true)}
            disabled={isPending}
            aria-label="Arquivar curso"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}
          >
            <Archive size={13} style={{ color: ink(0.4) }} />
          </button>
        )}
      </div>
    </div>
  )
}

function CourseModal({ open, initial, isPending, onSave, onClose }: {
  open: boolean
  initial: Course | null
  isPending: boolean
  onSave: (input: Omit<CourseInput, 'institution_id'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? 'elicos')
  const [cricos, setCricos] = useState(initial?.cricos ?? '')
  const [english, setEnglish] = useState(initial?.english_level ?? '')
  const [timetable, setTimetable] = useState(initial?.timetable ?? 'Integral')
  const [intake, setIntake] = useState(initial?.default_intake ?? '')

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar curso' : 'Novo curso'}>
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, type, cricos, english_level: english, timetable, default_intake: intake }) }}
        style={{ display: 'grid', gap: 12 }}>
        <Field label="Nome *">
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="General English Classic" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Tipo">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="elicos">ELICOS</option>
              <option value="vet">VET</option>
              <option value="he">HE</option>
            </Select>
          </Field>
          <Field label="Turno">
            <Input value={timetable} onChange={(e) => setTimetable(e.target.value)} placeholder="Integral" />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="CRICOS">
            <Input value={cricos} onChange={(e) => setCricos(e.target.value)} placeholder="12345A" />
          </Field>
          <Field label="Nível de inglês">
            <Input value={english} onChange={(e) => setEnglish(e.target.value)} placeholder="Elementary+" />
          </Field>
        </div>
        <Field label="Intake padrão">
          <Input value={intake} onChange={(e) => setIntake(e.target.value)} placeholder="Ex: Segunda-feira" />
        </Field>
        <ModalFooter onClose={onClose} isPending={isPending} label={initial ? 'Salvar' : 'Criar curso'} />
      </form>
    </Modal>
  )
}

// ─── Prices Tab ───────────────────────────────────────────────────────────────

function PricesTab({ institution, courses, priceVersionsByCourse: initial, onError }: {
  institution: Institution
  courses: Course[]
  priceVersionsByCourse: Record<string, CoursePriceVersion[]>
  onError: (e: string) => void
}) {
  const [pvByCourse, setPvByCourse] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [modalCourseId, setModalCourseId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openAdd(courseId: string) { setModalCourseId(courseId); setShowModal(true) }

  function handleSave(input: PriceVersionInput) {
    startTransition(async () => {
      try {
        const r = await createPriceVersionAction(input)
        const newRow: CoursePriceVersion = {
          id: r.id, course_id: input.course_id, org_id: institution.org_id,
          valid_from: input.valid_from, valid_until: input.valid_until ?? null,
          enrolment_fee_in_cents: input.enrolment_fee_in_cents,
          rate_per_week_in_cents: input.rate_per_week_in_cents,
          material_fee_in_cents: input.material_fee_in_cents ?? 0,
          has_material: (input.material_fee_in_cents ?? 0) > 0,
          tuition_in_cents: 0, deposit_weeks: input.deposit_weeks ?? 0,
          payment_parts: input.payment_parts ?? 1, payment_frequency: 'weekly',
          currency_code: input.currency_code ?? 'AUD', scholarship_in_cents: 0,
          market_id: null, nationality: null, source_document_id: null,
          metadata: {}, created_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }
        setPvByCourse((prev) => ({
          ...prev,
          [input.course_id]: [...(prev[input.course_id] ?? []), newRow],
        }))
        setShowModal(false)
      } catch (e) { onError(e instanceof Error ? e.message : 'Erro ao salvar vigência') }
    })
  }

  const activeCourses = courses.filter((c) => c.is_active)

  if (activeCourses.length === 0) {
    return <EmptyState icon={DollarSign} title="Nenhum curso ativo." description="Cadastre cursos primeiro para gerenciar vigências de preço." />
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {activeCourses.map((course) => {
        const versions = pvByCourse[course.id] ?? []
        const tc = COURSE_TYPE_COLORS[course.type] ?? COURSE_TYPE_COLORS.elicos
        return (
          <div key={course.id} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: tc.bg, color: tc.text, textTransform: 'uppercase' }}>{course.type}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{course.name}</span>
              </div>
              <Button type="button" variant="secondary" onClick={() => openAdd(course.id)} disabled={isPending}>
                <Plus size={12} /> Vigência
              </Button>
            </div>
            {versions.length === 0 ? (
              <div style={{ padding: '14px 16px', fontSize: 12, color: ink(0.45) }}>Nenhuma vigência cadastrada.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-sunken)' }}>
                    {['Início', 'Fim', 'Matrícula', 'Taxa/sem', 'Material', 'Depósito'].map((h) => (
                      <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, color: ink(0.5), fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {versions.map((pv) => (
                    <PriceVersionRow key={pv.id} pv={pv} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}

      <PriceVersionModal
        open={showModal && !!modalCourseId}
        courseId={modalCourseId ?? ''}
        institutionId={institution.id}
        isPending={isPending}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setModalCourseId(null) }}
      />
    </div>
  )
}

function PriceVersionRow({ pv }: { pv: CoursePriceVersion }) {
  const today = new Date().toISOString().slice(0, 10)
  const expired = pv.valid_until && pv.valid_until < today
  const expiring = pv.valid_until && !expired && Math.ceil((new Date(pv.valid_until).getTime() - Date.now()) / 86400000) <= 30

  const numCell: React.CSSProperties = { padding: '7px 12px', fontVariantNumeric: 'tabular-nums' }
  return (
    <tr style={{ borderTop: '1px solid var(--border)', color: expired ? ink(0.4) : t.text }}>
      <td style={numCell}>{fmtDate(pv.valid_from)}</td>
      <td style={numCell}>
        {fmtDate(pv.valid_until)}
        {expired && <span style={{ marginLeft: 4, fontSize: 10, color: '#dc2626', fontWeight: 700 }}>VENCIDA</span>}
        {expiring && <span style={{ marginLeft: 4, fontSize: 10, color: '#d97706', fontWeight: 700 }}>VENCENDO</span>}
      </td>
      <td style={numCell}>{aud(pv.enrolment_fee_in_cents)}</td>
      <td style={numCell}>{aud(pv.rate_per_week_in_cents)}</td>
      <td style={numCell}>{pv.has_material ? aud(pv.material_fee_in_cents) : '—'}</td>
      <td style={numCell}>{pv.deposit_weeks ? `${pv.deposit_weeks} sem` : '—'}</td>
    </tr>
  )
}

function PriceVersionModal({ open, courseId, institutionId, isPending, onSave, onClose }: {
  open: boolean
  courseId: string
  institutionId: string
  isPending: boolean
  onSave: (input: PriceVersionInput) => void
  onClose: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [validFrom, setValidFrom] = useState(today)
  const [validUntil, setValidUntil] = useState('')
  const [enrolment, setEnrolment] = useState('')
  const [ratePerWeek, setRatePerWeek] = useState('')
  const [material, setMaterial] = useState('')
  const [depositWeeks, setDepositWeeks] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const enrolmentCents = Math.round(parseFloat(enrolment || '0') * 100)
    const rateCents = Math.round(parseFloat(ratePerWeek || '0') * 100)
    const materialCents = Math.round(parseFloat(material || '0') * 100)
    if (!Number.isFinite(enrolmentCents) || !Number.isFinite(rateCents) || !Number.isFinite(materialCents)) return
    onSave({
      course_id: courseId,
      institution_id: institutionId,
      valid_from: validFrom,
      valid_until: validUntil || undefined,
      enrolment_fee_in_cents: enrolmentCents,
      rate_per_week_in_cents: rateCents,
      material_fee_in_cents: materialCents,
      deposit_weeks: parseInt(depositWeeks || '0'),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova vigência de preço">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Válido de *">
            <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
          </Field>
          <Field label="Válido até">
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Matrícula (AUD)">
            <Input type="number" value={enrolment} onChange={(e) => setEnrolment(e.target.value)} placeholder="250.00" min={0} step={0.01} />
          </Field>
          <Field label="Taxa/semana (AUD) *">
            <Input type="number" value={ratePerWeek} onChange={(e) => setRatePerWeek(e.target.value)} placeholder="400.00" min={0} step={0.01} required />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Material (AUD)">
            <Input type="number" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="75.00" min={0} step={0.01} />
          </Field>
          <Field label="Semanas de depósito">
            <Input type="number" value={depositWeeks} onChange={(e) => setDepositWeeks(e.target.value)} placeholder="0" min={0} step={1} />
          </Field>
        </div>
        <p style={{ fontSize: 11, color: ink(0.45), margin: 0 }}>Valores em dólares australianos. Serão convertidos para centavos internamente.</p>
        <ModalFooter onClose={onClose} isPending={isPending} label="Salvar vigência" />
      </form>
    </Modal>
  )
}

// ─── Rules Tab ────────────────────────────────────────────────────────────────

const EFFECT_LABELS: Record<string, string> = {
  add_fee: 'Taxa fixa',
  fee_per_week: 'Taxa por semana',
  material_cap: 'Cap de material',
  discount_pct: 'Desconto %',
  discount_fixed: 'Desconto fixo',
  promo_rate_override: 'Override de taxa',
  deposit: 'Depósito',
  agency_fee: 'Taxa de agência',
  markup: 'Markup',
}

const SCOPE_LABELS: Record<string, string> = {
  org: 'Organização',
  institution: 'Escola',
  campus: 'Campus',
  course: 'Curso',
  type: 'Tipo de curso',
}

function RulesTab({ institution, rules: initial, onError }: {
  institution: Institution
  rules: PricingRuleRow[]
  onError: (e: string) => void
}) {
  const [rules, setRules] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCreate(input: PricingRuleInput) {
    startTransition(async () => {
      try {
        const r = await createPricingRuleAction(input)
        setRules((prev) => [{
          id: r.id, label: input.label ?? null, scope: input.scope, scope_id: input.scope_id ?? null,
          conditions: toJson(input.conditions ?? {}),
          effect: toJson(input.effect),
          priority: input.priority ?? 0, is_active: true, valid_from: input.valid_from ?? null,
          valid_until: input.valid_until ?? null, org_id: institution.org_id, deleted_at: null,
          metadata: {}, created_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), updated_by: null,
        }, ...prev])
        setShowModal(false)
      } catch (e) { onError(e instanceof Error ? e.message : 'Erro ao salvar regra') }
    })
  }

  function handleToggle(rule: PricingRuleRow) {
    startTransition(async () => {
      try {
        await togglePricingRuleAction(rule.id, !rule.is_active)
        setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_active: !r.is_active } : r))
      } catch (e) { onError(e instanceof Error ? e.message : 'Erro') }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deletePricingRuleAction(id)
        setRules((prev) => prev.filter((r) => r.id !== id))
      } catch (e) { onError(e instanceof Error ? e.message : 'Erro ao excluir regra') }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="button" variant="primary" onClick={() => setShowModal(true)} disabled={isPending}>
          <Plus size={14} strokeWidth={2.5} /> Nova regra
        </Button>
      </div>

      {rules.length === 0 ? (
        <EmptyState icon={Zap} title="Nenhuma regra de preço cadastrada." description="Regras de preço permitem aplicar taxas, descontos e ajustes automaticamente." />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {rules.map((rule) => {
            const effect = typeof rule.effect === 'object' && rule.effect !== null && !Array.isArray(rule.effect) ? rule.effect as Record<string, unknown> : {}
            return (
              <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)', opacity: rule.is_active ? 1 : 0.5 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{rule.label ?? EFFECT_LABELS[String(effect.type)] ?? 'Regra'}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: ink(0.5) }}>
                      {SCOPE_LABELS[rule.scope] ?? rule.scope}
                    </span>
                    {!rule.is_active && <span style={{ fontSize: 10, color: ink(0.4) }}>inativa</span>}
                  </div>
                  <div style={{ fontSize: 11, color: ink(0.45), marginTop: 2 }}>
                    {String(effect.type ?? '')} {effect.value ? `· ${effect.value}` : ''} {effect.currency ? String(effect.currency) : ''}
                    {rule.valid_until && <span> · até {fmtDate(rule.valid_until)}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleToggle(rule)}
                    disabled={isPending}
                    aria-label={rule.is_active ? 'Desativar regra' : 'Ativar regra'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}
                  >
                    {rule.is_active ? <ToggleRight size={15} style={{ color: '#16a34a' }} /> : <ToggleLeft size={15} style={{ color: ink(0.4) }} />}
                  </button>
                  <RuleDeleteBtn onDelete={() => handleDelete(rule.id)} isPending={isPending} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RuleModal open={showModal} isPending={isPending} onSave={handleCreate} onClose={() => setShowModal(false)} />
    </div>
  )
}

function RuleDeleteBtn({ onDelete, isPending }: { onDelete: () => void; isPending: boolean }) {
  const [confirm, setConfirm] = useState(false)
  if (confirm) return (
    <Button type="button" variant="secondary" onClick={() => { onDelete(); setConfirm(false) }} disabled={isPending} style={{ color: '#dc2626', borderColor: '#dc2626', fontSize: 11 }}>
      Confirmar?
    </Button>
  )
  return (
    <button type="button" onClick={() => setConfirm(true)} disabled={isPending} aria-label="Excluir regra" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}>
      <Archive size={13} style={{ color: ink(0.4) }} />
    </button>
  )
}

function RuleModal({ open, isPending, onSave, onClose }: {
  open: boolean
  isPending: boolean
  onSave: (input: PricingRuleInput) => void
  onClose: () => void
}) {
  const [label, setLabel] = useState('')
  const [scope, setScope] = useState('org')
  const [effectType, setEffectType] = useState('add_fee')
  const [value, setValue] = useState('')
  const [currency, setCurrency] = useState('AUD')
  const [priority, setPriority] = useState('0')
  const [validUntil, setValidUntil] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      label: label || undefined,
      scope,
      effect: { type: effectType, value: parseFloat(value || '0'), currency },
      priority: parseInt(priority || '0'),
      valid_until: validUntil || undefined,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova regra de preço">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <Field label="Rótulo">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Taxa de agência AU" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Escopo">
            <Select value={scope} onChange={(e) => setScope(e.target.value)}>
              {Object.entries(SCOPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Efeito">
            <Select value={effectType} onChange={(e) => setEffectType(e.target.value)}>
              {Object.entries(EFFECT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
          <Field label="Valor">
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="150" min={0} step={0.01} />
          </Field>
          <Field label="Moeda">
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="AUD" maxLength={3} />
          </Field>
          <Field label="Prioridade">
            <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} min={0} step={1} />
          </Field>
        </div>
        <Field label="Válido até">
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </Field>
        <ModalFooter onClose={onClose} isPending={isPending} label="Criar regra" />
      </form>
    </Modal>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', fontSize: 13, fontWeight: active ? 700 : 500,
        background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: active ? '2px solid #F36B1C' : '2px solid transparent',
        color: active ? '#F36B1C' : ink(0.55),
        fontFamily: 'Satoshi, Outfit, sans-serif',
        transition: 'color 120ms',
      }}
    >
      {icon}{children}
    </button>
  )
}

function CountBadge({ n }: { n: number }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: ink(0.5), marginLeft: 2 }}>{n}</span>
  )
}


function ModalFooter({ onClose, isPending, label }: { onClose: () => void; isPending: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
      <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      <Button type="submit" variant="primary" loading={isPending}>{isPending ? 'Salvando…' : label}</Button>
    </div>
  )
}
