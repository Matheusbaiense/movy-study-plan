import { Skeleton } from '@/components/ui/Skeleton'

export default function InstitutionDetailLoading() {
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 4 }}>
      {/* Hero / header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Skeleton width={140} height={12} />
          <Skeleton width={300} height={32} style={{ borderRadius: 8 }} />
          <Skeleton width={420} height={14} />
        </div>
        <Skeleton width={180} height={28} style={{ borderRadius: 999 }} />
      </div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[100, 120, 90].map((w, i) => <Skeleton key={i} width={w} height={16} />)}
      </div>
      {/* Course grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={150} style={{ borderRadius: 14 }} />
        ))}
      </div>
    </div>
  )
}
