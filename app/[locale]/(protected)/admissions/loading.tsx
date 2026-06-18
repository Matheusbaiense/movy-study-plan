import { Skeleton } from '@/components/ui/Skeleton'

export default function AdmissionsLoading() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Skeleton style={{ width: 120, height: 12, marginBottom: 10 }} />
        <Skeleton style={{ width: 280, height: 30 }} />
      </div>
      <Skeleton style={{ width: 420, height: 40, marginBottom: 22 }} />
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="movy-card" style={{ padding: 18 }}>
            <Skeleton style={{ width: '60%', height: 18, marginBottom: 10 }} />
            <Skeleton style={{ width: '80%', height: 12, marginBottom: 16 }} />
            <Skeleton style={{ width: 120, height: 18 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
