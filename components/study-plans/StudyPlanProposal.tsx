'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { COURSE_TYPES } from '@/lib/study-plans/defaults'
import { formatBrl } from '@/lib/financial/calculator'
import {
  buildSchedule,
  courseDeposit,
  courseMaterial,
  courseStudyWeeks,
  courseTotal,
  courseTuition,
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
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { StudyCourse, StudyPlanData } from '@/lib/study-plans/types'

interface Props {
  data: StudyPlanData
  reference: string
  updatedAt: string | null
  backHref: string
  isPublic?: boolean
}

const INK = '#2A1153'
const PURPLE = '#4B1A77'
const GOLD = '#FBB615'
const ACCENT = '#D23B2B'
const MUTED = 'rgba(28,18,51,0.58)'
const HAIR = 'rgba(28,18,51,0.10)'

const CATEGORY_LABEL: Record<StudyPlanData['extraCosts'][number]['category'], string> = {
  oshc: 'OSHC',
  visa: 'Visto',
  admin: 'Administrativo',
  medical: 'Médico',
  other: 'Outro',
}

export function StudyPlanProposal({ data, reference, updatedAt, backHref, isPublic = false }: Props) {
  const schedule = useMemo(() => buildSchedule(data), [data])
  const visa = useMemo(() => planNewVisaDate(data), [data])
  const issued = updatedAt ? new Date(updatedAt) : new Date()
  const validity = new Date(issued.getTime() + 30 * 24 * 60 * 60 * 1000)
  const showHolidays = data.includeHolidayPlanning !== false

  const [fx, setFx] = useState<{ rate: number; asOf: string | null; source: string | null; mid: number | null; feePct: number | null } | null>(null)
  useEffect(() => {
    let active = true
    fetch('/api/fx', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (active && typeof j.rate === 'number' && j.rate > 0) {
          setFx({ rate: j.rate, asOf: j.asOf ?? null, source: j.source ?? null, mid: typeof j.mid === 'number' ? j.mid : null, feePct: typeof j.feePct === 'number' ? j.feePct : null })
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])
  const fxRate = fx?.rate ?? null
  const fxStamp = fx?.asOf
    ? new Date(fx.asOf).toLocaleString('pt-BR', { timeZone: 'Australia/Perth', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <style>{printStyles}</style>

      {!isPublic && (
        <div className="proposal-toolbar" style={toolbar}>
          <Link href={backHref} prefetch={false} className="button-outline-secondary-md" style={ghostButton}>← Voltar ao editor</Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" type="button" onClick={() => window.print()}>
              Salvar PDF / Imprimir
            </Button>
          </div>
        </div>
      )}

      <article id="movy-proposal" style={page}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <svg viewBox="0 0 120 120" width={36} height={36} aria-hidden style={{ overflow: 'visible' }}><use href="#movySymColor" /></svg>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: INK, fontFamily: 'Outfit, sans-serif' }}>
                MOVY <span style={{ color: GOLD }}>EDUCATION</span>
              </span>
            </div>
            <h1 style={{ margin: '18px 0 0', fontSize: 30, letterSpacing: '-0.04em', color: INK }}>Plano de Estudos</h1>
            <p style={{ margin: '4px 0 0', color: MUTED, fontSize: 14 }}>Proposta personalizada · {data.applicantType}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: MUTED, display: 'grid', gap: 4 }}>
            <span><strong style={{ color: INK }}>Ref.</strong> {reference}</span>
            <span><strong style={{ color: INK }}>Emitido</strong> {formatDate(toISODate(issued))}</span>
            <span><strong style={{ color: INK }}>Válido até</strong> {formatDate(toISODate(validity))}</span>
            {data.consultant && <span><strong style={{ color: INK }}>Consultor</strong> {data.consultant}</span>}
          </div>
        </header>

        <div style={{ height: 3, background: `linear-gradient(90deg, ${INK}, ${PURPLE} 55%, ${GOLD})`, borderRadius: 3, margin: '20px 0 24px' }} />

        <section style={studentCard}>
          <Detail label="Estudante" value={data.student || '—'} strong />
          <Detail label="Perfil" value={data.applicantType} />
          <Detail label="Vencimento do visto atual" value={data.currentVisaExpiry ? formatDate(data.currentVisaExpiry) : 'A confirmar'} />
        </section>

        <SummaryStrip data={data} showHolidays={showHolidays} />

        {data.options && data.options.length > 0 && (
          <OptionsComparison data={data} fxRate={fxRate} />
        )}

        <SectionTitle>Cursos</SectionTitle>
        <div style={{ display: 'grid', gap: 14 }}>
          {data.courses.map((course, index) => (
            <CourseBlock key={course.id} course={course} index={index} fxRate={fxRate} />
          ))}
        </div>

        {showHolidays && schedule.length > 0 && (
          <HolidayPlanning data={data} schedule={schedule} visaDate={visa.date} />
        )}

        {data.extraCosts.length > 0 && (
          <>
            <SectionTitle>Custos adicionais</SectionTitle>
            <table style={table}>
              <tbody>
                {data.extraCosts.map((extra) => (
                  <tr key={extra.id} style={{ borderBottom: `1px solid ${HAIR}` }}>
                    <td style={tdLabel}>
                      {extra.item}
                      <span style={categoryTag}>{CATEGORY_LABEL[extra.category]}</span>
                    </td>
                    <td style={tdAmount}>{money(extra.amount)}</td>
                    <td style={{ ...tdAmount, color: PURPLE, fontWeight: 700 }}>
                      {fxRate != null ? formatBrl(extra.amount * fxRate) : <Skeleton width={60} height={14} />}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdLabel, fontWeight: 800, color: INK }}>Subtotal adicionais</td>
                  <td style={{ ...tdAmount, fontWeight: 800, color: INK }}>{money(planExtrasTotal(data))}</td>
                  <td style={{ ...tdAmount, fontWeight: 800, color: PURPLE }}>
                    {fxRate != null ? formatBrl(planExtrasTotal(data) * fxRate) : <Skeleton width={60} height={14} />}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {data.payments.length > 0 && (
          <>
            <SectionTitle>Plano de pagamento sugerido</SectionTitle>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Parcela</th>
                  <th style={{ ...th, textAlign: 'left' }}>Vencimento</th>
                  <th style={{ ...th, textAlign: 'right' }}>Valor (AUD)</th>
                  <th style={{ ...th, textAlign: 'right' }}>Valor (BRL)</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: `1px solid ${HAIR}` }}>
                    <td style={tdLabel}>{payment.item}</td>
                    <td style={{ ...tdLabel, color: MUTED }}>{payment.due || '—'}</td>
                    <td style={tdAmount}>{money(payment.amount)}</td>
                    <td style={{ ...tdAmount, color: PURPLE }}>
                      {fxRate != null ? formatBrl(payment.amount * fxRate) : <Skeleton width={60} height={14} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <section style={totalsPanel}>
          <div>
            <span style={totalsLabel}>Investimento total estimado</span>
            <strong style={{ fontSize: 30, color: INK, letterSpacing: '-0.03em', display: 'block', fontVariantNumeric: 'tabular-nums' }}>{money(planGrandTotal(data))}</strong>
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: PURPLE }}>
              {fxRate != null
                ? <>≈ {formatBrl(planGrandTotal(data) * fxRate)} <span style={{ fontWeight: 600, color: MUTED, fontSize: 11 }}>(referência)</span></>
                : <Skeleton width={100} height={18} />}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8, minWidth: 220 }}>
            <TotalLine label="Pagamento no fechamento" value={money(planUpfrontSchools(data) + planExtrasTotal(data))} />
            <TotalLine label="Saldo a parcelar (cursos)" value={money(planInstallmentBalance(data))} />
            <TotalLine label="Duração total do visto" value={`${planVisaWeeks(data)} semanas`} />
            {visa.date && <TotalLine label="Novo venc. do visto (estimado)" value={formatDate(visa.date)} />}
          </div>
        </section>

        {fxRate && (
          <p style={{ marginTop: 16, fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
            Câmbio AUD→BRL: {fxRate}{fx?.mid && fx?.feePct != null ? ` (mid ${fx.mid} + ${fx.feePct}% Wise)` : ''}{fxStamp ? ` · cotado em ${fxStamp} (Perth)` : ''}{fx?.source ? ` · fonte ${fx.source}` : ''}. Valores em BRL são referência e variam com o câmbio.
          </p>
        )}

        {data.notes && (
          <p style={{ marginTop: 16, fontSize: 12, color: MUTED, lineHeight: 1.6, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 12 }}>
            {data.notes}
          </p>
        )}

        <footer style={footer}>
          <span>Movy Education · Plano de estudos gerado para fins informativos.</span>
          <span>Valores em AUD, sujeitos a confirmação na carta de oferta e variação cambial.</span>
        </footer>
      </article>
    </div>
  )
}

function SummaryStrip({ data, showHolidays }: { data: StudyPlanData; showHolidays: boolean }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12, margin: '6px 0 24px' }}>
      <Stat label="Semanas de estudo" value={`${planStudyWeeks(data)}`} />
      {showHolidays
        ? <Stat label="Semanas de férias" value={`${planHolidayWeeks(data)}`} />
        : <Stat label="Duração do visto" value={`${planVisaWeeks(data)} sem`} />}
      <Stat label="Cursos" value={`${data.courses.length}`} />
      <Stat label="Total geral" value={money(planGrandTotal(data))} accent />
    </section>
  )
}

