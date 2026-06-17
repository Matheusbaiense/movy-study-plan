// [A-H1] Skeleton that mirrors the ProposalsList table shape
import { Skeleton } from '@/components/ui'

const ROWS = 7

export function ProposalsListSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Toolbar skeleton */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Skeleton width="240px" height={38} style={{ borderRadius: 10, flex: '1 1 240px' }} />
        <Skeleton width="140px" height={38} style={{ borderRadius: 10 }} />
        <Skeleton width="130px" height={38} style={{ borderRadius: 10 }} />
        <Skeleton width="150px" height={38} style={{ borderRadius: 10 }} />
        <Skeleton width="120px" height={38} style={{ borderRadius: 10 }} />
      </div>

      {/* Table skeleton */}
      <div className="movy-card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Table header */}
        <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <Skeleton width={22} height={12} style={{ borderRadius: 3 }} />
          <Skeleton width="18%" height={10} style={{ borderRadius: 3 }} />
          <Skeleton width="8%" height={10} style={{ borderRadius: 3 }} />
          <Skeleton width="12%" height={10} style={{ borderRadius: 3 }} />
          <Skeleton width="12%" height={10} style={{ borderRadius: 3 }} />
          <Skeleton width="8%" height={10} style={{ borderRadius: 3 }} />
          <Skeleton width="10%" height={10} style={{ borderRadius: 3 }} />
          <Skeleton width="8%" height={10} style={{ borderRadius: 3, marginLeft: 'auto' }} />
        </div>
        {/* Rows */}
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 16,
              padding: '14px 16px',
              borderBottom: i < ROWS - 1 ? '1px solid var(--border)' : undefined,
              alignItems: 'center',
            }}
          >
            <Skeleton width={16} height={16} style={{ borderRadius: 3, flexShrink: 0 }} />
            <div style={{ flex: '0 0 18%' }}>
              <Skeleton width="80%" height={13} style={{ borderRadius: 4, marginBottom: 6 }} />
              <Skeleton width="60%" height={11} style={{ borderRadius: 4 }} />
            </div>
            <Skeleton width="8%" height={12} style={{ borderRadius: 4 }} />
            <Skeleton width="88px" height={22} style={{ borderRadius: 999 }} />
            <Skeleton width="8%" height={12} style={{ borderRadius: 4 }} />
            <Skeleton width="7%" height={12} style={{ borderRadius: 4 }} />
            <Skeleton width="10%" height={11} style={{ borderRadius: 4 }} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <Skeleton width={30} height={30} style={{ borderRadius: 8 }} />
              <Skeleton width={30} height={30} style={{ borderRadius: 8 }} />
              <Skeleton width={30} height={30} style={{ borderRadius: 8 }} />
              <Skeleton width={30} height={30} style={{ borderRadius: 8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
