'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Search,
  Copy,
  Archive,
  Trash2,
  RotateCcw,
  Pencil,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  duplicateStudyPlan,
  archiveStudyPlan,
  softDeleteStudyPlan,
  restoreStudyPlan,
  hardDeleteStudyPlan,
  bulkStudyPlanAction,
  type BulkStudyPlanOp,
} from './actions'
import type { StudyPlanStatus } from '@/lib/study-plans/types'

/** Server-built view-model: all formatting done server-side, interaction client-side. */
export interface ProposalItem {
  id: string
  student: string
  title: string
  applicantType: string
  status: StudyPlanStatus
  totalLabel: string
  updatedLabel: string
  daysToExpiry: number | null
  expired: boolean
}

interface Props {
  locale: string
  items: ProposalItem[]
  total: number
  page: number
  pageSize: number
  view: 'active' | 'trash'
  query: string
  statusFilter: string
  typeFilter: string
  sort: string
  isAdmin: boolean
}

const STATUS_META: Record<StudyPlanStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: '#6B7280' },
  ready_review: { label: 'Em revisão', color: '#2563EB' },
  approved_internal: { label: 'Aprovada (interno)', color: '#4F46E5' },
  sent: { label: 'Enviada', color: '#4B1A77' },
  viewed: { label: 'Visualizada', color: '#0D9488' },
  negotiating: { label: 'Em negociação', color: '#D97706' },
  accepted: { label: 'Aceita', color: '#15803D' },
  rejected: { label: 'Recusada', color: '#D23B2B' },
  expired: { label: 'Expirada', color: '#EA580C' },
  archived: { label: 'Arquivada', color: '#9298A3' },
}

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label }))

const TYPE_OPTIONS = ['Individual', 'Casal', 'Familia', 'Single Parent']

const SORT_OPTIONS = [
  { value: 'updated', label: 'Atualização' },
  { value: 'created', label: 'Criação' },
  { value: 'student', label: 'Estudante (A–Z)' },
]