function OptionsComparison({ data, fxRate }: { data: StudyPlanData; fxRate: number | null }) {
  const options = data.options ?? []
  const anyRecommended = options.some((option) => option.recommended)
  const columns = [
    { key: 'primary', label: 'Opção 1', recommended: !anyRecommended, plan: data, courses: data.courses },
    ...options.map((option) => ({
      key: option.id,
      label: option.label,
      recommended: !!option.recommended,
      plan: { ...data, courses: option.courses, extraCosts: option.extraCosts ?? [] } as StudyPlanData,
      courses: option.courses,
    })),
  ]
  return (
    <>
      <SectionTitle>Opções da proposta</SectionTitle>
      <div className="proposal-block" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 220px), 1fr))`, gap: 12, marginBottom: 8 }}>
        {columns.map((col) => (
          <div
            key={col.key}
            style={{
              border: `1px solid ${col.recommended ? PURPLE : HAIR}`,
              borderRadius: 12,
              padding: 14,
              background: col.recommended ? 'rgba(75,26,119,0.05)' : '#fff',
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <strong style={{ fontSize: 14, color: INK }}>{col.label}</strong>
              {col.recommended && (
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: PURPLE, borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }}>Recomendada</span>
              )}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{money(planGrandTotal(col.plan))}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: PURPLE }}>
              {fxRate != null ? `≈ ${formatBrl(planGrandTotal(col.plan) * fxRate)}` : <Skeleton width={60} height={14} />}
            </div>
            <div style={{ display: 'grid', gap: 4, borderTop: `1px solid ${HAIR}`, paddingTop: 8 }}>
              <CostLine label="Fechamento" value={money(planUpfrontSchools(col.plan) + planExtrasTotal(col.plan))} />
              <CostLine label="Saldo a parcelar" value={money(planInstallmentBalance(col.plan))} muted />
              <CostLine label="Estudo" value={`${planStudyWeeks(col.plan)} sem`} muted />
            </div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
              {col.courses.length > 0
                ? col.courses.map((course) => course.name || course.provider || COURSE_TYPES[course.type].label).join(' · ')
                : 'Sem cursos'}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function HolidayPlanning({ data, schedule, visaDate }: { data: StudyPlanData; schedule: ReturnType<typeof buildSchedule>; visaDate: string }) {
  const dated = schedule.filter((r) => r.start && r.end)
  const totalWeeks = schedule.reduce((sum, r) => sum + (r.weeks || 0), 0) || 1
  const start = dated[0]?.start
  const lastStudy = [...dated].reverse().find((r) => r.segment.kind === 'study')
  const coe = lastStudy?.end ?? dated[dated.length - 1]?.end

  return (
    <>
      <SectionTitle>Planejamento de férias &amp; cronograma</SectionTitle>
      <div style={planningCard} className="proposal-block">
        {/* Sequential study/holiday bar */}
        <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden', border: `1px solid ${HAIR}` }}>
          {schedule.map((r, i) => (
            <div
              key={`${r.course.id}-${r.segment.id}`}
              title={`${r.segment.label} · ${r.weeks} sem`}
              style={{
                width: `${(r.weeks / totalWeeks) * 100}%`,
                minWidth: 2,
                background: r.segment.kind === 'study' ? `linear-gradient(90deg, #5B238E, #7A37B8)` : `linear-gradient(90deg, #D49200, #FBB615)`,
                borderRight: i < schedule.length - 1 ? '1px solid #fff' : 'none'
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 12, color: MUTED }}>
          <span><Dot color="#5B238E" /> Estudo · {planStudyWeeks(data)} sem</span>
          <span><Dot color="#FBB615" /> Férias · {planHolidayWeeks(data)} sem</span>
        </div>

        {/* Schedule list */}
        <div style={{ marginTop: 16, display: 'grid', gap: 5 }}>
          {schedule.map((r) => (
            <div key={`row-${r.course.id}-${r.segment.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5, padding: '5px 0', borderBottom: `1px dashed ${HAIR}` }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Dot color={r.segment.kind === 'study' ? PURPLE : GOLD} />
                <strong style={{ color: INK }}>{r.segment.label}</strong>
                <span style={{ color: MUTED }}>· {r.course.provider || COURSE_TYPES[r.course.type].label}</span>
              </span>
              <span style={{ color: MUTED, whiteSpace: 'nowrap' }}>
                {r.start ? `${formatDate(r.start)} – ${formatDate(r.end)}` : 'A confirmar'} · {r.weeks} sem
              </span>
            </div>
          ))}
        </div>

        {/* Key dates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          <Stat label="Início" value={start ? formatDate(start) : 'A confirmar'} />
          <Stat label="Fim do curso (CoE)" value={coe ? formatDate(coe) : 'A confirmar'} />
          <Stat label="Visto estimado" value={visaDate ? formatDate(visaDate) : 'A confirmar'} />
        </div>
      </div>
    </>
  )
}

function Dot({ color }: { color: string }) {
  return <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, background: color, verticalAlign: -1, marginRight: 2 }} />
}

function CourseBlock({ course, index, fxRate }: { course: StudyCourse; index: number; fxRate: number | null }) {
  const type = COURSE_TYPES[course.type]
  return (
    <div style={courseCard} className="proposal-block">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <span style={{ ...pill, background: `${type.color}18`, color: type.color }}>#{index + 1} {type.label}</span>
          <h3 style={{ margin: '10px 0 2px', fontSize: 16, color: INK, letterSpacing: '-0.02em' }}>{course.name || 'Curso a definir'}</h3>
          <p style={{ margin: 0, color: MUTED, fontSize: 13 }}>
            {course.provider || 'Provedor a confirmar'}{course.timetable ? ` · ${course.timetable}` : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total do curso</span>
          <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{money(courseTotal(course))}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: PURPLE, marginTop: 2 }}>
            {fxRate != null ? `≈ ${formatBrl(courseTotal(course) * fxRate)}` : <Skeleton width={60} height={14} />}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, borderTop: `1px solid ${HAIR}`, paddingTop: 10, display: 'grid', gap: 4 }}>
        <CostLine label="Matrícula" value={money(course.enrolmentFee)} />
        <CostLine label={course.type === 'elicos' ? `Tuition (${courseStudyWeeks(course)} sem)` : 'Tuition'} value={money(courseTuition(course))} />
        {courseMaterial(course) > 0 && <CostLine label="Material" value={money(courseMaterial(course))} />}
        {number(course.scholarship) > 0 && <CostLine label="Bolsa / desconto" value={`- ${money(course.scholarship)}`} accent />}
        <CostLine label="Depósito no fechamento" value={money(courseDeposit(course))} muted />
      </div>
    </div>
  )
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ margin: '26px 0 12px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: PURPLE, fontWeight: 800 }}>
      {children}
    </h2>
  )
}

function Detail({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: strong ? 16 : 14, fontWeight: strong ? 800 : 600, color: INK }}>{value}</span>
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? INK : '#fff', border: `1px solid ${accent ? INK : HAIR}`, borderRadius: 12, padding: '12px 14px' }}>
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: accent ? 'rgba(255,255,255,0.7)' : MUTED, fontWeight: 700 }}>{label}</span>
      <div style={{ fontSize: accent ? 17 : 20, fontWeight: 800, color: accent ? '#fff' : INK, letterSpacing: '-0.02em', marginTop: 4 }}>{value}</div>
    </div>
  )
}

function CostLine({ label, value, muted = false, accent = false }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: muted ? MUTED : 'rgba(28,18,51,0.88)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? ACCENT : muted ? MUTED : INK, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span style={{ color: MUTED }}>{label}</span>
      <strong style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
    </div>
  )
}

const page: React.CSSProperties = {
  width: '100%',
  maxWidth: '210mm',
  background: '#fff',
  border: `1px solid ${HAIR}`,
  borderRadius: 14,
  padding: '32px 36px',
  boxShadow: '0 18px 50px rgba(28,18,51,0.08)',
  fontFamily: 'Outfit, system-ui, sans-serif',
  color: INK,
}
const toolbar: React.CSSProperties = { width: '100%', maxWidth: '210mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }
const studentCard: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 16, background: 'rgba(75,26,119,0.05)', border: `1px solid ${HAIR}`, borderRadius: 12, padding: 16, marginBottom: 20 }
const courseCard: React.CSSProperties = { border: `1px solid ${HAIR}`, borderRadius: 12, padding: 16 }
const totalsPanel: React.CSSProperties = { marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', background: 'rgba(28,18,51,0.04)', border: `1px solid ${HAIR}`, borderRadius: 14, padding: '18px 20px' }
const totalsLabel: React.CSSProperties = { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, fontWeight: 700, marginBottom: 4 }
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, borderBottom: `1px solid ${HAIR}` }
const tdLabel: React.CSSProperties = { padding: '9px 0', color: 'rgba(28,18,51,0.82)' }
const tdAmount: React.CSSProperties = { padding: '9px 0', textAlign: 'right', fontWeight: 700, color: INK, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }
const planningCard: React.CSSProperties = { border: `1px solid ${HAIR}`, borderRadius: 12, padding: 16 }
const pill: React.CSSProperties = { borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800 }
const categoryTag: React.CSSProperties = { marginLeft: 8, fontSize: 11, fontWeight: 700, color: PURPLE, background: 'rgba(75,26,119,0.1)', borderRadius: 999, padding: '2px 7px' }
const footer: React.CSSProperties = { marginTop: 28, paddingTop: 14, borderTop: `1px solid ${HAIR}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 11, color: MUTED }
const primaryButton: React.CSSProperties = { border: 0, borderRadius: 10, padding: '11px 16px', background: INK, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }
const ghostButton: React.CSSProperties = { border: `1px solid ${HAIR}`, borderRadius: 10, padding: '10px 14px', background: '#fff', color: INK, fontWeight: 700, textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontSize: 13 }

const printStyles = `
#movy-proposal, #movy-proposal * {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
@media print {
  @page { size: A4; margin: 12mm; }
  body { background: #fff !important; }
  body * { visibility: hidden !important; }
  #movy-proposal, #movy-proposal * { visibility: visible !important; }
  #movy-proposal {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  .proposal-toolbar { display: none !important; }
  .proposal-block { break-inside: avoid; page-break-inside: avoid; }
}
`
