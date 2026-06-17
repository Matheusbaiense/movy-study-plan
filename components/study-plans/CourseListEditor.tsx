'use client'

// CourseListEditor (SPLIT 4 · fatia B) — the course-cards editor, extracted verbatim from
// StudyPlanEditor so the primary mix AND each proposal option reuse the exact same UI/logic.
// Operates ONLY on the passed `courses` slice and emits a new array (immutable) — no `plan` access.

import {
  COURSE_TYPES,
  DEFAULT_ELICOS_HOLIDAY_WEEKS,
  DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY,
  ELICOS_MODULE_NAMES,
  MAX_TRANSITION_HOLIDAY_WEEKS,
  buildElicosSegments,
  createCourse,
  createElicosModule,
  uid,
} from '@/lib/study-plans/defaults'
import {
  courseDeposit,
  courseStudyWeeks,
  courseTotal,
  courseTuition,
  money,
  nextMonday,
} from '@/lib/study-plans/calculations'
import type { CourseType, ElicosModule, StudentLocation, StudyCourse, Timetable } from '@/lib/study-plans/types'
import type { PriceSnapshot } from '@/lib/portfolio/types'
import { CoursePortfolioPicker } from './CoursePortfolioPicker'
import { Field, NumberInput, dangerButton, ghostButton, grid2, input, pill } from './editor-ui'
import { Input, Select } from '@/components/ui/form'

const timetableLabels: Record<Timetable, string> = {
  Manha: 'Manhã',
  Tarde: 'Tarde',
  Noite: 'Noite',
}

interface CourseListEditorProps {
  courses: StudyCourse[]
  studentLocation?: StudentLocation
  nationality?: string | null
  onCoursesChange: (courses: StudyCourse[]) => void
}

