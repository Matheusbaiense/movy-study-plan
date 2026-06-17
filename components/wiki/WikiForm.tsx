'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createContent, updateContent } from '@/app/[locale]/(protected)/wiki/actions'
import { Field, Input, Textarea, Select } from '@/components/ui/form'
import { Button } from '@/components/ui/Button'
import type { Tables } from '@/types/supabase'

interface WikiFormProps {
  departments: Tables<'departments'>[]
  locale: string
  mode?: 'create' | 'edit'
  contentId?: string
  defaultValues?: {
    title_pt?: string
    title_en?: string
    title_es?: string
    body_pt?: string
    body_en?: string
    body_es?: string
    department_id?: string
    tags?: string[]
    status?: string
    is_featured?: boolean
  }
}

type Locale = 'pt' | 'en' | 'es'

const LOCALE_LABELS: Record<Locale, string> = { pt: 'Português', en: 'English', es: 'Español' }
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
]

export function WikiForm({ departments, locale, mode = 'create', contentId, defaultValues }: WikiFormProps) {
  const [activeTab, setActiveTab] = useState<Locale>('pt')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (mode === 'edit' && contentId) {
          await updateContent(contentId, formData)
          router.back()
        } else {
          await createContent(locale, formData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
      }
    })
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && (
        <div style={{ borderRadius: 10, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.22)', padding: '10px 14px', fontSize: 13, color: 'var(--color-danger, #c0392b)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dispensar erro"
            style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Department + Status row */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <Field label="Departamento">
          <Select name="department_id" defaultValue={defaultValues?.department_id ?? ''}>
            <option value="">Sem departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.icon ? `${dept.icon} ` : ''}{dept.name_pt}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status">
          <Select name="status" defaultValue={defaultValues?.status ?? 'draft'}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Tags */}
      <Field label="Tags" hint="Separadas por vírgula — ex: visto, estudante, coe">
        <Input
          name="tags"
          type="text"
          defaultValue={defaultValues?.tags?.join(', ') ?? ''}
          placeholder="ex: visto, estudante, coe"
        />
      </Field>

      {/* Featured toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox"
          id="is_featured"
          name="is_featured"
          value="true"
          defaultChecked={defaultValues?.is_featured ?? false}
          style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
        <label htmlFor="is_featured" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
          Artigo em destaque
        </label>
      </div>

      {/* Language tabs */}
      <div>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
          {(['pt', 'en', 'es'] as Locale[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveTab(l)}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === l ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === l ? 'var(--text)' : 'var(--text-muted)',
                marginBottom: -1, transition: 'color 0.15s',
              }}
            >
              {LOCALE_LABELS[l]}
              {l === 'pt' && <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--color-danger, #c0392b)' }}>*</span>}
            </button>
          ))}
        </div>

        {(['pt', 'en', 'es'] as Locale[]).map((l) => (
          <div key={l} style={{ display: activeTab === l ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
            <Field label={l === 'pt' ? 'Título *' : 'Título'}>
              <Input
                name={`title_${l}`}
                type="text"
                required={l === 'pt'}
                defaultValue={(defaultValues as Record<string, string | undefined>)?.[`title_${l}`] ?? ''}
                placeholder={l === 'pt' ? 'Ex: Como emitir um COE' : l === 'en' ? 'Ex: How to issue a COE' : 'Ex: Cómo emitir un COE'}
              />
            </Field>
            <Field label={l === 'pt' ? 'Conteúdo *' : 'Conteúdo'} hint="Suporta HTML">
              <Textarea
                name={`body_${l}`}
                required={l === 'pt'}
                defaultValue={(defaultValues as Record<string, string | undefined>)?.[`body_${l}`] ?? ''}
                rows={16}
                placeholder={l === 'pt' ? 'Escreva o conteúdo aqui…' : 'Write content here…'}
                style={{ fontFamily: 'var(--font-mono, monospace)', minHeight: 320 }}
              />
            </Field>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
        >
          {isPending ? 'Salvando…' : mode === 'edit' ? 'Atualizar artigo' : 'Salvar artigo'}
        </Button>
      </div>
    </form>
  )
}
