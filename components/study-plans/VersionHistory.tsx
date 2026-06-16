'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { listVersionsAction, restoreVersionAction, saveVersionAction } from '@/app/[locale]/(protected)/study-plans/actions'
import type { VersionSummary } from '@/app/[locale]/(protected)/study-plans/actions'
import { font, ink, t } from '@/lib/ui/theme'

interface VersionHistoryProps {
  planId: string
  /** Called after a successful restore so the editor can reload. */
  onRestored?: () => void
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'agora'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const REASON_LABELS: Record<string, string> = {
  manual: 'Manual',
  status_change: 'Status',
  restore: 'Restauração',
}

export function VersionHistory({ planId, onRestored }: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [confirmingRestore, setConfirmingRestore] = useState<string | null>(null)
  const [saveLabel, setSaveLabel] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const labelRef = useRef<HTMLInputElement>(null)

  const reload = useCallback(() => {
    setLoading(true)
    listVersionsAction(planId)
      .then(setVersions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [planId])

  useEffect(() => { reload() }, [reload])
  useEffect(() => { if (showSaveForm) labelRef.current?.focus() }, [showSaveForm])

  function handleSave() {
    startTransition(async () => {
      try {
        await saveVersionAction(planId, saveLabel || undefined)
        setSaveLabel('')
        setShowSaveForm(false)
        reload()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar versão')
      }
    })
  }

  function handleRestore(versionId: string) {
    if (confirmingRestore !== versionId) {
      setConfirmingRestore(versionId)
      return
    }
    startTransition(async () => {
      try {
        await restoreVersionAction(planId, versionId)
        setConfirmingRestore(null)
        onRestored?.()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao restaurar')
      }
    })
  }

  return (
    <div style={{ display: 'grid', gap: 0, fontFamily: 'Satoshi, Outfit, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: t.text, letterSpacing: '-0.01em' }}>Histórico de versões</span>
        <button
          type="button"
          onClick={() => setShowSaveForm((v) => !v)}
          style={saveBtn}
        >
          + Salvar versão
        </button>
      </div>

      {/* Save form */}
      {showSaveForm && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'grid', gap: 8, background: 'color-mix(in srgb, var(--surface) 80%, transparent)' }}>
          <input
            ref={labelRef}
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            placeholder="Label opcional (ex: antes de ajustar OSHC)"
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" disabled={isPending} onClick={handleSave} style={confirmBtn}>
              {isPending ? 'Salvando…' : 'Salvar snapshot'}
            </button>
            <button type="button" onClick={() => setShowSaveForm(false)} style={cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 16px', fontSize: 12, color: '#D23B2B', background: 'rgba(210,59,43,0.06)' }}>
          {error}
        </div>
      )}

      {/* Version list */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {loading && (
          <div style={{ padding: '16px', fontSize: 12, color: ink(0.45), textAlign: 'center' }}>Carregando…</div>
        )}
        {!loading && versions.length === 0 && (
          <div style={{ padding: '16px', fontSize: 12, color: ink(0.45), textAlign: 'center' }}>
            Nenhuma versão salva ainda.<br />
            <span style={{ fontSize: 11 }}>Use &quot;Salvar versão&quot; para criar um snapshot.</span>
          </div>
        )}
        {versions.map((v) => (
          <div
            key={v.id}
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '4px 10px',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'grid', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 12, fontFamily: font.display, color: t.text }}>
                  v{v.version_number}
                  {v.label && <span style={{ fontWeight: 400, color: ink(0.7) }}>  {v.label}</span>}
                </strong>
                <span style={{ fontSize: 10, background: 'var(--surface-sunken)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: ink(0.55) }}>
                  {REASON_LABELS[v.reason] ?? v.reason}
                </span>
                {v.status && (
                  <span style={{ fontSize: 10, color: ink(0.45) }}>{v.status}</span>
                )}
              </div>
              <span style={{ fontSize: 11, color: ink(0.45) }}>{formatRelative(v.created_at)}</span>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleRestore(v.id)}
              style={confirmingRestore === v.id ? confirmBtn : ghostRestoreBtn}
            >
              {confirmingRestore === v.id ? 'Confirmar?' : 'Restaurar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 10px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--surface)',
  color: 'var(--text)',
  fontFamily: 'Satoshi, Outfit, sans-serif',
  outline: 'none',
}
const saveBtn: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  border: '1px solid var(--border)',
  borderRadius: 7,
  background: 'var(--surface)',
  color: 'var(--text)',
  cursor: 'pointer',
  fontFamily: 'Satoshi, Outfit, sans-serif',
}
const confirmBtn: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  border: 'none',
  borderRadius: 7,
  background: '#F36B1C',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'Satoshi, Outfit, sans-serif',
}
const cancelBtn: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  border: '1px solid var(--border)',
  borderRadius: 7,
  background: 'transparent',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontFamily: 'Satoshi, Outfit, sans-serif',
}
const ghostRestoreBtn: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  border: '1px solid var(--border)',
  borderRadius: 7,
  background: 'transparent',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontFamily: 'Satoshi, Outfit, sans-serif',
  whiteSpace: 'nowrap',
}
