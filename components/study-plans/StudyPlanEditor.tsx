'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { updateStudyPlan } from '@/app/[locale]/(protected)/study-plans/actions'
import { COURSE_PRESETS, COURSE_TYPES, createCourse, createExtraCosts, uid } from '@/lib/study-plans/defaults'
import {
  buildSchedule,
  courseDeposit,
  courseMaterial,
  coursePaymentBalance,
  courseStudyWeeks,
  courseTotal,
  courseTuition,
  formatDate,
  money,
  number,
  planCourseDeposits,
  planExtrasTotal,
  planGrandTotal,
  planHolidayWeeks,
  planPaymentBalance,
  planStudyWeeks,
  planVisaWeeks,
} from '@/lib/study-plans/calculations'
import type { ApplicantType, CourseType, StudyCourse, StudyPlanData } from '@/lib/study-plans/types'

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
      const parts = Math.max(1, Math.round(number(course.paymentParts) || 1))
      const each = Math.round((balance / parts) * 100) / 100
      for (let i = 1; i <= parts; i++) {
        // Last installment absorbs the rounding remainder so the parts sum to the exact balance.
        const amount = i === parts ? Math.round((balance - each * (parts - 1)) * 100) / 100 : each
        payments.push({
          id: uid('pay'),
          item: `${course.provider || COURSE_TYPES[course.type].label} - Parcela ${i}`,
          due: i === 1 ? course.paymentFrequency : '',
          amount,
        })
      }
    }

    patchPlan({ payments })
  }

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
                  <Field label="Data de início"><input style={input} type="date" value={course.start} onChange={(e) => updateCourse(course.id, { start: e.target.value })} /></Field>
                  <Field label="Horário"><input style={input} value={course.timetable} onChange={(e) => updateCourse(course.id, { timetable: e.target.value })} /></Field>
                  {course.type === 'elicos' ? (
                    <Field label="Valor por semana"><NumberInput value={course.ratePerWeek} onChange={(value) => updateCourse(course.id, { ratePerWeek: value })} /></Field>
                  ) : (
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
                  <Field label="Frequência"><input style={input} value={course.paymentFrequency} onChange={(e) => updateCourse(course.id, { paymentFrequency: e.target.value })} /></Field>
                </div>

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

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }
const input = { width: '100%', border: '1px solid rgba(28,18,51,0.12)', borderRadius: 9, padding: '9px 10px', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#2A1153', background: '#fff' }
const primaryButton = { border: 0, borderRadius: 10, padding: '11px 16px', background: '#2A1153', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }
const proposalButton: React.CSSProperties = { border: '1px solid #2A1153', borderRadius: 10, padding: '10px 15px', background: '#fff', color: '#2A1153', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }
const ghostButton = { border: '1px solid rgba(28,18,51,0.12)', borderRadius: 9, padding: '8px 11px', background: '#fff', color: '#2A1153', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12 }
const dangerButton = { ...ghostButton, color: '#D23B2B' }
const pill = { borderRadius: 999, padding: '4px 9px', fontSize: 11, fontWeight: 800 }
const noticeDanger = { background: 'rgba(210,59,43,0.08)', border: '1px solid rgba(210,59,43,0.16)', color: '#9f1d03', borderRadius: 12, padding: '10px 12px', fontSize: 13 }
