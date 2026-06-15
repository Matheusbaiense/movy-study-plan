import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { StudyPlanEditor } from '@/components/study-plans/StudyPlanEditor'
import { getContactNationality } from '@/lib/crm/contacts'
import { dbPresetToOption, type DbPreset } from '@/lib/study-plans/presets'
import type { StudyPlanData, StudyPlanRow } from '@/lib/study-plans/types'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function StudyPlanDetailPage({ params }: Props) {
  const { locale, id } = await params
  await getUser(locale)
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('study_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (!plan) notFound()

  const { data: presetRows } = await supabase
    .from('course_presets')
    .select('*')
    .eq('is_active', true)
    .order('type', { ascending: true })
    .order('sort_order', { ascending: true })

  const presets = ((presetRows ?? []) as unknown as DbPreset[]).map(dbPresetToOption)

  const planRow = plan as unknown as StudyPlanRow
  let contactNationality: string | null = null
  if (planRow.contact_id) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('custom_attributes')
      .eq('id', planRow.contact_id)
      .maybeSingle()
    contactNationality = getContactNationality(contact ?? { custom_attributes: null })
  }

  return (
    <StudyPlanEditor
      id={planRow.id}
      locale={locale}
      initialData={planRow.data as StudyPlanData}
      status={planRow.status}
      presets={presets}
      contactNationality={contactNationality}
    />
  )
}
