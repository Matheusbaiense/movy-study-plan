'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { updateStudyPlan } from '@/app/[locale]/(protected)/study-plans/actions'
import {
  COURSE_PRESETS,
  COURSE_TYPES,
  ELICOS_MODULE_NAMES,
  MAX_TRANSITION_HOLIDAY_WEEKS,
  PAYMENT_CADENCES,
  buildElicosSegments,
  createCourse,
  createElicosModule,
  createExtraCosts,
  uid,
} from '@/lib/study-plans/defaults'
import {
  buildSchedule,
  courseDeposit,
  courseMaterial,
  coursePaymentBalance,
  courseStudyWeeks,
  courseTotal,
  courseTuition,
  datedInstallments,
  daysBetween,
  formatDate,
  money,
  nextMonday,
  number,
  planCourseDeposits,
  planExtrasTotal,
  planGrandTotal,
  planHolidayWeeks,
  planNewVisaDate,
  planPaymentBalance,
  planStudyWeeks,
  planVisaWeeks,
} from '@/lib/study-plans/calculations'
import type { ApplicantType, CourseType, ElicosModule, StudyCourse, StudyPlanData } from '@/lib/study-plans/types'

interface Props {
  id: string
  locale: string
  initialData: StudyPlanData
  status: string
}

const applicantTypes: ApplicantType[] = ['Individual', 'Casal', 'Família', 'Single Parent']

