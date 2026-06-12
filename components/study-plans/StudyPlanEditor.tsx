'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { updateStudyPlan } from '@/app/[locale]/(protected)/study-plans/actions'
import {
  COURSE_PRESETS,
  COURSE_TYPES,
  DEFAULT_ELICOS_HOLIDAY_WEEKS,
  DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY,
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
  OFFSHORE_ELICOS_MIN_INSTALLMENT_WEEKS,
  buildSchedule,
  courseCanInstallment,
  courseDeposit,
  courseInstallmentBalance,
  courseStudyWeeks,
  courseTotal,
  courseTuition,
  datedInstallments,
  daysBetween,
  formatDate,
  money,
  nextMonday,
  number,
  planExtrasTotal,
  planGrandTotal,
  planHolidayWeeks,
  planInstallmentBalance,
  planNewVisaDate,
  planStudyWeeks,
  planUpfrontSchools,
  planVisaWeeks,
} from '@/lib/study-plans/calculations'
import type { ApplicantType, CourseType, ElicosModule, StudentLocation, StudyCourse, StudyPlanData, Timetable } from '@/lib/study-plans/types'
import type { PresetOption } from '@/lib/study-plans/presets'
import { color, ink, font } from '@/lib/ui/theme'

interface Props {
  id: string
  locale: string
  initialData: StudyPlanData
  status: string
  presets?: PresetOption[]
}

const applicantTypes: ApplicantType[] = ['Individual', 'Casal', 'Familia', 'Single Parent']
const timetableLabels: Record<Timetable, string> = {
  Manha: 'Manhã',
  Tarde: 'Tarde',
  Noite: 'Noite',
}

