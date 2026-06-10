'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { COURSE_TYPES } from '@/lib/study-plans/defaults'
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
  planCourseDeposits,
  planExtrasTotal,
  planGrandTotal,
  planHolidayWeeks,
  planNewVisaDate,
  planPaymentBalance,
  planStudyWeeks,
  planVisaWeeks,
} from '@/lib/study-plans/calculations'
import type { StudyCourse, StudyPlanData } from '@/lib/study-plans/types'

interface Props {
  data: StudyPlanData
  reference: string
  updatedAt: string | null
  backHref: string
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

export function StudyPlanProposal({ data, reference, updatedAt, backHref }: Props) {
  const schedule = useMemo(() => buildSchedule(data), [data])
  const visa = useMemo(() => planNewVisaDate(data), [data])
  const issued = updatedAt ? new Date(updatedAt) : new Date()
  const validity = new Date(issued.getTime() + 30 * 24 * 60 * 60 * 1000)

  const scheduleByCourse = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildSchedule>>()
    for (const row of schedule) {
      const list = map.get(row.course.id) ?? []
      list.push(row)
      map.set(row.course.id, list)
    }
    return map
  }, [schedule])

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <style>{printStyles}</style>

      <div className="proposal-toolbar" style={toolbar}>
        <Link href={backHref} style={ghostButton}>← Voltar ao editor</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => window.print()} style={primaryButton}>
            Salvar PDF / Imprimir
          </button>
        </div>
      </div>

      <article id="movy-proposal" style={page}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={logoMark}>M</span>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em', color: INK }}>
                Movy <span style={{ color: GOLD }}>Education</span>
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

        <SummaryStrip data={data} />

        <SectionTitle>Cursos</SectionTitle>
        <div style={{ display: 'grid', gap: 14 }}>
          {data.courses.map((course, index) => (
            <CourseBlock key={course.id} course={course} index={index} schedule={scheduleByCourse.get(course.id) ?? []} />
          ))}
        </div>

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
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdLabel, fontWeight: 800, color: INK }}>Subtotal adicionais</td>
                  <td style={{ ...tdAmount, fontWeight: 800, color: INK }}>{money(planExtrasTotal(data))}</td>
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
                  <th style={{ ...th, textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: `1px solid ${HAIR}` }}>
                    <td style={tdLabel}>{payment.item}</td>
                    <td style={{ ...tdLabel, color: MUTED }}>{payment.due || '—'}</td>
                    <td style={tdAmount}>{money(payment.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <section style={totalsPanel}>
          <div>
            <span style={totalsLabel}>Investimento total estimado</span>
            <strong style={{ fontSize: 30, color: INK, letterSpacing: '-0.03em' }}>{money(planGrandTotal(data))}</strong>
          </div>
          <div style={{ display: 'grid', gap: 8, minWidth: 220 }}>
            <TotalLine label="Depósito no fechamento" value={money(planCourseDeposits(data) + planExtrasTotal(data))} />
            <TotalLine label="Saldo a parcelar (cursos)" value={money(planPaymentBalance(data))} />
            <TotalLine label="Duração total do visto" value={`${planVisaWeeks(data)} semanas`} />
            {visa.date && <TotalLine label="Novo venc. do visto (estimado)" value={formatDate(visa.date)} />}
          </div>
        </section>

        {data.notes && (
          <p style={{ marginTop: 22, fontSize: 12, color: MUTED, lineHeight: 1.6, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 12 }}>
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

function SummaryStrip({ data }: { data: StudyPlanData }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '6px 0 24px' }}>
      <Stat label="Semanas de estudo" value={`${planStudyWeeks(data)}`} />
      <Stat label="Semanas de férias" value={`${planHolidayWeeks(data)}`} />
      <Stat label="Cursos" value={`${data.courses.length}`} />
      <Stat label="Total geral" value={money(planGrandTotal(data))} accent />
    </section>
  )
}

function CourseBlock({ course, index, schedule }: { course: StudyCourse; index: number; schedule: ReturnType<typeof buildSchedule> }) {
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
        </div>
      </div>

      {schedule.length > 0 && (
        <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
          {schedule.map((row) => (
            <div key={`${row.course.id}-${row.segment.id}`} style={scheduleRow}>
              <span style={{ fontWeight: 700, color: INK }}>{row.segment.label}</span>
              <span style={{ color: MUTED }}>
                {row.start ? `${formatDate(row.start)} – ${formatDate(row.end)}` : 'Datas a confirmar'} · {row.weeks} sem
              </span>
            </div>
          ))}
        </div>
      )}

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
      <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: strong ? 16 : 14, fontWeight: strong ? 800 : 600, color: INK }}>{value}</span>
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? INK : '#fff', border: `1px solid ${accent ? INK : HAIR}`, borderRadius: 12, padding: '12px 14px' }}>
      <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.07em', color: accent ? 'rgba(255,255,255,0.7)' : MUTED, fontWeight: 700 }}>{label}</span>
      <div style={{ fontSize: accent ? 17 : 20, fontWeight: 800, color: accent ? '#fff' : INK, letterSpacing: '-0.02em', marginTop: 4 }}>{value}</div>
    </div>
  )
}

function CostLine({ label, value, muted = false, accent = false }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: muted ? MUTED : 'rgba(28,18,51,0.78)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? ACCENT : muted ? MUTED : INK }}>{value}</span>
    </div>
  )
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span style={{ color: MUTED }}>{label}</span>
      <strong style={{ color: INK }}>{value}</strong>
    </div>
  )
}

const page: React.CSSProperties = {
  width: '210mm',
  maxWidth: '100%',
  background: '#fff',
  border: `1px solid ${HAIR}`,
  borderRadius: 14,
  padding: '32px 36px',
  boxShadow: '0 18px 50px rgba(28,18,51,0.08)',
  fontFamily: 'Outfit, system-ui, sans-serif',
  color: INK,
}
const toolbar: React.CSSProperties = { width: '210mm', maxWidth: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }
const logoMark: React.CSSProperties = { width: 34, height: 34, borderRadius: 9, background: INK, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18 }
const studentCard: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, background: 'rgba(75,26,119,0.05)', border: `1px solid ${HAIR}`, borderRadius: 12, padding: 16, marginBottom: 20 }
const courseCard: React.CSSProperties = { border: `1px solid ${HAIR}`, borderRadius: 12, padding: 16 }
const totalsPanel: React.CSSProperties = { marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', background: 'rgba(28,18,51,0.04)', border: `1px solid ${HAIR}`, borderRadius: 14, padding: '18px 20px' }
const totalsLabel: React.CSSProperties = { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, fontWeight: 700, marginBottom: 4 }
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 0', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, borderBottom: `1px solid ${HAIR}` }
const tdLabel: React.CSSProperties = { padding: '9px 0', color: 'rgba(28,18,51,0.82)' }
const tdAmount: React.CSSProperties = { padding: '9px 0', textAlign: 'right', fontWeight: 700, color: INK, whiteSpace: 'nowrap' }
const scheduleRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', borderBottom: `1px dashed ${HAIR}` }
const pill: React.CSSProperties = { borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800 }
const categoryTag: React.CSSProperties = { marginLeft: 8, fontSize: 10, fontWeight: 700, color: PURPLE, background: 'rgba(75,26,119,0.1)', borderRadius: 999, padding: '2px 7px' }
const footer: React.CSSProperties = { marginTop: 28, paddingTop: 14, borderTop: `1px solid ${HAIR}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 10.5, color: MUTED }
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
