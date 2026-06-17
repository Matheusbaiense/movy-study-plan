'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { updateStudyPlan } from '@/app/[locale]/(protected)/study-plans/actions'
import { computeProposal } from '@/lib/study-plans/calculations'
import { formatMoney } from '@/lib/calc/money'
import {
  COURSE_TYPES,
  PAYMENT_CADENCES,
  createExtraCosts,
  uid,
} from '@/lib/study-plans/defaults'
import {
  OFFSHORE_ELICOS_MIN_INSTALLMENT_WEEKS,
  buildSchedule,
  courseCanInstallment,
  courseInstallmentBalance,
  datedInstallments,
  daysBetween,
  formatDate,
  money,
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
import type { ApplicantType, StudentLocation, StudyCourse, StudyPlanData } from '@/lib/study-plans/types'
import type { PresetOption } from '@/lib/study-plans/presets'
import { CourseListEditor } from './CourseListEditor'
import { ExtraCostsEditor } from './ExtraCostsEditor'
import { OptionsManager } from './OptionsManager'
import { EditorStickyBar } from './EditorStickyBar'
import { ScenarioPanel } from './ScenarioPanel'
import { EditorWizardNav } from './EditorWizardNav'
import { VersionHistory } from './VersionHistory'
import type { EditorWizardStep } from './editor-wizard-steps'
import { Field, MiniStat, NumberInput, Section, dangerButton, ghostButton, grid2, input } from './editor-ui'
import { Input, Select } from '@/components/ui/form'
import { color, ink, font, t } from '@/lib/ui/theme'
import { Drawer } from '@/components/ui/Drawer'
import { PageHeader } from '@/components/ui/PageHeader'

interface Props {
  id: string
  locale: string
  initialData: StudyPlanData
  status: string
  presets?: PresetOption[]
  contactNationality?: string | null
}

const applicantTypes: ApplicantType[] = ['Individual', 'Casal', 'Familia', 'Single Parent']

export function StudyPlanEditor({ id, locale, initialData, status, presets: _presets, contactNationality }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState(initialData)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(() => Date.now())
  const VALID_STEPS: EditorWizardStep[] = ['cliente', 'preferencias', 'cursos', 'custos', 'revisao']
  const rawStep = searchParams.get('step') as EditorWizardStep | null
  const wizardStep: EditorWizardStep = rawStep && VALID_STEPS.includes(rawStep) ? rawStep : 'cliente'
  const setWizardStep = useCallback((step: EditorWizardStep) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])
  const [isPending, startTransition] = useTransition()
  const [fxRate, setFxRate] = useState<number | null>(null)
  const [showVersions, setShowVersions] = useState(false)
  const lastPersistedRef = useRef(JSON.stringify(initialData))
  const schedule = useMemo(() => buildSchedule(plan), [plan])
  const computed = useMemo(() => computeProposal(plan), [plan])

  useEffect(() => {
    fetch('/api/fx').then((r) => r.json()).then((d) => { if (d?.rate > 0) setFxRate(d.rate) }).catch(() => null)
  }, [])

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

  const persist = useCallback(() => {
    startTransition(async () => {
      try {
        // Always autosave as 'draft' — explicit status transitions go through changeStudyPlanStatus.
        // Using the `status` prop here would revert an externally-approved plan on the next keystroke.
        await updateStudyPlan(id, plan, 'draft')
        lastPersistedRef.current = JSON.stringify(plan)
        setSaveState('saved')
        setLastSavedAt(Date.now())
      } catch {
        setSaveState('error')
      }
    })
  }, [id, plan])

  const save = useCallback(() => persist(), [persist])

  useEffect(() => {
    if (JSON.stringify(plan) === lastPersistedRef.current) return
    if (isPending) return
    const timer = window.setTimeout(() => {
      persist()
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [plan, persist, isPending])

  // Keep a ref that always reflects the latest plan so the beforeunload handler
  // can read it without being included in the effect deps (registered once).
  const planRef = useRef(plan)
  useEffect(() => { planRef.current = plan }, [plan])

  // Warn on navigation when there are unsaved changes (autosave takes 2.5s).
  // Registered once ([]) so it doesn't re-register on every keystroke.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (JSON.stringify(planRef.current) !== lastPersistedRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

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
    <>
    <div className="sp-editor-layout">
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      <div style={{ display: 'grid', gap: 18 }}>
        <PageHeader
          eyebrow="Proposta"
          title={plan.student || 'Cotação sem estudante'}
          description={`${plan.courses.length} curso(s) · ${planStudyWeeks(plan)} sem de estudo · ${money(planGrandTotal(plan))}`}
          actions={
            <>
              <button
                type="button"
                onClick={() => setShowVersions((v) => !v)}
                style={{ ...proposalButton, background: showVersions ? 'color-mix(in srgb, #5B238E 10%, var(--surface))' : 'var(--surface)', borderColor: showVersions ? '#5B238E' : '#2A1153' }}
              >
                {showVersions ? 'Fechar versões' : 'Versões'}
              </button>
              <Link href={`/${locale}/study-plans/${id}/proposal`} prefetch={false} style={proposalButton}>
                Proposta / PDF
              </Link>
            </>
          }
        />

        {saveState === 'error' && (
          <div style={noticeDanger}>Não consegui salvar. Verifique sua sessão e tente novamente.</div>
        )}

        <Drawer open={showVersions} onClose={() => setShowVersions(false)} title="Histórico de versões" width={480}>
          <VersionHistory
            planId={id}
            onRestored={router.refresh}
          />
        </Drawer>

        <EditorWizardNav step={wizardStep} onStepChange={setWizardStep} />

        <div style={{ display: wizardStep === 'cliente' ? 'grid' : 'none', gap: 18 }}>
        <Section title="Cliente">
          <div style={grid2}>
            <Field label="Nome do estudante ou casal">
              <Input value={plan.student} onChange={(e) => patchPlan({ student: e.target.value })} />
            </Field>
            <Field label="E-mail">
              <Input type="email" value={plan.email} onChange={(e) => patchPlan({ email: e.target.value })} />
            </Field>
            <Field label="Telefone">
              <Input value={plan.phone} onChange={(e) => patchPlan({ phone: e.target.value })} />
            </Field>
          </div>
        </Section>
        </div>

        <div style={{ display: wizardStep === 'preferencias' ? 'grid' : 'none', gap: 18 }}>
        <Section title="Preferências">
          <div style={grid2}>
            <Field label="Tipo de visto / aplicante">
              <Select
                value={plan.applicantType}
                onChange={(e) => {
                  const applicantType = e.target.value as ApplicantType
                  patchPlan({ applicantType, extraCosts: createExtraCosts(applicantType) })
                }}
              >
                {applicantTypes.map((type) => <option key={type}>{type}</option>)}
              </Select>
            </Field>
            <Field label="Situação do estudante">
              <Select value={plan.studentLocation ?? 'offshore'} onChange={(e) => patchPlan({ studentLocation: e.target.value as StudentLocation })}>
                <option value="offshore">Offshore (fora da Austrália)</option>
                <option value="onshore">Onshore (na Austrália)</option>
              </Select>
            </Field>
            <Field label="Vencimento do visto atual">
              <Input type="date" value={plan.currentVisaExpiry} onChange={(e) => patchPlan({ currentVisaExpiry: e.target.value })} />
            </Field>
            <Field label="Consultor">
              <Input value={plan.consultant} onChange={(e) => patchPlan({ consultant: e.target.value })} />
            </Field>
          </div>
        </Section>
        </div>

        <div style={{ display: wizardStep === 'cursos' ? 'grid' : 'none', gap: 18 }}>
        <Section title="Cursos">
          <CourseListEditor
            courses={plan.courses}
            studentLocation={plan.studentLocation}
            nationality={contactNationality}
            onCoursesChange={(courses) => patchPlan({ courses })}
          />
        </Section>
        </div>

        <div style={{ display: wizardStep === 'custos' ? 'grid' : 'none', gap: 18 }}>
        <Section title="Custos adicionais">
          <ExtraCostsEditor extraCosts={plan.extraCosts} onChange={(extraCosts) => patchPlan({ extraCosts })} />
        </Section>

        <Section title="Pagamento" action={<button style={ghostButton} onClick={suggestPayments}>Sugerir parcelamento</button>}>
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {plan.courses.map((course) => {
              const blocked = !courseCanInstallment(course, plan.studentLocation)
              return (
                <div key={course.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
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
                        <Select value={course.paymentCadenceDays ?? 30} onChange={(e) => updateCourse(course.id, { paymentCadenceDays: Number(e.target.value) })}>
                          {PAYMENT_CADENCES.map((c) => <option key={c.days} value={c.days}>{c.label}</option>)}
                        </Select>
                      </Field>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {plan.payments.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 130px auto', gap: 10 }} aria-hidden="true">
                <span style={paymentColHeader}>Parcela / item</span>
                <span style={paymentColHeader}>Vencimento</span>
                <span style={paymentColHeader}>Valor</span>
                <span />
              </div>
            )}
            {plan.payments.map((payment) => (
              <div key={payment.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 130px auto', gap: 10 }}>
                <input aria-label="Parcela / item" style={input} value={payment.item} onChange={(e) => patchPlan({ payments: plan.payments.map((item) => item.id === payment.id ? { ...item, item: e.target.value } : item) })} />
                <input aria-label="Vencimento" style={input} value={payment.due} onChange={(e) => patchPlan({ payments: plan.payments.map((item) => item.id === payment.id ? { ...item, due: e.target.value } : item) })} />
                <NumberInput aria-label="Valor" value={payment.amount} onChange={(value) => patchPlan({ payments: plan.payments.map((item) => item.id === payment.id ? { ...item, amount: value } : item) })} />
                <button style={dangerButton} onClick={() => patchPlan({ payments: plan.payments.filter((item) => item.id !== payment.id) })}>Remover</button>
              </div>
            ))}
          </div>
        </Section>
        </div>

        <div style={{ display: wizardStep === 'revisao' ? 'grid' : 'none', gap: 18 }}>
        <Section title="Revisão da proposta">
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={grid2}>
              <MiniStat label="Cliente" value={plan.student || '—'} />
              <MiniStat label="Aplicante" value={plan.applicantType} />
              <MiniStat label="Situação" value={plan.studentLocation === 'onshore' ? 'Onshore' : 'Offshore'} />
              <MiniStat label="Cursos" value={`${plan.courses.length}`} />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'grid', gap: 8 }}>
              {plan.courses.map((course, index) => (
                <div key={course.id} style={{ fontSize: 13 }}>
                  <strong>{index + 1}. {course.provider || 'Escola'}</strong>
                  <span style={{ color: 'var(--text-muted)' }}> — {course.name || COURSE_TYPES[course.type].label}</span>
                </div>
              ))}
              {plan.courses.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum curso adicionado ainda.</span>
              )}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'grid', gap: 6 }}>
              <MiniStat label="Total" value={formatMoney(computed.grandTotalCents, computed.currencyCode)} strong />
              <MiniStat label="Fechamento" value={formatMoney(computed.upfrontSchoolsCents + computed.extrasTotalCents, computed.currencyCode)} />
              <MiniStat label="Saldo parcelar" value={formatMoney(computed.installmentBalanceCents, computed.currencyCode)} />
              <MiniStat label="Novo venc. visto" value={visa.date ? formatDate(visa.date) : '—'} />
            </div>
            {plan.currentVisaExpiry && visa.date && plan.currentVisaExpiry < visa.date && (
              <div style={{ ...noticeDanger, marginTop: 4 }}>
                O visto atual vence antes do fim do plano de estudos — confira as datas.
              </div>
            )}
          </div>
        </Section>

        <Section title="Opções da proposta">
          <OptionsManager plan={plan} nationality={contactNationality} onChange={patchPlan} />
        </Section>

        <Section title="Cenários de duração">
          <ScenarioPanel plan={plan} />
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
        </div>
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
              <div key={`${row.course.id}-${row.segment.id}`} style={{ display: 'grid', gap: 2, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <strong style={{ fontSize: 12 }}>{row.segment.label}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{formatDate(row.start)} - {formatDate(row.end)} | {row.weeks} sem</span>
              </div>
            ))}
          </div>
        </SummaryCard>
      </aside>
    </div>

      <EditorStickyBar
        locale={locale}
        planId={id}
        computed={computed}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        isPending={isPending}
        onSave={save}
        fxRate={fxRate}
        courses={plan.courses.map((c) => ({ id: c.id, provider: c.provider, name: c.name }))}
        extraCosts={plan.extraCosts}
      />
    </>
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

const TIMELINE_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function Timeline({ plan, visaDate }: { plan: StudyPlanData; visaDate: string }) {
  const rows = useMemo(() => buildSchedule(plan).filter((r) => r.start && r.end), [plan])

  const ticks = useMemo(() => {
    if (rows.length === 0) return []
    const rangeStart = rows[0].start
    const lastEnd = rows[rows.length - 1].end
    const rangeEnd = visaDate && visaDate > lastEnd ? visaDate : lastEnd
    const result: Array<{ iso: string; label: string }> = []
    const startDate = new Date(`${rangeStart}T00:00:00Z`)
    let m = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1))
    if (m < startDate) m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
    while (m.toISOString().slice(0, 10) <= rangeEnd) {
      result.push({ iso: m.toISOString().slice(0, 10), label: `${TIMELINE_MONTHS[m.getUTCMonth()]} ${String(m.getUTCFullYear()).slice(2)}` })
      m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
    }
    return result
  }, [rows, visaDate])

  if (rows.length === 0) {
    return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Defina a data de inicio do primeiro curso para ver a linha do tempo.</span>
  }
  const rangeStart = rows[0].start
  const lastEnd = rows[rows.length - 1].end
  const rangeEnd = visaDate && visaDate > lastEnd ? visaDate : lastEnd
  const total = Math.max(1, daysBetween(rangeStart, rangeEnd))
  const pct = (iso: string) => (daysBetween(rangeStart, iso) / total) * 100
  const lastStudy = [...rows].reverse().find((r) => r.segment.kind === 'study')
  const coe = lastStudy ? lastStudy.end : lastEnd

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
                  {row.end === coe && <Marker left={Math.min(99.4, pct(coe))} color="var(--text)" label="CoE" />}
                  {visaDate && row === rows[rows.length - 1] && <Marker left={Math.min(99.4, pct(visaDate))} color="#FBB615" label="Visto" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span><Dot color="#6C35A4" /> Estudo</span>
        <span><Dot color="#FBB615" /> Férias</span>
        <span><Dot color="var(--text)" /> Fim do curso</span>
        <span><Dot color="#FBB615" border /> Visto</span>
      </div>
    </div>
  )
}

function Marker({ left, color, label }: { left: number; color: string; label: string }) {
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${left}%`, width: 0, borderLeft: `2px dashed ${color}` }}>
      <span style={{ position: 'absolute', top: -1, left: 4, fontSize: 9.5, fontWeight: 800, background: 'var(--surface)', padding: '1px 4px', borderRadius: 4, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

function Dot({ color, border = false }: { color: string; border?: boolean }) {
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: color, border: border ? '1px solid var(--text)' : 'none', verticalAlign: -1, marginRight: 6 }} />
}

const proposalButton: React.CSSProperties = { border: '1px solid #2A1153', borderRadius: 10, padding: '10px 16px', background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }
const noticeDanger = { background: 'rgba(210,59,43,0.08)', border: '1px solid rgba(210,59,43,0.16)', color: '#D23B2B', borderRadius: 12, padding: '10px 12px', fontSize: 13 }
const paymentColHeader: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }

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
  padding-bottom: 8px;
}
.sp-editor-sticky-bar {
  position: sticky;
  bottom: 0;
  z-index: 35;
  margin-top: 12px;
  border: 1px solid var(--border);
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.sp-editor-sticky-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.sp-editor-sticky-totals {
  display: flex;
  align-items: flex-end;
  gap: 22px;
  flex-wrap: wrap;
  min-width: 0;
}
.sp-editor-sticky-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-left: auto;
}
.sp-editor-sticky-link {
  border: 1px solid #2A1153;
  border-radius: 10px;
  padding: 10px 14px;
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
  font-family: Outfit, sans-serif;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
}
.sp-editor-sticky-save {
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  background: #F36B1C;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-family: Outfit, sans-serif;
  font-size: 13px;
}
.sp-editor-sticky-save:disabled {
  opacity: 0.7;
  cursor: wait;
}
.sp-explain-panel {
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 98%, transparent);
  font-family: Satoshi, Outfit, sans-serif;
  animation: sp-explain-in 140ms ease;
}
@keyframes sp-explain-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sp-wizard-nav {
  display: grid;
  gap: 12px;
  margin-bottom: 4px;
}
.sp-wizard-progress {
  height: 4px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}
.sp-wizard-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #5B238E, #F36B1C);
  transition: width 220ms ease;
}
.sp-wizard-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sp-wizard-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 7px 12px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: Outfit, sans-serif;
}
.sp-wizard-step.active {
  border-color: #5B238E;
  color: var(--text);
  background: color-mix(in srgb, #5B238E 8%, var(--surface));
}
.sp-wizard-step.done {
  color: var(--text);
}
.sp-wizard-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  font-size: 10px;
  background: var(--surface-sunken);
}
.sp-wizard-step.active .sp-wizard-step-num {
  background: #5B238E;
  color: #fff;
}
.sp-wizard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
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
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-sunken);
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
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-sunken);
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
  color: var(--text-muted);
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
  border-bottom: 1px solid var(--border);
}
.timeline-row-label {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.timeline-row-label strong {
  color: var(--text);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.timeline-row-label span {
  color: var(--text-muted);
  font-size: 10.5px;
}
.timeline-track {
  position: relative;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-sunken);
  overflow: visible;
}
.timeline-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 8px;
}
.timeline-bar.study { background: linear-gradient(90deg, #5B238E, #7A37B8); }
.timeline-bar.holiday { background: linear-gradient(90deg, #D49200, #FBB615); opacity: 0.95; }
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
  .sp-editor-sticky-bar { margin-top: 6px; }
  .sp-editor-sticky-inner { flex-direction: column; align-items: stretch; gap: 8px; padding: 8px 12px; }
  .sp-editor-sticky-totals { gap: 14px; flex-wrap: nowrap; overflow-x: auto; }
  .sp-editor-sticky-actions { margin-left: 0; justify-content: space-between; gap: 8px; }
  .sp-editor-sticky-actions > span { min-width: 0 !important; flex: 1; text-align: left !important; }
  .sp-editor-sticky-link, .sp-editor-sticky-save { padding: 9px 14px; }
}
`
