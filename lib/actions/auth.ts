import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { Enums } from '@/types/supabase'

export interface ActorProfile {
  id: string
  email: string
  role: Enums<'app_role'>
  org_id: string
}

export async function getActorSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, org_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Unauthenticated')
  return { supabase, user, profile: profile as ActorProfile }
}

export function svc() {
  try { return createServiceClient() } catch { return null }
}
