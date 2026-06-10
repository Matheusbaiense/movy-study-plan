'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createContent, updateContent } from '@/app/[locale]/(protected)/wiki/actions'
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
          await createContent(formData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Department + Status row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Departamento
          </label>
          <select
            name="department_id"
            defaultValue={defaultValues?.department_id ?? ''}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          >
            <option value="">Sem departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.icon ? `${dept.icon} ` : ''}{dept.name_pt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Status
          </label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? 'draft'}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tags <span className="font-normal text-slate-400">(separadas por vírgula)</span>
        </label>
        <input
          name="tags"
          type="text"
          defaultValue={defaultValues?.tags?.join(', ') ?? ''}
          placeholder="ex: visto, estudante, coe"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
        />
      </div>

      {/* Featured toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_featured"
          name="is_featured"
          value="true"
          defaultChecked={defaultValues?.is_featured ?? false}
          className="h-4 w-4 rounded border-slate-300 accent-slate-900"
        />
        <label htmlFor="is_featured" className="text-sm font-medium text-slate-700">
          Artigo em destaque
        </label>
      </div>

      {/* Language tabs */}
      <div>
        <div className="flex border-b border-slate-200 mb-4">
          {(['pt', 'en', 'es'] as Locale[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveTab(l)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === l
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {LOCALE_LABELS[l]}
              {l === 'pt' && <span className="ml-1 text-xs text-red-500">*</span>}
            </button>
          ))}
        </div>

        {(['pt', 'en', 'es'] as Locale[]).map((l) => (
          <div key={l} className={`space-y-4 ${activeTab === l ? 'block' : 'hidden'}`}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Título {l === 'pt' && <span className="text-red-500">*</span>}
              </label>
              <input
                name={`title_${l}`}
                type="text"
                required={l === 'pt'}
                defaultValue={(defaultValues as Record<string, string | undefined>)?.[`title_${l}`] ?? ''}
                placeholder={l === 'pt' ? 'Ex: Como emitir um COE' : l === 'en' ? 'Ex: How to issue a COE' : 'Ex: Cómo emitir un COE'}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Conteúdo {l === 'pt' && <span className="text-red-500">*</span>}
                <span className="ml-2 font-normal text-slate-400 text-xs">(suporta HTML)</span>
              </label>
              <textarea
                name={`body_${l}`}
                required={l === 'pt'}
                defaultValue={(defaultValues as Record<string, string | undefined>)?.[`body_${l}`] ?? ''}
                rows={16}
                placeholder={l === 'pt' ? 'Escreva o conteúdo aqui…' : 'Write content here…'}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 font-mono resize-y"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-movy-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Salvando…' : mode === 'edit' ? 'Atualizar artigo' : 'Salvar artigo'}
        </button>
      </div>
    </form>
  )
}
