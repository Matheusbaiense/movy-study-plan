import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'

export type Profile = Tables<'profiles'>

export const getUser = cache(async function getUser(
  locale = 'pt',
): Promise<{ profile: Profile; orgId: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/unauthorized')
  }

  // org_id arrives once migration 009 (tenancy) is applied; stay defensive until then.
  const orgId = (profile as { org_id?: string | null }).org_id ?? null

  return { profile, orgId }
})
