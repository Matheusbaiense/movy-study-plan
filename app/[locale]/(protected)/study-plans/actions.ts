'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAuditWithClient } from '@/lib/api/audit'
import { isEditorOrAbove, isAdminOrAbove } from '@/lib/permissions/can'
import { createBlankStudyPlan } from '@/lib/study-plans/defaults'
import type { StudyPlanData } from '@/lib/study-plans/types'
import type { Json, Enums } from '@/types/supabase'

async function getActor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (!profile || !isEditorOrAbove(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  return { supabase, user, profile }
}

export async function createStudyPlan(locale = 'pt') {
  const { supabase, user, profile } = await getActor()
  const data = createBlankStudyPlan()

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({
      title: 'Nova cotação',
      student_name: data.student,
      applicant_type: data.applicantType,
      status: 'draft',
      data: data as unknown as Json,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  if (!plan) throw new Error('Failed to create study plan')

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.create',
    entityType: 'study_plans',
    entityId: plan.id,
    metadata: { student: data.student, applicantType: data.applicantType },
  })

  revalidatePath(`/${locale}/study-plans`)
  redirect(`/${locale}/study-plans/${plan.id}`)
}

export async function updateStudyPlan(id: string, data: StudyPlanData, status = 'draft') {
  const { supabase, user, profile } = await getActor()
  const title = data.student ? `Cotação - ${data.student}` : 'Cotação sem estudante'

  const { error } = await supabase
    .from('study_plans')
    .update({
      title,
      student_name: data.student,
      applicant_type: data.applicantType,
      status: status as Enums<'study_plan_status'>,
      data: data as unknown as Json,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.update',
    entityType: 'study_plans',
    entityId: id,
    metadata: { student: data.student, applicantType: data.applicantType, status },
  })

  revalidatePath('/[locale]/(protected)/study-plans', 'page')
  revalidatePath('/[locale]/(protected)/study-plans/[id]', 'page')
}

export async function deleteStudyPlan(id: string, locale = 'pt') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminOrAbove(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase.from('study_plans').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.delete',
    entityType: 'study_plans',
    entityId: id,
  })

  revalidatePath(`/${locale}/study-plans`)
  redirect(`/${locale}/study-plans`)
}
