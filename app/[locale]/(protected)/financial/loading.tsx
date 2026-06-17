import { Skeleton } from '@/components/ui/Skeleton'

export default function FinancialLoading() {
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 4 }}>
      {/* PageHeader */}
      <div style={{ display: 'grid', gap: 10 }}>
        <Skeleton width={120} height={12} />
        <Skeleton width={280} height={32} style={{ borderRadius: 8 }} />
        <Skeleton width={360} height={14} />
      </div>
      {/* Calculator card */}
      <Skeleton height={420} style={{ borderRadius: 16 }} />
    </div>
  )
}
