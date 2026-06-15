'use client'

// ScenarioPanel (SPLIT 4 · fatia A) — read-only "what if?" comparator. Resizes the first
// course's study weeks into N variants and totals each through the engine (computeScenarios +
// withFirstCourseStudyWeeks, both pure). Nothing is persisted: no new data → nothing to remap
// into woofed later (white-label / woofed-shaped first). ELICOS has no standard duration, so
// columns are configurable WEEKS, never fixed months.

import { useMemo, useState } from 'react'
import { computeScenarios, withFirstCourseStudyWeeks } from '@/lib/calc/scenarios'
import { courseStudyWeeks } from '@/lib/study-plans/calculations'
import { formatMoney } from '@/lib/calc/money'
import type { StudyPlanData } from '@/lib/study-plans/types'
import { color, font, ink, t } from '@/lib/ui/theme'

interface ScenarioPanelProps {
  plan: StudyPlanData
}

const SCENARIO_COUNT = 3
const SCENARIO_DELTAS = [0, 10, 20] as const

function seedWeeks(baseline: number): number[] {
  return SCENARIO_DELTAS.map((delta) => Math.max(1, baseline + delta))
}

export function ScenarioPanel({ plan }: ScenarioPanelProps) {
  const firstCourse = plan.courses[0]
  const baseline = firstCourse ? Math.max(0, Math.round(courseStudyWeeks(firstCourse))) : 0
  const [weeks, setWeeks] = useState<number[]>(() => seedWeeks(baseline))

  const results = useMemo(
    () =>
      computeScenarios(
        weeks.map((value) => ({ label: `${value} sem`, plan: withFirstCourseStudyWeeks(plan, value) })),
      ),
    [plan, weeks],
  )

  if (!firstCourse || baseline <= 0) {
    return (
      <p style={{ fontSize: 12.5, color: ink(0.55) }}>
        Adicione um curso com semanas de estudo no 1º curso para comparar cenários de duração.
      </p>
    )
  }

  function setWeek(index: number, value: number) {
    const next = Math.max(1, Math.round(Number.isFinite(value) ? value : 1))
    setWeeks((current) => current.map((week, i) => (i === index ? next : week)))
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: ink(0.55) }}>
          Comparação por semanas de estudo do 1º curso (atual: <strong style={{ color: t.text }}>{baseline} sem</strong>). Só leitura — nada é salvo.
        </span>
        <button type="button" style={resetButton} onClick={() => setWeeks(seedWeeks(baseline))}>
          Redefinir
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SCENARIO_COUNT}, minmax(0, 1fr))`, gap: 12 }}>
        {results.map((result, index) => {
          const isCurrent = weeks[index] === baseline
          const { computed } = result
          const fechamento = computed.upfrontSchoolsCents + computed.extrasTotalCents
          return (
            <div
              key={index}
              style={{
                border: `1px solid ${isCurrent ? color.purple : t.border}`,
                borderRadius: 14,
                padding: 14,
                background: isCurrent ? `color-mix(in srgb, ${color.purple} 6%, var(--surface))` : 'var(--surface)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: ink(0.5), textTransform: 'uppercase', letterSpacing: '0.06em' }}>Semanas</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={weeks[index]}
                    onChange={(e) => setWeek(index, Number(e.target.value))}
                    style={weekInput}
                  />
                </label>
                {isCurrent && (
                  <span style={currentPill}>Atual</span>
                )}
              </div>

              <div style={{ display: 'grid', gap: 8, borderTop: `1px solid ${t.border}`, paddingTop: 10 }}>
                <Stat label="Total" value={formatMoney(computed.grandTotalCents, computed.currencyCode)} strong />
                <Stat label="Fechamento" value={formatMoney(fechamento, computed.currencyCode)} />
                <Stat label="Saldo a parcelar" value={formatMoney(computed.installmentBalanceCents, computed.currencyCode)} />
                <Stat label="Estudo" value={`${computed.studyWeeks} sem`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
      <span style={{ color: ink(0.52), fontSize: 12 }}>{label}</span>
      <strong style={{ fontFamily: font.display, color: strong ? color.purple : t.text, fontSize: strong ? 16 : 13, letterSpacing: strong ? '-0.01em' : 0 }}>
        {value}
      </strong>
    </div>
  )
}

const weekInput: React.CSSProperties = {
  width: 90,
  border: `1px solid ${t.border}`,
  borderRadius: 9,
  padding: '8px 10px',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
  textAlign: 'right',
  color: 'var(--text)',
  background: 'var(--surface)',
  outline: 'none',
}

const resetButton: React.CSSProperties = {
  border: `1px solid ${t.border}`,
  borderRadius: 9,
  padding: '7px 12px',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 12,
}

const currentPill: React.CSSProperties = {
  borderRadius: 999,
  padding: '3px 9px',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.04em',
  background: `color-mix(in srgb, ${color.purple} 14%, transparent)`,
  color: color.purple,
  whiteSpace: 'nowrap',
}
