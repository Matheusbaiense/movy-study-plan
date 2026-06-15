'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/calc/money'
import type { ComputedTotals } from '@/lib/calc/types'
import { font, t } from '@/lib/ui/theme'

interface EditorStickyBarProps {
  locale: string
  planId: string
  computed: ComputedTotals
  saveState: 'idle' | 'saved' | 'error'
  lastSavedAt: number | null
  isPending: boolean
  onSave: () => void
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

function TotalChip({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <strong style={{
        fontFamily: font.display,
        fontSize: strong ? 17 : 14,
        fontWeight: strong ? 800 : 700,
        color: strong ? t.text : 'var(--text)',
        letterSpacing: strong ? '-0.02em' : 0,
        whiteSpace: 'nowrap',
      }}>
        {value}
      </strong>
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
}: EditorStickyBarProps) {
  const [, tick] = useState(0)
  useEffect(() => {
    if (saveState !== 'saved' || !lastSavedAt) return
    const id = window.setInterval(() => tick((n) => n + 1), 5000)
    return () => window.clearInterval(id)
  }, [saveState, lastSavedAt])

  const currency = computed.currencyCode
  const closingCents = computed.upfrontSchoolsCents + computed.extrasTotalCents

  return (
    <div className="sp-editor-sticky-bar" role="region" aria-label="Totais e ações da proposta">
      <div className="sp-editor-sticky-inner">
        <div className="sp-editor-sticky-totals">
          <TotalChip label="Total" value={formatMoney(computed.grandTotalCents, currency)} strong />
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
