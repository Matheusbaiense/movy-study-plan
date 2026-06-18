'use client'

// CourseCalculator — the standalone "Simulador". Holds an EPHEMERAL StudyPlanData in React
// state (no contact, no DB row, no autosave). Composes the editors extracted in SPLIT 4
// (CourseListEditor, ExtraCostsEditor, ScenarioPanel) + the pure engine (computeProposal,
// buildSchedule, planNewVisaDate). Nothing is persisted until the consultant explicitly hits
// "Transformar em proposta" (ConvertToProposalModal). Migration-safe / woofed-safe.

import { useEffect, useMemo, useState } from 'react'
import { createBlankStudyPlan } from '@/lib/study-plans/defaults'
import {
  buildSchedule,
  computeProposal,
  courseHolidayWeeks,
  formatDate,
  planNewVisaDate,
} from '@/lib/study-plans/calculations'
import { formatMoney } from '@/lib/calc/money'
import { countryOptions } from '@/lib/constants/countries'
import type { ExtraCost, StudentLocation, StudyCourse, StudyPlanData } from '@/lib/study-plans/types'
import { CourseListEditor } from '@/components/study-plans/CourseListEditor'
import { ExtraCostsEditor } from '@/components/study-plans/ExtraCostsEditor'
import { ScenarioPanel } from '@/components/study-plans/ScenarioPanel'
import { Section } from '@/components/study-plans/editor-ui'
import { PageHeader } from '@/components/ui/PageHeader'
import { Field, Select } from '@/components/ui/form'
import { ConvertToProposalModal } from './ConvertToProposalModal'
import { font, ink, t } from '@/lib/ui/theme'

const COUNTRIES = countryOptions()

interface CourseCalculatorProps {
  locale: string
}

function formatBRL(audCents: number, fxRate: number): string {
  const brl = Math.round((audCents / 100) * fxRate)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(brl)
}

