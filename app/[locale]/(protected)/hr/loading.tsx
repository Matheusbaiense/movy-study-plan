import { Skeleton } from '@/components/ui/Skeleton'

export default function HrLoading() {
  return (
    <div style={{ display: 'grid', gap: 24, padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* PageHeader */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Skeleton width={140} height={12} />
          <Skeleton width={260} height={32} style={{ borderRadius: 8 }} />
          <Skeleton width={380} height={14} />
        </div>
        <Skeleton width={180} height={42} style={{ borderRadius: 10 }} />
      </div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={110} style={{ borderRadius: 14 }} />
        ))}
      </div>
      {/* Table */}
      <Skeleton height={280} style={{ borderRadius: 14 }} />
    </div>
  )
}
