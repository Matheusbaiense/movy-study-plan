'use server'

import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/api/audit'
import { isSuperAdmin } from '@/lib/permissions/can'
import { requireAdmin, svc as serviceClient, type ActorProfile } from '@/lib/actions/auth'
import type { createServiceClient } from '@/lib/supabase/service'
import type { Enums } from '@/types/supabase'

type Role = Enums<'app_role'>
const ASSIGNABLE_ROLES: Role[] = ['reader', 'editor', 'admin', 'super_admin']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

export interface ActionResult {
  ok: boolean
  error?: string
}

const SERVICE_MISSING =
  'Configuração ausente no servidor: defina SUPABASE_SERVICE_ROLE_KEY (Vercel → Settings → Environment Variables).'

function validateRole(role: string, actor: ActorProfile): Role | null {
  if (!ASSIGNABLE_ROLES.includes(role as Role)) return null
  // Only a super_admin can grant the super_admin role.
  if (role === 'super_admin' && !isSuperAdmin(actor.role)) return null
  return role as Role
}

/** Guard: an admin cannot touch a super_admin account. */
async function assertCanManageTarget(
  svc: ReturnType<typeof createServiceClient>,
  actor: ActorProfile,
  targetEmail: string
): Promise<void> {
  if (isSuperAdmin(actor.role)) return
  const { data } = await svc
    .from('profiles')
    .select('role')
    .eq('email', targetEmail)
    .maybeSingle()
  if (data && data.role === 'super_admin') {
    throw new Error('Insufficient permissions')
  }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function createUser(input: {
  email: string
  password: string
  fullName: string
  role: string
}): Promise<ActionResult> {
  const { profile: actor } = await requireAdmin()

  const email = input.email.trim().toLowerCase()
  const fullName = input.fullName.trim()
  const password = input.password

  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Email inválido.' }
  if (password.length < MIN_PASSWORD)
    return { ok: false, error: `A senha precisa ter ao menos ${MIN_PASSWORD} caracteres.` }
  const role = validateRole(input.role, actor)
  if (!role) return { ok: false, error: 'Permissão inválida para o seu nível de acesso.' }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }

  // Register on the allowlist first so the auth trigger activates the profile
  // with the correct role on creation.
  await svc.from('allowed_emails').upsert({ email, role }, { onConflict: 'email' })

  const { data: created, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  })

  if (error || !created?.user) {
    const msg = error?.message ?? 'Falha ao criar usuário.'
    if (/already/i.test(msg)) return { ok: false, error: 'Já existe um usuário com esse email.' }
    return { ok: false, error: msg }
  }

  // Ensure the profile reflects the chosen role and is active (covers any trigger timing).
  await svc
    .from('profiles')
    .update({ role, is_active: true, full_name: fullName || null })
    .eq('id', created.user.id)

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'user.create',
    entityType: 'profiles',
    entityId: created.user.id,
    metadata: { email, role },
  })

  revalidatePath('/[locale]/(protected)/settings/users', 'page')
  return { ok: true }
}

export async function updateUserRole(userId: string, newRole: string): Promise<ActionResult> {
  const { profile: actor } = await requireAdmin()
  if (userId === actor.id) return { ok: false, error: 'Você não pode alterar a sua própria permissão.' }

  const role = validateRole(newRole, actor)
  if (!role) return { ok: false, error: 'Permissão inválida para o seu nível de acesso.' }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }
  const { data: target } = await svc
    .from('profiles')
    .select('email, role')
    .eq('id', userId)
    .maybeSingle()
  if (!target) return { ok: false, error: 'Usuário não encontrado.' }
  if (target.role === 'super_admin' && !isSuperAdmin(actor.role)) {
    return { ok: false, error: 'Sem permissão para alterar um super admin.' }
  }

  const { error } = await svc.from('profiles').update({ role }).eq('id', userId)
  if (error) return { ok: false, error: error.message }

  // Keep the allowlist role in sync (for Google re-logins).
  await svc.from('allowed_emails').update({ role }).eq('email', target.email)

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'user.role_change',
    entityType: 'profiles',
    entityId: userId,
    metadata: { email: target.email, from: target.role, to: role },
  })

  revalidatePath('/[locale]/(protected)/settings/users', 'page')
  return { ok: true }
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const { profile: actor } = await requireAdmin()
  if (userId === actor.id) return { ok: false, error: 'Você não pode desativar a si mesmo.' }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }
  const { data: target } = await svc
    .from('profiles')
    .select('email, role')
    .eq('id', userId)
    .maybeSingle()
  if (!target) return { ok: false, error: 'Usuário não encontrado.' }
  if (target.role === 'super_admin' && !isSuperAdmin(actor.role)) {
    return { ok: false, error: 'Sem permissão para alterar um super admin.' }
  }

  const { error } = await svc.from('profiles').update({ is_active: isActive }).eq('id', userId)
  if (error) return { ok: false, error: error.message }

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: isActive ? 'user.activate' : 'user.deactivate',
    entityType: 'profiles',
    entityId: userId,
    metadata: { email: target.email },
  })

  revalidatePath('/[locale]/(protected)/settings/users', 'page')
  return { ok: true }
}

/** Hard-delete the auth user (cascades the profile). Super admin only. */
export async function removeUser(userId: string): Promise<ActionResult> {
  const { profile: actor } = await requireAdmin()
  if (!isSuperAdmin(actor.role)) return { ok: false, error: 'Apenas super admin pode excluir usuários.' }
  if (userId === actor.id) return { ok: false, error: 'Você não pode excluir a si mesmo.' }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }
  const { data: target } = await svc
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle()

  const { error } = await svc.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }

  if (target?.email) {
    await svc.from('allowed_emails').delete().eq('email', target.email)
  }

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'user.delete',
    entityType: 'profiles',
    entityId: userId,
    metadata: { email: target?.email ?? null },
  })

  revalidatePath('/[locale]/(protected)/settings/users', 'page')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Allowlist (Google authorised emails)
// ---------------------------------------------------------------------------

export async function addAllowedEmail(rawEmail: string, rawRole: string): Promise<ActionResult> {
  const { profile: actor } = await requireAdmin()
  const email = rawEmail.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Email inválido.' }
  const role = validateRole(rawRole, actor)
  if (!role) return { ok: false, error: 'Permissão inválida para o seu nível de acesso.' }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }
  await assertCanManageTarget(svc, actor, email)

  const { error } = await svc
    .from('allowed_emails')
    .upsert({ email, role }, { onConflict: 'email' })
  if (error) return { ok: false, error: error.message }

  // Retroactively activate a profile that already exists for this email
  // (e.g. someone who tried Google before being authorised).
  await svc.from('profiles').update({ is_active: true, role }).eq('email', email)

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'allowed_email.add',
    entityType: 'allowed_emails',
    metadata: { email, role },
  })

  revalidatePath('/[locale]/(protected)/settings/users', 'page')
  return { ok: true }
}

export async function removeAllowedEmail(rawEmail: string): Promise<ActionResult> {
  const { profile: actor } = await requireAdmin()
  const email = rawEmail.trim().toLowerCase()

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }
  await assertCanManageTarget(svc, actor, email)

  const { error } = await svc.from('allowed_emails').delete().eq('email', email)
  if (error) return { ok: false, error: error.message }

  // Revoke access for the matching profile, if any.
  await svc.from('profiles').update({ is_active: false }).eq('email', email)

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'allowed_email.remove',
    entityType: 'allowed_emails',
    metadata: { email },
  })

  revalidatePath('/[locale]/(protected)/settings/users', 'page')
  return { ok: true }
}