export function CourseCalculator({ locale }: CourseCalculatorProps) {
  const [data, setData] = useState<StudyPlanData>(() => createBlankStudyPlan())
  const [nationality, setNationality] = useState('')
  const [showExtras, setShowExtras] = useState(false)
  const [fxRate, setFxRate] = useState<number | null>(null)

  // Live AUD→BRL for the BRL equivalent (best-effort; BRL is hidden if unavailable).
  useEffect(() => {
    let active = true
    fetch('/api/fx')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (active && j && typeof j.rate === 'number' && j.rate > 0) setFxRate(j.rate) })
      .catch(() => { /* keep BRL hidden */ })
    return () => { active = false }
  }, [])

  const computed = useMemo(() => computeProposal(data), [data])
  const schedule = useMemo(() => buildSchedule(data), [data])
  const visa = useMemo(() => planNewVisaDate(data), [data])
  const totalHolidayWeeks = useMemo(
    () => data.courses.reduce((sum, c) => sum + courseHolidayWeeks(c), 0),
    [data],
  )

  const currency = computed.currencyCode
  const closingCents = computed.upfrontSchoolsCents + computed.extrasTotalCents

  const setCourses = (courses: StudyCourse[]) => setData((d) => ({ ...d, courses }))
  const setExtraCosts = (extraCosts: ExtraCost[]) => setData((d) => ({ ...d, extraCosts }))
  const setLocation = (studentLocation: StudentLocation) => setData((d) => ({ ...d, studentLocation }))

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <PageHeader
        eyebrow="Simulador"
        title="Simulador de cursos"
        description="Monte cursos, férias e datas e veja totais na hora — sem criar proposta. Nada é salvo até você transformar em proposta."
        actions={<ConvertToProposalModal locale={locale} data={data} nationality={nationality} />}
      />

      {/* Header: nationality + location drive the portfolio picker pricing (no contact yet). */}
      <Section title="Aluno (para precificação)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Field label="Nacionalidade (preço por mercado)">
            <Select value={nationality} onChange={(e) => setNationality(e.target.value)}>
              <option value="">—</option>
              {COUNTRIES.map((o) => (
                <option key={o.code} value={o.code}>{o.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Local do aluno">
            <Select value={data.studentLocation ?? 'offshore'} onChange={(e) => setLocation(e.target.value as StudentLocation)}>
              <option value="offshore">Offshore (fora da Austrália)</option>
              <option value="onshore">Onshore (na Austrália)</option>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Cursos & férias">
        <CourseListEditor
          courses={data.courses}
          studentLocation={data.studentLocation}
          nationality={nationality || null}
          onCoursesChange={setCourses}
        />
      </Section>

      <Section
        title="Custos adicionais"
        action={
          <button type="button" onClick={() => setShowExtras((v) => !v)} style={toggleButton}>
            {showExtras ? 'Ocultar' : `Mostrar (${data.extraCosts.length})`}
          </button>
        }
      >
        {showExtras ? (
          <ExtraCostsEditor extraCosts={data.extraCosts} onChange={setExtraCosts} />
        ) : (
          <p style={{ fontSize: 12.5, color: ink(0.55), margin: 0 }}>
            OSHC, visto, taxas… {data.extraCosts.length} item(s). Clique em “Mostrar” para editar.
          </p>
        )}
      </Section>

      {/* Results */}
      <section className="movy-card" style={{ padding: 20 }}>
        <h2 className="movy-kicker" style={{ margin: '0 0 16px', fontSize: 12 }}>Resultado</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          <ResultStat
            label="Total geral"
            value={formatMoney(computed.grandTotalCents, currency)}
            sub={fxRate ? `≈ ${formatBRL(computed.grandTotalCents, fxRate)}` : undefined}
            strong
          />
          <ResultStat label="Fechamento" value={formatMoney(closingCents, currency)} />
          <ResultStat label="Saldo a parcelar" value={formatMoney(computed.installmentBalanceCents, currency)} />
          <ResultStat label="Estudo" value={`${computed.studyWeeks} sem`} />
          <ResultStat label="Férias" value={`${totalHolidayWeeks} sem`} />
          <ResultStat label="Duração p/ visto" value={`${computed.visaWeeks} sem`} />
        </div>
      </section>

      {/* Timeline */}
      <Section title="Linha do tempo">
        {schedule.length === 0 || !schedule.some((row) => row.start) ? (
          <p style={{ fontSize: 12.5, color: ink(0.55), margin: 0 }}>
            Defina a data de início do 1º curso para ver a linha do tempo.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Curso', 'Etapa', 'Início', 'Fim', 'Semanas'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={`${row.segment.id}-${i}`} style={{ background: row.segment.kind === 'holiday' ? 'var(--surface-sunken)' : 'transparent' }}>
                      <td style={tdStyle}>{row.course.provider || row.course.name || '—'}</td>
                      <td style={tdStyle}>{row.segment.label}{row.segment.kind === 'holiday' ? ' 🏖️' : ''}</td>
                      <td style={tdStyle}>{formatDate(row.start)}</td>
                      <td style={tdStyle}>{formatDate(row.end)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.weeks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visa.date && (
              <div style={visaBox}>
                <strong style={{ fontFamily: font.display, color: t.accent }}>Vencimento estimado do visto: {formatDate(visa.date)}</strong>
                <span style={{ fontSize: 12, color: ink(0.6) }}>{visa.rule} · curso de {visa.durationMonths} meses</span>
              </div>
            )}
          </div>
        )}
      </Section>

      <Section title="Cenários de duração">
        <ScenarioPanel plan={data} />
      </Section>
    </div>
  )
}

function ResultStat({ label, value, sub, strong = false }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div style={{ display: 'grid', gap: 4, padding: '12px 14px', border: `1px solid ${t.border}`, borderRadius: 12, background: 'var(--surface)' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <strong style={{ fontFamily: font.display, fontSize: strong ? 22 : 16, color: t.text, letterSpacing: strong ? '-0.02em' : 0, fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
      {sub && <span style={{ fontSize: 11, color: ink(0.5) }}>{sub}</span>}
    </div>
  )
}

const toggleButton: React.CSSProperties = {
  border: `1px solid ${t.border}`, borderRadius: 9, padding: '6px 11px', background: 'var(--surface)',
  color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12,
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${t.border}`,
  fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: 'var(--text)',
}

const visaBox: React.CSSProperties = {
  display: 'grid', gap: 3, padding: '12px 14px', borderRadius: 12,
  border: `1px solid ${t.border}`, background: 'var(--surface-sunken)',
}
