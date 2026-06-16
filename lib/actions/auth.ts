import { redirect } from 'next/navigation'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isEditorOrAbove, isAdminOrAbove } from '@/lib/permissions/can'
import type { Database, Enums } from '@/types/supabase'

/**
 * Canonical server-action auth layer.
 *
 * Every server action gets its actor through exactly one of these helpers — do
 * NOT reinvent a local `getActor`/`requireAdmin`/`Actor` shape per file (that
 * sprawl was removed in the 2026-06-17 audit). The returned `profile` is the
 * single canonical shape `ActorProfile`; flatten it locally with
 * `const { profile: actor } = await requireAdmin()` when a file wants `actor.id`.
 *
 * Role gates throw `Permissão insuficiente` (surfaces to the user). Auth/active
 * failures `redirect('/unauthorized')`, mirroring `lib/auth/get-user.ts` for
 * page loads so a deactivated account cannot reach pages OR actions.
 */

export interface ActorProfile {
  id: string
  email: string
  role: Enums<'app_role'>
  org_id: string
}

export interface ActorSession {
  supabase: SupabaseClient<Database>
  user: User
  profile: ActorProfile
}

const INSUFFICIENT = 'Permissão insuficiente'

/** Authenticated + ACTIVE actor. No role requirement. Base of every gate. */
export async function requireActor(): Promise<ActorSession> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, org_id, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) redirect('/unauthorized')

  return {
    supabase,
    user,
    profile: { id: profile.id, email: profile.email, role: profile.role, org_id: profile.org_id },
  }
}

/**
 * Backwards-compatible alias for {@link requireActor}. Older action files import
 * `getActorSession` and apply their own role gate afterwards; both names return
 * the identical `{ supabase, user, profile }` shape. New code should call
 * `requireActor`/`requireEditor`/`requireAdmin` directly.
 */
export const getActorSession = requireActor

/** Actor with editor role or above; throws otherwise. */
export async function requireEditor(): Promise<ActorSession> {
  const session = await requireActor()
  if (!isEditorOrAbove(session.profile.role)) throw new Error(INSUFFICIENT)
  return session
}

/** Actor with admin role or above; throws otherwise. */
export async function requireAdmin(): Promise<ActorSession> {
  const session = await requireActor()
  if (!isAdminOrAbove(session.profile.role)) throw new Error(INSUFFICIENT)
  return session
}

/** Service-role client, or null when env is not configured. */
export function svc(): SupabaseClient<Database> | null {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}
