import { Skeleton } from '@/components/ui/Skeleton'

export default function CambioLoading() {
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 4 }}>
      {/* PageHeader */}
      <div style={{ display: 'grid', gap: 10 }}>
        <Skeleton width={120} height={12} />
        <Skeleton width={240} height={32} style={{ borderRadius: 8 }} />
        <Skeleton width={340} height={14} />
      </div>
      {/* Rate header + chart */}
      <Skeleton height={96} style={{ borderRadius: 14 }} />
      <Skeleton height={300} style={{ borderRadius: 16 }} />
      {/* Stats + converter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
        <Skeleton height={180} style={{ borderRadius: 14 }} />
        <Skeleton height={180} style={{ borderRadius: 14 }} />
      </div>
    </div>
  )
}