export function StudyPlanEditor({ id, locale, initialData, status }: Props) {
  const [plan, setPlan] = useState(initialData)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()
  const schedule = useMemo(() => buildSchedule(plan), [plan])

  function patchPlan(patch: Partial<StudyPlanData>) {
    setPlan((current) => ({ ...current, ...patch }))
    setSaveState('idle')
  }

  function updateCourse(courseId: string, patch: Partial<StudyCourse>) {
    setPlan((current) => ({
      ...current,
      courses: current.courses.map((course) => course.id === courseId ? { ...course, ...patch } : course),
    }))
    setSaveState('idle')
  }

  // ELICOS modules drive the study/holiday segments (12 + 4 rule).
  function updateModules(courseId: string, modules: ElicosModule[]) {
    updateCourse(courseId, { modules, segments: buildElicosSegments(modules) })
  }

  function setCourseStart(course: StudyCourse, value: string) {
    updateCourse(course.id, { start: course.type === 'elicos' ? nextMonday(value) : value })
  }

  function save() {
    startTransition(async () => {
      try {
        await updateStudyPlan(id, plan, status)
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    })
  }

  function applyPreset(courseId: string, index: number) {
    const preset = COURSE_PRESETS[index]
    if (!preset) return
    updateCourse(courseId, {
      ...preset,
      hasMaterial: preset.hasMaterial ?? preset.type === 'vet',
      paymentParts: preset.paymentParts ?? 4,
      paymentFrequency: preset.paymentFrequency ?? 'A confirmar',
      depositWeeks: preset.depositWeeks ?? 0,
    })
  }

  function suggestPayments() {
    const payments = []
    const deposit = planCourseDeposits(plan)
    const extras = planExtrasTotal(plan)
    if (deposit > 0) payments.push({ id: uid('pay'), item: 'Depósito escolas (matrícula/material/entrada)', due: 'No fechamento', amount: deposit })
    if (extras > 0) payments.push({ id: uid('pay'), item: 'OSHC + Visto + adicionais', due: 'No fechamento', amount: extras })

    for (const course of plan.courses) {
      const balance = coursePaymentBalance(course)
      if (balance <= 0) continue
      const parts = Math.max(1, Math.round(number(course.paymentParts) || 1))
      const cadence = number(course.paymentCadenceDays) || 30
      const label = course.provider || COURSE_TYPES[course.type].label
      // Real due dates from the course start, spaced by the chosen cadence.
      for (const inst of datedInstallments(balance, parts, cadence, course.start, label)) {
        payments.push({ id: uid('pay'), item: inst.item, due: inst.due ? formatDate(inst.due) : 'A confirmar', amount: inst.amount })
      }
    }

    patchPlan({ payments })
  }

  const visa = planNewVisaDate(plan)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.04em' }}>{plan.student || 'Cotação sem estudante'}</h1>
            <p style={{ margin: '6px 0 0', color: 'rgba(28,18,51,0.58)', fontSize: 13 }}>
              {plan.courses.length} curso(s) · {planStudyWeeks(plan)} semanas de estudo · {money(planGrandTotal(plan))}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/${locale}/study-plans/${id}/proposal`} style={proposalButton}>
              Proposta / PDF
            </Link>
            <button onClick={save} disabled={isPending} style={primaryButton}>
              {isPending ? 'Salvando...' : saveState === 'saved' ? 'Salvo' : 'Salvar'}
            </button>
          </div>
        </div>

        {saveState === 'error' && (
          <div style={noticeDanger}>Não consegui salvar. Verifique sua sessão e tente novamente.</div>
        )}

        <Section title="Dados do estudante">
          <div style={grid2}>
            <Field label="Nome do estudante ou casal">
              <input style={input} value={plan.student} onChange={(e) => patchPlan({ student: e.target.value })} />
            </Field>
            <Field label="Tipo de visto / aplicante">
              <select
                style={input}
                value={plan.applicantType}
                onChange={(e) => {
                  const applicantType = e.target.value as ApplicantType
                  patchPlan({ applicantType, extraCosts: createExtraCosts(applicantType) })
                }}
              >
                {applicantTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Vencimento do visto atual">
              <input style={input} type="date" value={plan.currentVisaExpiry} onChange={(e) => patchPlan({ currentVisaExpiry: e.target.value })} />
            </Field>
            <Field label="Consultor">
              <input style={input} value={plan.consultant} onChange={(e) => patchPlan({ consultant: e.target.value })} />
            </Field>
          </div>
        </Section>

        <Section
          title="Cursos"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              {(['elicos', 'vet', 'he'] as CourseType[]).map((type) => (
                <button key={type} type="button" style={ghostButton} onClick={() => patchPlan({ courses: [...plan.courses, createCourse(type)] })}>
                  + {COURSE_TYPES[type].label}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ display: 'grid', gap: 14 }}>
            {plan.courses.map((course, courseIndex) => (
              <div key={course.id} style={{ border: '1px solid rgba(28,18,51,0.09)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ ...pill, background: `${COURSE_TYPES[course.type].color}18`, color: COURSE_TYPES[course.type].color }}>
                    #{courseIndex + 1} {COURSE_TYPES[course.type].label}
                  </span>
                  <select style={{ ...input, width: 220 }} value={course.type} onChange={(e) => updateCourse(course.id, { ...createCourse(e.target.value as CourseType), id: course.id })}>
                    <option value="elicos">ELICOS</option>
                    <option value="vet">VET</option>
                    <option value="he">Higher Ed</option>
                  </select>
                  <select style={{ ...input, width: 260 }} onChange={(e) => applyPreset(course.id, Number(e.target.value))} value="">
                    <option value="">Aplicar preset...</option>
                    {COURSE_PRESETS.map((preset, i) => (
                      <option key={`${preset.provider}-${preset.name}-${i}`} value={i}>{preset.provider} - {preset.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    style={dangerButton}
                    onClick={() => patchPlan({ courses: plan.courses.filter((item) => item.id !== course.id) })}
                  >
                    Remover
                  </button>
                </div>

                <div style={grid2}>
                  <Field label="Escola / provedor"><input style={input} value={course.provider} onChange={(e) => updateCourse(course.id, { provider: e.target.value })} /></Field>
                  <Field label="Curso"><input style={input} value={course.name} onChange={(e) => updateCourse(course.id, { name: e.target.value })} /></Field>
                  <Field label={course.type === 'elicos' ? 'Data de início (segunda-feira)' : 'Data de início'}>
                    <input style={input} type="date" value={course.start} onChange={(e) => setCourseStart(course, e.target.value)} />
                  </Field>
                  <Field label="Horário"><input style={input} value={course.timetable} onChange={(e) => updateCourse(course.id, { timetable: e.target.value })} /></Field>
                  {course.type !== 'elicos' && (
                    <Field label="Tuition total"><NumberInput value={course.tuition} onChange={(value) => updateCourse(course.id, { tuition: value })} /></Field>
                  )}
                  <Field label="Matrícula"><NumberInput value={course.enrolmentFee} onChange={(value) => updateCourse(course.id, { enrolmentFee: value })} /></Field>
                  {course.type !== 'he' && (
                    <Field label={course.type === 'vet' ? 'Material (opcional)' : 'Material'}>
                      <NumberInput value={course.materialFee} onChange={(value) => updateCourse(course.id, { materialFee: value })} />
                    </Field>
                  )}
                  <Field label="Bolsa / desconto"><NumberInput value={course.scholarship} onChange={(value) => updateCourse(course.id, { scholarship: value })} /></Field>
                  {course.type === 'elicos' && <Field label="Entrada em semanas"><NumberInput value={course.depositWeeks} onChange={(value) => updateCourse(course.id, { depositWeeks: value })} /></Field>}
                  <Field label="Parcelas sugeridas"><NumberInput value={course.paymentParts} onChange={(value) => updateCourse(course.id, { paymentParts: value })} /></Field>
                  <Field label="Cadência das parcelas">
                    <select style={input} value={course.paymentCadenceDays ?? 30} onChange={(e) => updateCourse(course.id, { paymentCadenceDays: Number(e.target.value) })}>
                      {PAYMENT_CADENCES.map((c) => <option key={c.days} value={c.days}>{c.label}</option>)}
                    </select>
                  </Field>
                </div>

                {courseIndex > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Field label={`Férias de transição antes deste curso (semanas · máx ${MAX_TRANSITION_HOLIDAY_WEEKS})`}>
                      <NumberInput
                        value={course.gapBeforeWeeks ?? 0}
                        onChange={(value) => updateCourse(course.id, { gapBeforeWeeks: Math.max(0, Math.min(MAX_TRANSITION_HOLIDAY_WEEKS, Math.round(value))) })}
                      />
                    </Field>
                  </div>
                )}

                {course.type === 'elicos' && (
                  <ModuleEditor
                    modules={course.modules ?? []}
                    onChange={(modules) => updateModules(course.id, modules)}
                  />
                )}

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  <MiniStat label="Estudo" value={`${courseStudyWeeks(course)} sem`} />
                  <MiniStat label="Tuition" value={money(courseTuition(course))} />
                  <MiniStat label="Depósito" value={money(courseDeposit(course))} />
                  <MiniStat label="Total" value={money(courseTotal(course))} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Linha do tempo">
          <Timeline plan={plan} visaDate={visa.date} />
        </Section>

        <Section title="Custos adicionais">
          <div style={{ display: 'grid', gap: 10 }}>
            {plan.extraCosts.map((extra) => (
              <div key={extra.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 130px auto', gap: 10 }}>
                <input style={input} value={extra.item} onChange={(e) => patchPlan({ extraCosts: plan.extraCosts.map((item) => item.id === extra.id ? { ...item, item: e.target.value } : item) })} />
                <select style={input} value={extra.category} onChange={(e) => patchPlan({ extraCosts: plan.extraCosts.map((item) => item.id === extra.id ? { ...item, category: e.target.value as ExtraCostCategory } : item) })}>
                  <option value="oshc">OSHC</option>
                  <option value="visa">Visto</option>
                  <option value="admin">Admin</option>
                  <option value="medical">Médico</option>
                  <option value="other">Outro</option>
                </select>
                <NumberInput value={extra.amount} onChange={(value) => patchPlan({ extraCosts: plan.extraCosts.map((item) => item.id === extra.id ? { ...item, amount: value } : item) })} />
                <button style={dangerButton} onClick={() => patchPlan({ extraCosts: plan.extraCosts.filter((item) => item.id !== extra.id) })}>Remover</button>
              </div>
            ))}
            <button style={ghostButton} onClick={() => patchPlan({ extraCosts: [...plan.extraCosts, { id: uid('extra'), item: 'Novo custo', category: 'other', amount: 0 }] })}>+ Adicionar custo</button>
          </div>
        </Section>

        <Section title="Pagamento" action={<button style={ghostButton} onClick={suggestPayments}>Sugerir parcelamento</button>}>
          <div style={{ display: 'grid', gap: 10 }}>
            {plan.payments.map((payment) => (
              <div key={payment.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 130px auto', gap: 10 }}>
                <input style={input} value={payment.item} onChange={(e) => patchPlan({ payments: plan.payments.map((item) => item.id === payment.id ? { ...item, item: e.target.value } : item) })} />
                <input style={input} value={payment.due} onChange={(e) => patchPlan({ payments: plan.payments.map((item) => item.id === payment.id ? { ...item, due: e.target.value } : item) })} />
                <NumberInput value={payment.amount} onChange={(value) => patchPlan({ payments: plan.payments.map((item) => item.id === payment.id ? { ...item, amount: value } : item) })} />
                <button style={dangerButton} onClick={() => patchPlan({ payments: plan.payments.filter((item) => item.id !== payment.id) })}>Remover</button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <aside style={{ position: 'sticky', top: 20, display: 'grid', gap: 14 }}>
        <SummaryCard title="Resumo">
          <MiniStat label="Estudo" value={`${planStudyWeeks(plan)} sem`} />
          <MiniStat label="Férias" value={`${planHolidayWeeks(plan)} sem`} />
          <MiniStat label="Total visto" value={`${planVisaWeeks(plan)} sem`} />
          <MiniStat label="Novo venc. visto" value={visa.date ? formatDate(visa.date) : '—'} strong />
          <MiniStat label="Total geral" value={money(planGrandTotal(plan))} strong />
          <MiniStat label="Depósito escolas" value={money(planCourseDeposits(plan))} />
          <MiniStat label="OSHC/Visto/Extras" value={money(planExtrasTotal(plan))} />
          <MiniStat label="Saldo cursos" value={money(planPaymentBalance(plan))} />
        </SummaryCard>

        <SummaryCard title="Cronograma">
          <div style={{ display: 'grid', gap: 9 }}>
            {schedule.slice(0, 8).map((row) => (
              <div key={`${row.course.id}-${row.segment.id}`} style={{ display: 'grid', gap: 2, borderBottom: '1px solid rgba(28,18,51,0.06)', paddingBottom: 8 }}>
                <strong style={{ fontSize: 12 }}>{row.segment.label}</strong>
                <span style={{ color: 'rgba(28,18,51,0.56)', fontSize: 11 }}>{formatDate(row.start)} - {formatDate(row.end)} · {row.weeks} sem</span>
              </div>
            ))}
          </div>
        </SummaryCard>
      </aside>
    </div>
  )
}

type ExtraCostCategory = StudyPlanData['extraCosts'][number]['category']

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid rgba(28,18,51,0.08)', borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, letterSpacing: '-0.02em' }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid rgba(28,18,51,0.08)', borderRadius: 16, padding: 16 }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 15 }}>{title}</h2>
      <div style={{ display: 'grid', gap: 9 }}>{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(28,18,51,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      {children}
    </label>
  )
}

function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <input style={{ ...input, textAlign: 'right' }} type="number" step="0.01" value={value} onChange={(e) => onChange(number(e.target.value))} />
}

function MiniStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
      <span style={{ color: 'rgba(28,18,51,0.52)', fontSize: 12 }}>{label}</span>
      <strong style={{ color: '#2A1153', fontSize: strong ? 15 : 12.5 }}>{value}</strong>
    </div>
  )
}

const MODULE_HEADER = ['Módulo', 'Valor/sem', 'Semanas'] as const

function ModuleEditor({ modules, onChange }: { modules: ElicosModule[]; onChange: (modules: ElicosModule[]) => void }) {
  function update(moduleId: string, patch: Partial<ElicosModule>) {
    onChange(modules.map((m) => m.id === moduleId ? { ...m, ...patch } : m))
  }
  return (
    <div style={{ marginTop: 12, border: '1px dashed rgba(28,18,51,0.16)', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4B1A77' }}>Módulos de inglês · 12 estudo + 4 férias</span>
        <button type="button" style={ghostButton} onClick={() => onChange([...modules, createElicosModule()])}>+ Módulo</button>
      </div>
      {modules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px auto', gap: 8, marginBottom: 6 }}>
          {MODULE_HEADER.map((h) => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(28,18,51,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>)}
          <span />
        </div>
      )}
      <div style={{ display: 'grid', gap: 8 }}>
        {modules.map((m) => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px auto', gap: 8 }}>
            <select style={input} value={m.name} onChange={(e) => update(m.id, { name: e.target.value })}>
              {ELICOS_MODULE_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <NumberInput value={m.ratePerWeek} onChange={(value) => update(m.id, { ratePerWeek: value })} />
            <NumberInput value={m.weeks} onChange={(value) => update(m.id, { weeks: Math.max(0, Math.round(value)) })} />
            <button type="button" style={dangerButton} onClick={() => onChange(modules.filter((x) => x.id !== m.id))}>×</button>
          </div>
        ))}
        {modules.length === 0 && <span style={{ fontSize: 12, color: 'rgba(28,18,51,0.5)' }}>Adicione ao menos um módulo (ex.: General English).</span>}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(28,18,51,0.5)' }}>Tuition do ELICOS = soma de (semanas × valor/semana) dos módulos.</div>
    </div>
  )
}

const TIMELINE_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function Timeline({ plan, visaDate }: { plan: StudyPlanData; visaDate: string }) {
  const rows = useMemo(() => buildSchedule(plan).filter((r) => r.start && r.end), [plan])
  if (rows.length === 0) {
    return <span style={{ fontSize: 12, color: 'rgba(28,18,51,0.5)' }}>Defina a data de início do primeiro curso para ver a linha do tempo.</span>
  }
  const rangeStart = rows[0].start
  const lastEnd = rows[rows.length - 1].end
  const rangeEnd = visaDate && visaDate > lastEnd ? visaDate : lastEnd
  const total = Math.max(1, daysBetween(rangeStart, rangeEnd))
  const pct = (iso: string) => (daysBetween(rangeStart, iso) / total) * 100
  const lastStudy = [...rows].reverse().find((r) => r.segment.kind === 'study')
  const coe = lastStudy ? lastStudy.end : lastEnd

  const ticks: Array<{ iso: string; label: string }> = []
  const startDate = new Date(`${rangeStart}T00:00:00Z`)
  let m = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1))
  if (m < startDate) m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
  while (m.toISOString().slice(0, 10) <= rangeEnd) {
    ticks.push({ iso: m.toISOString().slice(0, 10), label: `${TIMELINE_MONTHS[m.getUTCMonth()]} ${String(m.getUTCFullYear()).slice(2)}` })
    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative', height: 40, border: '1px solid rgba(28,18,51,0.10)', borderRadius: 10, overflow: 'hidden', background: '#FBFAFE' }}>
          {rows.map((r) => {
            const left = pct(r.start)
            const width = ((daysBetween(r.start, r.end) + 1) / total) * 100
            const study = r.segment.kind === 'study'
            return (
              <div
                key={`${r.course.id}-${r.segment.id}`}
                title={`${r.segment.label} · ${r.weeks} sem (${formatDate(r.start)}–${formatDate(r.end)})`}
                style={{
                  position: 'absolute', top: 6, height: 28, left: `${left}%`, width: `${width}%`,
                  borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, overflow: 'hidden',
                  color: study ? '#fff' : '#2A1153',
                  background: study ? 'linear-gradient(135deg,#4B1A77,#7A1E7E)' : 'linear-gradient(135deg,#FBB615,#F36B1C)',
                }}
              >
                {width > 4 ? r.weeks : ''}
              </div>
            )
          })}
          <Marker left={pct(coe)} color="#2A1153" label={`CoE ${formatDate(coe)}`} />
          {visaDate && <Marker left={Math.min(99.5, pct(visaDate))} color="#FBB615" label={`Visto ${formatDate(visaDate)}`} />}
        </div>
        <div style={{ position: 'relative', height: 22, marginTop: 2 }}>
          {ticks.map((t) => (
            <div key={t.iso} style={{ position: 'absolute', left: `${pct(t.iso)}%`, top: 0, height: '100%', borderLeft: '1px solid rgba(28,18,51,0.08)' }}>
              <span style={{ position: 'absolute', top: 4, left: 3, fontSize: 10, color: 'rgba(28,18,51,0.5)', whiteSpace: 'nowrap', fontFamily: 'Space Mono, monospace' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(28,18,51,0.55)', flexWrap: 'wrap' }}>
        <span><Dot color="#4B1A77" /> Estudo</span>
        <span><Dot color="#FBB615" /> Férias</span>
        <span><Dot color="#2A1153" /> Fim do curso (CoE)</span>
        <span><Dot color="#FBB615" border /> Vencimento do visto</span>
      </div>
    </div>
  )
}

function Marker({ left, color, label }: { left: number; color: string; label: string }) {
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${left}%`, width: 0, borderLeft: `2px dashed ${color}` }}>
      <span style={{ position: 'absolute', top: -1, left: 4, fontSize: 9.5, fontWeight: 800, background: '#fff', padding: '1px 4px', borderRadius: 4, border: '1px solid rgba(28,18,51,0.10)', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

function Dot({ color, border = false }: { color: string; border?: boolean }) {
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: color, border: border ? '1px solid #2A1153' : 'none', verticalAlign: -1, marginRight: 6 }} />
}

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }
const input = { width: '100%', border: '1px solid rgba(28,18,51,0.12)', borderRadius: 9, padding: '9px 10px', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#2A1153', background: '#fff' }
const primaryButton = { border: 0, borderRadius: 10, padding: '11px 16px', background: '#2A1153', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }
const proposalButton: React.CSSProperties = { border: '1px solid #2A1153', borderRadius: 10, padding: '10px 15px', background: '#fff', color: '#2A1153', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }
const ghostButton = { border: '1px solid rgba(28,18,51,0.12)', borderRadius: 9, padding: '8px 11px', background: '#fff', color: '#2A1153', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12 }
const dangerButton = { ...ghostButton, color: '#D23B2B' }
const pill = { borderRadius: 999, padding: '4px 9px', fontSize: 11, fontWeight: 800 }
const noticeDanger = { background: 'rgba(210,59,43,0.08)', border: '1px solid rgba(210,59,43,0.16)', color: '#D23B2B', borderRadius: 12, padding: '10px 12px', fontSize: 13 }
