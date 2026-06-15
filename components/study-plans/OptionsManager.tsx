'use client'

// OptionsManager (SPLIT 4 · fatia B) — AllyHub-style "Opção 1..N" tabs. Opção 1 = the primary
// mix (plan.courses/plan.extraCosts); options 2..5 live in plan.options[]. Each option is edited
// independently via the same CourseListEditor/ExtraCostsEditor, can be renamed/duplicated/removed/
// marked recommended, and is compared side by side. Pure helpers in lib/study-plans/options.ts;
// persistence is the editor's existing autosave (this only emits plan patches).

import { useState } from 'react'
import { computeProposal } from '@/lib/study-plans/calculations'
import { formatMoney } from '@/lib/calc/money'
import {
  canAddOption,
  createOption,
  duplicateOption,
  setRecommended,
  withRecomputed,
} from '@/lib/study-plans/options'
import type { ComputedTotals } from '@/lib/calc/types'
import type { ExtraCost, ProposalOption, StudyCourse, StudyPlanData } from '@/lib/study-plans/types'
import { CourseListEditor } from './CourseListEditor'
import { ExtraCostsEditor } from './ExtraCostsEditor'
import { color, font, ink, t } from '@/lib/ui/theme'

const PRIMARY_KEY = 'primary'

interface OptionsManagerProps {
  plan: StudyPlanData
  nationality?: string | null
  onChange: (patch: Partial<StudyPlanData>) => void
}

interface Column {
  key: string
  label: string
  computed: ComputedTotals
  recommended: boolean
  isPrimary: boolean
}

