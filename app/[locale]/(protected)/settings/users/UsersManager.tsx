'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createUser,
  updateUserRole,
  setUserActive,
  removeUser,
  addAllowedEmail,
  removeAllowedEmail,
  type ActionResult,
} from './actions'
import { color, ink, font, roleColor } from '@/lib/ui/theme'

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

export function UsersManager({ users, allowed, actorRole, actorId, serviceConfigured = true }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)

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

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 24 }}>
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
                      color: 'rgba(28,18,51,0.45)',
                      borderBottom: '1px solid rgba(28,18,51,0.08)',
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
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(28,18,51,0.05)' }}>
                    <td style={{ padding: '10px 12px', color: '#2A1153', fontWeight: 500 }}>
                      {u.full_name ?? '—'} {self && <Tag>você</Tag>}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'rgba(28,18,51,0.6)' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <select
                        value={u.role}
                        disabled={pending || self || lockedTarget}
                        onChange={(e) =>
                          run(() => updateUserRole(u.id, e.target.value), 'Permissão atualizada.')
                        }
                        style={{
                          padding: '5px 8px',
                          borderRadius: 8,
                          border: '1px solid rgba(28,18,51,0.15)',
                          background: '#fff',
                          color: ROLE_COLORS[u.role],
                          fontWeight: 700,
                          fontSize: 12,
                          fontFamily: 'Outfit, system-ui, sans-serif',
                          cursor: self || lockedTarget ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {/* keep current value selectable even if not normally assignable */}
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
                          <SmallBtn
                            disabled={pending}
                            onClick={() =>
                              run(
                                () => setUserActive(u.id, !u.is_active),
                                u.is_active ? 'Acesso revogado.' : 'Acesso liberado.'
                              )
                            }
                          >
                            {u.is_active ? 'Desativar' : 'Ativar'}
                          </SmallBtn>
                          {isSuper && (
                            <SmallBtn
                              danger
                              disabled={pending}
                              onClick={() => {
                                if (confirm(`Excluir ${u.email}? Esta ação não pode ser desfeita.`)) {
                                  run(() => removeUser(u.id), 'Usuário excluído.')
                                }
                              }}
                            >
                              Excluir
                            </SmallBtn>
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
      </Card>

      {/* Allowlist */}
      <Card
        title="Emails autorizados (Google)"
        subtitle="Apenas estes emails conseguem entrar com o Google. Adicionar um email aqui também libera o acesso."
      >
        <AddAllowedForm canAssign={canAssign} pending={pending} onSubmit={run} />
        <div style={{ display: 'grid', gap: 6, marginTop: 14 }}>
          {allowed.length === 0 ? (
            <div style={{ fontSize: 13, color: 'rgba(28,18,51,0.45)' }}>Nenhum email autorizado ainda.</div>
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
                  background: 'rgba(28,18,51,0.02)',
                  border: '1px solid rgba(28,18,51,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 13, color: '#2A1153', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                <SmallBtn
                  danger
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Remover ${a.email} da lista de autorizados? O acesso será revogado.`)) {
                      run(() => removeAllowedEmail(a.email), 'Email removido da lista.')
                    }
                  }}
                >
                  Remover
                </SmallBtn>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

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
        style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', alignItems: 'end' }}
      >
        <Field label="Nome">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} placeholder="Nome completo" />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="pessoa@movyeducation.com"
          />
        </Field>
        <Field label="Senha inicial">
          <input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="mín. 8 caracteres"
          />
        </Field>
        <Field label="Permissão">
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={inputStyle}>
            {canAssign.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
        <button type="submit" disabled={pending} style={primaryBtn(pending)}>
          {pending ? 'Salvando…' : 'Adicionar'}
        </button>
      </form>
    </Card>
  )
}

function AddAllowedForm({
  canAssign,
  pending,
  onSubmit,
}: {
  canAssign: Role[]
  pending: boolean
  onSubmit: (fn: () => Promise<ActionResult>, okMsg: string) => void
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
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ ...inputStyle, flex: '1 1 220px' }}
        placeholder="pessoa@movyeducation.com"
      />
      <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={inputStyle}>
        {canAssign.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} style={primaryBtn(pending)}>
        {pending ? '…' : 'Autorizar'}
      </button>
    </form>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="movy-card" style={{ padding: '18px 20px' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 800, color: color.purpleDeep, letterSpacing: '-0.01em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: ink(0.5), marginTop: 3, lineHeight: 1.5 }}>{subtitle}</div>}
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(28,18,51,0.5)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: '#4B1A77', background: 'rgba(75,26,119,0.1)', padding: '1px 6px', borderRadius: 5, marginLeft: 4 }}>
      {children}
    </span>
  )
}

function SmallBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'Outfit, system-ui, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${danger ? 'rgba(210,59,43,0.3)' : 'rgba(28,18,51,0.15)'}`,
        background: danger ? 'rgba(210,59,43,0.06)' : '#fff',
        color: danger ? '#D23B2B' : '#2A1153',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 11px',
  borderRadius: 10,
  border: `1px solid ${ink(0.15)}`,
  background: '#fff',
  fontSize: 13,
  color: color.purpleDeep,
  fontFamily: font.display,
  outline: 'none',
}

function primaryBtn(pending: boolean): React.CSSProperties {
  return {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: color.purpleDeep,
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    fontFamily: font.display,
    cursor: pending ? 'wait' : 'pointer',
    opacity: pending ? 0.7 : 1,
  }
}
