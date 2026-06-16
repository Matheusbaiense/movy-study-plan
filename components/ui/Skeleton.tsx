// components/ui/Skeleton.tsx
'use client'

import { skeletonRows } from './skeleton-logic'

export function Skeleton({ width = '100%', height = 14, style }: { width?: number | string; height?: number | string; style?: React.CSSProperties }) {
  return <div className="movy-skeleton" style={{ width, height, ...style }} aria-hidden="true" />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'grid', gap: 8 }} aria-hidden="true">
      {skeletonRows(lines).map((i, idx, arr) => (
        <Skeleton key={i} width={idx === arr.length - 1 ? '60%' : '100%'} />
      ))}
    </div>
  )
}
