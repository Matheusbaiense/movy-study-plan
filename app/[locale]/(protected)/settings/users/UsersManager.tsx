'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import {
  createUser,
  updateUserRole,
  setUserActive,
  removeUser,
  addAllowedEmail,
  removeAllowedEmail,
  type ActionResult,
} from './actions'
import { color, ink, font, roleColor, t } from '@/lib/ui/theme'
import { Button, Field, Input, Select, EmptyState, Modal } from '@/components/ui'

type Role = 'reader' | 'editor' | 'admin' | 'super_admin'

export interface UserRow {
  id: string
  email: string
  full_name: string | null
  role: Role
  is_active: boolean
}

export interface AllowedRow {
  email: string
  role: Role
}

interface Props {
  users: UserRow[]
  allowed: AllowedRow[]
  actorRole: Role
  actorId: string
  serviceConfigured?: boolean
}

const ROLE_COLORS = roleColor as Record<Role, string>

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  reader: 'Leitor',
}

// ConfirmModal — shared danger-confirm pattern
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  pending,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  pending?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: t.textMuted, lineHeight: 1.55 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          style={{
            padding: '9px 16px', borderRadius: 10, border: 'none',
            background: color.red, color: '#fff',
            fontSize: 13, fontWeight: 700, fontFamily: font.ui,
            cursor: pending ? 'wait' : 'pointer', opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Aguarde…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function UsersManager({ users, allowed, actorRole, actorId, serviceConfigured = true }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)

  // Confirm-modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => void
  }>({ open: false, title: '', message: '', confirmLabel: 'Confirmar', onConfirm: () => {} })

  const canAssign: Role[] =
    actorRole === 'super_admin' ? ['reader', 'editor', 'admin', 'super_admin'] : ['reader', 'editor', 'admin']
  const isSuper = actorRole === 'super_admin'

  function run(fn: () => Promise<ActionResult>, okMsg: string) {
    setFlash(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        setFlash({ kind: 'ok', msg: okMsg })
        router.refresh()
      } else {
        setFlash({ kind: 'err', msg: res.error ?? 'Erro inesperado.' })
      }
    })
  }

  function confirm(opts: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) {
    setConfirmModal({ open: true, confirmLabel: 'Confirmar', ...opts })
  }

  return (
    <div className="movy-stagger" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal((s) => ({ ...s, open: false }))}
        onConfirm={() => {
          setConfirmModal((s) => ({ ...s, open: false }))
          confirmModal.onConfirm()
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        pending={pending}
      />

      {!serviceConfigured && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background: 'rgba(243,107,28,0.08)',
            color: '#B8480F',
            border: '1px solid rgba(243,107,28,0.25)',
            lineHeight: 1.5,
          }}
        >
          Gestão de usuários indisponível: defina a variável{' '}
          <code style={{ fontWeight: 800 }}>SUPABASE_SERVICE_ROLE_KEY</code> no servidor (Vercel → Settings →
          Environment Variables) e faça um novo deploy.
        </div>
      )}

      {flash && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background: flash.kind === 'ok' ? 'rgba(75,26,119,0.08)' : 'rgba(210,59,43,0.1)',
            color: flash.kind === 'ok' ? '#4B1A77' : '#D23B2B',
            border: `1px solid ${flash.kind === 'ok' ? 'rgba(75,26,119,0.2)' : 'rgba(210,59,43,0.25)'}`,
          }}
        >
          {flash.msg}
        </div>
      )}

      <AddUserForm canAssign={canAssign} pending={pending} onSubmit={run} />

      {/* Users table */}
      <Card title="Usuários" subtitle={`${users.length} no total`}>
        {users.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum usuário ainda" description="Adicione o primeiro usuário acima." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Nome', 'Email', 'Permissão', 'Status', 'Ações'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'var(--text-subtle)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.id === actorId
                  const lockedTarget = u.role === 'super_admin' && !isSuper
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>
                        {u.full_name ?? '—'} {self && <Tag>você</Tag>}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <select
                          aria-label={`Permissão de ${u.full_name ?? u.email}`}
                          value={u.role}
                          disabled={pending || self || lockedTarget}
                          onChange={(e) =>
                            run(() => updateUserRole(u.id, e.target.value), 'Permissão atualizada.')
                          }
                          className="movy-field-control"
                          style={{
                            padding: '5px 8px',
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: ROLE_COLORS[u.role],
                            fontWeight: 700,
                            fontSize: 12,
                            fontFamily: 'var(--font-body)',
                            cursor: self || lockedTarget ? 'not-allowed' : 'pointer',
                            outline: 'none',
                          }}
                        >
                          {Array.from(new Set([u.role, ...canAssign])).map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r as Role]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: u.is_active ? '#4B1A77' : '#D23B2B' }}>
                          {u.is_active ? '● Ativo' : '○ Inativo'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {!self && !lockedTarget && (
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <Button
                              variant="secondary"
                              type="button"
                              disabled={pending}
                              onClick={() =>
                                confirm({
                                  title: u.is_active ? 'Desativar usuário' : 'Ativar usuário',
                                  message: u.is_active
                                    ? `Revogar acesso de ${u.email}?`
                                    : `Liberar acesso para ${u.email}?`,
                                  confirmLabel: u.is_active ? 'Desativar' : 'Ativar',
                                  onConfirm: () =>
                                    run(
                                      () => setUserActive(u.id, !u.is_active),
                                      u.is_active ? 'Acesso revogado.' : 'Acesso liberado.'
                                    ),
                                })
                              }
                            >
                              {u.is_active ? 'Desativar' : 'Ativar'}
                            </Button>
                            {isSuper && (
                              <button
                                type="button"
                                aria-label={`Excluir ${u.email}`}
                                disabled={pending}
                                onClick={() =>
                                  confirm({
                                    title: 'Excluir usuário',
                                    message: `Excluir ${u.email}? Esta ação não pode ser desfeita.`,
                                    confirmLabel: 'Excluir',
                                    onConfirm: () => run(() => removeUser(u.id), 'Usuário excluído.'),
                                  })
                                }
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  fontFamily: 'var(--font-body)',
                                  cursor: pending ? 'not-allowed' : 'pointer',
                                  border: 'none',
                                  background: `${color.red}10`,
                                  color: color.red,
                                  opacity: pending ? 0.5 : 1,
                                }}
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Allowlist */}
      <Card
        title="Emails autorizados (Google)"
        subtitle="Apenas estes emails conseguem entrar com o Google. Adicionar um email aqui também libera o acesso."
      >
        <AddAllowedForm canAssign={canAssign} pending={pending} onSubmit={run} onConfirm={confirm} />
        <div style={{ display: 'grid', gap: 6, marginTop: 14 }}>
          {allowed.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Nenhum email autorizado ainda.</div>
          ) : (
            allowed.map((a) => (
              <div
                key={a.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'rgba(var(--ink-rgb),0.03)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.email}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ROLE_COLORS[a.role],
                      background: `${ROLE_COLORS[a.role]}15`,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}
                  >
                    {ROLE_LABELS[a.role]}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${a.email} da lista de autorizados`}
                  disabled={pending}
                  onClick={() =>
                    confirm({
                      title: 'Remover email autorizado',
                      message: `Remover ${a.email} da lista de autorizados? O acesso será revogado.`,
                      confirmLabel: 'Remover',
                      onConfirm: () => run(() => removeAllowedEmail(a.email), 'Email removido da lista.'),
                    })
                  }
                  style={{
                    padding: '5px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    cursor: pending ? 'not-allowed' : 'pointer',
                    border: `1px solid rgba(210,59,43,0.3)`,
                    background: 'rgba(210,59,43,0.06)',
                    color: '#D23B2B',
                    opacity: pending ? 0.5 : 1,
                  }}
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

type ConfirmFn = (opts: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) => void

function AddUserForm({
  canAssign,
  pending,
  onSubmit,
}: {
  canAssign: Role[]
  pending: boolean
  onSubmit: (fn: () => Promise<ActionResult>, okMsg: string) => void
}) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('editor')

  return (
    <Card title="Adicionar usuário" subtitle="Cria um login com email e senha, já ativo.">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(() => createUser({ email, fullName, password, role }), 'Usuário criado.')
          setPassword('')
        }}
        style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', alignItems: 'end', minWidth: 0 }}
      >
        <Field label="Nome">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pessoa@movyeducation.com"
          />
        </Field>
        <Field label="Senha inicial">
          <Input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mín. 8 caracteres"
          />
        </Field>
        <Field label="Permissão">
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {canAssign.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="primary" loading={pending}>
          Adicionar
        </Button>
      </form>
    </Card>
  )
}

function AddAllowedForm({
  canAssign,
  pending,
  onSubmit,
  onConfirm: _onConfirm,
}: {
  canAssign: Role[]
  pending: boolean
  onSubmit: (fn: () => Promise<ActionResult>, okMsg: string) => void
  onConfirm: ConfirmFn
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('editor')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(() => addAllowedEmail(email, role), 'Email autorizado.')
        setEmail('')
      }}
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}
    >
      <div style={{ flex: '1 1 220px' }}>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="pessoa@movyeducation.com"
          aria-label="Email a autorizar"
        />
      </div>
      <Select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        aria-label="Permissão do email autorizado"
        style={{ width: 'auto' }}
      >
        {canAssign.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="primary" loading={pending}>
        Autorizar
      </Button>
    </form>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="movy-card" style={{ padding: '18px 20px' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 800, color: t.text, letterSpacing: '-0.01em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: ink(0.5), marginTop: 3, lineHeight: 1.5 }}>{subtitle}</div>}
      </div>
      {children}
    </section>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, background: 'rgba(75,26,119,0.1)', padding: '1px 6px', borderRadius: 5, marginLeft: 4 }}>
      {children}
    </span>
  )
}
