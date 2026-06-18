import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { getAdmissionById } from '@/lib/admissions/queries'
import { AdmissionDetail } from '@/components/admissions/AdmissionDetail'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdmissionDetailPage({ params }: Props) {
  const { locale, id } = await params
  const [{ profile }, admission] = await Promise.all([
    getUser(locale),
    (async () => {
      try {
        const db = await createClient()
        return await getAdmissionById(db, id)
      } catch {
        return null
      }
    })(),
  ])

  if (!admission) notFound()

  return <AdmissionDetail locale={locale} admission={admission} canEdit={isEditorOrAbove(profile.role)} />
}
