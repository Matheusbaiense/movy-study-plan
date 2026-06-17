import { Skeleton } from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 4 }}>
      {/* PageHeader */}
      <div style={{ display: 'grid', gap: 10 }}>
        <Skeleton width={120} height={12} />
        <Skeleton width={240} height={32} style={{ borderRadius: 8 }} />
        <Skeleton width={360} height={14} />
      </div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[88, 96, 80, 110].map((w, i) => <Skeleton key={i} width={w} height={16} />)}
      </div>
      {/* Content cards */}
      <div style={{ display: 'grid', gap: 14 }}>
        <Skeleton height={120} style={{ borderRadius: 14 }} />
        <Skeleton height={220} style={{ borderRadius: 14 }} />
      </div>
    </div>
  )
}
