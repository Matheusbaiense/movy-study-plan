'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/calc/money'
import type { ComputedTotals } from '@/lib/calc/types'
import type { ExtraCost } from '@/lib/study-plans/types'
import { font, ink, t } from '@/lib/ui/theme'

interface CourseSlice {
  id: string
  provider: string
  name: string
}

interface EditorStickyBarProps {
  locale: string
  planId: string
  computed: ComputedTotals
  saveState: 'idle' | 'saved' | 'error'
  lastSavedAt: number | null
  isPending: boolean
  onSave: () => void
  fxRate?: number | null
  courses?: CourseSlice[]
  extraCosts?: ExtraCost[]
}

function savedLabel(lastSavedAt: number | null, saveState: EditorStickyBarProps['saveState'], isPending: boolean): string {
  if (isPending) return 'Salvando…'
  if (saveState === 'error') return 'Erro ao salvar'
  if (saveState === 'idle') return 'Alterações não salvas'
  if (!lastSavedAt) return 'Salvo'
  const sec = Math.floor((Date.now() - lastSavedAt) / 1000)
  if (sec < 8) return 'Salvo agora'
  if (sec < 60) return `Salvo há ${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `Salvo há ${min} min`
  return 'Salvo'
}

function formatBRL(audCents: number, fxRate: number): string {
  const brl = Math.round((audCents / 100) * fxRate)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(brl)
}

function TotalChip({ label, value, brl, strong = false, clickable = false, active = false, onClick }: {
  label: string
  value: string
  brl?: string
  strong?: boolean
  clickable?: boolean
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() } : undefined}
      style={{
        display: 'grid',
        gap: 2,
        minWidth: 0,
        cursor: clickable ? 'pointer' : 'default',
        padding: clickable ? '4px 8px' : '0',
        margin: clickable ? '-4px -8px' : '0',
        borderRadius: 8,
        background: active ? 'color-mix(in srgb, var(--text) 8%, transparent)' : 'transparent',
        transition: 'background 120ms',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <strong style={{
        fontFamily: font.display,
        fontSize: strong ? 17 : 14,
        fontWeight: strong ? 800 : 700,
        color: strong ? t.text : 'var(--text)',
        letterSpacing: strong ? '-0.02em' : 0,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
        {clickable && <span style={{ fontSize: 9, opacity: active ? 0.8 : 0.4 }}>{active ? '▲' : '▼'}</span>}
      </strong>
      {brl && (
        <span style={{ fontSize: 10, color: ink(0.45), marginTop: -1, whiteSpace: 'nowrap' }}>
          ≈ {brl}
        </span>
      )}
    </div>
  )
}

function ExplainPanel({ computed, courses, extraCosts, currency }: {
  computed: ComputedTotals
  courses?: CourseSlice[]
  extraCosts?: ExtraCost[]
  currency: string
}) {
  const feeLabels: Record<string, string> = {
    oshc: 'OSHC',
    visa: 'Visto',
    admin: 'Adm',
    medical: 'Médico',
    other: 'Outro',
  }

  return (
    <div className="sp-explain-panel" aria-label="Detalhamento dos valores">
      <div style={{ padding: '10px 20px 8px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Detalhamento
        </span>
      </div>
      <div style={{ padding: '8px 20px 10px', display: 'grid', gap: 6 }}>
        {computed.perCourse.map((pc) => {
          const course = courses?.find((c) => c.id === pc.courseId)
          const name = course?.provider || course?.name || 'Curso'
          const parts: string[] = []
          if (pc.enrolmentCents > 0) parts.push(`Matrícula ${formatMoney(pc.enrolmentCents, currency)}`)
          if (pc.tuitionCents > 0) parts.push(`Mensalidade ${formatMoney(pc.tuitionCents, currency)}`)
          if (pc.materialCents > 0) parts.push(`Material ${formatMoney(pc.materialCents, currency)}`)
          if (pc.scholarshipCents > 0) parts.push(`− Bolsa ${formatMoney(pc.scholarshipCents, currency)}`)

          return (
            <div key={pc.courseId} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '4px 12px', alignItems: 'start' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
              <span style={{ fontSize: 11, color: ink(0.55) }}>
                {parts.join(' + ').replace(' + − ', ' − ')}
              </span>
              <strong style={{ fontSize: 12, fontFamily: font.display, whiteSpace: 'nowrap' }}>
                {formatMoney(pc.totalCents, currency)}
              </strong>
            </div>
          )
        })}

        {extraCosts && extraCosts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '4px 12px', alignItems: 'start' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Extras</span>
            <span style={{ fontSize: 11, color: ink(0.55) }}>
              {extraCosts.map((e) => `${feeLabels[e.category] ?? e.category}: ${formatMoney(Math.round(e.amount * 100), currency)}`).join(' + ')}
            </span>
            <strong style={{ fontSize: 12, fontFamily: font.display, whiteSpace: 'nowrap' }}>
              {formatMoney(computed.extrasTotalCents, currency)}
            </strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '4px 12px', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
          <strong style={{ fontSize: 13, color: t.text }}>Total geral</strong>
          <span />
          <strong style={{ fontSize: 15, fontFamily: font.display, letterSpacing: '-0.02em', color: t.text, whiteSpace: 'nowrap' }}>
            {formatMoney(computed.grandTotalCents, currency)}
          </strong>
        </div>
      </div>
    </div>
  )
}

export function EditorStickyBar({
  locale,
  planId,
  computed,
  saveState,
  lastSavedAt,
  isPending,
  onSave,
  fxRate,
  courses,
  extraCosts,
}: EditorStickyBarProps) {
  const [, tick] = useState(0)
  const [explainOpen, setExplainOpen] = useState(false)

  useEffect(() => {
    if (saveState !== 'saved' || !lastSavedAt) return
    const id = window.setInterval(() => tick((n) => n + 1), 5000)
    return () => window.clearInterval(id)
  }, [saveState, lastSavedAt])

  const currency = computed.currencyCode
  const closingCents = computed.upfrontSchoolsCents + computed.extrasTotalCents
  const brlStr = fxRate ? formatBRL(computed.grandTotalCents, fxRate) : undefined

  return (
    <div className="sp-editor-sticky-bar" role="region" aria-label="Totais e ações da proposta">
      {explainOpen && (
        <ExplainPanel computed={computed} courses={courses} extraCosts={extraCosts} currency={currency} />
      )}
      <div className="sp-editor-sticky-inner">
        <div className="sp-editor-sticky-totals">
          <TotalChip
            label="Total"
            value={formatMoney(computed.grandTotalCents, currency)}
            brl={brlStr}
            strong
            clickable
            active={explainOpen}
            onClick={() => setExplainOpen((v) => !v)}
          />
          <TotalChip label="Fechamento" value={formatMoney(closingCents, currency)} />
          <TotalChip label="Saldo parcelar" value={formatMoney(computed.installmentBalanceCents, currency)} />
        </div>
        <div className="sp-editor-sticky-actions">
          <span style={{ fontSize: 12, color: saveState === 'error' ? '#D23B2B' : 'var(--text-muted)', minWidth: 120, textAlign: 'right' }}>
            {savedLabel(lastSavedAt, saveState, isPending)}
          </span>
          <Link href={`/${locale}/study-plans/${planId}/proposal`} prefetch={false} className="sp-editor-sticky-link">
            Proposta / PDF
          </Link>
          <button type="button" onClick={onSave} disabled={isPending} className="sp-editor-sticky-save">
            {isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
