'use client'

import { useTransition } from 'react'
import { UserPlus } from 'lucide-react'
import { createOwnEmployeeProfileAction } from '@/app/[locale]/(protected)/hr/actions'
import { Button } from '@/components/ui/Button'

interface Props { locale: string }

export function CreateEmployeeProfileButton({ locale }: Props) {
  const [isPending, startTransition] = useTransition()
  const pt = locale === 'pt'

  function handle() {
    startTransition(async () => { await createOwnEmployeeProfileAction() })
  }

  return (
    <Button
      variant="primary"
      onClick={handle}
      loading={isPending}
      style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
    >
      <UserPlus size={14} aria-hidden="true" />
      {pt ? 'Criar meu perfil de funcionário' : 'Create my employee profile'}
    </Button>
  )
}
