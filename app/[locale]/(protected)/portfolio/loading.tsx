import { Skeleton } from '@/components/ui/Skeleton'

export default function PortfolioLoading() {
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 4 }}>
      {/* PageHeader */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Skeleton width={120} height={12} />
          <Skeleton width={260} height={32} style={{ borderRadius: 8 }} />
          <Skeleton width={380} height={14} />
        </div>
        <Skeleton width={160} height={42} style={{ borderRadius: 10 }} />
      </div>
      {/* Institution card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={180} style={{ borderRadius: 16 }} />
        ))}
      </div>
    </div>
  )
}
