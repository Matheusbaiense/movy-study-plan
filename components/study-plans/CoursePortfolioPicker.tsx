'use client'

import { useState, useTransition, useRef } from 'react'
import { searchCoursesAction, resolveCourseAction, listCoursePricesAction } from '@/app/[locale]/(protected)/study-plans/actions'
import type { CourseOption, PriceSnapshot, PricedOption } from '@/lib/portfolio/types'
import type { StudentLocation, StudyCourse } from '@/lib/study-plans/types'

interface AppliedCourse {
  course: StudyCourse
  priceVersionId: string
  catalogCourseId: string
}

interface CoursePortfolioPickerProps {
  nationality?: string | null
  location?: StudentLocation
  /** Apply a resolved portfolio course (identity + price) to the editor's course. */
  onApply: (applied: AppliedCourse) => void
  /** Apply a different price version (float price fields only) to the editor's course. */
  onPriceVersion: (snapshot: PriceSnapshot) => void
}

const box: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid var(--border, rgba(0,0,0,0.2))', fontSize: 13 }

export function CoursePortfolioPicker({ nationality, location, onApply, onPriceVersion }: CoursePortfolioPickerProps) {
  const [results, setResults] = useState<CourseOption[]>([])
  const [prices, setPrices] = useState<PricedOption[]>([])
  const [selectedPriceId, setSelectedPriceId] = useState('')
  const [openList, setOpenList] = useState(false)
  const [pending, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onSearch = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!q.trim()) {
      setResults([])
      setOpenList(false)
      return
    }
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        try {
          setResults(await searchCoursesAction(q))
          setOpenList(true)
        } catch {
          setResults([])
        }
      })
    }, 250)
  }

  const pick = (option: CourseOption) => {
    setOpenList(false)
    startTransition(async () => {
      const ref = await resolveCourseAction(option.id, { nationality, location })
      if (!ref) return
      onApply({ course: ref.course, priceVersionId: ref.priceVersionId, catalogCourseId: option.id })
      setSelectedPriceId(ref.priceVersionId)
      try {
        setPrices(await listCoursePricesAction(option.id))
      } catch {
        setPrices([])
      }
    })
  }

  const changePrice = (priceVersionId: string) => {
    setSelectedPriceId(priceVersionId)
    const found = prices.find((p) => p.priceVersionId === priceVersionId)
    if (found) onPriceVersion(found.snapshot)
  }

  return (
    <div style={{ display: 'grid', gap: 8, position: 'relative' }}>
      <input
        type="text"
        placeholder="Buscar curso do portfólio…"
        style={box}
        onChange={(e) => onSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpenList(true)}
      />
      {openList && results.length > 0 && (
        <div style={{ position: 'absolute', top: 38, left: 0, right: 0, zIndex: 20, background: 'var(--surface, #fff)', border: '0.5px solid var(--border, rgba(0,0,0,0.2))', borderRadius: 8, maxHeight: 220, overflowY: 'auto' }}>
          {results.map((option) => (
            <button key={option.id} type="button" disabled={pending} onClick={() => pick(option)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: 'none', cursor: 'pointer', fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{option.provider}</span> — {option.name}
            </button>
          ))}
        </div>
      )}
      {prices.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted, #666)' }}>
          Preço aplicado:
          <select style={{ ...box, width: 'auto', flex: 1 }} value={selectedPriceId} onChange={(e) => changePrice(e.target.value)}>
            {prices.map((p) => (
              <option key={p.priceVersionId} value={p.priceVersionId}>{p.label}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