export function ProposalsList(props: Props) {
  const { locale, items, total, page, pageSize, view, query, statusFilter, typeFilter, sort, isAdmin } = props
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState(query)

  // Clear stale selections whenever the rendered set changes (filter/page nav).
  const idsKey = items.map((i) => i.id).join(',')
  useEffect(() => {
    setSelected((prev) => new Set([...prev].filter((id) => items.some((i) => i.id === id))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  function setParams(updates: Record<string, string | null>, resetPage = true) {
    const sp = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') sp.delete(k)
      else sp.set(k, v)
    }
    if (resetPage) sp.delete('page')
    router.push(`${pathname}?${sp.toString()}`)
  }

  // Debounce the free-text search into the URL.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const handle = setTimeout(() => {
      if (search !== query) setParams({ q: search || null })
    }, 350)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function run(fn: () => Promise<unknown>, okMsg: string) {
    setFlash(null)
    startTransition(async () => {
      try {
        const res = (await fn()) as { ok?: boolean; error?: string } | void
        if (res && res.ok === false) {
          setFlash({ kind: 'err', msg: res.error ?? 'Erro inesperado.' })
          return
        }
        setFlash({ kind: 'ok', msg: okMsg })
        setSelected(new Set())
        router.refresh()
      } catch (e) {
        setFlash({ kind: 'err', msg: e instanceof Error ? e.message : 'Erro inesperado.' })
      }
    })
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allOnPageSelected = items.length > 0 && items.every((i) => selected.has(i.id))
  function toggleAll() {
    setSelected((prev) => {
      if (allOnPageSelected) return new Set([...prev].filter((id) => !items.some((i) => i.id === id)))
      return new Set([...prev, ...items.map((i) => i.id)])
    })
  }

  function bulk(op: BulkStudyPlanOp, okMsg: string) {
    run(() => bulkStudyPlanAction([...selected], op, locale), okMsg)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const selCount = selected.size

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {flash && (
        <div role="status" style={flashStyle(flash.kind)}>
          {flash.msg}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por estudante ou título…"
            aria-label="Buscar propostas"
            style={{ ...inputStyle, paddingLeft: 32, width: '100%' }}
          />
        </div>
        <select aria-label="Filtrar por status" value={statusFilter} onChange={(e) => setParams({ status: e.target.value || null })} style={inputStyle}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select aria-label="Filtrar por tipo" value={typeFilter} onChange={(e) => setParams({ type: e.target.value || null })} style={inputStyle}>
          <option value="">Todos os tipos</option>
          {TYPE_OPTIONS.map((tp) => (
            <option key={tp} value={tp}>{tp}</option>
          ))}
        </select>
        <select aria-label="Ordenar" value={sort} onChange={(e) => setParams({ sort: e.target.value })} style={inputStyle}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>Ordenar: {o.label}</option>
          ))}
        </select>
        <div style={{ display: 'inline-flex', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <ViewTab active={view === 'active'} onClick={() => setParams({ view: null })}>Ativas</ViewTab>
          <ViewTab active={view === 'trash'} onClick={() => setParams({ view: 'trash' })}>Lixeira</ViewTab>
        </div>
      </div>

      {/* Bulk action bar */}
      {selCount > 0 && (
        <div style={bulkBarStyle}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{selCount} selecionada{selCount > 1 ? 's' : ''}</span>
          <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
            {view === 'active' ? (
              <>
                <BulkBtn icon={<Archive size={14} />} disabled={pending} onClick={() => bulk('archive', 'Propostas arquivadas.')}>Arquivar</BulkBtn>
                <BulkBtn icon={<Trash2 size={14} />} danger disabled={pending} onClick={() => {
                  if (confirm(`Mover ${selCount} proposta(s) para a lixeira?`)) bulk('soft_delete', 'Movidas para a lixeira.')
                }}>Excluir</BulkBtn>
              </>
            ) : (
              <BulkBtn icon={<RotateCcw size={14} />} disabled={pending} onClick={() => bulk('restore', 'Propostas restauradas.')}>Restaurar</BulkBtn>
            )}
            <BulkBtn icon={<X size={14} />} disabled={pending} onClick={() => setSelected(new Set())}>Limpar</BulkBtn>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="movy-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 38, textAlign: 'center' }}>
                  <input type="checkbox" aria-label="Selecionar todas" checked={allOnPageSelected} onChange={toggleAll} style={{ cursor: 'pointer' }} />
                </th>
                {['Estudante', 'Tipo', 'Status', 'Total estimado', 'Expira', 'Atualizado', 'Ações'].map((h) => (
                  <th key={h} style={{ ...thStyle, textAlign: h === 'Ações' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '52px 24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
                      {view === 'trash' ? 'Lixeira vazia' : query || statusFilter || typeFilter ? 'Nenhuma proposta encontrada' : 'Nenhuma cotação ainda'}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      {view === 'trash' ? 'Propostas excluídas aparecem aqui e podem ser restauradas.' : 'Ajuste os filtros ou crie uma nova cotação.'}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const meta = STATUS_META[it.status] ?? { label: it.status, color: '#6B7280' }
                  const isSel = selected.has(it.id)
                  return (
                    <tr key={it.id} style={{ borderBottom: '1px solid var(--border)', background: isSel ? 'rgba(var(--ink-rgb),0.03)' : undefined }}>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <input type="checkbox" aria-label={`Selecionar ${it.student}`} checked={isSel} onChange={() => toggle(it.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => router.push(`/${locale}/study-plans/${it.id}`)}
                          style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--font-display)', color: 'var(--text)', fontWeight: 800 }}
                        >
                          {it.student}
                        </button>
                        <div style={{ marginTop: 3, color: 'var(--text-subtle)', fontSize: 12 }}>{it.title}</div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{it.applicantType}</td>
                      <td style={tdStyle}>
                        <span style={{ borderRadius: 999, padding: '3px 10px', background: `${meta.color}18`, color: meta.color, fontWeight: 700, fontSize: 11 }}>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)' }}>{it.totalLabel}</td>
                      <td style={tdStyle}>{expiryBadge(it)}</td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-subtle)' }}>{it.updatedLabel}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          {view === 'active' ? (
                            <>
                              <IconBtn title="Editar" onClick={() => router.push(`/${locale}/study-plans/${it.id}`)}><Pencil size={15} /></IconBtn>
                              <IconBtn title="Proposta" onClick={() => router.push(`/${locale}/study-plans/${it.id}/proposal`)}><FileText size={15} /></IconBtn>
                              <IconBtn title="Duplicar" disabled={pending} onClick={() => run(() => duplicateStudyPlan(it.id, locale), 'Proposta duplicada.')}><Copy size={15} /></IconBtn>
                              <IconBtn title="Arquivar" disabled={pending} onClick={() => run(() => archiveStudyPlan(it.id, locale), 'Proposta arquivada.')}><Archive size={15} /></IconBtn>
                              <IconBtn title="Excluir" danger disabled={pending} onClick={() => {
                                if (confirm(`Mover "${it.student}" para a lixeira?`)) run(() => softDeleteStudyPlan(it.id, locale), 'Movida para a lixeira.')
                              }}><Trash2 size={15} /></IconBtn>
                            </>
                          ) : (
                            <>
                              <IconBtn title="Restaurar" disabled={pending} onClick={() => run(() => restoreStudyPlan(it.id, locale), 'Proposta restaurada.')}><RotateCcw size={15} /></IconBtn>
                              {isAdmin && (
                                <IconBtn title="Excluir definitivamente" danger disabled={pending} onClick={() => {
                                  if (confirm(`Excluir "${it.student}" DEFINITIVAMENTE? Esta ação não pode ser desfeita.`)) run(() => hardDeleteStudyPlan(it.id, locale), 'Excluída definitivamente.')
                                }}><Trash2 size={15} /></IconBtn>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{total} proposta{total === 1 ? '' : 's'} · página {page} de {totalPages}</span>
          <div style={{ display: 'inline-flex', gap: 6 }}>
            <PageBtn disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) }, false)}><ChevronLeft size={16} /></PageBtn>
            <PageBtn disabled={page >= totalPages} onClick={() => setParams({ page: String(page + 1) }, false)}><ChevronRight size={16} /></PageBtn>
          </div>
        </div>
      )}
    </div>
  )
}

function expiryBadge(it: ProposalItem) {
  if (it.daysToExpiry === null) return <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>—</span>
  if (it.expired) return <span style={{ color: '#EA580C', fontWeight: 700, fontSize: 12 }}>Expirada</span>
  const soon = it.daysToExpiry <= 7
  return (
    <span style={{ color: soon ? '#D97706' : 'var(--text-muted)', fontWeight: soon ? 700 : 500, fontSize: 12 }}>
      {it.daysToExpiry === 0 ? 'vence hoje' : `vence em ${it.daysToExpiry}d`}
    </span>
  )
}

function ViewTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        border: 'none',
        background: active ? 'var(--purple, #4B1A77)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--text-muted)',
        fontSize: 12.5,
        fontWeight: 700,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function IconBtn({ children, title, onClick, disabled, danger }: { children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: danger ? '#D23B2B' : 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

function BulkBtn({ children, icon, onClick, disabled, danger }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 9,
        fontSize: 12.5,
        fontWeight: 700,
        fontFamily: 'var(--font-body)',
        border: `1px solid ${danger ? 'rgba(210,59,43,0.3)' : 'var(--border)'}`,
        background: danger ? 'rgba(210,59,43,0.06)' : 'var(--surface)',
        color: danger ? '#D23B2B' : 'var(--text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      {children}
    </button>
  )
}

function PageBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 11px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  fontSize: 13,
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-subtle)',
  borderBottom: '1px solid var(--border)',
}

const tdStyle: React.CSSProperties = { padding: '13px 16px', verticalAlign: 'middle' }

const bulkBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  padding: '10px 14px',
  borderRadius: 12,
  background: 'rgba(75,26,119,0.06)',
  border: '1px solid rgba(75,26,119,0.18)',
}

function flashStyle(kind: 'ok' | 'err'): React.CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    background: kind === 'ok' ? 'rgba(75,26,119,0.08)' : 'rgba(210,59,43,0.1)',
    color: kind === 'ok' ? '#4B1A77' : '#D23B2B',
    border: `1px solid ${kind === 'ok' ? 'rgba(75,26,119,0.2)' : 'rgba(210,59,43,0.25)'}`,
  }
}
