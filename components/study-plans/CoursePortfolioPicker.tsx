'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { searchCoursesAction, resolveCourseAction, listCoursePricesAction } from '@/app/[locale]/(protected)/study-plans/actions'
import type { CourseOption, PriceSnapshot, PricedOption } from '@/lib/portfolio/types'
import type { StudentLocation, StudyCourse } from '@/lib/study-plans/types'
import { SkeletonText } from '@/components/ui/Skeleton'

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

const box: React.CSSProperties = { width: '100%', padding: '10px 11px', borderRadius: 9, border: '1px solid var(--border)', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--text)', background: 'var(--surface)', outline: 'none' }

export function CoursePortfolioPicker({ nationality, location, onApply, onPriceVersion }: CoursePortfolioPickerProps) {
  const [results, setResults] = useState<CourseOption[]>([])
  const [prices, setPrices] = useState<PricedOption[]>([])
  const [selectedPriceId, setSelectedPriceId] = useState('')
  const [openList, setOpenList] = useState(false)
  const [pending, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click-outside.
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenList(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

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
    <div ref={containerRef} style={{ display: 'grid', gap: 8, position: 'relative' }}>
      <input
        type="text"
        placeholder="Buscar curso do portfólio…"
        style={box}
        onChange={(e) => onSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpenList(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpenList(false) }}
      />
      {pending && (
        <div style={{ padding: '8px 0' }}>
          <SkeletonText lines={3} />
        </div>
      )}
      {!pending && openList && results.length > 0 && (
        <div style={{ position: 'absolute', top: 44, left: 0, right: 0, zIndex: 30, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, maxHeight: 240, overflowY: 'auto', boxShadow: 'var(--shadow-lift, 0 10px 30px rgba(20,11,48,0.12))' }}>
          {results.map((option) => (
            <button key={option.id} type="button" disabled={pending} onClick={() => pick(option)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 11px', border: 'none', borderBottom: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--text)' }}>
              <span style={{ fontWeight: 600 }}>{option.provider}</span> — {option.name}
            </button>
          ))}
        </div>
      )}
      {prices.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
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
