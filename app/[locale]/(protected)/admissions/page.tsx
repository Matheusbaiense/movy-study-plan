import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { listAdmissions, listInstitutionsWithoutAdmission } from '@/lib/admissions/queries'
import type { SchoolAdmissionView } from '@/lib/admissions/types'
import { AdmissionsList } from '@/components/admissions/AdmissionsList'

interface Props {
  params: Promise<{ locale: string }>
}

async function fetchAdmissions(): Promise<{
  admissions: SchoolAdmissionView[]
  addable: { id: string; name: string }[]
}> {
  try {
    const db = await createClient()
    const [admissions, addable] = await Promise.all([
      listAdmissions(db),
      listInstitutionsWithoutAdmission(db),
    ])
    return { admissions, addable }
  } catch {
    return { admissions: [], addable: [] }
  }
}

export default async function AdmissionsIndexPage({ params }: Props) {
  const { locale } = await params
  const [{ profile }, { admissions, addable }] = await Promise.all([getUser(locale), fetchAdmissions()])

  return (
    <AdmissionsList
      locale={locale}
      admissions={admissions}
      addableInstitutions={addable}
      canEdit={isEditorOrAbove(profile.role)}
    />
  )
}
