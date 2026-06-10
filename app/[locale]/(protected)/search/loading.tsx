export default function SearchLoading() {
  return (
    <div>
      <div style={{ width: 100, height: 28, borderRadius: 8, background: 'rgba(28,18,51,0.08)', marginBottom: 20 }} />
      <div style={{
        height: 56, borderRadius: 16, background: '#fff', marginBottom: 20,
        border: '1px solid rgba(28,18,51,0.06)',
      }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ width: 80, height: 30, borderRadius: 8, background: 'rgba(28,18,51,0.06)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: '20px 24px', height: 100,
            border: '1px solid rgba(28,18,51,0.06)',
          }}>
            <div style={{ width: 80, height: 14, borderRadius: 6, background: 'rgba(28,18,51,0.06)', marginBottom: 10 }} />
            <div style={{ width: '60%', height: 18, borderRadius: 6, background: 'rgba(28,18,51,0.08)', marginBottom: 8 }} />
            <div style={{ width: '80%', height: 14, borderRadius: 6, background: 'rgba(28,18,51,0.05)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
