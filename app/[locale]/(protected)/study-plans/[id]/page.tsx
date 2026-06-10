import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { StudyPlanEditor } from '@/components/study-plans/StudyPlanEditor'
import type { StudyPlanData, StudyPlanRow } from '@/lib/study-plans/types'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function StudyPlanDetailPage({ params }: Props) {
  const { locale, id } = await params
  await getUser(locale)
  const supabase = await createClient()

  const { data: plan } = await (supabase as any)
    .from('study_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (!plan) notFound()

  const row = plan as StudyPlanRow
  return <StudyPlanEditor id={row.id} initialData={row.data as StudyPlanData} status={row.status} />
}
