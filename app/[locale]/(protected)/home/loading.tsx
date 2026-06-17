import { Skeleton } from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <div style={{ display: 'grid', gap: 28, paddingTop: 4 }}>
      {/* Masthead skeleton */}
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <Skeleton width={160} height={12} />
          <Skeleton width={200} height={12} />
        </div>
        <Skeleton height={1} />
        <Skeleton width="60%" height={64} style={{ borderRadius: 8 }} />
        <Skeleton width={380} height={18} />
      </div>

      {/* Primary action cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Skeleton height={232} style={{ borderRadius: 16 }} />
        <Skeleton height={232} style={{ borderRadius: 16 }} />
      </div>

      {/* CRM banner skeleton */}
      <Skeleton height={96} style={{ borderRadius: 14 }} />
    </div>
  )
}
