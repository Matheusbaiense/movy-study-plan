'use client'

import { useTransition } from 'react'
import { UserPlus } from 'lucide-react'
import { createOwnEmployeeProfileAction } from '@/app/[locale]/(protected)/hr/actions'
import { color } from '@/lib/ui/theme'

interface Props { locale: string }

export function CreateEmployeeProfileButton({ locale }: Props) {
  const [isPending, startTransition] = useTransition()
  const pt = locale === 'pt'

  function handle() {
    startTransition(async () => { await createOwnEmployeeProfileAction() })
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginTop: 14, width: '100%', padding: '10px 16px',
        borderRadius: 9, border: 'none',
        background: color.purple, color: '#fff',
        fontSize: 13, fontWeight: 600,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.7 : 1,
        justifyContent: 'center',
      }}
    >
      <UserPlus size={14} />
      {isPending
        ? '...'
        : (pt ? 'Criar meu perfil de funcionário' : 'Create my employee profile')}
    </button>
  )
}
