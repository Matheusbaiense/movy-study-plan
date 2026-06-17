'use client'

import { useRouter } from 'next/navigation'
import { t } from '@/lib/ui/theme'
import { Select } from '@/components/ui/form'

interface InvoiceEmployeeFilterProps {
  employees: Array<{ id: string; full_name: string; email: string }>
  currentEmployeeId?: string
  locale: string
}

export function InvoiceEmployeeFilter({ employees, currentEmployeeId, locale }: InvoiceEmployeeFilterProps) {
  const router = useRouter()
  const pt = locale === 'pt'

  function handleChange(id: string) {
    const url = new URL(window.location.href)
    if (id) {
      url.searchParams.set('employee', id)
    } else {
      url.searchParams.delete('employee')
    }
    router.push(url.pathname + (url.search || ''))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, whiteSpace: 'nowrap' }}>
        {pt ? 'Funcionário:' : 'Employee:'}
      </label>
      <Select
        value={currentEmployeeId ?? ''}
        onChange={e => handleChange(e.target.value)}
        style={{ width: 'auto' }}
        aria-label={pt ? 'Filtrar por funcionário' : 'Filter by employee'}
      >
        <option value="">{pt ? 'Todos os funcionários' : 'All employees'}</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>
            {emp.full_name || emp.email || emp.id.slice(0, 8)}
          </option>
        ))}
      </Select>
      {currentEmployeeId && (
        <button
          onClick={() => handleChange('')}
          style={{ background: 'none', border: 'none', fontSize: 12, color: t.textMuted, cursor: 'pointer' }}
          aria-label={pt ? 'Limpar filtro' : 'Clear filter'}
        >
          × {pt ? 'Limpar' : 'Clear'}
        </button>
      )}
    </div>
  )
}
