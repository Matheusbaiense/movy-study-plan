export default function DashboardLoading() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ height: 14, width: 180, background: 'rgba(28,18,51,0.08)', borderRadius: 6, marginBottom: 10 }} />
        <div style={{ height: 40, width: 320, background: 'rgba(28,18,51,0.08)', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 16, width: 420, background: 'rgba(28,18,51,0.06)', borderRadius: 6 }} />
      </div>

      {/* KPI strip skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 18, padding: '18px 20px',
            border: '1px solid rgba(28,18,51,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ height: 12, width: 80, background: 'rgba(28,18,51,0.08)', borderRadius: 4 }} />
              <div style={{ width: 30, height: 30, background: 'rgba(28,18,51,0.06)', borderRadius: 8 }} />
            </div>
            <div style={{ height: 36, width: 60, background: 'rgba(28,18,51,0.08)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 12, width: 100, background: 'rgba(28,18,51,0.06)', borderRadius: 4 }} />
          </div>
        ))}
      </div>

      {/* Dept cards skeleton */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ height: 20, width: 140, background: 'rgba(28,18,51,0.08)', borderRadius: 6, marginBottom: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 18,
              border: '1px solid rgba(28,18,51,0.06)', overflow: 'hidden',
            }}>
              <div style={{ height: 6, background: 'rgba(28,18,51,0.1)' }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ height: 12, width: 60, background: 'rgba(28,18,51,0.08)', borderRadius: 4, marginBottom: 12 }} />
                <div style={{ height: 22, width: 120, background: 'rgba(28,18,51,0.08)', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 14, width: '100%', background: 'rgba(28,18,51,0.06)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  )
}