export function StudyPlanEditor({ id, locale, initialData, status, presets }: Props) {
  const [plan, setPlan] = useState(initialData)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()
  const schedule = useMemo(() => buildSchedule(plan), [plan])
  // DB presets when available, else the bundled defaults.
  const presetList: PresetOption[] = presets && presets.length > 0 ? presets : COURSE_PRESETS

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

  // ELICOS modules drive the study/holiday segments.
  function updateModules(courseId: string, modules: ElicosModule[]) {
    const course = plan.courses.find((item) => item.id === courseId)
    updateCourse(courseId, {
      modules,
      segments: buildElicosSegments(
        modules,
        course?.studyWeeksBeforeHoliday ?? DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY,
        course?.holidayWeeks ?? DEFAULT_ELICOS_HOLIDAY_WEEKS,
      ),
    })
  }

  function updateElicosPattern(course: StudyCourse, patch: Pick<Partial<StudyCourse>, 'studyWeeksBeforeHoliday' | 'holidayWeeks'>) {
    const next = { ...course, ...patch }
    updateCourse(course.id, {
      ...patch,
      segments: buildElicosSegments(
        next.modules ?? [],
        next.studyWeeksBeforeHoliday ?? DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY,
        next.holidayWeeks ?? DEFAULT_ELICOS_HOLIDAY_WEEKS,
      ),
    })
  }

  function setCourseStart(course: StudyCourse, value: string) {
    updateCourse(course.id, { start: course.type === 'elicos' ? nextMonday(value) : value })
  }

  function updateStandardCourseDuration(course: StudyCourse, patch: { studyWeeks?: number; holidayWeeks?: number }) {
    const studySegment = course.segments.find((segment) => segment.kind === 'study')
    const holidaySegment = course.segments.find((segment) => segment.kind === 'holiday')
    const studyWeeks = Math.max(1, Math.round(patch.studyWeeks ?? studySegment?.weeks ?? courseStudyWeeks(course) ?? 24))
    const holidayWeeks = Math.max(0, Math.round(patch.holidayWeeks ?? holidaySegment?.weeks ?? 0))
    updateCourse(course.id, {
      segments: [
        {
          id: studySegment?.id ?? uid('seg'),
          label: course.name || COURSE_TYPES[course.type].label,
          kind: 'study' as const,
          weeks: studyWeeks,
        },
        ...(holidayWeeks > 0
          ? [{
              id: holidaySegment?.id ?? uid('seg'),
              label: 'Férias',
              kind: 'holiday' as const,
              weeks: holidayWeeks,
            }]
          : []),
      ],
    })
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
    const preset = presetList[index]
    if (!preset) return
    const course = plan.courses.find((item) => item.id === courseId)
    const studyWeeksBeforeHoliday = course?.studyWeeksBeforeHoliday ?? DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY
    const holidayWeeks = course?.holidayWeeks ?? DEFAULT_ELICOS_HOLIDAY_WEEKS
    const modules = preset.type === 'elicos'
      ? [createElicosModule(preset.name, preset.ratePerWeek ?? course?.ratePerWeek ?? 260, courseStudyWeeks(course ?? createCourse('elicos')) || 12)]
      : undefined
    updateCourse(courseId, {
      ...preset,
      modules,
      studyWeeksBeforeHoliday: preset.type === 'elicos' ? studyWeeksBeforeHoliday : undefined,
      holidayWeeks: preset.type === 'elicos' ? holidayWeeks : undefined,
      segments: preset.type === 'elicos'
        ? buildElicosSegments(modules ?? [], studyWeeksBeforeHoliday, holidayWeeks)
        : createCourse(preset.type).segments,
      hasMaterial: preset.hasMaterial ?? preset.type === 'vet',
      paymentParts: preset.paymentParts ?? 4,
      paymentFrequency: preset.paymentFrequency ?? 'A confirmar',
      depositWeeks: preset.depositWeeks ?? 0,
    })
  }

  function suggestPayments() {
    const payments = []
    const upfront = planUpfrontSchools(plan)
    const extras = planExtrasTotal(plan)
    if (upfront > 0) payments.push({ id: uid('pay'), item: 'Escolas - pagamento no fechamento', due: 'No fechamento', amount: upfront })
    if (extras > 0) payments.push({ id: uid('pay'), item: 'OSHC + Visto + adicionais', due: 'No fechamento', amount: extras })

    for (const course of plan.courses) {
      const balance = courseInstallmentBalance(course, plan.studentLocation)
      if (balance <= 0) continue // offshore ELICOS <25 weeks paid fully upfront above
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
    <div className="sp-editor-layout">
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <span className="movy-kicker">Proposta</span>
            <h1 style={{ margin: '8px 0 0', fontFamily: font.display, fontSize: 'clamp(26px, 3.2vw, 38px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.98, color: color.purpleDeep }}>
              {plan.student || 'Cotação sem estudante'}
            </h1>
            <p style={{ margin: '10px 0 0', fontFamily: font.mono, fontSize: 12, color: ink(0.5), letterSpacing: '0.02em' }}>
              {plan.courses.length} curso(s) · {planStudyWeeks(plan)} sem de estudo · {money(planGrandTotal(plan))}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/${locale}/study-plans/${id}/proposal`} prefetch={false} style={proposalButton}>
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
            <Field label="Situação do estudante">
              <select style={input} value={plan.studentLocation ?? 'offshore'} onChange={(e) => patchPlan({ studentLocation: e.target.value as StudentLocation })}>
                <option value="offshore">Offshore (fora da Austrália)</option>
                <option value="onshore">Onshore (na Austrália)</option>
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
                    {presetList.map((preset, i) => (
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
                  <Field label="Turno">
                    <select style={input} value={course.timetable} onChange={(e) => updateCourse(course.id, { timetable: e.target.value })}>
                      {(['Manha', 'Tarde', 'Noite'] as Timetable[]).map((t) => <option key={t} value={t}>{timetableLabels[t]}</option>)}
                    </select>
                  </Field>
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
                </div>

                {course.type !== 'elicos' && (
                  <div className="course-type-panel">
                    <Field label="Duração do curso (semanas)">
                      <NumberInput
                        value={course.segments.find((segment) => segment.kind === 'study')?.weeks ?? courseStudyWeeks(course)}
                        onChange={(value) => updateStandardCourseDuration(course, { studyWeeks: value })}
                      />
                    </Field>
                    <Field label="Férias no CoE (semanas)">
                      <NumberInput
                        value={course.segments.find((segment) => segment.kind === 'holiday')?.weeks ?? 0}
                        onChange={(value) => updateStandardCourseDuration(course, { holidayWeeks: value })}
                      />
                    </Field>
                    {course.type === 'vet' && (
                      <Field label="Material cobrado pela escola">
                        <select
                          style={input}
                          value={course.hasMaterial ? 'yes' : 'no'}
                          onChange={(e) => updateCourse(course.id, { hasMaterial: e.target.value === 'yes' })}
                        >
                          <option value="no">Não</option>
                          <option value="yes">Sim</option>
                        </select>
                      </Field>
                    )}
                  </div>
                )}

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
                  <>
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                      <Field label="Estudo antes de férias (semanas)">
                        <NumberInput
                          value={course.studyWeeksBeforeHoliday ?? DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY}
                          onChange={(value) => updateElicosPattern(course, { studyWeeksBeforeHoliday: Math.max(1, Math.round(value)) })}
                        />
                      </Field>
                      <Field label="Férias entre blocos (semanas)">
                        <NumberInput
                          value={course.holidayWeeks ?? DEFAULT_ELICOS_HOLIDAY_WEEKS}
                          onChange={(value) => updateElicosPattern(course, { holidayWeeks: Math.max(0, Math.round(value)) })}
                        />
                      </Field>
                    </div>
                    <ModuleEditor
                      modules={course.modules ?? []}
                      studyWeeksBeforeHoliday={course.studyWeeksBeforeHoliday ?? DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY}
                      holidayWeeks={course.holidayWeeks ?? DEFAULT_ELICOS_HOLIDAY_WEEKS}
                      onChange={(modules) => updateModules(course.id, modules)}
                    />
                  </>
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

        <Section
          title="Linha do tempo"
          action={
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: ink(0.72), fontFamily: font.ui }}>
              <input
                type="checkbox"
                checked={plan.includeHolidayPlanning !== false}
                onChange={(e) => patchPlan({ includeHolidayPlanning: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: color.orange, cursor: 'pointer' }}
              />
              Incluir planejamento de férias na proposta
            </label>
          }
        >
          {plan.includeHolidayPlanning === false && (
            <div style={{ marginBottom: 12, fontSize: 12.5, color: ink(0.55), background: color.lilac, border: `1px solid ${color.line}`, borderRadius: 10, padding: '9px 12px' }}>
              O planejamento de férias e o cronograma <strong>não</strong> sairão na proposta — apenas valores e pagamento.
            </div>
          )}
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
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {plan.courses.map((course) => {
              const blocked = !courseCanInstallment(course, plan.studentLocation)
              return (
                <div key={course.id} style={{ border: '1px solid rgba(28,18,51,0.08)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#2A1153', marginBottom: 10 }}>
                    {course.provider || COURSE_TYPES[course.type].label} | {COURSE_TYPES[course.type].label}
                  </div>
                  {blocked ? (
                    <div style={{ fontSize: 12, color: '#D23B2B', background: 'rgba(210,59,43,0.06)', border: '1px solid rgba(210,59,43,0.15)', borderRadius: 8, padding: '8px 10px' }}>
                      Offshore com ELICOS abaixo de {OFFSHORE_ELICOS_MIN_INSTALLMENT_WEEKS} semanas: custos da escola pagos a vista no fechamento (sem parcelamento).
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: course.type === 'elicos' ? '120px 120px 1fr' : '120px 1fr', gap: 10 }}>
                      {course.type === 'elicos' && (
                        <Field label="Entrada (sem)"><NumberInput value={course.depositWeeks} onChange={(value) => updateCourse(course.id, { depositWeeks: value })} /></Field>
                      )}
                      <Field label="Parcelas"><NumberInput value={course.paymentParts} onChange={(value) => updateCourse(course.id, { paymentParts: value })} /></Field>
                      <Field label="Cadência das parcelas">
                        <select style={input} value={course.paymentCadenceDays ?? 30} onChange={(e) => updateCourse(course.id, { paymentCadenceDays: Number(e.target.value) })}>
                          {PAYMENT_CADENCES.map((c) => <option key={c.days} value={c.days}>{c.label}</option>)}
                        </select>
                      </Field>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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

      <aside className="sp-editor-aside">
        <SummaryCard title="Resumo">
          <MiniStat label="Estudo" value={`${planStudyWeeks(plan)} sem`} />
          <MiniStat label="Ferias" value={`${planHolidayWeeks(plan)} sem`} />
          <MiniStat label="Total visto" value={`${planVisaWeeks(plan)} sem`} />
          <MiniStat label="Novo venc. visto" value={visa.date ? formatDate(visa.date) : '-'} strong />
          <MiniStat label="Total geral" value={money(planGrandTotal(plan))} strong />
          <MiniStat label="Escolas no fechamento" value={money(planUpfrontSchools(plan))} />
          <MiniStat label="OSHC/Visto/Extras" value={money(planExtrasTotal(plan))} />
          <MiniStat label="Saldo a parcelar" value={money(planInstallmentBalance(plan))} />
        </SummaryCard>

        <SummaryCard title="Cronograma">
          <div style={{ display: 'grid', gap: 9 }}>
            {schedule.slice(0, 8).map((row) => (
              <div key={`${row.course.id}-${row.segment.id}`} style={{ display: 'grid', gap: 2, borderBottom: '1px solid rgba(28,18,51,0.06)', paddingBottom: 8 }}>
                <strong style={{ fontSize: 12 }}>{row.segment.label}</strong>
                <span style={{ color: 'rgba(28,18,51,0.56)', fontSize: 11 }}>{formatDate(row.start)} - {formatDate(row.end)} | {row.weeks} sem</span>
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
    <section className="movy-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 className="movy-kicker" style={{ margin: 0, fontSize: 12 }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="movy-card" style={{ padding: 18 }}>
      <h2 className="movy-kicker" style={{ margin: '0 0 14px', fontSize: 11 }}>{title}</h2>
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
      <span style={{ color: ink(0.52), fontSize: 12 }}>{label}</span>
      <strong style={{ fontFamily: font.display, color: strong ? color.purple : color.purpleDeep, fontSize: strong ? 16 : 13, letterSpacing: strong ? '-0.01em' : 0 }}>{value}</strong>
    </div>
  )
}

const MODULE_HEADER = ['Módulo', 'Valor/sem', 'Semanas'] as const

function ModuleEditor({
  modules,
  studyWeeksBeforeHoliday,
  holidayWeeks,
  onChange,
}: {
  modules: ElicosModule[]
  studyWeeksBeforeHoliday: number
  holidayWeeks: number
  onChange: (modules: ElicosModule[]) => void
}) {
  function update(moduleId: string, patch: Partial<ElicosModule>) {
    onChange(modules.map((m) => m.id === moduleId ? { ...m, ...patch } : m))
  }
  return (
    <div style={{ marginTop: 12, border: '1px dashed rgba(28,18,51,0.16)', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="movy-kicker" style={{ fontSize: 11 }}>
          Módulos de inglês · {studyWeeksBeforeHoliday} estudo + {holidayWeeks} férias
        </span>
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
            <button type="button" style={dangerButton} onClick={() => onChange(modules.filter((x) => x.id !== m.id))}>x</button>
          </div>
        ))}
        {modules.length === 0 && <span style={{ fontSize: 12, color: 'rgba(28,18,51,0.5)' }}>Adicione ao menos um módulo (ex.: General English).</span>}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(28,18,51,0.5)' }}>Tuition do ELICOS = soma de semanas por valor semanal dos módulos.</div>
    </div>
  )
}

const TIMELINE_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function Timeline({ plan, visaDate }: { plan: StudyPlanData; visaDate: string }) {
  const rows = useMemo(() => buildSchedule(plan).filter((r) => r.start && r.end), [plan])
  if (rows.length === 0) {
    return <span style={{ fontSize: 12, color: 'rgba(28,18,51,0.5)' }}>Defina a data de inicio do primeiro curso para ver a linha do tempo.</span>
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
    <div className="timeline-shell">
      <div className="timeline-summary">
        <MiniStat label="Início" value={formatDate(rangeStart)} />
        <MiniStat label="Fim CoE" value={formatDate(coe)} />
        <MiniStat label="Visto estimado" value={visaDate ? formatDate(visaDate) : '-'} />
        <MiniStat label="Duração total" value={`${Math.ceil((total + 1) / 7)} sem`} />
      </div>

      <div className="timeline-scroll">
        <div className="timeline-scale">
          {ticks.map((tick) => (
            <span key={tick.iso} style={{ left: `${pct(tick.iso)}%` }}>{tick.label}</span>
          ))}
        </div>
        <div className="timeline-rows">
          {rows.map((row) => {
            const left = pct(row.start)
            const width = Math.max(0.8, ((daysBetween(row.start, row.end) + 1) / total) * 100)
            const study = row.segment.kind === 'study'
            return (
              <div key={`${row.course.id}-${row.segment.id}`} className="timeline-row">
                <div className="timeline-row-label">
                  <strong>{row.segment.label}</strong>
                  <span>{formatDate(row.start)} - {formatDate(row.end)} | {row.weeks} sem</span>
                </div>
                <div className="timeline-track">
                  <div
                    className={study ? 'timeline-bar study' : 'timeline-bar holiday'}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${row.segment.label} | ${row.weeks} sem | ${formatDate(row.start)} - ${formatDate(row.end)}`}
                  />
                  {row.end === coe && <Marker left={Math.min(99.4, pct(coe))} color="#2A1153" label="CoE" />}
                  {visaDate && row === rows[rows.length - 1] && <Marker left={Math.min(99.4, pct(visaDate))} color="#FBB615" label="Visto" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(28,18,51,0.55)', flexWrap: 'wrap' }}>
        <span><Dot color="#4B1A77" /> Estudo</span>
        <span><Dot color="#FBB615" /> Férias</span>
        <span><Dot color="#2A1153" /> Fim do curso</span>
        <span><Dot color="#FBB615" border /> Visto</span>
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

const HAIR = '#E0D6EE'
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }
const input = { width: '100%', border: `1px solid ${HAIR}`, borderRadius: 9, padding: '10px 11px', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#2A1153', background: '#fff', outline: 'none' }
const primaryButton = { border: 0, borderRadius: 10, padding: '11px 18px', background: '#F36B1C', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }
const proposalButton: React.CSSProperties = { border: '1px solid #2A1153', borderRadius: 10, padding: '10px 16px', background: '#fff', color: '#2A1153', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }
const ghostButton = { border: `1px solid ${HAIR}`, borderRadius: 9, padding: '8px 12px', background: '#fff', color: '#2A1153', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12 }
const dangerButton = { ...ghostButton, color: '#D23B2B' }
const pill = { borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, fontFamily: 'Space Mono, monospace', letterSpacing: '0.04em' }
const noticeDanger = { background: 'rgba(210,59,43,0.08)', border: '1px solid rgba(210,59,43,0.16)', color: '#D23B2B', borderRadius: 12, padding: '10px 12px', fontSize: 13 }

const editorStyles = `
.sp-editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.sp-editor-aside {
  position: sticky;
  top: 20px;
  display: grid;
  gap: 14px;
  min-width: 0;
}
.sp-editor-layout > * {
  min-width: 0;
}
.sp-editor-layout > div:nth-of-type(1) {
  min-width: 0;
}
.sp-editor-layout > div:nth-of-type(1) > div:first-child {
  flex-wrap: wrap;
  min-width: 0;
  width: 100%;
}
.course-type-panel {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(28,18,51,0.08);
  border-radius: 12px;
  background: #FBFAFE;
}
.timeline-shell {
  display: grid;
  gap: 12px;
}
.timeline-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(28,18,51,0.08);
  border-radius: 12px;
  background: #FBFAFE;
}
.timeline-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
}
.timeline-scale,
.timeline-rows {
  min-width: 720px;
}
.timeline-scale {
  position: relative;
  height: 24px;
  margin-left: 190px;
}
.timeline-scale span {
  position: absolute;
  top: 2px;
  transform: translateX(-1px);
  color: rgba(28,18,51,0.52);
  font-family: Space Mono, ui-monospace, monospace;
  font-size: 10px;
  white-space: nowrap;
}
.timeline-row {
  display: grid;
  grid-template-columns: 180px minmax(520px, 1fr);
  gap: 10px;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid rgba(28,18,51,0.06);
}
.timeline-row-label {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.timeline-row-label strong {
  color: #2A1153;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.timeline-row-label span {
  color: rgba(28,18,51,0.55);
  font-size: 10.5px;
}
.timeline-track {
  position: relative;
  height: 28px;
  border: 1px solid rgba(28,18,51,0.10);
  border-radius: 9px;
  background: #FBFAFE;
  overflow: visible;
}
.timeline-bar {
  position: absolute;
  top: 5px;
  height: 18px;
  border-radius: 6px;
  min-width: 3px;
}
.timeline-bar.study {
  background: #4B1A77;
}
.timeline-bar.holiday {
  background: #FBB615;
}
@media (max-width: 1060px) {
  .sp-editor-layout {
    grid-template-columns: 1fr;
  }
  .sp-editor-aside {
    position: static;
  }
}
@media (max-width: 640px) {
  .sp-editor-layout {
    gap: 14px;
  }
  .sp-editor-layout > div:nth-of-type(1) > div:first-child {
    display: grid !important;
    grid-template-columns: 1fr !important;
  }
  .timeline-scale,
  .timeline-rows {
    min-width: 620px;
  }
  .timeline-row {
    grid-template-columns: 150px minmax(450px, 1fr);
  }
  .timeline-scale {
    margin-left: 160px;
  }
}
`
