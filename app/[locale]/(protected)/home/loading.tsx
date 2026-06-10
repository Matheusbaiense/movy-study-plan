export default function HomeLoading() {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ height: 60, background: 'rgba(28,18,51,0.06)', borderRadius: 12, marginBottom: 32 }} />
      <div style={{ height: 52, background: 'rgba(28,18,51,0.06)', borderRadius: 14, marginBottom: 36 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 36 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: 80, background: 'rgba(28,18,51,0.06)', borderRadius: 14 }} />
        ))}
      </div>
    </div>
  )
}