export function OptionsManager({ plan, nationality, onChange }: OptionsManagerProps) {
  const options = plan.options ?? []
  const [activeKey, setActiveKey] = useState<string>(PRIMARY_KEY)

  function patchOptions(next: ProposalOption[]) {
    onChange({ options: next })
  }

  function updateOption(id: string, patch: { courses?: StudyCourse[]; extraCosts?: ExtraCost[] }) {
    patchOptions(
      options.map((option) =>
        option.id === id ? withRecomputed({ ...option, ...patch }, plan) : option,
      ),
    )
  }

  function addOption() {
    const next = createOption(`Opção ${options.length + 2}`)
    patchOptions([...options, withRecomputed(next, plan)])
    setActiveKey(next.id)
  }

  function duplicate(from: { courses: StudyCourse[]; extraCosts?: ExtraCost[]; label: string }) {
    const clone = duplicateOption(
      { id: '', label: from.label, courses: from.courses, extraCosts: from.extraCosts },
      `${from.label} (cópia)`,
    )
    patchOptions([...options, withRecomputed(clone, plan)])
    setActiveKey(clone.id)
  }

  function removeOption(id: string) {
    patchOptions(options.filter((option) => option.id !== id))
    setActiveKey(PRIMARY_KEY)
  }

  function renameOption(id: string, label: string) {
    patchOptions(options.map((option) => (option.id === id ? { ...option, label } : option)))
  }

  function recommend(id: string) {
    patchOptions(setRecommended(options, id))
  }

  // ── Comparison columns (live computed) ───────────────────────────────────
  const primaryComputed = computeProposal(plan)
  const columns: Column[] = [
    { key: PRIMARY_KEY, label: 'Opção 1 (principal)', computed: primaryComputed, recommended: !options.some((o) => o.recommended), isPrimary: true },
    ...options.map((option) => ({
      key: option.id,
      label: option.label,
      computed: option.computed ?? computeProposal({ ...plan, courses: option.courses, extraCosts: option.extraCosts ?? [] }),
      recommended: !!option.recommended,
      isPrimary: false,
    })),
  ]

  const activeOption = options.find((option) => option.id === activeKey)
  const isPrimaryActive = activeKey === PRIMARY_KEY

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {columns.map((column) => (
          <button
            key={column.key}
            type="button"
            onClick={() => setActiveKey(column.key)}
            style={tab(activeKey === column.key)}
          >
            {column.label}
            {column.recommended && <span style={recommendedDot} title="Recomendada" />}
          </button>
        ))}
        {canAddOption(options.length) && (
          <button type="button" style={addTab} onClick={addOption}>+ Opção</button>
        )}
      </div>

      {/* Active editor */}
      <div style={{ border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, display: 'grid', gap: 16 }}>
        {isPrimaryActive ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <strong style={{ fontFamily: font.display, fontSize: 16, color: t.text }}>Opção 1 (principal)</strong>
              <button
                type="button"
                style={ghost}
                disabled={!canAddOption(options.length)}
                onClick={() => duplicate({ courses: plan.courses, extraCosts: plan.extraCosts, label: 'Opção 1' })}
              >
                Duplicar para nova opção
              </button>
            </div>
            <CourseListEditor
              courses={plan.courses}
              studentLocation={plan.studentLocation}
              nationality={nationality}
              onCoursesChange={(courses) => onChange({ courses })}
            />
            <div>
              <div style={blockLabel}>Custos adicionais</div>
              <ExtraCostsEditor extraCosts={plan.extraCosts} onChange={(extraCosts) => onChange({ extraCosts })} />
            </div>
          </>
        ) : activeOption ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input
                style={{ ...renameInput }}
                value={activeOption.label}
                onChange={(e) => renameOption(activeOption.id, e.target.value)}
              />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: ink(0.7), cursor: 'pointer' }}>
                <input type="checkbox" checked={!!activeOption.recommended} onChange={() => recommend(activeOption.id)} style={{ accentColor: color.purple }} />
                Recomendada
              </label>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  style={ghost}
                  disabled={!canAddOption(options.length)}
                  onClick={() => duplicate({ courses: activeOption.courses, extraCosts: activeOption.extraCosts, label: activeOption.label })}
                >
                  Duplicar
                </button>
                <button type="button" style={danger} onClick={() => removeOption(activeOption.id)}>Remover opção</button>
              </div>
            </div>
            <CourseListEditor
              courses={activeOption.courses}
              studentLocation={plan.studentLocation}
              nationality={nationality}
              onCoursesChange={(courses) => updateOption(activeOption.id, { courses })}
            />
            <div>
              <div style={blockLabel}>Custos adicionais</div>
              <ExtraCostsEditor
                extraCosts={activeOption.extraCosts ?? []}
                onChange={(extraCosts) => updateOption(activeOption.id, { extraCosts })}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Comparison strip */}
      <div>
        <div style={blockLabel}>Comparação</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, gap: 12 }}>
          {columns.map((column) => (
            <div
              key={column.key}
              style={{
                border: `1px solid ${column.recommended ? color.purple : t.border}`,
                borderRadius: 12,
                padding: 12,
                background: column.recommended ? `color-mix(in srgb, ${color.purple} 6%, var(--surface))` : 'var(--surface)',
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <strong style={{ fontSize: 12.5, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{column.label}</strong>
                {column.recommended && <span style={recommendedPill}>★</span>}
              </div>
              <div style={{ display: 'grid', gap: 6, borderTop: `1px solid ${t.border}`, paddingTop: 8 }}>
                <Row label="Total" value={formatMoney(column.computed.grandTotalCents, column.computed.currencyCode)} strong />
                <Row label="Fechamento" value={formatMoney(column.computed.upfrontSchoolsCents + column.computed.extrasTotalCents, column.computed.currencyCode)} />
                <Row label="Saldo a parcelar" value={formatMoney(column.computed.installmentBalanceCents, column.computed.currencyCode)} />
                <Row label="Estudo" value={`${column.computed.studyWeeks} sem`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
      <span style={{ color: ink(0.52), fontSize: 12 }}>{label}</span>
      <strong style={{ fontFamily: font.display, color: strong ? color.purple : t.text, fontSize: strong ? 15 : 13 }}>{value}</strong>
    </div>
  )
}

function tab(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    border: `1px solid ${active ? color.purple : t.border}`,
    borderRadius: 999,
    padding: '7px 14px',
    background: active ? `color-mix(in srgb, ${color.purple} 8%, var(--surface))` : 'var(--surface)',
    color: active ? t.text : 'var(--text-muted)',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
  }
}

const addTab: React.CSSProperties = {
  border: '1px dashed var(--border-strong)',
  borderRadius: 999,
  padding: '7px 14px',
  background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit, sans-serif',
}

const ghost: React.CSSProperties = { border: `1px solid ${t.border}`, borderRadius: 9, padding: '7px 12px', background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12 }
const danger: React.CSSProperties = { ...ghost, color: '#D23B2B' }
const renameInput: React.CSSProperties = { border: `1px solid ${t.border}`, borderRadius: 9, padding: '8px 11px', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--surface)', outline: 'none', minWidth: 180 }
const blockLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }
const recommendedDot: React.CSSProperties = { width: 7, height: 7, borderRadius: 999, background: color.purple, display: 'inline-block' }
const recommendedPill: React.CSSProperties = { color: color.gold, fontSize: 13 }