export function CourseListEditor({ courses, studentLocation, nationality, onCoursesChange }: CourseListEditorProps) {
  function updateCourse(courseId: string, patch: Partial<StudyCourse>) {
    onCoursesChange(courses.map((course) => (course.id === courseId ? { ...course, ...patch } : course)))
  }

  function updateModules(courseId: string, modules: ElicosModule[]) {
    const course = courses.find((item) => item.id === courseId)
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

  function applyPortfolioCourse(courseId: string, picked: { course: StudyCourse; priceVersionId: string }) {
    const current = courses.find((item) => item.id === courseId)
    if (!current) return
    if (current.type === picked.course.type) {
      updateCourse(courseId, {
        provider: picked.course.provider,
        name: picked.course.name,
        url: picked.course.url,
        ratePerWeek: picked.course.ratePerWeek,
        tuition: picked.course.tuition,
        enrolmentFee: picked.course.enrolmentFee,
        materialFee: picked.course.materialFee,
        hasMaterial: picked.course.hasMaterial,
        scholarship: picked.course.scholarship,
        depositWeeks: picked.course.depositWeeks,
        paymentParts: picked.course.paymentParts,
        paymentFrequency: picked.course.paymentFrequency,
        priceVersionId: picked.priceVersionId,
      })
    } else {
      updateCourse(courseId, { ...picked.course, id: courseId, priceVersionId: picked.priceVersionId })
    }
  }

  function applyPriceSnapshot(courseId: string, snapshot: PriceSnapshot) {
    updateCourse(courseId, {
      ratePerWeek: snapshot.ratePerWeek,
      tuition: snapshot.tuition,
      enrolmentFee: snapshot.enrolmentFee,
      materialFee: snapshot.materialFee,
      hasMaterial: snapshot.hasMaterial,
      scholarship: snapshot.scholarship,
      depositWeeks: snapshot.depositWeeks,
      paymentParts: snapshot.paymentParts,
      paymentFrequency: snapshot.paymentFrequency,
      priceVersionId: snapshot.priceVersionId,
    })
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['elicos', 'vet', 'he'] as CourseType[]).map((type) => (
          <button key={type} type="button" style={ghostButton} onClick={() => onCoursesChange([...courses, createCourse(type)])}>
            + {COURSE_TYPES[type].label}
          </button>
        ))}
      </div>

      {courses.map((course, courseIndex) => (
        <div key={course.id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ ...pill, background: `${COURSE_TYPES[course.type].color}18`, color: COURSE_TYPES[course.type].color }}>
              #{courseIndex + 1} {COURSE_TYPES[course.type].label}
            </span>
            <Select style={{ width: 220 }} value={course.type} onChange={(e) => updateCourse(course.id, { ...createCourse(e.target.value as CourseType), id: course.id })}>
              <option value="elicos">ELICOS</option>
              <option value="vet">VET</option>
              <option value="he">Higher Ed</option>
            </Select>
            <div style={{ width: 280 }}>
              <CoursePortfolioPicker
                nationality={nationality}
                location={studentLocation}
                onApply={(applied) => applyPortfolioCourse(course.id, applied)}
                onPriceVersion={(snapshot) => applyPriceSnapshot(course.id, snapshot)}
              />
            </div>
            <button type="button" style={dangerButton} onClick={() => onCoursesChange(courses.filter((item) => item.id !== course.id))}>
              Remover
            </button>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {/* Bloco 1: Dados Básicos */}
            <div style={grid2}>
              <Field label="Escola / provedor"><Input value={course.provider} onChange={(e) => updateCourse(course.id, { provider: e.target.value })} /></Field>
              <Field label="Curso"><Input value={course.name} onChange={(e) => updateCourse(course.id, { name: e.target.value })} /></Field>
              <Field label={course.type === 'elicos' ? 'Data de início (segunda-feira)' : 'Data de início'}>
                <Input type="date" value={course.start} onChange={(e) => setCourseStart(course, e.target.value)} />
              </Field>
              <Field label="Turno">
                <Select value={course.timetable} onChange={(e) => updateCourse(course.id, { timetable: e.target.value })}>
                  {(['Manha', 'Tarde', 'Noite'] as Timetable[]).map((tt) => <option key={tt} value={tt}>{timetableLabels[tt]}</option>)}
                </Select>
              </Field>
            </div>

            {/* Bloco 2: Financeiro */}
            <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface-sunken)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Taxas & Custos</div>
              <div style={grid2}>
                <Field label="Matrícula (Enrolment)"><NumberInput value={course.enrolmentFee} onChange={(value) => updateCourse(course.id, { enrolmentFee: value })} /></Field>
                {course.type !== 'elicos' && (
                  <Field label="Tuition total"><NumberInput value={course.tuition} onChange={(value) => updateCourse(course.id, { tuition: value })} /></Field>
                )}
                {course.type !== 'he' && (
                  <Field label={course.type === 'vet' ? 'Material (Extra/Opcional)' : 'Material'}>
                    <NumberInput value={course.materialFee} onChange={(value) => updateCourse(course.id, { materialFee: value })} />
                  </Field>
                )}
                <Field label="Bolsa / desconto"><NumberInput value={course.scholarship} onChange={(value) => updateCourse(course.id, { scholarship: value })} /></Field>
              </div>
            </div>

            {/* Bloco 3: Estrutura (VET/HE) */}
            {course.type !== 'elicos' && (
              <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface-sunken)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Estrutura do Curso</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
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
                    <Field label="Cobrar material da escola?">
                      <Select
                        value={course.hasMaterial ? 'yes' : 'no'}
                        onChange={(e) => updateCourse(course.id, { hasMaterial: e.target.value === 'yes' })}
                      >
                        <option value="no">Não</option>
                        <option value="yes">Sim, no Tuition</option>
                      </Select>
                    </Field>
                  )}
                </div>
              </div>
            )}
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
            <CourseStat label="Estudo" value={`${courseStudyWeeks(course)} sem`} />
            <CourseStat label="Tuition" value={money(courseTuition(course))} />
            <CourseStat label="Depósito" value={money(courseDeposit(course))} />
            <CourseStat label="Total" value={money(courseTotal(course))} />
          </div>
        </div>
      ))}

      {courses.length === 0 && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum curso ainda. Adicione um curso acima.</span>
      )}
    </div>
  )
}

function CourseStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: 3, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <strong style={{ fontSize: 13, color: 'var(--text)' }}>{value}</strong>
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
    onChange(modules.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)))
  }
  return (
    <div style={{ marginTop: 12, border: '1px dashed var(--border-strong)', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="movy-kicker" style={{ fontSize: 11 }}>
          Módulos de inglês · {studyWeeksBeforeHoliday} estudo + {holidayWeeks} férias
        </span>
        <button type="button" style={ghostButton} onClick={() => onChange([...modules, createElicosModule()])}>+ Módulo</button>
      </div>
      {modules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px auto', gap: 8, marginBottom: 6 }}>
          {MODULE_HEADER.map((h) => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>)}
          <span />
        </div>
      )}
      <div style={{ display: 'grid', gap: 8 }}>
        {modules.map((m) => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px auto', gap: 8 }}>
            <Select value={m.name} onChange={(e) => update(m.id, { name: e.target.value })}>
              {ELICOS_MODULE_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <NumberInput value={m.ratePerWeek} onChange={(value) => update(m.id, { ratePerWeek: value })} />
            <NumberInput value={m.weeks} onChange={(value) => update(m.id, { weeks: Math.max(0, Math.round(value)) })} />
            <button type="button" style={dangerButton} onClick={() => onChange(modules.filter((x) => x.id !== m.id))}>x</button>
          </div>
        ))}
        {modules.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Adicione ao menos um módulo (ex.: General English).</span>}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Tuition do ELICOS = soma de semanas por valor semanal dos módulos.</div>
    </div>
  )
}
